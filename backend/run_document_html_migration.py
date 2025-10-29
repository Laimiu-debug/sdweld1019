"""
执行document_html字段迁移脚本
"""
import os
import sys
import psycopg2
from psycopg2 import sql

def load_env_file():
    """加载.env文件"""
    env_file = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_file):
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

def get_database_config():
    """从环境变量或配置文件获取数据库配置"""
    # 先加载.env文件
    load_env_file()

    # 从环境变量获取
    db_config = {
        'host': os.getenv('DATABASE_HOST', 'localhost'),
        'port': os.getenv('DATABASE_PORT', '5432'),
        'database': os.getenv('DATABASE_NAME', 'weld_db'),
        'user': os.getenv('DATABASE_USER', 'weld_user'),
        'password': os.getenv('DATABASE_PASSWORD', 'weld_password')
    }

    return db_config

def run_migration():
    """执行数据库迁移"""
    print("=" * 60)
    print("WPS文档编辑器 - 数据库迁移")
    print("=" * 60)
    
    # 获取数据库配置
    db_config = get_database_config()
    
    print(f"\n数据库配置:")
    print(f"  主机: {db_config['host']}")
    print(f"  端口: {db_config['port']}")
    print(f"  数据库: {db_config['database']}")
    print(f"  用户: {db_config['user']}")
    
    # 读取迁移SQL
    migration_file = os.path.join(
        os.path.dirname(__file__),
        'migrations',
        'add_document_html_to_wps.sql'
    )
    
    if not os.path.exists(migration_file):
        print(f"\n✗ 迁移文件不存在: {migration_file}")
        return False
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()
    
    print(f"\n迁移SQL:")
    print("-" * 60)
    print(migration_sql)
    print("-" * 60)
    
    # 确认执行
    print("\n⚠️  即将执行数据库迁移")
    response = input("是否继续？(y/n): ")
    
    if response.lower() != 'y':
        print("\n已取消迁移")
        return False
    
    # 连接数据库
    try:
        print("\n正在连接数据库...")
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        print("✓ 数据库连接成功")
        
        # 执行迁移
        print("\n正在执行迁移...")
        cursor.execute(migration_sql)
        conn.commit()
        
        print("✓ 迁移执行成功")
        
        # 验证字段是否添加
        print("\n正在验证迁移结果...")
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'wps' AND column_name = 'document_html'
        """)
        
        result = cursor.fetchone()
        
        if result:
            print("✓ 字段验证成功")
            print(f"  字段名: {result[0]}")
            print(f"  数据类型: {result[1]}")
            print(f"  最大长度: {result[2] or '无限制'}")
        else:
            print("✗ 字段验证失败：未找到document_html字段")
            return False
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 60)
        print("🎉 迁移完成！")
        print("=" * 60)
        print("\n下一步:")
        print("1. 启动后端服务: uvicorn app.main:app --reload")
        print("2. 启动前端服务: npm run dev")
        print("3. 访问WPS编辑页面测试文档编辑功能")
        
        return True
        
    except psycopg2.Error as e:
        print(f"\n✗ 数据库错误: {e}")
        print("\n请检查:")
        print("1. 数据库是否正在运行")
        print("2. 数据库配置是否正确")
        print("3. 用户是否有足够的权限")
        return False
    except Exception as e:
        print(f"\n✗ 未知错误: {e}")
        return False

def check_field_exists():
    """检查字段是否已存在"""
    print("=" * 60)
    print("检查document_html字段是否已存在")
    print("=" * 60)
    
    db_config = get_database_config()
    
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'wps' AND column_name = 'document_html'
        """)
        
        result = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        if result:
            print("\n✓ document_html字段已存在")
            print("  无需执行迁移")
            return True
        else:
            print("\n✗ document_html字段不存在")
            print("  需要执行迁移")
            return False
            
    except psycopg2.Error as e:
        print(f"\n⚠️  无法连接数据库: {e}")
        print("  请确保数据库正在运行")
        return None

def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("WPS文档编辑器 - 数据库迁移工具")
    print("=" * 60 + "\n")
    
    # 检查字段是否已存在
    exists = check_field_exists()
    
    if exists is True:
        print("\n迁移已完成，无需重复执行")
        return 0
    elif exists is None:
        print("\n无法检查字段状态，请手动执行迁移SQL")
        print(f"迁移文件: migrations/add_document_html_to_wps.sql")
        return 1
    
    # 执行迁移
    print("\n")
    success = run_migration()
    
    return 0 if success else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n已取消迁移")
        sys.exit(1)

