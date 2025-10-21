"""
Payment service for handling payment processing.
"""
import hashlib
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.api.v1.schemas.payment import (
    PaymentRequest, PaymentResponse, PaymentCallback, PaymentStatus
)
from app.models.subscription import Subscription, SubscriptionTransaction
from app.models.user import User
from app.core.config import settings


class PaymentService:
    """支付服务类"""

    def __init__(self, db: Session):
        self.db = db

    def create_payment_order(
        self,
        user_id: str,
        plan_id: str,
        billing_cycle: str,
        payment_method: str
    ) -> Dict[str, Any]:
        """创建支付订单"""
        # 获取订阅计划
        from app.models.subscription import SubscriptionPlan
        plan = self.db.query(SubscriptionPlan).filter(
            SubscriptionPlan.id == plan_id,
            SubscriptionPlan.is_active == True
        ).first()
        
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="订阅计划不存在"
            )

        # 计算价格
        if billing_cycle == "monthly":
            price = plan.monthly_price
            duration_months = 1
        elif billing_cycle == "quarterly":
            price = plan.quarterly_price
            duration_months = 3
        elif billing_cycle == "yearly":
            price = plan.yearly_price
            duration_months = 12
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的计费周期"
            )

        # 生成订单ID
        order_id = f"ORDER{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8].upper()}"

        # 计算订阅时间
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=duration_months * 30)

        # 创建订阅记录
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            status="pending",
            billing_cycle=billing_cycle,
            price=price,
            currency="CNY",
            start_date=start_date,
            end_date=end_date,
            auto_renew=False,
            payment_method=payment_method
        )

        self.db.add(subscription)
        self.db.commit()
        self.db.refresh(subscription)

        # 创建交易记录
        transaction = SubscriptionTransaction(
            subscription_id=subscription.id,
            transaction_id=f"TXN{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{user_id[:8].upper()}",
            amount=price,
            currency="CNY",
            payment_method=payment_method,
            status="pending",
            description=f"升级到 {plan.name} - {billing_cycle}"
        )

        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)

        return {
            "order_id": order_id,
            "subscription_id": subscription.id,
            "transaction_id": transaction.transaction_id,
            "amount": price,
            "plan_name": plan.name,
            "billing_cycle": billing_cycle,
            "payment_method": payment_method,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }

    def process_payment(
        self,
        order_id: str,
        payment_method: str
    ) -> PaymentResponse:
        """处理支付"""
        # 模拟支付处理
        # 实际应该调用支付网关（支付宝、微信支付等）
        
        # 生成支付URL或二维码
        payment_url = self._generate_payment_url(order_id, payment_method)
        qr_code = self._generate_payment_qr_code(order_id, payment_method)

        return PaymentResponse(
            success=True,
            payment_url=payment_url,
            qr_code=qr_code,
            order_id=order_id,
            message="支付订单创建成功",
            amount=0,  # 从数据库获取
            payment_method=payment_method,
            created_at=datetime.now()
        )

    def handle_payment_callback(
        self,
        callback_data: PaymentCallback
    ) -> Dict[str, Any]:
        """处理支付回调"""
        # 验证签名
        if not self._verify_payment_signature(callback_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="无效的支付签名"
            )

        # 查找交易记录
        transaction = self.db.query(SubscriptionTransaction).filter(
            SubscriptionTransaction.transaction_id == callback_data.transaction_id
        ).first()

        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="交易记录不存在"
            )

        # 更新交易状态
        transaction.status = callback_data.status
        transaction.transaction_date = callback_data.paid_at

        # 更新订阅状态
        subscription = transaction.subscription
        if callback_data.status == "success":
            subscription.status = "active"
            subscription.last_payment_date = callback_data.paid_at
            subscription.next_billing_date = subscription.end_date - timedelta(days=7)

            # 更新用户会员等级
            user = self.db.query(User).filter(User.id == subscription.user_id).first()
            if user:
                user.member_tier = subscription.plan_id
                user.subscription_status = "active"
                user.subscription_start_date = subscription.start_date
                user.subscription_end_date = subscription.end_date
                user.updated_at = datetime.utcnow()

        self.db.commit()

        return {
            "success": True,
            "message": "支付回调处理成功",
            "transaction_id": callback_data.transaction_id,
            "status": callback_data.status
        }

    def get_payment_status(self, order_id: str) -> PaymentStatus:
        """获取支付状态"""
        # 模拟查询支付状态
        # 实际应该调用支付网关API查询
        
        return PaymentStatus(
            order_id=order_id,
            status="pending",
            amount=0,  # 从数据库获取
            paid_at=None,
            transaction_id=None,
            failure_reason=None
        )

    def _generate_payment_url(self, order_id: str, payment_method: str) -> str:
        """生成支付URL"""
        base_url = settings.API_V1_STR
        payment_url = ""

        if payment_method == "alipay":
            payment_url = f"https://openapi.alipay.com/gateway.do?order_id={order_id}"
        elif payment_method == "wechat":
            payment_url = f"https://api.mch.weixin.qq.com/pay/unifiedorder?order_id={order_id}"
        elif payment_method == "bank":
            payment_url = f"{base_url}/payment/bank?order_id={order_id}"

        return payment_url

    def _generate_payment_qr_code(self, order_id: str, payment_method: str) -> str:
        """生成支付二维码"""
        # 模拟生成二维码
        # 实际应该调用支付网关API生成二维码
        qr_data = f"payment:{payment_method}:{order_id}"
        
        # 这里应该生成实际的二维码图片，返回URL或Base64编码
        return f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

    def _verify_payment_signature(self, callback_data: PaymentCallback) -> bool:
        """验证支付签名"""
        # 模拟签名验证
        # 实际应该根据支付网关的规则验证签名
        
        # 构造待签名字符串
        sign_str = f"order_id={callback_data.order_id}&transaction_id={callback_data.transaction_id}&amount={callback_data.amount}&status={callback_data.status}&paid_at={callback_data.paid_at.isoformat()}"
        
        # 计算签名
        sign = hashlib.md5(f"{sign_str}&{settings.SECRET_KEY}".encode()).hexdigest()
        
        # 比对签名
        return sign == callback_data.signature

    def refund_payment(self, transaction_id: str, refund_amount: float, reason: str) -> Dict[str, Any]:
        """退款处理"""
        # 查找交易记录
        transaction = self.db.query(SubscriptionTransaction).filter(
            SubscriptionTransaction.transaction_id == transaction_id
        ).first()

        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="交易记录不存在"
            )

        if transaction.status != "success":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="只能对已成功的交易进行退款"
            )

        if refund_amount > transaction.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="退款金额不能大于交易金额"
            )

        # 模拟退款处理
        # 实际应该调用支付网关API处理退款
        
        # 创建退款记录
        from app.models.subscription import SubscriptionRefund
        refund = SubscriptionRefund(
            transaction_id=transaction.id,
            amount=refund_amount,
            reason=reason,
            status="processing",
            refund_id=f"REFUND{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8].upper()}"
        )

        self.db.add(refund)
        self.db.commit()
        self.db.refresh(refund)

        return {
            "success": True,
            "message": "退款申请已提交",
            "refund_id": refund.refund_id,
            "amount": refund_amount,
            "status": "processing"
        }


def get_payment_service(db: Session = Depends(get_db)) -> PaymentService:
    """获取支付服务实例"""
    return PaymentService(db)