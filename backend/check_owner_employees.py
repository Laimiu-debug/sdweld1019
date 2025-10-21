"""
检查企业所有者是否在员工表中
"""
import sys
import os

# 设置环境变量避免编码问题
os.environ['PYTHONIOENCODING'] = 'utf-8'

sys.path.insert(0, 'backend')

from sqlalchemy import create_engine, text
from app.core.config import settings

# 创建数据库连接
engine = create_engine(settings.DATABASE_URL)

def check_owners():
    with engine.connect() as conn:
        # 查询所有企业及其所有者
        query = text("""
            SELECT 
                c.id as company_id,
                c.name as company_name,
                c.owner_id,
                u.email as owner_email,
                (SELECT COUNT(*) FROM company_employees ce 
                 WHERE ce.company_id = c.id AND ce.user_id = c.owner_id) as owner_in_employees,
                (SELECT COUNT(*) FROM company_employees ce 
                 WHERE ce.company_id = c.id) as total_employees
            FROM companies c
            JOIN users u ON c.owner_id = u.id
            WHERE c.is_active = true
        """)
        
        result = conn.execute(query)
        rows = result.fetchall()
        
        print("\n" + "="*80)
        print("企业所有者员工记录检查")
        print("="*80 + "\n")
        
        for row in rows:
            company_id, company_name, owner_id, owner_email, owner_in_employees, total_employees = row
            
            status = "✅ 存在" if owner_in_employees > 0 else "❌ 不存在"
            
            print(f"企业: {company_name}")
            print(f"  所有者: {owner_email}")
            print(f"  所有者在员工表: {status}")
            print(f"  总员工数: {total_employees}")
            print()
        
        print("="*80 + "\n")

if __name__ == "__main__":
    check_owners()

