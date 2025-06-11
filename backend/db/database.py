from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from backend.config.config import settings

# 비동기 데이터베이스 엔진 생성 (asyncpg 사용)
# postgresql:// 를 postgresql+asyncpg:// 로 변경
async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
engine = create_async_engine(async_database_url)

# 비동기 세션 팩토리 생성
AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# Base 클래스 생성
Base = declarative_base()

# User 모델 정의
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# 비동기 데이터베이스 세션 의존성
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session 