#!/usr/bin/env python3
"""
创建测试用户并测试工作区API
"""
import sys
import requests
import json
sys.path.append('.')

from app.core.database import SessionLocal
from app.services.user_service import user_service
from app.schemas.user import UserCreate

def create_and_test_user():
    """创建测试用户并测试工作区API"""
    base_url = "http://localhost:8000/api/v1"
    
    # 创建数据库会话
    db = SessionLocal()
    try:
        # 创建测试用户
        print("Creating test user...")
        user_data = UserCreate(
            username="workspace_test_user",
            email="workspace_test@example.com",
            password="test123456",
            full_name="Workspace Test User"
        )
        
        user = user_service.create(db, obj_in=user_data)
        print(f"Created user: ID={user.id}, Email={user.email}")
        
        # 测试认证
        print("\nTesting authentication...")
        auth_user = user_service.authenticate(db, email="workspace_test@example.com", password="test123456")
        if auth_user:
            print(f"Authentication successful: ID={auth_user.id}, Email={auth_user.email}")
        else:
            print("Authentication failed")
            return
            
    except Exception as e:
        print(f"Error: {e}")
        return
    finally:
        db.close()
    
    # 测试API登录
    print("\nTesting API login...")
    login_data = {
        "username": "workspace_test@example.com",
        "password": "test123456"
    }
    
    try:
        login_response = requests.post(
            f"{base_url}/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get("access_token")
            print(f"API login successful, token: {token[:20]}...")
            
            # 使用token测试工作区API
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # 测试获取工作区列表
            print("\nTesting get workspaces...")
            workspaces_response = requests.get(
                f"{base_url}/workspace/workspaces",
                headers=headers
            )
            
            print(f"Workspaces API status: {workspaces_response.status_code}")
            if workspaces_response.status_code == 200:
                workspaces = workspaces_response.json()
                print(f"Workspaces: {json.dumps(workspaces, indent=2, ensure_ascii=False)}")
            else:
                print(f"Workspaces API error: {workspaces_response.text}")
                
            # 测试获取当前工作区
            print("\nTesting get current workspace...")
            current_workspace_response = requests.get(
                f"{base_url}/workspace/workspaces/current",
                headers=headers
            )
            
            print(f"Current workspace API status: {current_workspace_response.status_code}")
            if current_workspace_response.status_code == 200:
                current_workspace = current_workspace_response.json()
                print(f"Current workspace: {json.dumps(current_workspace, indent=2, ensure_ascii=False)}")
            else:
                print(f"Current workspace API error: {current_workspace_response.text}")
                
            # 测试获取默认工作区
            print("\nTesting get default workspace...")
            default_workspace_response = requests.get(
                f"{base_url}/workspace/workspaces/default",
                headers=headers
            )
            
            print(f"Default workspace API status: {default_workspace_response.status_code}")
            if default_workspace_response.status_code == 200:
                default_workspace = default_workspace_response.json()
                print(f"Default workspace: {json.dumps(default_workspace, indent=2, ensure_ascii=False)}")
            else:
                print(f"Default workspace API error: {default_workspace_response.text}")
                
        else:
            print(f"API login failed: {login_response.status_code} - {login_response.text}")
            
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    create_and_test_user()