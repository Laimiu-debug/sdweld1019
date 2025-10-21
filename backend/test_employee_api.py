"""
测试员工API
"""
import requests
import json

# API基础URL
BASE_URL = "http://localhost:8000/api/v1"

# 测试用户登录
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
    else:
        print(f"❌ 登录失败: {response.status_code}")
        print(response.text)
        return None

# 测试获取员工列表
def get_employees(token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(
        f"{BASE_URL}/enterprise/employees",
        headers=headers,
        params={
            "page": 1,
            "page_size": 20
        }
    )
    print(f"\n{'='*80}")
    print(f"获取员工列表 - 状态码: {response.status_code}")
    print(f"{'='*80}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get("success") and data.get("data"):
            items = data["data"].get("items", [])
            print(f"\n✅ 成功获取 {len(items)} 个员工")
            for emp in items:
                print(f"  - {emp.get('name')} ({emp.get('email')}) - {emp.get('role')} - {emp.get('status')}")
        else:
            print("❌ 响应格式不正确")
    else:
        print(f"❌ 请求失败: {response.status_code}")
        print(response.text)

# 测试获取员工配额
def get_employee_quota(token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(
        f"{BASE_URL}/enterprise/quota/employees",
        headers=headers
    )
    print(f"\n{'='*80}")
    print(f"获取员工配额 - 状态码: {response.status_code}")
    print(f"{'='*80}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get("success") and data.get("data"):
            quota = data["data"]
            print(f"\n✅ 员工配额:")
            print(f"  - 当前: {quota.get('current')}")
            print(f"  - 最大: {quota.get('max')}")
            print(f"  - 使用率: {quota.get('percentage')}%")
            print(f"  - 等级: {quota.get('tier')}")
    else:
        print(f"❌ 请求失败: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    # 使用企业会员账号登录
    print("🔐 登录企业会员账号...")
    # 尝试多个账号
    accounts = [
        ("test@example.com", "password123"),
        ("enterprise@example.com", "password123"),
        ("testuser176070001@example.com", "password123"),
    ]

    token = None
    for email, password in accounts:
        print(f"尝试登录: {email}")
        token = login(email, password)
        if token:
            print(f"✅ 使用 {email} 登录成功")
            break

    if not token:
        print("❌ 所有账号登录失败，无法继续测试")
        exit(1)

    print(f"✅ 登录成功，Token: {token[:50]}...")

    # 测试获取员工列表
    get_employees(token)

    # 测试获取员工配额
    get_employee_quota(token)

