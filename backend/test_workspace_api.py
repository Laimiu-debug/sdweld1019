#!/usr/bin/env python3
"""
测试工作区API
"""
import sys
import requests
import json
sys.path.append('.')

def test_workspace_api():
    """测试工作区API"""
    base_url = "http://localhost:8000/api/v1"
    
    # 首先尝试登录获取token
    print("Testing login...")
    
    try:
        # 尝试OAuth2表单登录 - 使用已知存在的用户
        login_data = {
            "username": "test@example.com",  # 使用数据库中存在的用户
            "password": "test123"
        }
        
        login_response = requests.post(
            f"{base_url}/auth/login",
            data=login_data,  # 使用表单数据
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            token = login_result.get("access_token")
            print(f"Login successful, token: {token[:20]}...")
            
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
            print(f"Login failed: {login_response.status_code} - {login_response.text}")
            
            # 尝试创建测试用户
            print("\nTrying to create test user...")
            register_data = {
                "username": "testuser",
                "email": "test@example.com",
                "password": "test123",
                "full_name": "Test User"
            }
            
            register_response = requests.post(
                f"{base_url}/auth/register",
                json=register_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Register response: {register_response.status_code} - {register_response.text}")
            
            # 如果注册成功，尝试登录
            if register_response.status_code == 200:
                print("\nTrying to login with new user...")
                login_data = {
                    "username": "test@example.com",
                    "password": "test123"
                }
                
                login_response = requests.post(
                    f"{base_url}/auth/login",
                    data=login_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                
                if login_response.status_code == 200:
                    login_result = login_response.json()
                    token = login_result.get("access_token")
                    print(f"Login with new user successful, token: {token[:20]}...")
                    
                    # 测试工作区API
                    headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                    
                    print("\nTesting get workspaces with new user...")
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
            
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_workspace_api()