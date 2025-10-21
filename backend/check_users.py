#!/usr/bin/env python3
"""
检查数据库中的用户
"""
import sys
sys.path.append('.')

from app.core.database import engine
from sqlalchemy import text
from app.services.user_service import user_service

def check_users():
    """检查数据库中的用户"""
    try:
        print("Checking existing users...")
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, username, email, is_active, is_verified, member_tier, membership_type
                FROM users 
                ORDER BY id
                LIMIT 10
            """))
            users = result.fetchall()
            
            if users:
                print(f"Found {len(users)} users:")
                for user in users:
                    print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Active: {user[3]}, Verified: {user[4]}, Tier: {user[5]}, Type: {user[6]}")
            else:
                print("No users found in database")
                
        # 尝试创建一个测试用户
        print("\nTrying to create test user...")
        from app.core.database import SessionLocal
        from app.schemas.user import UserCreate
        
        db = SessionLocal()
        try:
            # 创建测试用户
            user_data = UserCreate(
                username="testuser123",
                email="test123@example.com",
                password="test123",
                full_name="Test User 123"
            )
            
            user = user_service.create(db, obj_in=user_data)
            print(f"Created user: ID={user.id}, Email={user.email}")
            
            # 尝试登录
            print("\nTrying to authenticate test user...")
            auth_user = user_service.authenticate(db, email="test123@example.com", password="test123")
            if auth_user:
                print(f"Authentication successful: ID={auth_user.id}, Email={auth_user.email}")
            else:
                print("Authentication failed")
                
        except Exception as e:
            print(f"Error creating user: {e}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error checking users: {e}")

if __name__ == "__main__":
    check_users()