from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# 🔐 Hash password
def hash_password(password: str):
    # 🔥 truncate to 72 bytes (bcrypt limit)
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    plain = plain[:72]
    return pwd_context.verify(plain, hashed)


# 🔍 Verify password
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


# 🎟️ Create JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 🔓 Decode JWT
def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])