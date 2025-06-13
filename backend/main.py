from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.todos import router as todos_router
from routers.notes import router as notes_router
from db.database import engine, Base
import asyncio
import uvicorn
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
app.include_router(todos_router)
app.include_router(notes_router)

@app.get("/")
async def root():
    return {"message": "OnTime 인증 API 서버가 실행 중입니다"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# 직접 실행할 때 서버 시작
if __name__ == "__main__":
    print("🚀 OnTime 인증 API 서버를 시작합니다...")
    print("📍 서버 주소: http://127.0.0.1:8000")
    print("📚 API 문서: http://127.0.0.1:8000/docs")
    print("🔄 자동 리로드가 활성화되었습니다.")
    print("⏹️  서버를 중지하려면 Ctrl+C를 누르세요.")
    print("-" * 50)
    
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True, log_level="info")