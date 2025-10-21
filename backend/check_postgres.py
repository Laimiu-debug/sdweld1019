#!/usr/bin/env python3
"""
PostgreSQL数据库检查工具
"""

import psycopg2
import sys

# 数据库连接配置
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'weld_user',
    'password': 'weld_password',
    'database': 'weld_db'
}

def check_connection():
    """检查PostgreSQL连接"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("PostgreSQL连接成功!")

        # 获取数据库版本
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"版本: {version[0]}")

        # 获取所有表
        cursor.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"\n数据库表 (共{len(tables)}个):")
        for table in tables:
            print(f"  - {table[0]}")

        conn.close()
        return True

    except Exception as e:
        print(f"连接失败: {e}")
        return False

if __name__ == "__main__":
    check_connection()