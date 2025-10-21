"""
测试企业会员升级和自动创建企业记录
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.company import Company, Factory, CompanyEmployee
from app.services.membership_service import MembershipService

# 直接创建数据库连接
DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_enterprise_upgrade():
    """测试企业会员升级"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("Testing Enterprise Membership Upgrade")
        print("=" * 80)
        
        # 查找一个个人会员用户
        user = db.query(User).filter(
            User.membership_type == "personal"
        ).first()
        
        if not user:
            print("\nNo personal membership user found. Creating test user...")
            user = User(
                username="test_enterprise_user",
                email="test_enterprise@example.com",
                hashed_password="test_password_hash",
                full_name="Test Enterprise User",
                membership_type="personal",
                member_tier="free",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created test user: {user.email}")
        
        print(f"\nUser before upgrade:")
        print(f"  ID: {user.id}")
        print(f"  Email: {user.email}")
        print(f"  Membership Type: {user.membership_type}")
        print(f"  Member Tier: {user.member_tier}")
        
        # 检查是否已有企业记录
        existing_company = db.query(Company).filter(
            Company.owner_id == user.id
        ).first()
        
        if existing_company:
            print(f"\nUser already has a company: {existing_company.name}")
            print("Deleting existing company for test...")
            db.delete(existing_company)
            db.commit()
        
        # 升级到企业会员
        print("\nUpgrading user to enterprise membership...")
        membership_service = MembershipService(db)
        
        result = membership_service.upgrade_membership(
            user_id=user.id,
            tier="enterprise",
            duration_months=12,
            payment_method="test"
        )
        
        print(f"\nUpgrade result: {result}")
        
        # 刷新用户数据
        db.refresh(user)
        
        print(f"\nUser after upgrade:")
        print(f"  Membership Type: {user.membership_type}")
        print(f"  Member Tier: {user.member_tier}")
        
        # 检查是否创建了企业记录
        company = db.query(Company).filter(
            Company.owner_id == user.id
        ).first()
        
        if company:
            print(f"\nCompany created successfully!")
            print(f"  ID: {company.id}")
            print(f"  Name: {company.name}")
            print(f"  Owner ID: {company.owner_id}")
            print(f"  Membership Tier: {company.membership_tier}")
            print(f"  Max Factories: {company.max_factories}")
            print(f"  Max Employees: {company.max_employees}")
            
            # 检查工厂
            factories = db.query(Factory).filter(
                Factory.company_id == company.id
            ).all()
            
            print(f"\nFactories created: {len(factories)}")
            for factory in factories:
                print(f"  - {factory.name} (ID: {factory.id})")
            
            # 检查员工记录
            employees = db.query(CompanyEmployee).filter(
                CompanyEmployee.company_id == company.id
            ).all()
            
            print(f"\nEmployees created: {len(employees)}")
            for emp in employees:
                print(f"  - User ID: {emp.user_id}, Role: {emp.role}, Status: {emp.status}")
                print(f"    Employee Number: {emp.employee_number}")
                print(f"    Position: {emp.position}")
                print(f"    Department: {emp.department}")
            
            print("\n" + "=" * 80)
            print("Test PASSED! Enterprise upgrade works correctly!")
            print("=" * 80)
        else:
            print("\n" + "=" * 80)
            print("Test FAILED! No company created after upgrade!")
            print("=" * 80)
            sys.exit(1)
        
    except Exception as e:
        print(f"\nTest FAILED with error: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_enterprise_upgrade()

