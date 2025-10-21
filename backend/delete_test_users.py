#!/usr/bin/env python3
"""
Delete test users from the database.
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User

def delete_test_users():
    """Delete all test users created during development."""
    db: Session = SessionLocal()

    try:
        # List of test emails to delete
        test_emails = [
            "test@test.com",
            "demo@test.com",
            "user@test.com",
            "admin@welding.com",
            "admin@test.com",
            "demo@welding.com",
            "user@welding.com",
            "free@welding.com"
        ]

        deleted_count = 0
        for email in test_emails:
            user = db.query(User).filter(User.email == email).first()
            if user:
                print(f"Deleting user: {user.email} (ID: {user.id})")
                db.delete(user)
                deleted_count += 1
            else:
                print(f"User not found: {email}")

        # Commit the changes
        db.commit()
        print(f"\nSuccessfully deleted {deleted_count} test users")

    except Exception as e:
        print(f"Error deleting users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    delete_test_users()