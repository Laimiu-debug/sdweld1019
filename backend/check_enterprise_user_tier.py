"""
检查enterprise@example.com用户的会员等级
"""
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

# 登录
def login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        data={
            "username": email,
            "password": password
        }
    )
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    return None

# 获取当前用户信息
def get_current_user(token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(
        f"{BASE_URL}/users/me",
        headers=headers
    )
    if response.status_code == 200:
        return response.json()
    return None

if __name__ == "__main__":
    print("🔐 登录...")
    token = login("enterprise@example.com", "password123")
    
    if token:
        print("✅ 登录成功\n")
        
        user_info = get_current_user(token)
        if user_info:
            print("用户信息:")
            print(json.dumps(user_info, indent=2, ensure_ascii=False))
            
            print(f"\n会员信息:")
            print(f"  - 会员类型: {user_info.get('membership_type')}")
            print(f"  - 会员等级: {user_info.get('member_tier')}")
            print(f"  - 是否激活: {user_info.get('is_active')}")
    else:
        print("❌ 登录失败")

