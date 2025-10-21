"""
创建测试数据的脚本
"""
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.admin import Admin


def create_test_admin():
    """创建测试管理员"""
    db = next(get_db())
    try:
        # 检查是否已存在管理员
        existing_admin = db.query(Admin).filter(Admin.email == "admin@test.com").first()
        if existing_admin:
            print("测试管理员已存在")
            return existing_admin

        # 创建测试管理员
        admin = Admin(
            email="admin@test.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="系统管理员",
            is_super_admin=True,
            admin_level="super_admin",
            is_active=True
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"创建测试管理员成功: {admin.email}")
        return admin

    except Exception as e:
        print(f"创建测试管理员失败: {e}")
        db.rollback()
        return None
    finally:
        db.close()


def create_test_users():
    """创建测试用户"""
    db = next(get_db())
    try:
        users_data = [
            {
                "email": "user1@test.com",
                "username": "user1",
                "full_name": "张三",
                "phone": "13800138001",
                "company": "测试公司A",
                "member_tier": "free",
                "membership_type": "personal",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "user2@test.com",
                "username": "user2",
                "full_name": "李四",
                "phone": "13800138002",
                "company": "测试公司B",
                "member_tier": "personal_pro",
                "membership_type": "personal",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "user3@test.com",
                "username": "user3",
                "full_name": "王五",
                "phone": "13800138003",
                "company": "测试公司C",
                "member_tier": "enterprise",
                "membership_type": "personal",
                "is_active": False,
                "is_verified": False,
            },
            {
                "email": "user4@test.com",
                "username": "user4",
                "full_name": "赵六",
                "phone": "13800138004",
                "company": "测试公司D",
                "member_tier": "personal_advanced",
                "membership_type": "personal",
                "is_active": True,
                "is_verified": True,
            }
        ]

        created_users = []
        for user_data in users_data:
            # 检查用户是否已存在
            existing_user = db.query(User).filter(User.email == user_data["email"]).first()
            if existing_user:
                print(f"用户 {user_data['email']} 已存在")
                created_users.append(existing_user)
                continue

            # 创建用户
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                hashed_password=get_password_hash("password123"),
                full_name=user_data["full_name"],
                phone=user_data["phone"],
                company=user_data["company"],
                member_tier=user_data["member_tier"],
                membership_type=user_data["membership_type"],
                is_active=user_data["is_active"],
                is_verified=user_data["is_verified"],
                created_at=datetime.utcnow() - timedelta(days=hash(user_data["email"]) % 30),
                last_login_at=datetime.utcnow() - timedelta(hours=hash(user_data["email"]) % 24) if user_data["is_active"] else None,
                wps_quota_used=hash(user_data["email"]) % 10,
                pqr_quota_used=hash(user_data["email"]) % 8,
                ppqr_quota_used=hash(user_data["email"]) % 5,
                storage_quota_used=hash(user_data["email"]) % 100,
            )

            db.add(user)
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"创建测试用户成功: {user.email}")

        return created_users

    except Exception as e:
        print(f"创建测试用户失败: {e}")
        db.rollback()
        return []
    finally:
        db.close()


def main():
    """主函数"""
    print("开始创建测试数据...")

    # 创建测试管理员
    admin = create_test_admin()

    # 创建测试用户
    users = create_test_users()

    print(f"测试数据创建完成!")
    print(f"管理员: admin@test.com / admin123")
    print(f"用户密码: 所有用户的密码都是 password123")
    print(f"创建了 {len(users)} 个测试用户")


if __name__ == "__main__":
    main()