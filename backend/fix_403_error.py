"""
修复403错误 - 将常用测试用户升级为企业会员
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.services.enterprise_service import EnterpriseService

DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_403_error():
    """修复403错误"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("修复企业管理403错误")
        print("=" * 80)
        
        # 常用的测试用户邮箱
        test_emails = [
            "test@example.com",
            "testuser@example.com", 
            "admin@example.com",
            "user@example.com"
        ]
        
        print("\n正在检查常用测试用户...")
        
        upgraded_users = []
        enterprise_service = EnterpriseService(db)
        
        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            
            if user:
                print(f"\n找到用户: {email}")
                print(f"  - 当前状态: {user.membership_type}/{user.member_tier}")
                
                # 检查是否已经是企业会员
                if user.membership_type == "enterprise":
                    print(f"  - ✓ 已经是企业会员")
                    continue
                
                # 升级为企业会员
                print(f"  - 升级为企业会员...")
                user.membership_type = "enterprise"
                user.member_tier = "enterprise_pro_max"
                user.is_active = True
                
                db.commit()
                db.refresh(user)
                
                # 创建企业记录
                company = enterprise_service.get_company_by_owner(user.id)
                if not company:
                    company = enterprise_service.create_company(
                        owner_id=user.id,
                        name=f"{user.username or user.email.split('@')[0]}'s Company",
                        membership_tier=user.member_tier
                    )
                    
                    factory = enterprise_service.create_factory(
                        company_id=company.id,
                        name="Headquarters",
                        code="HQ",
                        is_headquarters=True,
                        created_by=user.id
                    )
                    
                    employee = enterprise_service.create_employee(
                        company_id=company.id,
                        user_id=user.id,
                        role="admin",
                        position="Company Owner",
                        department="Management",
                        factory_id=factory.id,
                        data_access_scope="company"
                    )
                    
                    print(f"  - ✓ 企业记录创建成功")
                
                upgraded_users.append(email)
                print(f"  - ✓ 升级完成")
        
        # 确保enterprise@example.com也有企业记录
        enterprise_user = db.query(User).filter(User.email == "enterprise@example.com").first()
        if enterprise_user:
            print(f"\n检查 enterprise@example.com...")
            company = enterprise_service.get_company_by_owner(enterprise_user.id)
            if not company:
                print(f"  - 创建企业记录...")
                company = enterprise_service.create_company(
                    owner_id=enterprise_user.id,
                    name=f"{enterprise_user.username or 'Enterprise'}'s Company",
                    membership_tier=enterprise_user.member_tier
                )
                
                factory = enterprise_service.create_factory(
                    company_id=company.id,
                    name="Headquarters",
                    code="HQ",
                    is_headquarters=True,
                    created_by=enterprise_user.id
                )
                
                employee = enterprise_service.create_employee(
                    company_id=company.id,
                    user_id=enterprise_user.id,
                    role="admin",
                    position="Company Owner",
                    department="Management",
                    factory_id=factory.id,
                    data_access_scope="company"
                )
                print(f"  - ✓ 企业记录创建成功")
            else:
                print(f"  - ✓ 企业记录已存在")
        
        print("\n" + "=" * 80)
        print("修复完成！")
        print("=" * 80)
        
        if upgraded_users:
            print(f"\n已升级的用户:")
            for email in upgraded_users:
                print(f"  ✓ {email}")
        
        print(f"\n可用的企业会员账号:")
        enterprise_users = db.query(User).filter(
            User.membership_type == "enterprise",
            User.is_active == True
        ).all()
        
        for user in enterprise_users:
            print(f"  - {user.email} ({user.member_tier})")
        
        print(f"\n请使用以上任一账号登录用户门户，即可访问企业管理功能。")
        print(f"\n如果仍然出现403错误，请:")
        print(f"1. 退出当前登录")
        print(f"2. 使用企业会员账号重新登录")
        print(f"3. 访问企业管理页面")
        
    except Exception as e:
        print(f"\n✗ 修复失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_403_error()

