"""
测试删除空部门
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

# 创建员工
def create_employee(token, employee_data):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(
        f"{BASE_URL}/enterprise/employees",
        headers=headers,
        json=employee_data
    )
    print(f"\n创建员工 - 状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return data.get("data")
    else:
        print(f"❌ 创建失败: {response.text}")
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
    if response.status_code == 200:
        data = response.json()
        if data.get("success") and data.get("data"):
            items = data["data"].get("items", [])
            print(f"\n当前部门列表:")
            for dept in items:
                print(f"  - ID: {dept.get('id')}, 名称: {dept.get('department_name')}, 员工数: {dept.get('employee_count')}")
            return items
    return []

# 更新员工
def update_employee(token, employee_id, update_data):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.put(
        f"{BASE_URL}/enterprise/employees/{employee_id}",
        headers=headers,
        json=update_data
    )
    print(f"\n更新员工 - 状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return True
    else:
        print(f"❌ 更新失败: {response.text}")
    return False

# 删除部门
def delete_department(token, department_id):
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.delete(
        f"{BASE_URL}/enterprise/departments/{department_id}",
        headers=headers
    )
    print(f"\n删除部门 ID={department_id} - 状态码: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2, ensure_ascii=False))
        print(f"✅ 部门删除成功")
        return True
    else:
        print(f"❌ 删除失败: {response.text}")
    return False

if __name__ == "__main__":
    print("🔐 登录...")
    token = login("enterprise@example.com", "password123")
    
    if token:
        print("✅ 登录成功\n")
        
        # 步骤1: 创建一个新员工，分配到新部门
        print("\n" + "="*80)
        print("步骤1: 创建新员工，分配到测试部门")
        print("="*80)
        
        new_employee = create_employee(token, {
            "email": "test.employee@example.com",
            "full_name": "测试员工",
            "phone": "13800138000",
            "position": "测试工程师",
            "department": "测试部门",
            "role": "employee",
            "factory_id": 1
        })
        
        if not new_employee:
            print("❌ 创建员工失败，无法继续测试")
            exit(1)
        
        employee_id = new_employee.get("id")
        
        # 步骤2: 查看部门列表
        print("\n" + "="*80)
        print("步骤2: 查看部门列表")
        print("="*80)
        
        departments = get_departments(token)
        
        # 找到测试部门
        test_dept = None
        for dept in departments:
            if dept.get("department_name") == "测试部门":
                test_dept = dept
                break
        
        if not test_dept:
            print("❌ 未找到测试部门")
            exit(1)
        
        print(f"\n✅ 找到测试部门: ID={test_dept.get('id')}, 员工数={test_dept.get('employee_count')}")
        
        # 步骤3: 尝试删除有员工的部门（应该失败）
        print("\n" + "="*80)
        print("步骤3: 尝试删除有员工的部门（应该失败）")
        print("="*80)
        
        delete_department(token, test_dept.get('id'))
        
        # 步骤4: 将员工移动到其他部门
        print("\n" + "="*80)
        print("步骤4: 将员工移动到Management部门")
        print("="*80)
        
        update_employee(token, employee_id, {
            "department": "Management"
        })
        
        # 步骤5: 再次查看部门列表
        print("\n" + "="*80)
        print("步骤5: 再次查看部门列表")
        print("="*80)
        
        departments = get_departments(token)
        
        # 步骤6: 尝试删除空部门（应该成功）
        print("\n" + "="*80)
        print("步骤6: 尝试删除空部门（应该成功）")
        print("="*80)
        
        # 找到测试部门（如果还存在）
        test_dept = None
        for dept in departments:
            if dept.get("department_name") == "测试部门":
                test_dept = dept
                break
        
        if test_dept:
            print(f"✅ 找到测试部门: ID={test_dept.get('id')}, 员工数={test_dept.get('employee_count')}")
            delete_department(token, test_dept.get('id'))
        else:
            print("✅ 测试部门已自动消失（因为没有员工）")
        
        # 步骤7: 最终查看部门列表
        print("\n" + "="*80)
        print("步骤7: 最终查看部门列表")
        print("="*80)
        
        get_departments(token)
        
    else:
        print("❌ 登录失败")

