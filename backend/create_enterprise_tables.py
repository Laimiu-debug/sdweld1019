"""
直接使用SQLAlchemy创建企业表
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

# 直接创建数据库连接，避免编码问题
DATABASE_URL = "postgresql://weld_user:weld_password@localhost:5432/weld_db"
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

Base = declarative_base()

# 导入模型
from app.models.company import Company, Factory, CompanyEmployee
from app.models.user import User

def create_tables():
    """创建企业相关表"""
    try:
        print("=" * 80)
        print("Creating enterprise tables...")
        print("=" * 80)

        # 创建所有表
        print("\nCreating table structures...")
        Base.metadata.create_all(bind=engine, tables=[
            Company.__table__,
            Factory.__table__,
            CompanyEmployee.__table__
        ])

        print("Success! Enterprise tables created!")
        print("\nCreated tables:")
        print("  - companies")
        print("  - factories")
        print("  - company_employees")

        print("\n" + "=" * 80)
        print("Migration completed!")
        print("=" * 80)

    except Exception as e:
        print(f"\nError creating tables: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    create_tables()

