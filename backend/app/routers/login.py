from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.database import get_db_connection
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from typing import Optional
import uuid

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "trendmart_super_secret_key"
ALGORITHM = "HS256"

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register")
def register_user(user: UserRegister):
    conn = None
    cursor = None
    try:
        password_bytes = user.password.encode('utf-8')
        if len(password_bytes) > 72:
            raise HTTPException(status_code=400, detail="Password too long")

        conn = get_db_connection()
        cursor = conn.cursor() 
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        
        user_id_val = "USR-" + str(uuid.uuid4())[:8].upper()

        hashed_password = pwd_context.hash(user.password)

        cursor.execute("""
            INSERT INTO users (user_id, username, email, password, role) 
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id_val, user.username, user.email, hashed_password, 'customer'))
        
        conn.commit()

        return {"message": "User registered successfully", "user_id": user_id_val}

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor() 
        
        cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
        user = cursor.fetchone()

        if not user or not pwd_context.verify(form_data.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        
        token = create_access_token(data={"sub": user['email'], "role": user['role']})
        
        
        return {
            "access_token": token, 
            "token_type": "bearer", 
            "role": user['role'],
            "username": user['username'],
            "user_id": user['user_id'] 
        }

    except Exception as e:
        print(f"Login Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


@router.post("/forgot-password")
def reset_user_password(request: ForgotPasswordRequest):
    conn = None
    cursor = None
    try:
        if len(request.new_password) < 5:
            raise HTTPException(status_code=400, detail="Password too short")

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE email = %s", (request.email,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Email not found")

        hashed_password = pwd_context.hash(request.new_password)
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (hashed_password, request.email))
        conn.commit()

        return {"message": "Success! Password updated"}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()