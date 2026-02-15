#!/usr/bin/env python3
"""
Script to create an admin user for ProjectVeo
"""
import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create an admin user in the database"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Admin credentials
    admin_email = "admin@projectveo.com"
    admin_password = "Admin@123"
    admin_name = "Admin User"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if existing_admin:
        print(f"✅ Admin user already exists!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
    else:
        # Create admin user
        hashed_password = pwd_context.hash(admin_password)
        
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "name": admin_name,
            "role": "admin",
            "hashed_password": hashed_password,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(admin_user)
        print("✅ Admin user created successfully!")
        print(f"\n📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print(f"\n⚠️  Please change this password after first login!")
    
    client.close()
    
    print("\n" + "="*50)
    print("LOGIN CREDENTIALS:")
    print("="*50)
    print(f"Email:    {admin_email}")
    print(f"Password: {admin_password}")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(create_admin_user())
