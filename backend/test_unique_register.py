#!/usr/bin/env python3
"""
Test registration API with unique email addresses
"""

import requests
import json
import random
import string

def generate_random_email():
    """Generate a random email address"""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return f"test_{random_str}@example.com"

def generate_random_phone():
    """Generate a random phone number"""
    random_digits = ''.join(random.choices(string.digits, k=8))
    return f"138{random_digits}"

def test_registration_api():
    """Test the registration API endpoint with unique data"""
    base_url = "http://localhost:8000"

    # Generate unique test data
    test_cases = [
        {
            "name": "Email registration",
            "data": {
                "email": generate_random_email(),
                "username": f"email_user_{''.join(random.choices(string.digits, k=4))}",
                "contact": generate_random_email(),
                "password": "test123456",
                "full_name": "Email Test User"
            }
        },
        {
            "name": "Phone registration",
            "data": {
                "email": generate_random_email(),
                "username": f"phone_user_{''.join(random.choices(string.digits, k=4))}",
                "contact": generate_random_phone(),
                "password": "test123456",
                "full_name": "Phone Test User",
                "phone": generate_random_phone()
            }
        },
        {
            "name": "Minimal registration",
            "data": {
                "email": generate_random_email(),
                "username": f"minimal_user_{''.join(random.choices(string.digits, k=4))}",
                "contact": generate_random_email(),
                "password": "test123456"
            }
        }
    ]

    for test_case in test_cases:
        print(f"\n=== Testing: {test_case['name']} ===")
        print(f"Email: {test_case['data']['email']}")
        print(f"Username: {test_case['data']['username']}")
        print(f"Contact: {test_case['data']['contact']}")

        try:
            url = f"{base_url}/api/v1/auth/register"
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }

            response = requests.post(url, json=test_case['data'], headers=headers)

            print(f"Status Code: {response.status_code}")

            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    json_response = response.json()
                    print(f"Response: {json.dumps(json_response, indent=2, ensure_ascii=False)}")
                except json.JSONDecodeError:
                    print("Response is not valid JSON")
                    print(f"Response Text: {response.text}")
            else:
                print(f"Response Text: {response.text}")

        except requests.exceptions.ConnectionError:
            print("ERROR: Could not connect to backend server")
        except requests.exceptions.Timeout:
            print("ERROR: Request timed out")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    print("Testing Registration API with unique data...")
    test_registration_api()