from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import User
from auth_utils import get_password_hash, verify_password
from schemas import RegisterRequest

async def get_user_by_username(db: AsyncSession, username: str):
    """사용자명으로 사용자 조회"""
    result = await db.execute(select(User).filter(User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str):
    """이메일로 사용자 조회"""
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: RegisterRequest):
    """새 사용자 생성"""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def authenticate_user(db: AsyncSession, username: str, password: str):
    """사용자 인증"""
    user = await get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user 