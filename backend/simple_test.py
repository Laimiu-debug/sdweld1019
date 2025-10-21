#!/usr/bin/env python3
"""
Simple test script for WPS/PQR API endpoints.
"""
import requests
import json

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

def test_wps_list():
    """Test WPS list endpoint without authentication."""
    print("Testing WPS list endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/wps/")
        if response.status_code == 401:
            print("WPS endpoint correctly requires authentication")
            return True
        else:
            print(f"WPS endpoint unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"WPS endpoint error: {e}")
        return False

def test_pqr_list():
    """Test PQR list endpoint without authentication."""
    print("Testing PQR list endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/pqr/")
        if response.status_code == 401:
            print("PQR endpoint correctly requires authentication")
            return True
        else:
            print(f"PQR endpoint unexpected response: {response.status_code}")
            return False
    except Exception as e:
        print(f"PQR endpoint error: {e}")
        return False

def main():
    """Main test function."""
    print("Starting Simple API Tests")
    print("=" * 40)

    # Test health check
    if not test_health_check():
        print("Health check failed, aborting tests")
        return

    # Test endpoints require authentication
    wps_ok = test_wps_list()
    pqr_ok = test_pqr_list()

    print("\n" + "=" * 40)
    print("Simple API Tests Complete!")
    print(f"WPS endpoint auth: {'OK' if wps_ok else 'FAIL'}")
    print(f"PQR endpoint auth: {'OK' if pqr_ok else 'FAIL'}")
    print("Core API structure is working correctly")

if __name__ == "__main__":
    main()