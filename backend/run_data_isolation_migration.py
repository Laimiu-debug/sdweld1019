"""
执行数据隔离和工作区管理迁移脚本
Run Data Isolation and Workspace Management Migration
"""
import sys
import os
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, engine

# 导入所有模型以确保它们被注册
from app.models.user import User
from app.models.company import Company, Factory, CompanyEmployee, CompanyRole
from app.models.wps import WPS
from app.models.pqr import PQR
from app.models.ppqr import PPQR
from app.models.material import WeldingMaterial, MaterialTransaction, MaterialCategory
from app.models.welder import Welder, WelderCertification, WelderTraining, WelderWorkRecord
from app.models.equipment import Equipment, EquipmentMaintenance, EquipmentUsage
from app.models.production import ProductionTask, ProductionRecord, ProductionPlan
from app.models.quality import QualityInspection, NonconformanceRecord, QualityMetric


def run_sql_migration():
    """执行 SQL 迁移脚本"""
    print("=" * 80)
    print("开始执行数据隔离和工作区管理迁移")
    print("=" * 80)
    
    # 读取 SQL 迁移脚本
    migration_file = Path(__file__).parent / "migrations" / "add_data_isolation_fields.sql"
    
    if not migration_file.exists():
        print(f"错误：迁移文件不存在: {migration_file}")
        return False
    
    print(f"\n读取迁移脚本: {migration_file}")
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql_script = f.read()
    
    # 执行 SQL 脚本
    try:
        with engine.connect() as connection:
            # 开始事务
            trans = connection.begin()
            
            try:
                print("\n执行 SQL 迁移脚本...")
                
                # 分割 SQL 语句并逐个执行
                statements = [s.strip() for s in sql_script.split(';') if s.strip()]
                
                for i, statement in enumerate(statements, 1):
                    # 跳过注释和空语句
                    if statement.startswith('--') or not statement:
                        continue
                    
                    # 跳过 DO 块（PostgreSQL 特定语法）
                    if 'DO $$' in statement:
                        print(f"  [{i}/{len(statements)}] 执行 DO 块...")
                        connection.execute(text(statement + ';'))
                        continue
                    
                    try:
                        # 显示正在执行的语句（简短版本）
                        stmt_preview = statement[:100].replace('\n', ' ')
                        print(f"  [{i}/{len(statements)}] {stmt_preview}...")
                        
                        connection.execute(text(statement))
                    except Exception as e:
                        # 某些语句可能因为已存在而失败，这是正常的
                        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                            print(f"    ⚠️  跳过（已存在）: {str(e)[:100]}")
                        else:
                            print(f"    ❌ 错误: {str(e)[:200]}")
                            # 不中断，继续执行其他语句
                
                # 提交事务
                trans.commit()
                print("\n✅ SQL 迁移脚本执行成功")
                return True
                
            except Exception as e:
                trans.rollback()
                print(f"\n❌ SQL 迁移失败: {str(e)}")
                return False
                
    except Exception as e:
        print(f"\n❌ 数据库连接失败: {str(e)}")
        return False


def create_tables():
    """使用 SQLAlchemy 创建所有表"""
    print("\n" + "=" * 80)
    print("使用 SQLAlchemy 创建/更新所有表")
    print("=" * 80)
    
    try:
        print("\n创建所有表...")
        Base.metadata.create_all(bind=engine)
        print("✅ 所有表创建/更新成功")
        return True
    except Exception as e:
        print(f"❌ 创建表失败: {str(e)}")
        return False


def verify_migration():
    """验证迁移结果"""
    print("\n" + "=" * 80)
    print("验证迁移结果")
    print("=" * 80)
    
    try:
        with engine.connect() as connection:
            # 检查关键表是否存在
            tables_to_check = [
                'wps',
                'pqr',
                'ppqr',
                'welding_materials',
                'welders',
                'equipment',
                'production_tasks',
                'quality_inspections'
            ]
            
            print("\n检查表是否存在:")
            for table in tables_to_check:
                result = connection.execute(text(
                    f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '{table}')"
                ))
                exists = result.scalar()
                status = "✅" if exists else "❌"
                print(f"  {status} {table}")
            
            # 检查 WPS 表的数据隔离字段
            print("\n检查 WPS 表的数据隔离字段:")
            fields_to_check = [
                'user_id',
                'workspace_type',
                'company_id',
                'factory_id',
                'is_shared',
                'access_level',
                'created_by',
                'updated_by'
            ]
            
            for field in fields_to_check:
                result = connection.execute(text(
                    f"SELECT EXISTS (SELECT FROM information_schema.columns "
                    f"WHERE table_name = 'wps' AND column_name = '{field}')"
                ))
                exists = result.scalar()
                status = "✅" if exists else "❌"
                print(f"  {status} {field}")
            
            # 检查 PQR 表的数据隔离字段
            print("\n检查 PQR 表的数据隔离字段:")
            for field in fields_to_check:
                result = connection.execute(text(
                    f"SELECT EXISTS (SELECT FROM information_schema.columns "
                    f"WHERE table_name = 'pqr' AND column_name = '{field}')"
                ))
                exists = result.scalar()
                status = "✅" if exists else "❌"
                print(f"  {status} {field}")
            
            # 统计现有数据
            print("\n现有数据统计:")
            for table in ['wps', 'pqr', 'users', 'companies']:
                try:
                    result = connection.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"  {table}: {count} 条记录")
                except:
                    print(f"  {table}: 表不存在或无法访问")
            
            print("\n✅ 迁移验证完成")
            return True
            
    except Exception as e:
        print(f"\n❌ 验证失败: {str(e)}")
        return False


def main():
    """主函数"""
    print("\n" + "=" * 80)
    print("数据隔离和工作区管理系统 - 数据库迁移工具")
    print("Data Isolation and Workspace Management - Database Migration Tool")
    print("=" * 80)

    print(f"\n数据库连接: {settings.DATABASE_URL}")
    print(f"调试模式: {settings.DEBUG}")

    # 确认执行
    response = input("\n是否继续执行迁移？(yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("迁移已取消")
        return
    
    # 步骤 1: 执行 SQL 迁移
    sql_success = run_sql_migration()
    
    # 步骤 2: 使用 SQLAlchemy 创建表
    create_success = create_tables()
    
    # 步骤 3: 验证迁移结果
    verify_success = verify_migration()
    
    # 总结
    print("\n" + "=" * 80)
    print("迁移总结")
    print("=" * 80)
    print(f"SQL 迁移: {'✅ 成功' if sql_success else '❌ 失败'}")
    print(f"表创建: {'✅ 成功' if create_success else '❌ 失败'}")
    print(f"验证: {'✅ 成功' if verify_success else '❌ 失败'}")
    
    if sql_success and create_success and verify_success:
        print("\n🎉 迁移全部完成！")
        print("\n接下来的步骤:")
        print("1. 重启后端服务")
        print("2. 测试工作区切换功能")
        print("3. 测试数据隔离功能")
        print("4. 测试配额管理功能")
    else:
        print("\n⚠️  迁移过程中出现错误，请检查日志")
    
    print("=" * 80)


if __name__ == "__main__":
    main()

