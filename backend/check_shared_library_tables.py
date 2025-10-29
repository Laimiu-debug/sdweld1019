"""
检查共享库表是否存在的脚本
"""
import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine
from sqlalchemy import text

def check_shared_library_tables():
    """检查共享库相关表是否存在"""
    print("=== 检查共享库数据库表 ===")

    try:
        with engine.connect() as connection:
            # 检查表是否存在
            tables_to_check = [
                'shared_modules',
                'shared_templates',
                'user_ratings',
                'shared_downloads',
                'shared_comments'
            ]

            existing_tables = []
            missing_tables = []

            for table in tables_to_check:
                try:
                    result = connection.execute(text(f"SELECT COUNT(*) FROM {table} LIMIT 1"))
                    print(f"✅ 表 {table} 存在")
                    existing_tables.append(table)
                except Exception as e:
                    print(f"❌ 表 {table} 不存在或无法访问: {e}")
                    missing_tables.append(table)

            if len(existing_tables) == len(tables_to_check):
                print(f"\n✅ 所有共享库表都已存在 ({len(existing_tables)}/{len(tables_to_check)})")
                return True
            else:
                print(f"\n⚠️ 部分表缺失 ({len(existing_tables)}/{len(tables_to_check)})")
                print(f"缺失的表: {missing_tables}")
                return False

    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

def run_migration_if_needed():
    """如果需要则运行迁移"""
    if not check_shared_library_tables():
        print("\n=== 尝试执行共享库迁移 ===")

        try:
            # 读取迁移文件
            migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'create_shared_library_tables.sql')
            with open(migration_file, 'r', encoding='utf-8') as f:
                migration_sql = f.read()

            # 执行迁移
            with engine.connect() as connection:
                # 分割SQL语句并逐个执行
                statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]

                for statement in statements:
                    if statement:
                        try:
                            connection.execute(text(statement))
                            connection.commit()
                        except Exception as e:
                            print(f"执行语句失败: {e}")
                            print(f"语句: {statement[:100]}...")

                print("✅ 迁移执行完成")

            # 再次检查
            return check_shared_library_tables()

        except Exception as e:
            print(f"❌ 迁移执行失败: {e}")
            return False
    else:
        return True

def check_table_data():
    """检查表中的数据"""
    print("\n=== 检查共享库表数据 ===")

    try:
        with engine.connect() as connection:
            tables = ['shared_modules', 'shared_templates', 'user_ratings', 'shared_downloads', 'shared_comments']

            for table in tables:
                try:
                    result = connection.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"📊 {table}: {count} 条记录")
                except Exception as e:
                    print(f"❌ 无法查询 {table}: {e}")

    except Exception as e:
        print(f"❌ 数据查询失败: {e}")

if __name__ == "__main__":
    print("共享库数据库检查工具")
    print("=" * 40)

    # 检查表是否存在
    if run_migration_if_needed():
        # 检查数据
        check_table_data()
        print("\n✅ 共享库数据库检查完成")
    else:
        print("\n❌ 共享库数据库设置失败")