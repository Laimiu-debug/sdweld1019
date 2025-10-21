"""
创建测试数据的简化脚本，只使用现有字段
"""
import sys
import os
from datetime import datetime, timedelta

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, get_db
from app.core.security import get_password_hash


def create_test_admin_simple():
    """创建测试管理员（直接使用SQL）"""
    try:
        from sqlalchemy import text
        db = next(get_db())

        # 检查是否已存在管理员
        existing_admin = db.execute(text("SELECT id FROM admins WHERE email = 'admin@test.com'")).fetchone()
        if existing_admin:
            print("测试管理员已存在")
            return existing_admin[0]

        # 创建测试管理员
        admin_data = {
            "email": "admin@test.com",
            "username": "admin",
            "hashed_password": get_password_hash("admin123"),
            "full_name": "系统管理员",
            "is_super_admin": True,
            "admin_level": "super_admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # 使用原生SQL插入
        columns = ", ".join(admin_data.keys())
        placeholders = ", ".join([f":{k}" for k in admin_data.keys()])
        sql = f"INSERT INTO admins ({columns}) VALUES ({placeholders}) RETURNING id"

        result = db.execute(text(sql), admin_data)
        admin_id = result.fetchone()[0]
        db.commit()

        print(f"创建测试管理员成功: admin@test.com (ID: {admin_id})")
        return admin_id

    except Exception as e:
        print(f"创建测试管理员失败: {e}")
        return None
    finally:
        db.close()


def create_test_users_simple():
    """创建测试用户（直接使用SQL）"""
    try:
        from sqlalchemy import text
        db = next(get_db())

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
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=5),
                "last_login_at": datetime.utcnow() - timedelta(hours=2),
                "wps_quota_used": 3,
                "pqr_quota_used": 2,
                "ppqr_quota_used": 0,
                "storage_quota_used": 15,
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
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=10),
                "last_login_at": datetime.utcnow() - timedelta(hours=5),
                "wps_quota_used": 15,
                "pqr_quota_used": 8,
                "ppqr_quota_used": 5,
                "storage_quota_used": 120,
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
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=15),
                "last_login_at": None,
                "wps_quota_used": 50,
                "pqr_quota_used": 25,
                "ppqr_quota_used": 20,
                "storage_quota_used": 500,
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
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=20),
                "last_login_at": datetime.utcnow() - timedelta(hours=1),
                "wps_quota_used": 25,
                "pqr_quota_used": 12,
                "ppqr_quota_used": 8,
                "storage_quota_used": 280,
            }
        ]

        created_users = []
        for user_data in users_data:
            # 检查用户是否已存在
            existing_user = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user_data["email"]}).fetchone()
            if existing_user:
                print(f"用户 {user_data['email']} 已存在")
                created_users.append(existing_user[0])
                continue

            # 添加密码
            user_data["hashed_password"] = get_password_hash("password123")
            user_data["contact"] = user_data["email"]

            # 添加会员相关字段
            user_data.update({
                "subscription_status": "active",
                "auto_renewal": False,
                "last_login_ip": "127.0.0.1",
                "updated_at": datetime.utcnow()
            })

            # 使用原生SQL插入
            columns = ", ".join(user_data.keys())
            placeholders = ", ".join([f":{k}" for k in user_data.keys()])
            sql = f"INSERT INTO users ({columns}) VALUES ({placeholders}) RETURNING id"

            result = db.execute(text(sql), user_data)
            user_id = result.fetchone()[0]
            db.commit()
            created_users.append(user_id)
            print(f"创建测试用户成功: {user_data['email']} (ID: {user_id})")

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
    admin_id = create_test_admin_simple()

    # 创建测试用户
    user_ids = create_test_users_simple()

    print(f"测试数据创建完成!")
    print(f"管理员: admin@test.com / admin123")
    print(f"用户密码: 所有用户的密码都是 password123")
    print(f"创建了 {len(user_ids)} 个测试用户")

    # 显示API测试信息
    print("\n=== API测试信息 ===")
    print("后端服务运行在: http://localhost:8000")
    print("API文档地址: http://localhost:8000/api/v1/docs")
    print("管理员登录接口: POST /api/v1/admin/auth/login")
    print("用户列表接口: GET /api/v1/admin/users")


if __name__ == "__main__":
    main()