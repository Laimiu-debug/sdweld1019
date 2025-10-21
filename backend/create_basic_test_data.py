"""
创建最基础的测试数据
"""
import sys
import os

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import get_db
from app.core.security import get_password_hash


def create_basic_test_data():
    """创建最基本的测试数据"""
    try:
        from sqlalchemy import text
        db = next(get_db())

        # 创建测试用户 - 只包含最基本的字段
        users_data = [
            {
                "email": "user1@test.com",
                "username": "user1",
                "hashed_password": get_password_hash("password123"),
                "full_name": "张三",
                "phone": "13800138001",
                "company": "测试公司A",
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
            },
            {
                "email": "user2@test.com",
                "username": "user2",
                "hashed_password": get_password_hash("password123"),
                "full_name": "李四",
                "phone": "13800138002",
                "company": "测试公司B",
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
            },
            {
                "email": "user3@test.com",
                "username": "user3",
                "hashed_password": get_password_hash("password123"),
                "full_name": "王五",
                "phone": "13800138003",
                "company": "测试公司C",
                "is_active": False,
                "is_verified": False,
                "is_superuser": False,
            },
            {
                "email": "user4@test.com",
                "username": "user4",
                "hashed_password": get_password_hash("password123"),
                "full_name": "赵六",
                "phone": "13800138004",
                "company": "测试公司D",
                "is_active": True,
                "is_verified": True,
                "is_superuser": False,
            }
        ]

        created_users = []
        for i, user_data in enumerate(users_data, 1):
            # 检查用户是否已存在
            existing_user = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user_data["email"]}).fetchone()
            if existing_user:
                print(f"用户 {user_data['email']} 已存在 (ID: {existing_user[0]})")
                created_users.append(existing_user[0])
                continue

            # 尝试插入用户
            try:
                # 添加可选字段
                user_data["contact"] = user_data["email"]

                # 使用原生SQL插入
                columns = ", ".join(user_data.keys())
                placeholders = ", ".join([f":{k}" for k in user_data.keys()])
                sql = f"INSERT INTO users ({columns}) VALUES ({placeholders}) RETURNING id"

                result = db.execute(text(sql), user_data)
                user_id = result.fetchone()[0]
                db.commit()
                created_users.append(user_id)
                print(f"创建测试用户成功: {user_data['email']} (ID: {user_id})")

            except Exception as e:
                print(f"创建用户 {user_data['email']} 失败: {e}")
                # 尝试只插入必要字段
                try:
                    basic_user_data = {
                        "email": user_data["email"],
                        "username": user_data["username"],
                        "hashed_password": user_data["hashed_password"],
                        "is_active": user_data["is_active"],
                    }

                    columns = ", ".join(basic_user_data.keys())
                    placeholders = ", ".join([f":{k}" for k in basic_user_data.keys()])
                    sql = f"INSERT INTO users ({columns}) VALUES ({placeholders}) RETURNING id"

                    result = db.execute(text(sql), basic_user_data)
                    user_id = result.fetchone()[0]
                    db.commit()
                    created_users.append(user_id)
                    print(f"创建基础用户成功: {user_data['email']} (ID: {user_id})")

                except Exception as e2:
                    print(f"创建基础用户也失败: {e2}")

        return created_users

    except Exception as e:
        print(f"创建测试数据失败: {e}")
        return []
    finally:
        db.close()


def test_api_endpoints():
    """测试API端点是否工作"""
    try:
        from sqlalchemy import text
        db = next(get_db())

        # 测试用户查询
        result = db.execute(text("SELECT COUNT(*) FROM users")).scalar()
        print(f"数据库中用户总数: {result}")

        # 测试管理员查询
        result = db.execute(text("SELECT COUNT(*) FROM admins")).scalar()
        print(f"数据库中管理员总数: {result}")

        # 显示最近的用户
        result = db.execute(text("""
            SELECT id, email, username, is_active
            FROM users
            ORDER BY id DESC
            LIMIT 5
        """)).fetchall()

        print("\n最近创建的用户:")
        for row in result:
            print(f"  ID: {row[0]}, 邮箱: {row[1]}, 用户名: {row[2]}, 状态: {'活跃' if row[3] else '禁用'}")

    except Exception as e:
        print(f"测试API失败: {e}")
    finally:
        db.close()


def main():
    """主函数"""
    print("开始创建基础测试数据...")

    # 创建测试用户
    user_ids = create_basic_test_data()

    print(f"\n测试数据创建完成!")
    print(f"用户密码: 所有用户的密码都是 password123")
    print(f"创建了 {len(user_ids)} 个测试用户")

    # 测试API
    test_api_endpoints()

    # 显示API测试信息
    print("\n=== API测试信息 ===")
    print("后端服务运行在: http://localhost:8000")
    print("API文档地址: http://localhost:8000/api/v1/docs")
    print("管理员登录: admin@test.com / admin123")
    print("用户列表接口: GET /api/v1/admin/users")
    print("用户详情接口: GET /api/v1/admin/users/{user_id}")

    print("\n现在您可以:")
    print("1. 在前端登录管理员账户")
    print("2. 查看用户管理页面")
    print("3. 测试用户管理功能")


if __name__ == "__main__":
    main()