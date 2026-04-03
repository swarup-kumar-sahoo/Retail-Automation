from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_THIS"  # 🔐 change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 🔐 Hash password
def hash_password(password: str):
    password = password[:72]  # bcrypt limit
    return pwd_context.hash(password)


# 🔍 Verify password
def verify_password(plain: str, hashed: str):
    plain = plain[:72]  # ensure same logic
    return pwd_context.verify(plain, hashed)


# 🎟️ Create JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 🔓 Decode JWT
def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None