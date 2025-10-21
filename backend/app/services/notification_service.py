"""
Notification service for handling system notifications.
"""
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from fastapi import HTTPException, status

from app.models.user import User
from app.models.subscription import Subscription
from app.models.system_announcement import SystemAnnouncement
from app.core.database import get_db
from app.core.config import settings

try:
    from fastapi import Depends
except ImportError:
    Depends = None


class NotificationService:
    """通知服务类"""

    def __init__(self, db: Session):
        self.db = db

    def check_expiring_subscriptions(self, days_ahead: int = 7) -> List[Dict[str, Any]]:
        """检查即将到期的订阅"""
        expiry_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        # 查找即将到期的订阅
        expiring_subscriptions = self.db.query(Subscription).join(User).filter(
            and_(
                Subscription.end_date <= expiry_date,
                Subscription.end_date > datetime.utcnow(),
                Subscription.status == "active",
                User.auto_renewal == False
            )
        ).all()

        result = []
        for subscription in expiring_subscriptions:
            days_until_expiry = (subscription.end_date - datetime.utcnow()).days
            result.append({
                "user_id": subscription.user_id,
                "user_email": subscription.user.email,
                "subscription_id": subscription.id,
                "plan_id": subscription.plan_id,
                "end_date": subscription.end_date.isoformat(),
                "days_until_expiry": days_until_expiry
            })

        return result

    def send_expiration_reminders(self, days_ahead: int = 7) -> int:
        """发送订阅到期提醒"""
        expiring_subscriptions = self.check_expiring_subscriptions(days_ahead)
        
        sent_count = 0
        for subscription_info in expiring_subscriptions:
            try:
                # 创建系统公告
                announcement = SystemAnnouncement(
                    title="订阅即将到期提醒",
                    content=f"您的订阅将在 {subscription_info['days_until_expiry']} 天后到期，请及时续费以免影响使用。",
                    announcement_type="warning",
                    priority="normal",
                    target_audience="user",
                    publish_at=datetime.utcnow(),
                    expire_at=subscription_info['end_date'],
                    created_by=subscription_info['user_id']
                )

                self.db.add(announcement)
                
                # 这里可以添加邮件通知逻辑
                # email_service.send_expiration_reminder(subscription_info)
                
                sent_count += 1
            except Exception as e:
                print(f"发送到期提醒失败: {str(e)}")
        
        self.db.commit()
        return sent_count

    def check_expired_subscriptions(self) -> List[Dict[str, Any]]:
        """检查已过期的订阅"""
        # 查找已过期的订阅
        expired_subscriptions = self.db.query(Subscription).join(User).filter(
            and_(
                Subscription.end_date < datetime.utcnow(),
                Subscription.status == "active"
            )
        ).all()

        result = []
        for subscription in expired_subscriptions:
            result.append({
                "user_id": subscription.user_id,
                "user_email": subscription.user.email,
                "subscription_id": subscription.id,
                "plan_id": subscription.plan_id,
                "end_date": subscription.end_date.isoformat(),
                "days_expired": (datetime.utcnow() - subscription.end_date).days
            })

        return result

    def process_expired_subscriptions(self) -> int:
        """处理已过期的订阅"""
        expired_subscriptions = self.check_expired_subscriptions()
        
        processed_count = 0
        for subscription_info in expired_subscriptions:
            try:
                # 更新订阅状态
                subscription = self.db.query(Subscription).filter(
                    Subscription.id == subscription_info['subscription_id']
                ).first()
                
                if subscription:
                    subscription.status = "expired"
                    
                    # 更新用户会员等级为免费版
                    user = self.db.query(User).filter(User.id == subscription_info['user_id']).first()
                    if user:
                        user.member_tier = "personal_free"
                        user.subscription_status = "expired"
                        user.subscription_end_date = None
                        user.auto_renewal = False
                        # 更新权限为免费版权限
                        import json
                        free_permissions = {
                            'wps_management': True,
                            'pqr_management': True,
                            'ppqr_management': False,
                            'equipment_management': False,
                            'production_management': False,
                            'quality_management': False,
                            'materials_management': False,
                            'welders_management': False,
                            'employee_management': False,
                            'multi_factory_management': False,
                            'reports_management': False,
                            'api_access': False,
                        }
                        user.permissions = json.dumps(free_permissions)
                        user.updated_at = datetime.utcnow()
                    
                    # 创建系统公告
                    announcement = SystemAnnouncement(
                        title="订阅已过期",
                        content="您的订阅已过期，部分功能可能受限。请升级订阅以继续使用全部功能。",
                        announcement_type="info",
                        priority="normal",
                        target_audience="user",
                        publish_at=datetime.utcnow(),
                        expire_at=datetime.utcnow() + timedelta(days=30),
                        created_by=subscription_info['user_id']
                    )

                    self.db.add(announcement)
                    
                    # 这里可以添加邮件通知逻辑
                    # email_service.send_expiration_notice(subscription_info)
                    
                    processed_count += 1
            except Exception as e:
                print(f"处理过期订阅失败: {str(e)}")
        
        self.db.commit()
        return processed_count

    def process_auto_renewals(self) -> int:
        """处理自动续费"""
        # 查找需要自动续费的订阅
        renew_date = datetime.utcnow() + timedelta(days=7)
        
        auto_renew_subscriptions = self.db.query(Subscription).join(User).filter(
            and_(
                Subscription.next_billing_date <= renew_date,
                Subscription.end_date > datetime.utcnow(),
                Subscription.status == "active",
                User.auto_renewal == True
            )
        ).all()

        renewed_count = 0
        for subscription in auto_renew_subscriptions:
            try:
                # 获取订阅计划
                from app.models.subscription import SubscriptionPlan
                plan = self.db.query(SubscriptionPlan).filter(
                    SubscriptionPlan.id == subscription.plan_id
                ).first()
                
                if not plan:
                    continue
                
                # 计算新价格
                if subscription.billing_cycle == "monthly":
                    price = plan.monthly_price
                    duration_months = 1
                elif subscription.billing_cycle == "quarterly":
                    price = plan.quarterly_price
                    duration_months = 3
                else:  # yearly
                    price = plan.yearly_price
                    duration_months = 12
                
                # 延长订阅时间
                if subscription.end_date > datetime.utcnow():
                    subscription.end_date += timedelta(days=duration_months * 30)
                else:
                    subscription.end_date = datetime.utcnow() + timedelta(days=duration_months * 30)
                
                subscription.next_billing_date = subscription.end_date - timedelta(days=7)
                subscription.last_payment_date = datetime.utcnow()
                
                # 创建交易记录
                from app.models.subscription import SubscriptionTransaction
                transaction = SubscriptionTransaction(
                    subscription_id=subscription.id,
                    transaction_id=f"TXN{datetime.utcnow().strftime('%Y%m%d%H%M%S')}{subscription.user_id}",
                    amount=price,
                    currency="CNY",
                    payment_method=subscription.payment_method,
                    status="success",
                    transaction_date=datetime.utcnow(),
                    description=f"自动续费 {plan.name} - {subscription.billing_cycle}"
                )

                self.db.add(transaction)
                
                # 创建系统公告
                announcement = SystemAnnouncement(
                    title="自动续费成功",
                    content=f"您的订阅已自动续费，下次扣款日期为 {subscription.next_billing_date.strftime('%Y-%m-%d')}。",
                    announcement_type="info",
                    priority="low",
                    target_audience="user",
                    publish_at=datetime.utcnow(),
                    expire_at=datetime.utcnow() + timedelta(days=7),
                    created_by=subscription.user_id
                )

                self.db.add(announcement)
                
                renewed_count += 1
            except Exception as e:
                print(f"处理自动续费失败: {str(e)}")
        
        self.db.commit()
        return renewed_count

    def create_system_announcement(
        self,
        title: str,
        content: str,
        announcement_type: str = "info",
        priority: str = "normal",
        target_audience: str = "all",
        publish_at: Optional[datetime] = None,
        expire_at: Optional[datetime] = None,
        created_by: Optional[str] = None
    ) -> SystemAnnouncement:
        """创建系统公告"""
        announcement = SystemAnnouncement(
            title=title,
            content=content,
            announcement_type=announcement_type,
            priority=priority,
            target_audience=target_audience,
            is_published=True,
            publish_at=publish_at or datetime.utcnow(),
            expire_at=expire_at,
            created_by=created_by
        )

        self.db.add(announcement)
        self.db.commit()
        self.db.refresh(announcement)

        return announcement

    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """获取用户通知"""
        query = self.db.query(SystemAnnouncement).filter(
            or_(
                SystemAnnouncement.target_audience == "all",
                SystemAnnouncement.target_audience == "user",
                SystemAnnouncement.created_by == user_id
            ),
            SystemAnnouncement.is_published == True,
            SystemAnnouncement.publish_at <= datetime.utcnow(),
            or_(
                SystemAnnouncement.expire_at.is_(None),
                SystemAnnouncement.expire_at > datetime.utcnow()
            )
        )

        if unread_only:
            # 这里应该添加已读/未读状态查询
            # 暂时返回所有通知
            pass

        announcements = query.order_by(SystemAnnouncement.publish_at.desc()).limit(limit).all()

        result = []
        for announcement in announcements:
            result.append({
                "id": announcement.id,
                "title": announcement.title,
                "content": announcement.content,
                "type": announcement.announcement_type,
                "priority": announcement.priority,
                "publish_at": announcement.publish_at.isoformat(),
                "expire_at": announcement.expire_at.isoformat() if announcement.expire_at else None,
                "view_count": announcement.view_count
            })

        return result


def get_notification_service(db: Session = None) -> NotificationService:
    """获取通知服务实例"""
    return NotificationService(db)