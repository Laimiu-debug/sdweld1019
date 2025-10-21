#!/usr/bin/env python3
"""
Test verification code login functionality
"""

import requests
import json
import time

def test_verification_login():
    """Test the verification code login flow"""
    base_url = "http://localhost:8000"

    # Test data - use an existing registered user
    test_account = "test@example.com"  # This should be a registered user's contact
    account_type = "email"

    print(f"=== Testing Verification Code Login ===")
    print(f"Test Account: {test_account}")
    print(f"Account Type: {account_type}")

    # Step 1: Send verification code
    print(f"\n--- Step 1: Send Verification Code ---")

    try:
        url = f"{base_url}/api/v1/auth/send-verification-code"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        send_data = {
            "account": test_account,
            "account_type": account_type,
            "purpose": "login"
        }

        response = requests.post(url, json=send_data, headers=headers)

        print(f"Send Code Status: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            send_response = response.json()
            print(f"Send Code Response: {json.dumps(send_response, indent=2, ensure_ascii=False)}")
        else:
            print(f"Send Code Response: {response.text}")

        if response.status_code == 200:
            print("✅ Verification code sent successfully!")

            # Step 2: Try to login with verification code
            print(f"\n--- Step 2: Login with Verification Code ---")

            # For development, we need to get the actual verification code from database
            # In production, user would receive it via email/SMS

            # Let's try to login with a dummy code first to see the error format
            login_url = f"{base_url}/api/v1/auth/login-with-verification-code"

            # Try with invalid code first
            invalid_login_data = {
                "account": test_account,
                "verification_code": "123456",  # Invalid code
                "account_type": account_type
            }

            print("Trying login with invalid code...")
            invalid_response = requests.post(login_url, json=invalid_login_data, headers=headers)
            print(f"Invalid Login Status: {invalid_response.status_code}")
            if invalid_response.headers.get('content-type', '').startswith('application/json'):
                invalid_json = invalid_response.json()
                print(f"Invalid Login Response: {json.dumps(invalid_json, indent=2, ensure_ascii=False)}")

            print("\nNote: In development environment, you need to check the database for the actual verification code")
            print("In production, the user would receive the code via email or SMS")

        else:
            print("❌ Failed to send verification code")
            print("This might be because:")
            print("1. The account is not registered")
            print("2. There's an API error")
            print("3. The backend is not running")

    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Could not connect to backend server")
        print("Please make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_send_code_for_new_user():
    """Test sending verification code for unregistered user (should fail)"""
    base_url = "http://localhost:8000"

    print(f"\n=== Testing Send Code for Unregistered User ===")

    try:
        url = f"{base_url}/api/v1/auth/send-verification-code"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        send_data = {
            "account": "unregistered@example.com",
            "account_type": "email",
            "purpose": "login"
        }

        response = requests.post(url, json=send_data, headers=headers)

        print(f"Send Code Status: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            send_response = response.json()
            print(f"Response: {json.dumps(send_response, indent=2, ensure_ascii=False)}")

        if response.status_code == 404:
            print("✅ Correctly rejected unregistered user")
        else:
            print("❌ Should have rejected unregistered user")

    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("Testing Verification Code Login API...")
    test_verification_login()
    test_send_code_for_new_user()

    print(f"\n=== Test Summary ===")
    print("1. Check if verification codes are being created in the database")
    print("2. Verify the API endpoints are working correctly")
    print("3. Test with valid verification codes from the database")
    print("4. Ensure proper error handling for invalid codes")