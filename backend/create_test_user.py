"""
创建测试用户
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def create_test_user():
    """创建测试用户"""
    db = SessionLocal()
    
    try:
        # 检查用户是否已存在
        existing_user = db.query(User).filter(User.username == "testuser").first()
        if existing_user:
            print("用户 'testuser' 已存在")
            print(f"  ID: {existing_user.id}")
            print(f"  Email: {existing_user.email}")
            print(f"  用户名: {existing_user.username}")
            return
        
        # 创建新用户
        user = User(
            email="testuser@example.com",
            username="testuser",
            hashed_password=get_password_hash("test123"),
            full_name="Test User",
            is_active=True,
            is_verified=True,
            is_superuser=False,
            member_tier="pro",
            membership_type="personal"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("✅ 测试用户创建成功！")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  用户名: {user.username}")
        print(f"  密码: test123")
        
    except Exception as e:
        print(f"❌ 创建用户失败: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()

