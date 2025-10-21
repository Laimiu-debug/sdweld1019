"""
测试用户会员等级和企业会员等级的同步
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.models.company import Company
from app.services.admin_user_service import AdminUserService

DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_membership_sync():
    """测试会员等级同步"""
    db = SessionLocal()
    
    try:
        print("=" * 100)
        print("测试用户会员等级和企业会员等级的同步")
        print("=" * 100)
        
        admin_user_service = AdminUserService()
        
        # 找一个企业会员用户进行测试
        test_user = db.query(User).filter(
            User.email == "testuser176070002@example.com"
        ).first()
        
        if not test_user:
            print("❌ 测试用户不存在")
            return
        
        print(f"\n📋 测试用户: {test_user.email}")
        print(f"   - 当前会员等级: {test_user.member_tier}")
        print(f"   - 当前会员类型: {test_user.membership_type}")
        
        # 获取企业信息
        company = db.query(Company).filter(Company.owner_id == test_user.id).first()
        if company:
            print(f"   - 企业名称: {company.name}")
            print(f"   - 企业会员等级: {company.membership_tier}")
        else:
            print(f"   - ❌ 没有企业记录")
            return
        
        # 测试1: 调整会员等级（从 enterprise_pro 到 enterprise_pro_max）
        print("\n" + "=" * 100)
        print("测试1: 调整会员等级 enterprise_pro -> enterprise_pro_max")
        print("=" * 100)
        
        result = admin_user_service.adjust_user_membership(
            db=db,
            user=test_user,
            membership_tier="enterprise_pro_max",
            reason="测试会员等级同步"
        )
        
        print(f"\n✅ 调整结果:")
        print(f"   - 旧等级: {result['old_tier']}")
        print(f"   - 新等级: {result['new_tier']}")
        
        # 刷新数据
        db.refresh(test_user)
        db.refresh(company)
        
        print(f"\n验证同步结果:")
        print(f"   - 用户会员等级: {test_user.member_tier}")
        print(f"   - 企业会员等级: {company.membership_tier}")
        
        if test_user.member_tier == company.membership_tier:
            print(f"   ✅ 同步成功！")
        else:
            print(f"   ❌ 同步失败！用户等级和企业等级不一致")
        
        # 测试2: 再次调整会员等级（从 enterprise_pro_max 到 enterprise）
        print("\n" + "=" * 100)
        print("测试2: 调整会员等级 enterprise_pro_max -> enterprise")
        print("=" * 100)
        
        result = admin_user_service.adjust_user_membership(
            db=db,
            user=test_user,
            membership_tier="enterprise",
            reason="测试会员等级同步"
        )
        
        print(f"\n✅ 调整结果:")
        print(f"   - 旧等级: {result['old_tier']}")
        print(f"   - 新等级: {result['new_tier']}")
        
        # 刷新数据
        db.refresh(test_user)
        db.refresh(company)
        
        print(f"\n验证同步结果:")
        print(f"   - 用户会员等级: {test_user.member_tier}")
        print(f"   - 企业会员等级: {company.membership_tier}")
        
        if test_user.member_tier == company.membership_tier:
            print(f"   ✅ 同步成功！")
        else:
            print(f"   ❌ 同步失败！用户等级和企业等级不一致")
        
        # 恢复原始等级
        print("\n" + "=" * 100)
        print("恢复原始会员等级 enterprise -> enterprise_pro")
        print("=" * 100)
        
        admin_user_service.adjust_user_membership(
            db=db,
            user=test_user,
            membership_tier="enterprise_pro",
            reason="恢复原始等级"
        )
        
        db.refresh(test_user)
        db.refresh(company)
        
        print(f"\n✅ 已恢复:")
        print(f"   - 用户会员等级: {test_user.member_tier}")
        print(f"   - 企业会员等级: {company.membership_tier}")
        
        print("\n" + "=" * 100)
        print("✅ 所有测试完成！")
        print("=" * 100)
        
    except Exception as e:
        print(f"\n✗ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_membership_sync()

