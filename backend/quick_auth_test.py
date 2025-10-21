#!/usr/bin/env python3
"""
Quick authentication test
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_registration():
    """Test user registration"""
    print("Testing user registration...")

    user_data = {
        "email": "testuser@welding.com",
        "password": "TestPassword123!",
        "full_name": "Test User",
        "company": "Test Company"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)

        if response.status_code == 200:
            user_info = response.json()
            print("✅ Registration successful!")
            print(f"   User ID: {user_info.get('id')}")
            print(f"   Email: {user_info.get('email')}")
            return user_data
        else:
            error_msg = response.json().get('detail', 'Unknown error')
            print(f"❌ Registration failed: {error_msg}")
            return None

    except Exception as e:
        print(f"❌ Registration error: {str(e)}")
        return None

def test_login(user_data):
    """Test user login"""
    print("\nTesting user login...")

    if not user_data:
        print("❌ No user data available")
        return None

    login_data = {
        "username": user_data["email"],
        "password": user_data["password"]
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)

        if response.status_code == 200:
            token_info = response.json()
            print("✅ Login successful!")
            print(f"   Token Type: {token_info.get('token_type')}")
            print(f"   Expires In: {token_info.get('expires_in')} seconds")
            return token_info.get('access_token')
        else:
            error_msg = response.json().get('detail', 'Unknown error')
            print(f"❌ Login failed: {error_msg}")
            return None

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return None

def main():
    """Main test function"""
    print("QUICK AUTHENTICATION TEST")
    print("=" * 40)

    # Test registration
    user_data = test_registration()

    # Test login
    token = test_login(user_data)

    # Summary
    print("\n" + "=" * 40)
    print("TEST SUMMARY")
    print("=" * 40)

    if user_data:
        print("✅ User Registration: Working")
    else:
        print("❌ User Registration: Failed")

    if token:
        print("✅ User Login: Working")
    else:
        print("❌ User Login: Failed")

    if user_data and token:
        print("\n🎉 Authentication system is working!")
        print("Users can register and login successfully.")
    else:
        print("\n⚠️  Authentication system needs attention.")

if __name__ == "__main__":
    main()