"""
检查企业所有者是否已经作为员工添加到员工表中
"""
import sys
sys.path.insert(0, 'backend')

from app.core.database import SessionLocal
from app.models.user import User
from app.models.company import Company, CompanyEmployee

def check_owner_as_employee():
    db = SessionLocal()
    try:
        print("\n" + "="*80)
        print("检查企业所有者是否在员工表中")
        print("="*80 + "\n")
        
        # 获取所有企业
        companies = db.query(Company).filter(Company.is_active == True).all()
        
        print(f"找到 {len(companies)} 个活跃企业\n")
        
        for company in companies:
            owner = db.query(User).filter(User.id == company.owner_id).first()
            if not owner:
                print(f"❌ 企业 {company.name} (ID: {company.id}) 的所有者不存在")
                continue
            
            # 检查所有者是否在员工表中
            employee = db.query(CompanyEmployee).filter(
                CompanyEmployee.company_id == company.id,
                CompanyEmployee.user_id == owner.id
            ).first()
            
            if employee:
                print(f"✅ 企业: {company.name}")
                print(f"   所有者: {owner.email}")
                print(f"   员工记录: 存在 (ID: {employee.id}, 角色: {employee.role}, 状态: {employee.status})")
            else:
                print(f"❌ 企业: {company.name}")
                print(f"   所有者: {owner.email}")
                print(f"   员工记录: 不存在")
                
                # 统计该企业的员工数
                employee_count = db.query(CompanyEmployee).filter(
                    CompanyEmployee.company_id == company.id
                ).count()
                print(f"   当前员工数: {employee_count}")
            
            print()
        
        print("\n" + "="*80)
        print("检查完成")
        print("="*80 + "\n")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_owner_as_employee()

