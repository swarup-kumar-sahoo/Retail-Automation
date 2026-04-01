from fastapi import APIRouter, HTTPException
from database import users_collection
from auth.auth_utils import hash_password, verify_password, create_access_token
from models.schemas import User

router = APIRouter()

@router.post("/signup")
def signup(user: User):
    existing = users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user.password)

    users_collection.insert_one({
        "email": user.email,
        "password": hashed
    })

    return {"message": "User created successfully"}


# 🔐 Login
@router.post("/login")
def login(user: dict):
    db_user = users_collection.find_one({"email": user["email"]})

    if not db_user or not verify_password(user["password"], db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"email": user["email"]})

    return {"access_token": token}