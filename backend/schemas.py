from pydantic import BaseModel, EmailStr
from datetime import datetime
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