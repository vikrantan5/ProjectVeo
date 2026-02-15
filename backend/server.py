from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import firebase_admin
from firebase_admin import credentials, storage
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

firebase_config_json = os.environ.get('FIREBASE_CONFIG_JSON', '{}')
if firebase_config_json and firebase_config_json != '{}':
    try:
        firebase_cred_dict = json.loads(firebase_config_json)
        cred = credentials.Certificate(firebase_cred_dict)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred, {'storageBucket': os.environ.get('FIREBASE_STORAGE_BUCKET', '')})
    except Exception as e:
        logging.warning(f"Firebase initialization failed: {e}")

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "client"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Client(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None

class Milestone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    completed: bool = False

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    description: str
    start_date: datetime
    deadline: datetime
    progress: int = 0
    status: str = "not_started"
    total_price: float = 0
    amount_paid: float = 0
    google_sheet_link: Optional[str] = None
    share_link: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_portfolio: bool = False
    milestones: List[Milestone] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    client_id: str
    title: str
    description: str
    start_date: datetime
    deadline: datetime
    total_price: float = 0
    is_portfolio: bool = False

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    progress: Optional[int] = None
    status: Optional[str] = None
    total_price: Optional[float] = None
    amount_paid: Optional[float] = None
    google_sheet_link: Optional[str] = None
    is_portfolio: Optional[bool] = None
    milestones: Optional[List[Milestone]] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    sender_name: str
    sender_role: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    project_id: str
    message: str

class FileUpload(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    filename: str
    file_url: str
    file_type: str
    category: Optional[str] = "general"
    description: Optional[str] = None
    uploaded_by: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SRSDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    title: str
    version: str
    file_url: str
    uploaded_by: str
    description: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    project_idea: str
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    website_type: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    project_idea: str
    budget_range: Optional[str] = None
    deadline: Optional[str] = None
    website_type: Optional[str] = None

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role
    )
    user_dict = user.model_dump()
    user_dict["hashed_password"] = hashed_password
    user_dict["created_at"] = user_dict["created_at"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not pwd_context.verify(credentials.password, user_doc.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, current_user: User = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not pwd_context.verify(password_data.old_password, user_doc.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Incorrect current password")
    
    new_hashed_password = pwd_context.hash(password_data.new_password)
    await db.users.update_one({"id": current_user.id}, {"$set": {"hashed_password": new_hashed_password}})
    
    return {"message": "Password changed successfully"}

@api_router.post("/clients", response_model=Client)
async def create_client(client_data: ClientCreate, current_user: User = Depends(get_admin_user)):
    client = Client(**client_data.model_dump())
    client_dict = client.model_dump()
    client_dict["created_at"] = client_dict["created_at"].isoformat()
    await db.clients.insert_one(client_dict)
    return client

@api_router.get("/clients", response_model=List[Client])
async def get_clients(current_user: User = Depends(get_admin_user)):
    clients = await db.clients.find({}, {"_id": 0}).to_list(1000)
    for c in clients:
        if isinstance(c["created_at"], str):
            c["created_at"] = datetime.fromisoformat(c["created_at"])
    return clients

@api_router.get("/clients/{client_id}", response_model=Client)
async def get_client(client_id: str, current_user: User = Depends(get_admin_user)):
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    if isinstance(client["created_at"], str):
        client["created_at"] = datetime.fromisoformat(client["created_at"])
    return Client(**client)

@api_router.put("/clients/{client_id}", response_model=Client)
async def update_client(client_id: str, client_data: ClientCreate, current_user: User = Depends(get_admin_user)):
    update_data = client_data.model_dump()
    result = await db.clients.update_one({"id": client_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if isinstance(client["created_at"], str):
        client["created_at"] = datetime.fromisoformat(client["created_at"])
    return Client(**client)

@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.clients.delete_one({"id": client_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"message": "Client deleted successfully"}

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_admin_user)):
    project = Project(**project_data.model_dump())
    project_dict = project.model_dump()
    project_dict["created_at"] = project_dict["created_at"].isoformat()
    project_dict["start_date"] = project_dict["start_date"].isoformat()
    project_dict["deadline"] = project_dict["deadline"].isoformat()
    await db.projects.insert_one(project_dict)
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_admin_user)):
    projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    for p in projects:
        if isinstance(p["created_at"], str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
        if isinstance(p["start_date"], str):
            p["start_date"] = datetime.fromisoformat(p["start_date"])
        if isinstance(p["deadline"], str):
            p["deadline"] = datetime.fromisoformat(p["deadline"])
    return projects

@api_router.get("/projects/portfolio")
async def get_portfolio_projects():
    projects = await db.projects.find({"is_portfolio": True}, {"_id": 0, "share_link": 0}).to_list(1000)
    for p in projects:
        if isinstance(p["created_at"], str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
        if isinstance(p.get("start_date"), str):
            p["start_date"] = datetime.fromisoformat(p["start_date"])
        if isinstance(p.get("deadline"), str):
            p["deadline"] = datetime.fromisoformat(p["deadline"])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user: User = Depends(get_admin_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project["created_at"], str):
        project["created_at"] = datetime.fromisoformat(project["created_at"])
    if isinstance(project["start_date"], str):
        project["start_date"] = datetime.fromisoformat(project["start_date"])
    if isinstance(project["deadline"], str):
        project["deadline"] = datetime.fromisoformat(project["deadline"])
    return Project(**project)

@api_router.get("/projects/share/{share_link}")
async def get_project_by_share_link(share_link: str):
    project = await db.projects.find_one({"share_link": share_link}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if isinstance(project["created_at"], str):
        project["created_at"] = datetime.fromisoformat(project["created_at"])
    if isinstance(project["start_date"], str):
        project["start_date"] = datetime.fromisoformat(project["start_date"])
    if isinstance(project["deadline"], str):
        project["deadline"] = datetime.fromisoformat(project["deadline"])
    
    client = await db.clients.find_one({"id": project["client_id"]}, {"_id": 0})
    messages = await db.messages.find({"project_id": project["id"]}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    files = await db.files.find({"project_id": project["id"]}, {"_id": 0}).to_list(1000)
    srs_docs = await db.srs_documents.find({"project_id": project["id"]}, {"_id": 0}).to_list(1000)
    
    return {
        "project": project,
        "client": client,
        "messages": messages,
        "files": files,
        "srs_documents": srs_docs
    }

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate, current_user: User = Depends(get_admin_user)):
    update_data = project_data.model_dump(exclude_unset=True)
    if "start_date" in update_data and update_data["start_date"]:
        update_data["start_date"] = update_data["start_date"].isoformat()
    if "deadline" in update_data and update_data["deadline"]:
        update_data["deadline"] = update_data["deadline"].isoformat()
    
    result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if isinstance(project["created_at"], str):
        project["created_at"] = datetime.fromisoformat(project["created_at"])
    if isinstance(project["start_date"], str):
        project["start_date"] = datetime.fromisoformat(project["start_date"])
    if isinstance(project["deadline"], str):
        project["deadline"] = datetime.fromisoformat(project["deadline"])
    return Project(**project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.messages.delete_many({"project_id": project_id})
    await db.files.delete_many({"project_id": project_id})
    await db.srs_documents.delete_many({"project_id": project_id})
    return {"message": "Project deleted successfully"}

@api_router.post("/messages", response_model=Message)
async def create_message(message_data: MessageCreate, current_user: User = Depends(get_current_user)):
    message = Message(
        project_id=message_data.project_id,
        message=message_data.message,
        sender_name=current_user.name,
        sender_role=current_user.role
    )
    message_dict = message.model_dump()
    message_dict["created_at"] = message_dict["created_at"].isoformat()
    await db.messages.insert_one(message_dict)
    return message

@api_router.get("/messages/{project_id}", response_model=List[Message])
async def get_messages(project_id: str):
    messages = await db.messages.find({"project_id": project_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    for m in messages:
        if isinstance(m["created_at"], str):
            m["created_at"] = datetime.fromisoformat(m["created_at"])
    return messages

@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    category: str = Form("general"),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    if not firebase_admin._apps:
        raise HTTPException(status_code=500, detail="Firebase not configured. Please add FIREBASE_CONFIG_JSON to backend .env")
    
    try:
        bucket = storage.bucket()
        filename = f"{project_id}/{uuid.uuid4()}_{file.filename}"
        blob = bucket.blob(filename)
        
        content = await file.read()
        blob.upload_from_string(content, content_type=file.content_type)
        blob.make_public()
        
        file_upload = FileUpload(
            project_id=project_id,
            filename=file.filename,
            file_url=blob.public_url,
            file_type=file.content_type or "unknown",
            category=category,
            description=description,
            uploaded_by=current_user.name
        )
        
        file_dict = file_upload.model_dump()
        file_dict["created_at"] = file_dict["created_at"].isoformat()
        await db.files.insert_one(file_dict)
        
        return file_upload
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/files/{project_id}", response_model=List[FileUpload])
async def get_files(project_id: str):
    files = await db.files.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for f in files:
        if isinstance(f["created_at"], str):
            f["created_at"] = datetime.fromisoformat(f["created_at"])
    return files

@api_router.delete("/files/{file_id}")
async def delete_file(file_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.files.delete_one({"id": file_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"message": "File deleted successfully"}

@api_router.post("/srs")
async def upload_srs(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    title: str = Form(...),
    version: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    if not firebase_admin._apps:
        raise HTTPException(status_code=500, detail="Firebase not configured. Please add FIREBASE_CONFIG_JSON to backend .env")
    
    try:
        bucket = storage.bucket()
        filename = f"{project_id}/srs/{uuid.uuid4()}_{file.filename}"
        blob = bucket.blob(filename)
        
        content = await file.read()
        blob.upload_from_string(content, content_type=file.content_type)
        blob.make_public()
        
        srs_doc = SRSDocument(
            project_id=project_id,
            title=title,
            version=version,
            file_url=blob.public_url,
            uploaded_by=current_user.name,
            description=description
        )
        
        srs_dict = srs_doc.model_dump()
        srs_dict["created_at"] = srs_dict["created_at"].isoformat()
        await db.srs_documents.insert_one(srs_dict)
        
        return srs_doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/srs/{project_id}", response_model=List[SRSDocument])
async def get_srs_documents(project_id: str):
    docs = await db.srs_documents.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    for d in docs:
        if isinstance(d["created_at"], str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs

@api_router.put("/srs/{srs_id}/status")
async def update_srs_status(srs_id: str, status: str, current_user: User = Depends(get_admin_user)):
    result = await db.srs_documents.update_one({"id": srs_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="SRS document not found")
    return {"message": "Status updated successfully"}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate):
    booking = Booking(**booking_data.model_dump())
    booking_dict = booking.model_dump()
    booking_dict["created_at"] = booking_dict["created_at"].isoformat()
    await db.bookings.insert_one(booking_dict)
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: User = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for b in bookings:
        if isinstance(b["created_at"], str):
            b["created_at"] = datetime.fromisoformat(b["created_at"])
    return bookings

@api_router.put("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, status: str, current_user: User = Depends(get_admin_user)):
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking status updated successfully"}

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_admin_user)):
    total_clients = await db.clients.count_documents({})
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({"status": {"$in": ["designing", "development", "testing", "revision"]}})
    completed_projects = await db.projects.count_documents({"status": "completed"})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    
    projects = await db.projects.find({}, {"_id": 0, "total_price": 1, "amount_paid": 1}).to_list(1000)
    total_revenue = sum(p.get("total_price", 0) for p in projects)
    total_paid = sum(p.get("amount_paid", 0) for p in projects)
    pending_payments = total_revenue - total_paid
    
    return {
        "total_clients": total_clients,
        "total_projects": total_projects,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "pending_bookings": pending_bookings,
        "total_revenue": total_revenue,
        "pending_payments": pending_payments
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()