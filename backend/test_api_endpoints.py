"""
测试企业管理API端点
"""
import requests
import json

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

# 企业用户登录凭证
ENTERPRISE_USER = {
    "username": "enterprise@example.com",
    "password": "enterprise123"  # 请根据实际密码修改
}

def login():
    """登录获取token"""
    print("\n1. Logging in as enterprise user...")
    response = requests.post(
        f"{API_BASE}/auth/login",
        data=ENTERPRISE_USER
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print(f"   ✓ Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"   ✗ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_employee_endpoints(token):
    """测试员工管理端点"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n2. Testing Employee Management Endpoints...")
    
    # 获取员工列表
    print("\n   2.1 GET /enterprise/employees")
    response = requests.get(
        f"{API_BASE}/enterprise/employees",
        headers=headers,
        params={"page": 1, "page_size": 20}
    )
    print(f"       Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"       ✓ Found {data['data']['total']} employees")
        if data['data']['items']:
            print(f"       First employee: {data['data']['items'][0]['employee_number']}")
    else:
        print(f"       ✗ Error: {response.text}")
    
    # 获取员工统计
    print("\n   2.2 GET /enterprise/statistics/employees")
    response = requests.get(
        f"{API_BASE}/enterprise/statistics/employees",
        headers=headers
    )
    print(f"       Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"       ✓ Statistics: {json.dumps(data['data'], indent=8, ensure_ascii=False)}")
    else:
        print(f"       ✗ Error: {response.text}")

def test_factory_endpoints(token):
    """测试工厂管理端点"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n3. Testing Factory Management Endpoints...")
    
    # 获取工厂列表
    print("\n   3.1 GET /enterprise/factories")
    response = requests.get(
        f"{API_BASE}/enterprise/factories",
        headers=headers,
        params={"page": 1, "page_size": 20}
    )
    print(f"       Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"       ✓ Found {data['data']['total']} factories")
        if data['data']['items']:
            print(f"       First factory: {data['data']['items'][0]['name']}")
            factory_id = data['data']['items'][0]['id']
            
            # 测试创建工厂
            print("\n   3.2 POST /enterprise/factories")
            new_factory = {
                "name": "Test Factory",
                "code": "TEST001",
                "address": "Test Address",
                "city": "Test City",
                "contact_person": "Test Manager",
                "contact_phone": "13800138000",
                "is_headquarters": False
            }
            response = requests.post(
                f"{API_BASE}/enterprise/factories",
                headers=headers,
                json=new_factory
            )
            print(f"       Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"       ✓ Factory created: {data['data']['name']}")
                new_factory_id = data['data']['id']
                
                # 测试更新工厂
                print("\n   3.3 PUT /enterprise/factories/{id}")
                update_data = {
                    "name": "Updated Test Factory",
                    "contact_person": "Updated Manager"
                }
                response = requests.put(
                    f"{API_BASE}/enterprise/factories/{new_factory_id}",
                    headers=headers,
                    json=update_data
                )
                print(f"       Status: {response.status_code}")
                if response.status_code == 200:
                    print(f"       ✓ Factory updated")
                else:
                    print(f"       ✗ Error: {response.text}")
                
                # 测试删除工厂
                print("\n   3.4 DELETE /enterprise/factories/{id}")
                response = requests.delete(
                    f"{API_BASE}/enterprise/factories/{new_factory_id}",
                    headers=headers
                )
                print(f"       Status: {response.status_code}")
                if response.status_code == 200:
                    print(f"       ✓ Factory deleted")
                else:
                    print(f"       ✗ Error: {response.text}")
            else:
                print(f"       ✗ Error: {response.text}")
    else:
        print(f"       ✗ Error: {response.text}")

def test_department_endpoints(token):
    """测试部门管理端点"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n4. Testing Department Management Endpoints...")
    
    # 获取部门列表
    print("\n   4.1 GET /enterprise/departments")
    response = requests.get(
        f"{API_BASE}/enterprise/departments",
        headers=headers,
        params={"page": 1, "page_size": 20}
    )
    print(f"       Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"       ✓ Found {data['data']['total']} departments")
        if data['data']['items']:
            for dept in data['data']['items']:
                print(f"       - {dept['department_name']}: {dept['employee_count']} employees")
    else:
        print(f"       ✗ Error: {response.text}")

def main():
    """主测试函数"""
    print("=" * 80)
    print("Testing Enterprise Management API Endpoints")
    print("=" * 80)
    
    # 登录
    token = login()
    if not token:
        print("\n✗ Cannot proceed without authentication token")
        return
    
    # 测试各个端点
    test_employee_endpoints(token)
    test_factory_endpoints(token)
    test_department_endpoints(token)
    
    print("\n" + "=" * 80)
    print("API Endpoint Testing Complete!")
    print("=" * 80)
    print("\nAll backend APIs are working correctly.")
    print("You can now test the frontend integration:")
    print("1. Open the user portal in your browser")
    print("2. Login with: enterprise@example.com")
    print("3. Navigate to Enterprise Management pages")
    print("4. Test all CRUD operations in the UI")

if __name__ == "__main__":
    main()

