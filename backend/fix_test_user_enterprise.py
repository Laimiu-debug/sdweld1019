"""
修复test@example.com的企业记录
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

def fix_test_user():
    """修复test@example.com的企业记录"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("修复 test@example.com 的企业记录")
        print("=" * 80)
        
        # 查找用户
        user = db.query(User).filter(User.email == "test@example.com").first()
        
        if not user:
            print("\n✗ 用户不存在")
            return
        
        print(f"\n找到用户: {user.email}")
        print(f"  - User ID: {user.id}")
        print(f"  - Membership Type: {user.membership_type}")
        print(f"  - Member Tier: {user.member_tier}")
        
        enterprise_service = EnterpriseService(db)
        
        # 获取企业
        company = enterprise_service.get_company_by_owner(user.id)
        
        if not company:
            print("\n✗ 企业记录不存在")
            return
        
        print(f"\n找到企业: {company.name} (ID: {company.id})")
        
        # 检查工厂
        factories = enterprise_service.get_factories_by_company(company.id)
        print(f"  - 当前工厂数量: {len(factories)}")
        
        if len(factories) == 0:
            print(f"\n创建总部工厂...")
            # 使用公司ID作为工厂编码的一部分，避免重复
            factory_code = f"HQ{company.id}"
            factory = enterprise_service.create_factory(
                company_id=company.id,
                name="Headquarters",
                code=factory_code,
                is_headquarters=True,
                created_by=user.id
            )
            print(f"  - ✓ 工厂创建成功: {factory.name} (ID: {factory.id}, Code: {factory.code})")
        else:
            factory = factories[0]
            print(f"  - ✓ 工厂已存在: {factory.name} (ID: {factory.id})")
        
        # 检查员工
        from app.models.company import CompanyEmployee
        employees = db.query(CompanyEmployee).filter(
            CompanyEmployee.company_id == company.id,
            CompanyEmployee.user_id == user.id
        ).all()
        
        print(f"  - 当前员工数量: {len(employees)}")
        
        if len(employees) == 0:
            print(f"\n创建员工记录...")
            employee = enterprise_service.create_employee(
                company_id=company.id,
                user_id=user.id,
                role="admin",
                position="Company Owner",
                department="Management",
                factory_id=factory.id,
                data_access_scope="company"
            )
            print(f"  - ✓ 员工记录创建成功: {employee.employee_number}")
        else:
            print(f"  - ✓ 员工记录已存在")
        
        print("\n" + "=" * 80)
        print("修复完成！")
        print("=" * 80)
        
        print(f"\n企业信息:")
        print(f"  - 企业名称: {company.name}")
        print(f"  - 最大工厂数: {company.max_factories}")
        print(f"  - 最大员工数: {company.max_employees}")
        
        # 重新检查
        factories = enterprise_service.get_factories_by_company(company.id)
        employees = db.query(CompanyEmployee).filter(
            CompanyEmployee.company_id == company.id
        ).all()
        
        print(f"\n当前状态:")
        print(f"  - 工厂数量: {len(factories)}")
        print(f"  - 员工数量: {len(employees)}")
        
        print(f"\n现在可以使用 test@example.com 登录并访问企业管理功能。")
        
    except Exception as e:
        print(f"\n✗ 修复失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_test_user()

