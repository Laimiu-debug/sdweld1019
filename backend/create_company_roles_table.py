"""
创建企业角色表和更新员工表
"""
import sys
sys.path.insert(0, 'backend')

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_company_roles_table():
    """创建企业角色表"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
            # 创建企业角色表
            print("创建 company_roles 表...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS company_roles (
                    id SERIAL PRIMARY KEY,
                    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                    name VARCHAR(100) NOT NULL,
                    code VARCHAR(50),
                    description TEXT,
                    permissions JSONB DEFAULT '{}',
                    is_active BOOLEAN DEFAULT TRUE,
                    is_system BOOLEAN DEFAULT FALSE,
                    data_access_scope VARCHAR(50) DEFAULT 'factory',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    created_by INTEGER REFERENCES users(id),
                    updated_by INTEGER REFERENCES users(id)
                )
            """))
            print("✅ company_roles 表创建成功")
            
            # 添加索引
            print("添加索引...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_company_roles_company_id 
                ON company_roles(company_id)
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_company_roles_code 
                ON company_roles(code)
            """))
            print("✅ 索引创建成功")
            
            # 检查 company_employees 表是否已有 company_role_id 列
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'company_employees' 
                AND column_name = 'company_role_id'
            """))
            
            if result.fetchone() is None:
                print("添加 company_role_id 列到 company_employees 表...")
                conn.execute(text("""
                    ALTER TABLE company_employees 
                    ADD COLUMN company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL
                """))
                print("✅ company_role_id 列添加成功")
            else:
                print("⚠️  company_role_id 列已存在，跳过")
            
            # 为每个企业创建默认角色
            print("\n为现有企业创建默认角色...")
            
            # 获取所有企业
            companies = conn.execute(text("""
                SELECT id, name, owner_id FROM companies WHERE is_active = TRUE
            """)).fetchall()
            
            for company in companies:
                company_id, company_name, owner_id = company
                print(f"\n处理企业: {company_name} (ID: {company_id})")
                
                # 创建默认角色
                default_roles = [
                    {
                        'name': '企业管理员',
                        'code': 'ADMIN',
                        'description': '拥有所有权限的管理员角色',
                        'permissions': {
                            'wps_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'pqr_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'ppqr_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'equipment_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'materials_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'welders_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'employee_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'factory_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'department_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'role_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                            'reports_management': {'view': True, 'create': True, 'edit': True, 'delete': True},
                        },
                        'data_access_scope': 'company',
                        'is_system': True
                    },
                    {
                        'name': '部门经理',
                        'code': 'MANAGER',
                        'description': '部门经理，可以管理本部门的数据',
                        'permissions': {
                            'wps_management': {'view': True, 'create': True, 'edit': True, 'delete': False},
                            'pqr_management': {'view': True, 'create': True, 'edit': True, 'delete': False},
                            'ppqr_management': {'view': True, 'create': True, 'edit': True, 'delete': False},
                            'equipment_management': {'view': True, 'create': True, 'edit': True, 'delete': False},
                            'materials_management': {'view': True, 'create': True, 'edit': False, 'delete': False},
                            'welders_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'employee_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'factory_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'department_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'role_management': {'view': False, 'create': False, 'edit': False, 'delete': False},
                            'reports_management': {'view': True, 'create': True, 'edit': False, 'delete': False},
                        },
                        'data_access_scope': 'factory',
                        'is_system': True
                    },
                    {
                        'name': '普通员工',
                        'code': 'EMPLOYEE',
                        'description': '普通员工，只能查看和创建基本数据',
                        'permissions': {
                            'wps_management': {'view': True, 'create': True, 'edit': False, 'delete': False},
                            'pqr_management': {'view': True, 'create': True, 'edit': False, 'delete': False},
                            'ppqr_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'equipment_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'materials_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'welders_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                            'employee_management': {'view': False, 'create': False, 'edit': False, 'delete': False},
                            'factory_management': {'view': False, 'create': False, 'edit': False, 'delete': False},
                            'department_management': {'view': False, 'create': False, 'edit': False, 'delete': False},
                            'role_management': {'view': False, 'create': False, 'edit': False, 'delete': False},
                            'reports_management': {'view': True, 'create': False, 'edit': False, 'delete': False},
                        },
                        'data_access_scope': 'factory',
                        'is_system': True
                    }
                ]
                
                for role_data in default_roles:
                    # 检查角色是否已存在
                    existing = conn.execute(text("""
                        SELECT id FROM company_roles 
                        WHERE company_id = :company_id AND code = :code
                    """), {
                        'company_id': company_id,
                        'code': role_data['code']
                    }).fetchone()
                    
                    if existing:
                        print(f"  ⚠️  角色 {role_data['name']} 已存在，跳过")
                        continue
                    
                    # 创建角色
                    result = conn.execute(text("""
                        INSERT INTO company_roles (
                            company_id, name, code, description, permissions, 
                            data_access_scope, is_system, created_by
                        ) VALUES (
                            :company_id, :name, :code, :description, :permissions::jsonb,
                            :data_access_scope, :is_system, :created_by
                        ) RETURNING id
                    """), {
                        'company_id': company_id,
                        'name': role_data['name'],
                        'code': role_data['code'],
                        'description': role_data['description'],
                        'permissions': str(role_data['permissions']).replace("'", '"'),
                        'data_access_scope': role_data['data_access_scope'],
                        'is_system': role_data['is_system'],
                        'created_by': owner_id
                    })
                    
                    role_id = result.fetchone()[0]
                    print(f"  ✅ 创建角色: {role_data['name']} (ID: {role_id})")
                    
                    # 如果是管理员角色，将企业所有者分配到这个角色
                    if role_data['code'] == 'ADMIN':
                        conn.execute(text("""
                            UPDATE company_employees 
                            SET company_role_id = :role_id
                            WHERE company_id = :company_id 
                            AND user_id = :user_id
                            AND role = 'admin'
                        """), {
                            'role_id': role_id,
                            'company_id': company_id,
                            'user_id': owner_id
                        })
                        print(f"  ✅ 将企业所有者分配到管理员角色")
            
            trans.commit()
            print("\n" + "="*80)
            print("✅ 所有操作完成！")
            print("="*80)
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ 错误: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    create_company_roles_table()

