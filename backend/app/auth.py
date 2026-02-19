from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt safety limit
def _safe_password(pw: str) -> str:
    return pw[:72] if pw else pw

def hash_password(password: str) -> str:
    return pwd_context.hash(_safe_password(password))

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(_safe_password(password), hashed)

def create_access_token(data: dict, expires_delta: int = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
