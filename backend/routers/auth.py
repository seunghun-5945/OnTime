from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from database import get_db
from schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from crud import authenticate_user, create_user, get_user_by_username, get_user_by_email
from auth_utils import create_access_token, verify_token
from config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth2 스키마 설정
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# 현재 사용자 가져오기 의존성
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token, credentials_exception)
    user = await get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=UserResponse)
async def register(user: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """회원가입"""
    # 기존 사용자 확인
    db_user = await get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 사용자명입니다"
        )
    
    db_user = await get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다"
        )
    
    # 새 사용자 생성
    return await create_user(db=db, user=user)

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """로그인"""
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자명 또는 비밀번호가 잘못되었습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    return current_user

@router.post("/logout")
async def logout():
    """로그아웃 (클라이언트에서 토큰 삭제)"""
    return {"message": "로그아웃되었습니다"} 