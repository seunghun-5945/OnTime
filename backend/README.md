# OnTime Backend API

FastAPI 기반의 인증 시스템을 제공하는 백엔드 서버입니다.

## 환경 설정 🔧

### 1. Python 가상환경 설정
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows
```

### 2. 패키지 설치
```bash
pip install -r requirements.txt
```

### 3. 환경 변수 설정 ⚠️ **중요**
**민감한 정보는 절대 GitHub에 올리지 마세요!**

1. `.env.example` 파일을 복사해서 `.env` 파일을 만듭니다:
```bash
cp .env.example .env
```

2. `.env` 파일을 열어서 실제 값들로 수정합니다:
```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://username:password@host:port/database_name

# JWT Configuration  
SECRET_KEY=your-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**주의사항:**
- `.env` 파일은 이미 `.gitignore`에 포함되어 있어서 Git에 커밋되지 않습니다
- 팀원들은 각자 본인의 `.env` 파일을 만들어야 합니다
- SECRET_KEY는 최소 32자 이상의 랜덤한 문자열을 사용하세요

### 4. 서버 실행
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## API 엔드포인트 📚

### 인증 관련
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `GET /auth/me` - 현재 사용자 정보
- `POST /auth/logout` - 로그아웃

### 테스트
```bash
# 로그인 테스트
curl -X POST "http://127.0.0.1:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

## 보안 주의사항 🔒

1. **절대 하지 마세요:**
   - `.env` 파일을 Git에 커밋
   - 하드코딩된 비밀번호나 키를 코드에 포함
   - 프로덕션 DB 정보를 개발환경에서 사용

2. **반드시 하세요:**
   - 강력한 SECRET_KEY 사용
   - 정기적인 비밀번호 변경
   - HTTPS 사용 (프로덕션 환경)

## 문제 해결 🛠️

### 환경 변수 로딩 확인
```bash
python -c "from config import settings; print('Database URL:', settings.database_url[:30] + '...'); print('Secret Key Length:', len(settings.secret_key))"
``` 