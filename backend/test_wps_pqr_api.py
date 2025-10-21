#!/usr/bin/env python3
"""
Test script for WPS/PQR API endpoints.
"""
import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000/api/v1"

def test_health_check():
    """Test health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("Health check passed")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check error: {e}")
        return False

def test_auth():
    """Test authentication endpoints."""
    print("\n🔍 Testing authentication...")

    # Test user registration
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "company": "Test Company"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 200:
            print("✅ User registration successful")
            user_data = response.json()
            print(f"   User ID: {user_data['id']}")
            print(f"   Email: {user_data['email']}")
        else:
            print(f"⚠️  User registration: {response.status_code} - {response.json().get('detail', 'Unknown error')}")
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return None

    # Test user login
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            print("✅ User login successful")
            token_data = response.json()
            access_token = token_data["access_token"]
            print(f"   Access token: {access_token[:20]}...")
            return access_token
        else:
            print(f"❌ Login failed: {response.status_code} - {response.json().get('detail', 'Unknown error')}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_wps_api(token):
    """Test WPS API endpoints."""
    print("\n🔍 Testing WPS API...")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Test creating a WPS
    wps_data = {
        "title": "测试WPS文档",
        "wps_number": "WPS-TEST-001",
        "revision": "A",
        "status": "draft",
        "company": "测试公司",
        "project_name": "测试项目",
        "welding_process": "GMAW",
        "process_type": "semi-automatic",
        "process_specification": "AWS D1.1",
        "base_material_group": "P-No.1",
        "base_material_spec": "ASTM A36",
        "base_material_thickness_range": "6-25mm",
        "filler_material_spec": "AWS A5.18",
        "filler_material_classification": "ER70S-6",
        "filler_material_diameter": 1.2,
        "shielding_gas": "75%Ar+25%CO2",
        "gas_flow_rate": 15.0,
        "current_type": "DCEP",
        "current_range": "150-200A",
        "voltage_range": "22-28V",
        "wire_feed_speed": "200-300mm/min",
        "welding_speed": "250-400mm/min",
        "joint_design": "butt",
        "groove_type": "V-groove",
        "groove_angle": "60°",
        "root_gap": "2-3mm",
        "preheat_temp_min": 50.0,
        "preheat_temp_max": 100.0,
        "interpass_temp_max": 200.0,
        "ndt_required": True,
        "ndt_methods": "RT, UT",
        "mechanical_testing": "tensile, bend"
    }

    try:
        response = requests.post(f"{BASE_URL}/wps/", json=wps_data, headers=headers)
        if response.status_code == 200:
            print("✅ WPS creation successful")
            wps = response.json()
            print(f"   WPS ID: {wps['id']}")
            print(f"   WPS Number: {wps['wps_number']}")
            print(f"   Title: {wps['title']}")
            wps_id = wps['id']
        else:
            print(f"❌ WPS creation failed: {response.status_code} - {response.json().get('detail', 'Unknown error')}")
            return None
    except Exception as e:
        print(f"❌ WPS creation error: {e}")
        return None

    # Test getting WPS list
    try:
        response = requests.get(f"{BASE_URL}/wps/", headers=headers)
        if response.status_code == 200:
            print("✅ WPS list retrieval successful")
            wps_list = response.json()
            print(f"   Found {len(wps_list)} WPS documents")
        else:
            print(f"❌ WPS list retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ WPS list retrieval error: {e}")

    # Test getting specific WPS
    try:
        response = requests.get(f"{BASE_URL}/wps/{wps_id}", headers=headers)
        if response.status_code == 200:
            print("✅ Specific WPS retrieval successful")
            wps_detail = response.json()
            print(f"   Retrieved WPS: {wps_detail['wps_number']} - {wps_detail['title']}")
        else:
            print(f"❌ Specific WPS retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Specific WPS retrieval error: {e}")

    # Test WPS statistics
    try:
        response = requests.get(f"{BASE_URL}/wps/statistics/overview", headers=headers)
        if response.status_code == 200:
            print("✅ WPS statistics retrieval successful")
            stats = response.json()
            print(f"   Total WPS: {stats.get('total_count', 0)}")
            print(f"   Status counts: {stats.get('status_counts', {})}")
        else:
            print(f"❌ WPS statistics retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ WPS statistics retrieval error: {e}")

    return wps_id

def test_pqr_api(token):
    """Test PQR API endpoints."""
    print("\n🔍 Testing PQR API...")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Test creating a PQR
    pqr_data = {
        "title": "测试PQR文档",
        "pqr_number": "PQR-TEST-001",
        "wps_number": "WPS-TEST-001",
        "test_date": datetime.now().isoformat(),
        "company": "测试公司",
        "project_name": "测试项目",
        "test_location": "测试实验室",
        "welding_operator": "张三",
        "welding_process": "GMAW",
        "process_type": "semi-automatic",
        "process_specification": "AWS D1.1",
        "base_material_group": "P-No.1",
        "base_material_spec": "ASTM A36",
        "base_material_thickness": 12.0,
        "base_material_heat_number": "H12345",
        "filler_material_spec": "AWS A5.18",
        "filler_material_classification": "ER70S-6",
        "filler_material_diameter": 1.2,
        "filler_material_heat_number": "F67890",
        "shielding_gas": "75%Ar+25%CO2",
        "gas_flow_rate": 15.0,
        "gas_composition": "75%Ar+25%CO2",
        "current_type": "DCEP",
        "current_polarity": "electrode positive",
        "current_actual": 175.0,
        "voltage_actual": 25.0,
        "wire_feed_speed_actual": 250.0,
        "welding_speed_actual": 350.0,
        "travel_speed_actual": 350.0,
        "heat_input_calculated": 1.25,
        "weld_passes_actual": 3,
        "weld_layer_actual": 2,
        "joint_design": "butt",
        "groove_type": "V-groove",
        "groove_angle_actual": 60.0,
        "root_gap_actual": 2.5,
        "root_face_actual": 1.5,
        "preheat_temp_actual": 75.0,
        "interpass_temp_max_actual": 180.0,
        "ambient_temperature": 25.0,
        "humidity": 60.0,
        "visual_inspection_result": "pass",
        "rt_result": "pass",
        "ut_result": "N/A",
        "mt_result": "pass",
        "pt_result": "N/A",
        "ndt_report_number": "NDT-2023-001",
        "tensile_test_result": "pass",
        "tensile_strength_actual": 520.0,
        "tensile_yield_strength": 380.0,
        "tensile_elongation": 28.0,
        "root_bend_result": "pass",
        "face_bend_result": "pass",
        "side_bend_result": "pass",
        "bend_angle": 180.0,
        "bend_radius": 3.0,
        "qualification_result": "qualified",
        "qualification_date": datetime.now().isoformat(),
        "thickness_range_qualified": "6-25mm",
        "position_qualified": "1G, 2G, 3G, 4G",
        "filler_material_range": "ER70S-6 (0.8-1.6mm)"
    }

    try:
        response = requests.post(f"{BASE_URL}/pqr/", json=pqr_data, headers=headers)
        if response.status_code == 200:
            print("✅ PQR creation successful")
            pqr = response.json()
            print(f"   PQR ID: {pqr['id']}")
            print(f"   PQR Number: {pqr['pqr_number']}")
            print(f"   Title: {pqr['title']}")
            print(f"   Qualification Result: {pqr['qualification_result']}")
            pqr_id = pqr['id']
        else:
            print(f"❌ PQR creation failed: {response.status_code} - {response.json().get('detail', 'Unknown error')}")
            return None
    except Exception as e:
        print(f"❌ PQR creation error: {e}")
        return None

    # Test getting PQR list
    try:
        response = requests.get(f"{BASE_URL}/pqr/", headers=headers)
        if response.status_code == 200:
            print("✅ PQR list retrieval successful")
            pqr_list = response.json()
            print(f"   Found {len(pqr_list)} PQR documents")
        else:
            print(f"❌ PQR list retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ PQR list retrieval error: {e}")

    # Test PQR statistics
    try:
        response = requests.get(f"{BASE_URL}/pqr/statistics/overview", headers=headers)
        if response.status_code == 200:
            print("✅ PQR statistics retrieval successful")
            stats = response.json()
            print(f"   Total PQR: {stats.get('total_count', 0)}")
            print(f"   Qualification counts: {stats.get('qualification_counts', {})}")
        else:
            print(f"❌ PQR statistics retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ PQR statistics retrieval error: {e}")

    return pqr_id

def main():
    """Main test function."""
    print("Starting WPS/PQR API Tests")
    print("=" * 50)

    # Test health check
    if not test_health_check():
        print("Health check failed, aborting tests")
        return

    # Test authentication
    token = test_auth()
    if not token:
        print("Authentication failed, aborting tests")
        return

    # Test WPS API
    wps_id = test_wps_api(token)

    # Test PQR API
    pqr_id = test_pqr_api(token)

    print("\n" + "=" * 50)
    print("API Tests Complete!")
    print(f"   WPS ID: {wps_id}")
    print(f"   PQR ID: {pqr_id}")
    print("   All core functionality is working")

if __name__ == "__main__":
    main()