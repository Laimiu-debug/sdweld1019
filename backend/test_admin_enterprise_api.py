"""
测试管理员企业管理API
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.services.admin_user_service import AdminUserService

DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_get_enterprise_users():
    """测试获取企业用户列表"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("测试管理员企业管理API")
        print("=" * 80)
        
        admin_user_service = AdminUserService()
        
        # 测试获取企业列表
        print("\n📋 获取企业列表...")
        result = admin_user_service.get_enterprise_users(
            db=db,
            page=1,
            page_size=10,
            search=None
        )
        
        print(f"\n✅ 成功获取企业列表:")
        print(f"  - 总企业数: {result['total']}")
        print(f"  - 总员工数: {result['summary']['total_enterprise_users']}")
        print(f"  - 当前页: {result['page']}/{result['total_pages']}")
        
        print(f"\n企业详情:")
        for idx, company in enumerate(result['items'], 1):
            print(f"\n{idx}. {company['company_name']}")
            print(f"   - 企业ID: {company['company_id']}")
            print(f"   - 会员等级: {company['membership_tier']}")
            print(f"   - 订阅状态: {company['subscription_status']}")
            print(f"   - 配额: {len(company['members'])}/{company['max_employees']} 员工, {company['max_factories']} 工厂")
            print(f"   - 管理员: {company['admin_user']['email']} ({company['admin_user']['username']})")
            print(f"   - 员工列表:")
            for emp in company['members']:
                print(f"     • {emp['employee_number']} - {emp['full_name']} ({emp['email']}) - {emp['role']} - {emp['position']}")
        
        # 测试搜索功能
        print("\n" + "=" * 80)
        print("测试搜索功能")
        print("=" * 80)
        
        search_result = admin_user_service.get_enterprise_users(
            db=db,
            page=1,
            page_size=10,
            search="testuser"
        )
        
        print(f"\n✅ 搜索 'testuser' 结果:")
        print(f"  - 找到 {search_result['total']} 个企业")
        for company in search_result['items']:
            print(f"  - {company['company_name']} ({company['admin_user']['email']})")
        
        print("\n" + "=" * 80)
        print("测试完成！")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n✗ 测试失败: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_get_enterprise_users()

