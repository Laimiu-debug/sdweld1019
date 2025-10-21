"""
检查当前登录用户的权限
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User

# 使用正确的数据库URL
DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_permissions():
    """检查用户权限"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("Checking User Permissions")
        print("=" * 80)
        
        # 查找所有用户
        users = db.query(User).all()
        
        print(f"\n找到 {len(users)} 个用户:\n")
        
        for user in users:
            print(f"Email: {user.email}")
            print(f"  - ID: {user.id}")
            print(f"  - Username: {user.username}")
            print(f"  - Membership Type: {user.membership_type}")
            print(f"  - Member Tier: {user.member_tier}")
            print(f"  - Is Active: {user.is_active}")
            print(f"  - Is Superuser: {user.is_superuser}")
            
            # 检查是否符合企业会员条件
            enterprise_tiers = ["enterprise", "enterprise_pro", "enterprise_pro_max"]
            is_enterprise = (
                user.membership_type == "enterprise" and
                user.member_tier in enterprise_tiers and
                user.is_active
            )
            print(f"  - 符合企业会员条件: {'✓ YES' if is_enterprise else '✗ NO'}")
            
            if not is_enterprise:
                if user.membership_type != "enterprise":
                    print(f"    原因: membership_type 不是 'enterprise' (当前: {user.membership_type})")
                elif user.member_tier not in enterprise_tiers:
                    print(f"    原因: member_tier 不在企业等级列表中 (当前: {user.member_tier})")
                elif not user.is_active:
                    print(f"    原因: 用户未激活")
            
            print()
        
        # 查找企业会员
        print("\n" + "=" * 80)
        print("企业会员列表:")
        print("=" * 80)
        
        enterprise_users = db.query(User).filter(
            User.membership_type == "enterprise",
            User.is_active == True
        ).all()
        
        if enterprise_users:
            for user in enterprise_users:
                print(f"\n✓ {user.email}")
                print(f"  - Member Tier: {user.member_tier}")
                print(f"  - Is Active: {user.is_active}")
        else:
            print("\n没有找到企业会员用户！")
            print("\n建议操作:")
            print("1. 升级现有用户到企业会员")
            print("2. 或创建新的企业会员用户")
        
    except Exception as e:
        print(f"\n✗ 错误: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_permissions()

