"""
创建独立的管理员用户脚本
"""
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.database import engine, get_db
from app.models.admin import Admin
from app.services.admin_service import admin_service

def create_admin_user():
    """创建管理员用户"""

    # 确保数据库表存在
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)

    # 获取数据库会话
    db = next(get_db())

    try:
        # 检查是否已存在管理员用户
        existing_admin = admin_service.get_by_email(db, "Laimiu.new@gmail.com")
        if existing_admin:
            print("管理员用户已存在")
            print(f"邮箱: {existing_admin.email}")
            print(f"用户名: {existing_admin.username}")
            print(f"是否超级管理员: {existing_admin.is_super_admin}")
            print(f"是否激活: {existing_admin.is_active}")
            return existing_admin

        # 创建管理员用户
        admin_data = {
            "email": "Laimiu.new@gmail.com",
            "username": "Laimiu",
            "full_name": "系统管理员",
            "password": "admin123",  # 使用你的密码
            "is_active": True,
            "is_super_admin": True,  # 设置为超级管理员
            "admin_level": "super_admin"
        }

        admin_user = admin_service.create(db, admin_data)

        print("管理员用户创建成功！")
        print(f"邮箱: {admin_user.email}")
        print(f"用户名: {admin_user.username}")
        print(f"密码: ghzzz123")
        print(f"是否超级管理员: {admin_user.is_super_admin}")
        print(f"管理员等级: {admin_user.admin_level}")

        return admin_user

    except Exception as e:
        print(f"创建管理员用户失败: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()