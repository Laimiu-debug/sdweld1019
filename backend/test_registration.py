#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test user registration functionality
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_registration():
    """Test user registration"""
    print("Testing user registration...")

    import time
    timestamp = int(time.time())
    user_data = {
        "email": f"testuser{timestamp}@example.com",
        "password": "TestPassword123",
        "full_name": "测试用户",
        "phone": "13800138000",
        "company": "测试公司"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)

        if response.status_code == 200:
            result = response.json()
            print(f"[SUCCESS] Registration successful: {result}")
            return True
        else:
            error = response.json()
            print(f"[FAILED] Registration failed: {error}")
            return False

    except Exception as e:
        print(f"[ERROR] Registration error: {e}")
        return False

if __name__ == "__main__":
    test_registration()