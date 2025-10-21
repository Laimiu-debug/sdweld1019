"""
Payment API endpoints for the welding system backend.
"""
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.api.v1.schemas.payment import (
    PaymentRequest, PaymentResponse, PaymentCallback, PaymentStatus
)
from app.services.payment_service import PaymentService

router = APIRouter()


class PaymentCreateRequest(BaseModel):
    """支付创建请求"""
    plan_id: str
    billing_cycle: str  # monthly, quarterly, yearly
    payment_method: str  # alipay, wechat, bank
    auto_renew: bool = False


@router.post("/create", response_model=Dict[str, Any])
async def create_payment(
    payment_data: PaymentCreateRequest,
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """创建支付订单"""
    payment_service = PaymentService(db)
    
    try:
        # 创建支付订单
        order_data = payment_service.create_payment_order(
            user_id=current_user["id"],
            plan_id=payment_data.plan_id,
            billing_cycle=payment_data.billing_cycle,
            payment_method=payment_data.payment_method
        )
        
        # 处理支付
        payment_response = payment_service.process_payment(
            order_id=order_data["order_id"],
            payment_method=payment_data.payment_method
        )
        
        return {
            "success": True,
            "message": "支付订单创建成功",
            "data": {
                "order_id": order_data["order_id"],
                "subscription_id": order_data["subscription_id"],
                "transaction_id": order_data["transaction_id"],
                "amount": order_data["amount"],
                "plan_name": order_data["plan_name"],
                "billing_cycle": order_data["billing_cycle"],
                "payment_method": order_data["payment_method"],
                "payment_url": payment_response.payment_url,
                "qr_code": payment_response.qr_code,
                "start_date": order_data["start_date"],
                "end_date": order_data["end_date"]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"创建支付订单失败: {str(e)}"
        )


@router.get("/status/{order_id}", response_model=Dict[str, Any])
async def get_payment_status(
    order_id: str,
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """获取支付状态"""
    payment_service = PaymentService(db)
    
    try:
        status = payment_service.get_payment_status(order_id)
        
        return {
            "success": True,
            "data": {
                "order_id": status.order_id,
                "status": status.status,
                "amount": status.amount,
                "paid_at": status.paid_at,
                "transaction_id": status.transaction_id,
                "failure_reason": status.failure_reason
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"获取支付状态失败: {str(e)}"
        )


@router.post("/callback/{payment_method}", response_model=Dict[str, Any])
async def payment_callback(
    payment_method: str,
    request: Request,
    db: Session = Depends(deps.get_db)
) -> Any:
    """处理支付回调"""
    payment_service = PaymentService(db)
    
    try:
        # 获取回调数据
        if payment_method == "alipay":
            # 支付宝回调数据
            callback_data = await request.form()
            callback_dict = dict(callback_data)
            
            # 构造回调对象
            callback = PaymentCallback(
                order_id=callback_dict.get("out_trade_no", ""),
                transaction_id=callback_dict.get("trade_no", ""),
                amount=float(callback_dict.get("total_amount", 0)),
                currency=callback_dict.get("currency", "CNY"),
                payment_method="alipay",
                status="success" if callback_dict.get("trade_status") == "TRADE_SUCCESS" else "failed",
                paid_at=datetime.now(),
                signature=callback_dict.get("sign", "")
            )
        elif payment_method == "wechat":
            # 微信支付回调数据
            body = await request.body()
            callback_dict = xmltodict.parse(body.decode("utf-8"))["xml"]
            
            # 构造回调对象
            callback = PaymentCallback(
                order_id=callback_dict.get("out_trade_no", ""),
                transaction_id=callback_dict.get("transaction_id", ""),
                amount=float(callback_dict.get("total_fee", 0)) / 100,
                currency="CNY",
                payment_method="wechat",
                status="success" if callback_dict.get("result_code") == "SUCCESS" else "failed",
                paid_at=datetime.now(),
                signature=callback_dict.get("sign", "")
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不支持的支付方式"
            )
        
        # 处理支付回调
        result = payment_service.handle_payment_callback(callback)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"处理支付回调失败: {str(e)}"
        )


@router.post("/refund/{transaction_id}", response_model=Dict[str, Any])
async def refund_payment(
    transaction_id: str,
    refund_amount: float = Form(...),
    reason: str = Form(...),
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """申请退款"""
    payment_service = PaymentService(db)
    
    try:
        # 验证交易所有权
        from app.models.subscription import SubscriptionTransaction
        transaction = db.query(SubscriptionTransaction).filter(
            SubscriptionTransaction.transaction_id == transaction_id
        ).first()
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="交易记录不存在"
            )
        
        subscription = transaction.subscription
        if subscription.user_id != current_user["id"] and not current_user.get("is_admin", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权操作此交易"
            )
        
        # 处理退款
        result = payment_service.refund_payment(
            transaction_id=transaction_id,
            refund_amount=refund_amount,
            reason=reason
        )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"申请退款失败: {str(e)}"
        )


# 导入xmltodict用于微信支付回调解析
try:
    import xmltodict
except ImportError:
    xmltodict = None