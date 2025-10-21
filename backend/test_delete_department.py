"""
测试删除部门API
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

# 获取部门列表
def get_departments(token):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(
        f"{BASE_URL}/enterprise/departments",
        headers=headers,
        params={
            "page": 1,
            "page_size": 20
        }
    )
    print(f"\n{'='*80}")
    print(f"获取部门列表 - 状态码: {response.status_code}")
    print(f"{'='*80}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        if data.get("success") and data.get("data"):
            items = data["data"].get("items", [])
            print(f"\n✅ 成功获取 {len(items)} 个部门")
            for dept in items:
                print(f"  - ID: {dept.get('id')}, 名称: {dept.get('department_name')}, 员工数: {dept.get('employee_count')}")
            return items
    else:
        print(f"❌ 请求失败: {response.status_code}")
        print(response.text)
    return []

# 删除部门
def delete_department(token, department_id):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.delete(
        f"{BASE_URL}/enterprise/departments/{department_id}",
        headers=headers
    )
    print(f"\n{'='*80}")
    print(f"删除部门 ID={department_id} - 状态码: {response.status_code}")
    print(f"{'='*80}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"\n✅ 部门删除成功")
    else:
        print(f"❌ 请求失败: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    print("🔐 登录...")
    token = login("enterprise@example.com", "password123")
    
    if token:
        print("✅ 登录成功\n")
        
        # 获取部门列表
        departments = get_departments(token)
        
        if departments:
            # 尝试删除第一个部门
            first_dept = departments[0]
            print(f"\n🗑️ 尝试删除部门: ID={first_dept.get('id')}, 名称={first_dept.get('department_name')}")
            delete_department(token, first_dept.get('id'))
    else:
        print("❌ 登录失败")

