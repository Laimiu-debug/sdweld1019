"""
检查用户会员等级和企业会员等级的一致性
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.company import Company

DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_consistency():
    """检查会员等级一致性"""
    db = SessionLocal()
    
    try:
        print("=" * 100)
        print("检查用户会员等级和企业会员等级的一致性")
        print("=" * 100)
        
        # 获取所有企业会员
        enterprise_users = db.query(User).filter(
            User.membership_type == "enterprise",
            User.is_active == True
        ).all()
        
        print(f"\n找到 {len(enterprise_users)} 个企业会员用户\n")
        
        inconsistent_count = 0
        
        for user in enterprise_users:
            # 获取该用户的企业
            company = db.query(Company).filter(Company.owner_id == user.id).first()
            
            user_tier = user.member_tier
            company_tier = company.membership_tier if company else None
            
            is_consistent = user_tier == company_tier
            status = "✅" if is_consistent else "❌"
            
            if not is_consistent:
                inconsistent_count += 1
            
            print(f"{status} 用户: {user.email}")
            print(f"   - 用户ID: {user.id}")
            print(f"   - 用户会员等级: {user_tier}")
            print(f"   - 用户会员类型: {user.membership_type}")
            
            if company:
                print(f"   - 企业ID: {company.id}")
                print(f"   - 企业名称: {company.name}")
                print(f"   - 企业会员等级: {company_tier}")
                
                if not is_consistent:
                    print(f"   ⚠️  不一致！用户等级是 {user_tier}，但企业等级是 {company_tier}")
            else:
                print(f"   ⚠️  没有企业记录！")
            
            print()
        
        print("=" * 100)
        if inconsistent_count == 0:
            print("✅ 所有用户和企业的会员等级都一致！")
        else:
            print(f"❌ 发现 {inconsistent_count} 个不一致的记录")
            print("\n需要修复这些不一致的数据...")
        print("=" * 100)
        
        return inconsistent_count
        
    except Exception as e:
        print(f"\n✗ 检查失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def fix_inconsistency():
    """修复会员等级不一致"""
    db = SessionLocal()
    
    try:
        print("\n" + "=" * 100)
        print("修复会员等级不一致")
        print("=" * 100)
        
        # 获取所有企业会员
        enterprise_users = db.query(User).filter(
            User.membership_type == "enterprise",
            User.is_active == True
        ).all()
        
        fixed_count = 0
        
        for user in enterprise_users:
            company = db.query(Company).filter(Company.owner_id == user.id).first()
            
            if company and company.membership_tier != user.member_tier:
                old_tier = company.membership_tier
                company.membership_tier = user.member_tier
                
                print(f"✓ 修复企业: {company.name}")
                print(f"  - 企业ID: {company.id}")
                print(f"  - 旧等级: {old_tier}")
                print(f"  - 新等级: {user.member_tier}")
                print(f"  - 用户: {user.email}")
                print()
                
                fixed_count += 1
        
        if fixed_count > 0:
            db.commit()
            print(f"✅ 成功修复 {fixed_count} 个企业的会员等级")
        else:
            print("✅ 没有需要修复的数据")
        
        print("=" * 100)
        
    except Exception as e:
        print(f"\n✗ 修复失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    inconsistent_count = check_consistency()
    
    if inconsistent_count > 0:
        print("\n是否要修复这些不一致的数据？")
        response = input("输入 'yes' 继续修复: ")
        
        if response.lower() == 'yes':
            fix_inconsistency()
            print("\n重新检查一致性...")
            check_consistency()
        else:
            print("已取消修复")

