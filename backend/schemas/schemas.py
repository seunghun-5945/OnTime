from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

# 로그인 요청 스키마
class LoginRequest(BaseModel):
    username: str
    password: str

# 회원가입 요청 스키마  
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

# 토큰 응답 스키마
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# 사용자 정보 응답 스키마
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# 토큰 데이터 스키마
class TokenData(BaseModel):
    username: Optional[str] = None

# Todo 스키마들
class TodoCreate(BaseModel):
    task: str
    due_date: Optional[date] = None

class TodoUpdate(BaseModel):
    task: Optional[str] = None
    due_date: Optional[date] = None
    completed: Optional[bool] = None

class TodoResponse(BaseModel):
    id: int
    user_id: int
    task: str
    due_date: Optional[date]
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Note 스키마들
class NoteCreate(BaseModel):
    content: str

class NoteUpdate(BaseModel):
    content: str

class NoteResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True