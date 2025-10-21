"""
创建管理员账户脚本
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import engine, Base
from app.models.admin import Admin
from app.core.security import get_password_hash
import hashlib

def create_admin_account():
    """创建管理员账户"""
    # 创建数据库会话
    with Session(engine) as db:
        try:
            # 检查是否已存在管理员
            existing_admin = db.query(Admin).filter(Admin.username == 'admin').first()
            if existing_admin:
                print(f"管理员账户 'admin' 已存在，ID: {existing_admin.id}")
                return True

            # 创建管理员账户
            admin = Admin(
                email='admin@welding-system.com',
                username='admin',
                hashed_password=get_password_hash('Admin@2024!'),
                full_name='系统管理员',
                is_super_admin=True,
                admin_level='super_admin',
                is_active=True
            )

            db.add(admin)
            db.commit()
            db.refresh(admin)

            print(f"✅ 成功创建管理员账户:")
            print(f"   用户名: {admin.username}")
            print(f"   邮箱: {admin.email}")
            print(f"   密码: Admin@2024!")
            print(f"   管理员级别: {admin.admin_level}")
            print(f"   ID: {admin.id}")

            return True

        except Exception as e:
            print(f"❌ 创建管理员账户失败: {e}")
            db.rollback()
            return False

if __name__ == "__main__":
    print("=== 创建管理员账户 ===")
    success = create_admin_account()
    if success:
        print("=== 创建完成 ===")
    else:
        print("=== 创建失败 ===")