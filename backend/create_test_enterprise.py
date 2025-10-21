"""
为现有企业用户创建企业记录
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

def create_enterprise_for_user():
    """为企业用户创建企业记录"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("Creating Enterprise Record for Existing User")
        print("=" * 80)
        
        # 查找企业用户
        user = db.query(User).filter(
            User.membership_type == "enterprise"
        ).first()
        
        if not user:
            print("\nNo enterprise user found!")
            return
        
        print(f"\nFound enterprise user: {user.email}")
        print(f"  - User ID: {user.id}")
        print(f"  - Membership Type: {user.membership_type}")
        print(f"  - Member Tier: {user.member_tier}")
        
        enterprise_service = EnterpriseService(db)
        
        # 检查是否已有企业
        existing_company = enterprise_service.get_company_by_owner(user.id)
        if existing_company:
            print(f"\n✓ User already has a company: {existing_company.name}")
            return
        
        # 创建企业
        print("\nCreating company...")
        company = enterprise_service.create_company(
            owner_id=user.id,
            name=f"{user.full_name or user.username or user.email.split('@')[0]}'s Company",
            membership_tier=user.member_tier
        )
        print(f"✓ Company created: {company.name} (ID: {company.id})")
        
        # 创建总部工厂
        print("\nCreating headquarters factory...")
        factory = enterprise_service.create_factory(
            company_id=company.id,
            name="Headquarters",
            code="HQ",
            is_headquarters=True,
            created_by=user.id
        )
        print(f"✓ Factory created: {factory.name} (ID: {factory.id})")
        
        # 添加用户为管理员员工
        print("\nAdding user as admin employee...")
        employee = enterprise_service.create_employee(
            company_id=company.id,
            user_id=user.id,
            role="admin",
            position="Company Owner",
            department="Management",
            factory_id=factory.id,
            data_access_scope="company"
        )
        print(f"✓ Employee created: {employee.employee_number}")
        
        print("\n" + "=" * 80)
        print("Enterprise Setup Complete!")
        print("=" * 80)
        print(f"\nCompany: {company.name}")
        print(f"  - Max Factories: {company.max_factories}")
        print(f"  - Max Employees: {company.max_employees}")
        print(f"\nFactory: {factory.name}")
        print(f"  - Code: {factory.code}")
        print(f"\nEmployee: {employee.employee_number}")
        print(f"  - Role: {employee.role}")
        print(f"  - Department: {employee.department}")
        
    except Exception as e:
        print(f"\n✗ Failed: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_enterprise_for_user()

