"""
修复会员类型不匹配的问题
将所有 member_tier 为企业等级但 membership_type 为 personal 的用户修复为 enterprise
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

def fix_membership_type_mismatch():
    """修复会员类型不匹配"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("修复会员类型不匹配问题")
        print("=" * 80)
        
        # 企业等级列表
        enterprise_tiers = ["enterprise", "enterprise_pro", "enterprise_pro_max"]
        
        # 查找所有 member_tier 为企业等级但 membership_type 不是 enterprise 的用户
        mismatched_users = db.query(User).filter(
            User.member_tier.in_(enterprise_tiers),
            User.membership_type != "enterprise"
        ).all()
        
        print(f"\n找到 {len(mismatched_users)} 个会员类型不匹配的用户:\n")
        
        enterprise_service = EnterpriseService(db)
        fixed_count = 0
        
        for user in mismatched_users:
            print(f"用户: {user.email}")
            print(f"  - User ID: {user.id}")
            print(f"  - Member Tier: {user.member_tier} (企业等级)")
            print(f"  - Membership Type: {user.membership_type} (应该是 enterprise)")
            
            # 修复 membership_type
            user.membership_type = "enterprise"
            user.is_active = True
            
            print(f"  - ✓ 已修复 membership_type 为 enterprise")
            
            # 检查是否有企业记录
            company = enterprise_service.get_company_by_owner(user.id)
            
            if not company:
                print(f"  - 创建企业记录...")
                
                # 创建企业
                company = enterprise_service.create_company(
                    owner_id=user.id,
                    name=f"{user.full_name or user.username or user.email.split('@')[0]}'s Company",
                    membership_tier=user.member_tier
                )
                print(f"  - ✓ 企业创建成功: {company.name}")
                
                # 创建总部工厂
                factory_code = f"HQ{company.id}"
                factory = enterprise_service.create_factory(
                    company_id=company.id,
                    name="Headquarters",
                    code=factory_code,
                    is_headquarters=True,
                    created_by=user.id
                )
                print(f"  - ✓ 工厂创建成功: {factory.name}")
                
                # 添加用户为管理员员工
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
                print(f"  - ✓ 企业记录已存在: {company.name}")
            
            fixed_count += 1
            print()
        
        # 提交所有更改
        db.commit()
        
        print("=" * 80)
        print(f"修复完成！共修复 {fixed_count} 个用户")
        print("=" * 80)
        
        # 显示所有企业会员
        print(f"\n当前所有企业会员:")
        enterprise_users = db.query(User).filter(
            User.membership_type == "enterprise",
            User.is_active == True
        ).all()
        
        for user in enterprise_users:
            company = enterprise_service.get_company_by_owner(user.id)
            print(f"  ✓ {user.email}")
            print(f"    - Member Tier: {user.member_tier}")
            print(f"    - Membership Type: {user.membership_type}")
            print(f"    - Company: {company.name if company else '无'}")
        
        print(f"\n现在可以使用以上任一账号登录并访问企业管理功能。")
        print(f"\n重要提示:")
        print(f"1. 如果你已经登录，请退出并重新登录")
        print(f"2. 重新登录后，会员类型会正确显示为企业会员")
        print(f"3. 企业管理功能将正常工作")
        
    except Exception as e:
        print(f"\n✗ 修复失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_membership_type_mismatch()

