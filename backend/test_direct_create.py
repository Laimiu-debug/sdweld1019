#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Direct user creation test without API
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.services.user_service import user_service
from app.schemas.user import UserCreate

def test_direct_create():
    """Test direct user creation"""
    print("Testing direct user creation...")

    db = SessionLocal()
    try:
        # Create user data
        user_data = UserCreate(
            email="directtest@example.com",
            password="TestPassword123",
            full_name="Direct Test User",
            phone="13800138000",
            company="Direct Test Co"
        )

        # Create user
        user = user_service.create(db, obj_in=user_data)

        print(f"✅ User created successfully!")
        print(f"   User ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Created at: {user.created_at}")
        print(f"   Updated at: {user.updated_at}")

        return True

    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    test_direct_create()