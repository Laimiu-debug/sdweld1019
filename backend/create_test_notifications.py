"""
创建测试通知数据
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.system_announcement import SystemAnnouncement

def create_test_notifications():
    """创建测试通知"""
    db: Session = SessionLocal()
    
    try:
        # 测试通知数据
        test_notifications = [
            {
                "title": "🎉 欢迎使用焊接工艺管理系统",
                "content": "感谢您注册使用我们的系统！我们为您提供了专业的WPS、PQR、pPQR管理功能，助力您的焊接工艺管理工作。",
                "announcement_type": "success",
                "priority": "normal",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": True,
                "publish_at": datetime.utcnow(),
                "expire_at": datetime.utcnow() + timedelta(days=30),
            },
            {
                "title": "📢 系统升级通知",
                "content": "系统将于今晚22:00-23:00进行升级维护，期间可能会出现短暂的服务中断，请您提前保存工作内容。感谢您的理解与支持！",
                "announcement_type": "warning",
                "priority": "high",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(hours=2),
                "expire_at": datetime.utcnow() + timedelta(days=1),
            },
            {
                "title": "💎 会员特权升级",
                "content": "我们为专业版和旗舰版用户新增了更多功能配额！现在升级会员可享受限时优惠，年付8折，季付9折。",
                "announcement_type": "info",
                "priority": "normal",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(hours=5),
                "expire_at": datetime.utcnow() + timedelta(days=7),
            },
            {
                "title": "🔧 新功能上线：设备管理",
                "content": "设备管理功能已正式上线！您现在可以管理焊接设备、记录维护历史、设置维护提醒等。快去体验吧！",
                "announcement_type": "info",
                "priority": "normal",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(days=1),
                "expire_at": datetime.utcnow() + timedelta(days=14),
            },
            {
                "title": "⚠️ 重要安全更新",
                "content": "我们发现了一个潜在的安全问题并已修复。建议您立即更新密码并启用两步验证以保护账户安全。",
                "announcement_type": "error",
                "priority": "urgent",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(days=2),
                "expire_at": datetime.utcnow() + timedelta(days=7),
            },
            {
                "title": "📊 数据统计报表功能优化",
                "content": "我们优化了数据统计报表功能，新增了更多图表类型和导出格式。现在您可以更直观地查看和分析数据。",
                "announcement_type": "info",
                "priority": "low",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(days=3),
                "expire_at": datetime.utcnow() + timedelta(days=10),
            },
            {
                "title": "🎓 在线培训课程上线",
                "content": "我们推出了焊接工艺管理在线培训课程，涵盖WPS编制、PQR评定等内容。会员用户可免费观看！",
                "announcement_type": "success",
                "priority": "normal",
                "target_audience": "all",
                "is_published": True,
                "is_pinned": False,
                "publish_at": datetime.utcnow() - timedelta(days=4),
                "expire_at": datetime.utcnow() + timedelta(days=30),
            },
        ]
        
        # 创建通知
        created_count = 0
        for notification_data in test_notifications:
            # 检查是否已存在相同标题的通知
            existing = db.query(SystemAnnouncement).filter(
                SystemAnnouncement.title == notification_data["title"]
            ).first()
            
            if not existing:
                notification = SystemAnnouncement(**notification_data)
                db.add(notification)
                created_count += 1
                print(f"✅ 创建通知: {notification_data['title']}")
            else:
                print(f"⏭️  跳过已存在的通知: {notification_data['title']}")
        
        db.commit()
        print(f"\n🎉 成功创建 {created_count} 条测试通知！")
        
    except Exception as e:
        print(f"❌ 创建测试通知失败: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("开始创建测试通知...")
    create_test_notifications()

