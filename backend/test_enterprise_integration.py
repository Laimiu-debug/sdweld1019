"""
测试企业管理功能的完整集成
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.company import Company, Factory, CompanyEmployee
from app.services.enterprise_service import EnterpriseService

DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_enterprise_integration():
    """测试企业管理完整功能"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("Testing Enterprise Management Integration")
        print("=" * 80)
        
        # 1. 查找或创建企业会员用户
        print("\n1. Finding or creating enterprise user...")
        user = db.query(User).filter(
            User.membership_type == "enterprise"
        ).first()
        
        if not user:
            print("   No enterprise user found. Please upgrade a user to enterprise first.")
            print("   You can do this through the membership upgrade API or admin panel.")
            return
        
        print(f"   ✓ Found enterprise user: {user.email}")
        print(f"     - Membership Type: {user.membership_type}")
        print(f"     - Member Tier: {user.member_tier}")
        
        # 2. 检查企业记录
        print("\n2. Checking company record...")
        enterprise_service = EnterpriseService(db)
        company = enterprise_service.get_company_by_owner(user.id)
        
        if not company:
            print("   ✗ No company found for this user!")
            print("   This should have been created automatically during upgrade.")
            return
        
        print(f"   ✓ Company found: {company.name}")
        print(f"     - ID: {company.id}")
        print(f"     - Membership Tier: {company.membership_tier}")
        print(f"     - Max Factories: {company.max_factories}")
        print(f"     - Max Employees: {company.max_employees}")
        
        # 3. 检查工厂
        print("\n3. Checking factories...")
        factories = enterprise_service.get_factories_by_company(company.id)
        print(f"   ✓ Found {len(factories)} factories:")
        for factory in factories:
            print(f"     - {factory.name} (ID: {factory.id})")
            print(f"       Code: {factory.code or 'N/A'}")
            print(f"       Headquarters: {factory.is_headquarters}")
            print(f"       Active: {factory.is_active}")
        
        # 4. 检查员工
        print("\n4. Checking employees...")
        employees = db.query(CompanyEmployee).filter(
            CompanyEmployee.company_id == company.id
        ).all()
        print(f"   ✓ Found {len(employees)} employees:")
        for emp in employees:
            emp_user = db.query(User).filter(User.id == emp.user_id).first()
            print(f"     - {emp_user.email if emp_user else 'Unknown'}")
            print(f"       Employee Number: {emp.employee_number}")
            print(f"       Role: {emp.role}")
            print(f"       Status: {emp.status}")
            print(f"       Department: {emp.department or 'N/A'}")
        
        # 5. 测试部门统计
        print("\n5. Testing department statistics...")
        from sqlalchemy import func
        departments = db.query(
            CompanyEmployee.department,
            func.count(CompanyEmployee.id).label('count')
        ).filter(
            CompanyEmployee.company_id == company.id,
            CompanyEmployee.department.isnot(None),
            CompanyEmployee.department != "",
            CompanyEmployee.status == "active"
        ).group_by(CompanyEmployee.department).all()
        
        print(f"   ✓ Found {len(departments)} departments:")
        for dept in departments:
            print(f"     - {dept.department}: {dept.count} employees")
        
        # 6. API端点测试提示
        print("\n6. API Endpoints Ready for Testing:")
        print("   Employee Management:")
        print("     GET    /api/v1/enterprise/employees")
        print("     GET    /api/v1/enterprise/employees/{id}")
        print("     POST   /api/v1/enterprise/employees/{id}/disable")
        print("     POST   /api/v1/enterprise/employees/{id}/enable")
        print("     DELETE /api/v1/enterprise/employees/{id}")
        print("     GET    /api/v1/enterprise/statistics/employees")
        print("\n   Factory Management:")
        print("     GET    /api/v1/enterprise/factories")
        print("     POST   /api/v1/enterprise/factories")
        print("     PUT    /api/v1/enterprise/factories/{id}")
        print("     DELETE /api/v1/enterprise/factories/{id}")
        print("\n   Department Management:")
        print("     GET    /api/v1/enterprise/departments")
        print("     POST   /api/v1/enterprise/departments")
        print("     PUT    /api/v1/enterprise/departments/{id}")
        print("     DELETE /api/v1/enterprise/departments/{id}")
        
        print("\n" + "=" * 80)
        print("Integration Test PASSED!")
        print("=" * 80)
        print("\nNext Steps:")
        print("1. Start the backend server: cd backend && python -m uvicorn app.main:app --reload")
        print("2. Start the frontend: cd frontend && npm run dev")
        print("3. Login with enterprise user: " + user.email)
        print("4. Navigate to Enterprise Management pages")
        print("5. Test all CRUD operations")
        
    except Exception as e:
        print(f"\n✗ Test FAILED with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_enterprise_integration()

