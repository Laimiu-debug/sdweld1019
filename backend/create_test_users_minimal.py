"""
创建测试用户的最小化脚本，只使用基本字段
"""
import sys
import os
from datetime import datetime, timedelta

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.core.security import get_password_hash


def create_test_users_minimal():
    """创建测试用户（只使用基本字段）"""
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
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=5),
                "last_login_at": datetime.utcnow() - timedelta(hours=2),
            },
            {
                "email": "user2@test.com",
                "username": "user2",
                "full_name": "李四",
                "phone": "13800138002",
                "company": "测试公司B",
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=10),
                "last_login_at": datetime.utcnow() - timedelta(hours=5),
            },
            {
                "email": "user3@test.com",
                "username": "user3",
                "full_name": "王五",
                "phone": "13800138003",
                "company": "测试公司C",
                "is_active": False,
                "is_verified": False,
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=15),
                "last_login_at": None,
            },
            {
                "email": "user4@test.com",
                "username": "user4",
                "full_name": "赵六",
                "phone": "13800138004",
                "company": "测试公司D",
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
                "created_at": datetime.utcnow() - timedelta(days=20),
                "last_login_at": datetime.utcnow() - timedelta(hours=1),
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
            user_data["updated_at"] = datetime.utcnow()

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
    print("开始创建测试用户...")

    # 创建测试用户
    user_ids = create_test_users_minimal()

    print(f"测试用户创建完成!")
    print(f"用户密码: 所有用户的密码都是 password123")
    print(f"创建了 {len(user_ids)} 个测试用户")

    # 显示用户信息
    print("\n=== 创建的用户列表 ===")
    for i, user_id in enumerate(user_ids, 1):
        print(f"{i}. 用户ID: {user_id}")

    # 显示API测试信息
    print("\n=== API测试信息 ===")
    print("后端服务运行在: http://localhost:8000")
    print("API文档地址: http://localhost:8000/api/v1/docs")
    print("管理员登录: admin@test.com / admin123")
    print("用户列表接口: GET /api/v1/admin/users")


if __name__ == "__main__":
    main()