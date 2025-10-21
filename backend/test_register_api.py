#!/usr/bin/env python3
"""
Test registration API directly
"""

import requests
import json

def test_registration_api():
    """Test the registration API endpoint"""
    base_url = "http://localhost:8000"

    # Test data
    test_cases = [
        {
            "name": "Email registration",
            "data": {
                "email": "test@example.com",
                "username": "testuser",
                "contact": "test@example.com",
                "password": "test123456",
                "full_name": "Test User"
            }
        },
        {
            "name": "Phone registration",
            "data": {
                "email": "phoneuser@example.com",
                "username": "phoneuser",
                "contact": "13800138888",
                "password": "test123456",
                "full_name": "Phone User",
                "phone": "13800138888"
            }
        },
        {
            "name": "Minimal registration",
            "data": {
                "email": "minimal@example.com",
                "username": "minimal",
                "contact": "minimal@example.com",
                "password": "test123456"
            }
        }
    ]

    for test_case in test_cases:
        print(f"\n=== Testing: {test_case['name']} ===")

        try:
            url = f"{base_url}/api/v1/auth/register"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            response = requests.post(url, json=test_case['data'], headers=headers)

            print(f"Status Code: {response.status_code}")
            print(f"Headers: {dict(response.headers)}")

            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    json_response = response.json()
                    print(f"Response JSON: {json.dumps(json_response, indent=2, ensure_ascii=False)}")
                except json.JSONDecodeError:
                    print("Response is not valid JSON")
            else:
                print(f"Response Text: {response.text}")

        except requests.exceptions.ConnectionError:
            print("ERROR: Could not connect to backend server")
        except requests.exceptions.Timeout:
            print("ERROR: Request timed out")
        except Exception as e:
            print(f"ERROR: {e}")

def test_cors_options():
    """Test CORS OPTIONS request"""
    base_url = "http://localhost:8000"

    print(f"\n=== Testing CORS OPTIONS ===")

    try:
        url = f"{base_url}/api/v1/auth/register"
        headers = {
            "Origin": "http://localhost:3003",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        }

        response = requests.options(url, headers=headers)

        print(f"OPTIONS Status Code: {response.status_code}")
        print(f"CORS Headers: {dict(response.headers)}")

    except Exception as e:
        print(f"OPTIONS ERROR: {e}")

if __name__ == "__main__":
    print("Testing Registration API...")
    test_cors_options()
    test_registration_api()