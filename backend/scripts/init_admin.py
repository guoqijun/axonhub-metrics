"""One-time script to initialize the admin user.
Usage: python scripts/init_admin.py [username] [password]
"""

import asyncio
import sys
sys.path.insert(0, ".")

from app.database import database
from app.auth import hash_password
from app.config import get_settings


async def main():
    settings = get_settings()
    await database.connect()

    username = sys.argv[1] if len(sys.argv) > 1 else settings.admin_username
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"

    existing = await database.fetch_one(
        "SELECT id FROM admin_users WHERE username = :username",
        {"username": username},
    )
    if existing:
        print(f"Admin user '{username}' already exists.")
        await database.disconnect()
        return

    hashed = hash_password(password)
    await database.execute(
        "INSERT INTO admin_users (username, password_hash) VALUES (:username, :password_hash)",
        {"username": username, "password_hash": hashed},
    )
    print(f"Admin user '{username}' created successfully.")
    await database.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
