#!/usr/bin/env python3
"""
Basic authentication test
"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_registration():
    """Test user registration"""
    print("Testing user registration...")

    user_data = {
        "email": f"newuser{datetime.now().strftime('%Y%m%d%H%M%S')}@welding.com",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "company": "Test Company"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)

        if response.status_code == 200:
            user_info = response.json()
            print("SUCCESS: Registration successful!")
            print(f"   User ID: {user_info.get('id')}")
            print(f"   Email: {user_info.get('email')}")
            return user_data
        else:
            error_msg = response.json().get('detail', 'Unknown error')
            print(f"FAILED: Registration failed: {error_msg}")
            return None

    except Exception as e:
        print(f"ERROR: Registration error: {str(e)}")
        return None

def test_login(user_data):
    """Test user login"""
    print("\nTesting user login...")

    if not user_data:
        print("ERROR: No user data available")
        return None

    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)

        if response.status_code == 200:
            token_info = response.json()
            print("SUCCESS: Login successful!")
            print(f"   Token Type: {token_info.get('token_type')}")
            print(f"   Expires In: {token_info.get('expires_in')} seconds")
            return token_info.get('access_token')
        else:
            error_msg = response.json().get('detail', 'Unknown error')
            print(f"FAILED: Login failed: {error_msg}")
            return None

    except Exception as e:
        print(f"ERROR: Login error: {str(e)}")
        return None

def main():
    """Main test function"""
    print("BASIC AUTHENTICATION TEST")
    print("=" * 40)

    # Test registration
    user_data = test_registration()

    # Test login
    token = test_login(user_data)

    # Summary
    print("\n" + "=" * 40)
    print("TEST SUMMARY")
    print("=" * 40)

    reg_status = "Working" if user_data else "Failed"
    login_status = "Working" if token else "Failed"

    print(f"User Registration: {reg_status}")
    print(f"User Login: {login_status}")

    if user_data and token:
        print("\nAuthentication system is working!")
        print("Users can register and login successfully.")
    else:
        print("\nAuthentication system needs attention.")

if __name__ == "__main__":
    main()