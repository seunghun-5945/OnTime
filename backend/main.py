from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.auth import router as auth_router
from backend.db.database import engine, Base
import asyncio

# FastAPI 앱 생성
app = FastAPI(
    title="OnTime 인증 API",
    description="FastAPI와 JWT를 사용한 사용자 인증 시스템",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영환경에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 테이블 생성 (비동기)
@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 라우터 등록
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "OnTime 인증 API 서버가 실행 중입니다"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 