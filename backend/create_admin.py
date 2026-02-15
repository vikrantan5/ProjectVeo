import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime, timezone
import uuid
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    admin_email = "vikrantsinghan5@gmail.com"
    admin_password = "VikrantVeo@#"
    admin_name = "Vikrant Admin"
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user with email {admin_email} already exists!")
        client.close()
        return
    
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
    print(f"✅ Admin user created successfully!")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
