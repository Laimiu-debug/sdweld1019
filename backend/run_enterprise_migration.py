"""
运行企业表迁移脚本
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.core.database import SessionLocal

def run_migration():
    """运行企业表迁移"""
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("开始运行企业表迁移...")
        print("=" * 80)
        
        # 读取SQL文件
        sql_file = os.path.join(os.path.dirname(__file__), "migrations", "add_enterprise_tables.sql")
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # 执行SQL
        print("\n执行SQL迁移...")
        db.execute(text(sql_content))
        db.commit()
        
        print("✅ 企业表迁移成功完成！")
        print("\n创建的表:")
        print("  - companies (企业表)")
        print("  - factories (工厂表)")
        print("  - company_employees (企业员工关联表)")
        
        # 验证表是否创建成功
        print("\n验证表创建...")
        result = db.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('companies', 'factories', 'company_employees')
            ORDER BY table_name
        """))
        
        tables = [row[0] for row in result]
        print(f"✅ 找到 {len(tables)} 个表: {', '.join(tables)}")
        
        print("\n" + "=" * 80)
        print("迁移完成！")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ 迁移失败: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()

