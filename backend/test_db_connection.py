#!/usr/bin/env python3
"""
测试数据库连接
"""
import sys
sys.path.append('.')

from app.core.database import engine
from sqlalchemy import text

def test_database_connection():
    """测试数据库连接"""
    try:
        print("Testing database connection...")
        with engine.connect() as conn:
            result = conn.execute(text('SELECT 1'))
            print(f"Database connection successful: {result.fetchone()}")
            
        # 检查数据库表是否存在
        print("\nChecking database tables...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = result.fetchall()
            print(f"Found {len(tables)} tables:")
            for table in tables:
                print(f"  - {table[0]}")
                
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)