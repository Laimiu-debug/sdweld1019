"""
重置管理员用户密码脚本
"""
from app.core.database import get_db
from app.models.admin import Admin
from app.core.security import get_password_hash

def reset_admin_password():
    """重置管理员用户密码"""

    # 获取数据库会话
    db = next(get_db())

    try:
        # 查找管理员用户
        admin = db.query(Admin).filter(Admin.username == "Laimiu").first()
        if not admin:
            print("未找到管理员用户")
            return

        # 重置密码
        admin.hashed_password = get_password_hash("admin123")
        db.commit()

        print("管理员密码重置成功！")
        print(f"用户名: {admin.username}")
        print(f"邮箱: {admin.email}")
        print(f"新密码: admin123")

    except Exception as e:
        print(f"重置密码失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reset_admin_password()