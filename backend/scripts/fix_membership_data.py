"""修复会员数据问题"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.database import SessionLocal
from app.models.company import Company
from app.models.user import User
from sqlalchemy import text

def fix_enterprise_quotas(db):
    """修复企业配额限制"""
    print('=' * 80)
    print('修复企业配额限制')
    print('=' * 80)
    
    # 企业级会员的正确配额
    enterprise_limits = {
        "max_employees": 10,
        "max_factories": 1,
        "max_wps_records": 200,
        "max_pqr_records": 200
    }
    
    # 查询所有企业级会员的企业
    companies = db.query(Company).filter(Company.membership_tier == 'enterprise').all()
    
    updated_count = 0
    for company in companies:
        needs_update = False
        
        if company.max_employees != enterprise_limits["max_employees"]:
            print(f'企业 {company.name} (ID: {company.id}): 更新员工配额 {company.max_employees} -> {enterprise_limits["max_employees"]}')
            company.max_employees = enterprise_limits["max_employees"]
            needs_update = True
        
        if company.max_factories != enterprise_limits["max_factories"]:
            print(f'企业 {company.name} (ID: {company.id}): 更新工厂配额 {company.max_factories} -> {enterprise_limits["max_factories"]}')
            company.max_factories = enterprise_limits["max_factories"]
            needs_update = True
        
        if company.max_wps_records != enterprise_limits["max_wps_records"]:
            print(f'企业 {company.name} (ID: {company.id}): 更新WPS配额 {company.max_wps_records} -> {enterprise_limits["max_wps_records"]}')
            company.max_wps_records = enterprise_limits["max_wps_records"]
            needs_update = True
        
        if company.max_pqr_records != enterprise_limits["max_pqr_records"]:
            print(f'企业 {company.name} (ID: {company.id}): 更新PQR配额 {company.max_pqr_records} -> {enterprise_limits["max_pqr_records"]}')
            company.max_pqr_records = enterprise_limits["max_pqr_records"]
            needs_update = True
        
        if needs_update:
            updated_count += 1
    
    db.commit()
    print(f'\n✅ 企业配额修复完成！共更新 {updated_count} 个企业。')
    return updated_count


def fix_enterprise_user_subscriptions(db):
    """修复企业会员用户的订阅状态"""
    print('\n' + '=' * 80)
    print('修复企业会员用户的订阅状态')
    print('=' * 80)
    
    # 查询所有企业会员类型的用户
    users = db.query(User).filter(User.membership_type == 'enterprise').all()
    
    updated_count = 0
    for user in users:
        needs_update = False
        
        # 企业会员应该是激活状态
        if user.subscription_status != 'active':
            print(f'用户 {user.email} (ID: {user.id}): 更新订阅状态 {user.subscription_status} -> active')
            user.subscription_status = 'active'
            needs_update = True
        
        # 如果没有订阅开始日期，设置为创建日期
        if not user.subscription_start_date:
            start_date = user.created_at if hasattr(user, 'created_at') and user.created_at else datetime.utcnow()
            print(f'用户 {user.email} (ID: {user.id}): 设置订阅开始日期为 {start_date}')
            user.subscription_start_date = start_date
            needs_update = True
        
        # 企业会员设置一年后到期
        if not user.subscription_end_date:
            if user.subscription_start_date:
                end_date = user.subscription_start_date + timedelta(days=365)
            else:
                end_date = datetime.utcnow() + timedelta(days=365)
            print(f'用户 {user.email} (ID: {user.id}): 设置订阅结束日期为 {end_date}')
            user.subscription_end_date = end_date
            needs_update = True
        
        if needs_update:
            updated_count += 1
    
    db.commit()
    print(f'\n✅ 企业用户订阅状态修复完成！共更新 {updated_count} 个用户。')
    return updated_count


def fix_company_subscriptions(db):
    """修复企业的订阅状态"""
    print('\n' + '=' * 80)
    print('修复企业的订阅状态')
    print('=' * 80)
    
    companies = db.query(Company).all()
    
    updated_count = 0
    for company in companies:
        needs_update = False
        
        # 企业应该是激活状态
        if company.subscription_status != 'active':
            print(f'企业 {company.name} (ID: {company.id}): 更新订阅状态 {company.subscription_status} -> active')
            company.subscription_status = 'active'
            needs_update = True
        
        # 如果没有订阅结束日期，设置为一年后
        if not company.subscription_end_date:
            if company.subscription_start_date:
                end_date = company.subscription_start_date + timedelta(days=365)
            else:
                end_date = datetime.utcnow() + timedelta(days=365)
            print(f'企业 {company.name} (ID: {company.id}): 设置订阅结束日期为 {end_date}')
            company.subscription_end_date = end_date
            needs_update = True
        
        if needs_update:
            updated_count += 1
    
    db.commit()
    print(f'\n✅ 企业订阅状态修复完成！共更新 {updated_count} 个企业。')
    return updated_count


def main():
    """主函数"""
    db = SessionLocal()
    try:
        print('\n🔧 开始修复会员数据...\n')
        
        # 1. 修复企业配额
        quota_count = fix_enterprise_quotas(db)
        
        # 2. 修复企业用户订阅状态
        user_count = fix_enterprise_user_subscriptions(db)
        
        # 3. 修复企业订阅状态
        company_count = fix_company_subscriptions(db)
        
        print('\n' + '=' * 80)
        print('✅ 所有修复完成！')
        print('=' * 80)
        print(f'- 更新企业配额: {quota_count} 个')
        print(f'- 更新用户订阅: {user_count} 个')
        print(f'- 更新企业订阅: {company_count} 个')
        print('=' * 80)
        
    except Exception as e:
        print(f'\n❌ 错误: {e}')
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

