"""
创建用户通知已读状态表
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def create_notification_read_status_table():
    """创建用户通知已读状态表"""
    engine = create_engine(settings.DATABASE_URL)
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS user_notification_read_status (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        announcement_id INTEGER NOT NULL REFERENCES system_announcements(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, announcement_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_notification_user_id 
        ON user_notification_read_status(user_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_notification_announcement_id 
        ON user_notification_read_status(announcement_id);
    
    CREATE INDEX IF NOT EXISTS idx_user_notification_is_read 
        ON user_notification_read_status(is_read);
    
    CREATE INDEX IF NOT EXISTS idx_user_notification_is_deleted 
        ON user_notification_read_status(is_deleted);
    """
    
    try:
        with engine.connect() as conn:
            conn.execute(text(create_table_sql))
            conn.commit()
        print("✅ 用户通知已读状态表创建成功！")
        return True
    except Exception as e:
        print(f"❌ 创建表失败: {str(e)}")
        return False
    finally:
        engine.dispose()

if __name__ == "__main__":
    print("开始创建用户通知已读状态表...")
    success = create_notification_read_status_table()
    if success:
        print("\n🎉 数据库表创建完成！")
    else:
        print("\n❌ 数据库表创建失败，请检查错误信息")
        sys.exit(1)

