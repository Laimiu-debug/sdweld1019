#!/usr/bin/env python3
"""
Check recent registrations in PostgreSQL database
"""

import psycopg2
from datetime import datetime, timedelta

def check_recent_registrations():
    """Check users registered in the last few minutes"""
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            database='weld_db',
            user='weld_user',
            password='weld_password'
        )
        cursor = conn.cursor()

        # Get users from the last 10 minutes
        cursor.execute("""
            SELECT id, email, username, contact, phone, full_name, created_at
            FROM users
            WHERE created_at > %s
            ORDER BY created_at DESC;
        """, (datetime.utcnow() - timedelta(minutes=10),))

        users = cursor.fetchall()

        print(f"Found {len(users)} users registered in the last 10 minutes:")
        print("-" * 80)

        for user in users:
            print(f"ID: {user[0]}")
            print(f"Email: {user[1]}")
            print(f"Username: {user[2]}")
            print(f"Contact: {user[3]}")
            print(f"Phone: {user[4]}")
            print(f"Full Name: {user[5]}")
            print(f"Created At: {user[6]}")
            print("-" * 80)

        # Also check total user count
        cursor.execute("SELECT COUNT(*) FROM users;")
        total_users = cursor.fetchone()[0]
        print(f"\nTotal users in database: {total_users}")

        cursor.close()
        conn.close()

        return True

    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    print("Checking recent registrations...")
    check_recent_registrations()