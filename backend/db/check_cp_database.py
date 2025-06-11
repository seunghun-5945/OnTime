import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

async def check_cp_database():
    try:
        # 환경변수에서 데이터베이스 정보 가져오기
        db_host = os.getenv("DB_HOST")
        db_port = int(os.getenv("DB_PORT", "5432"))
        db_user = os.getenv("DB_USER")
        db_password = os.getenv("DB_PASSWORD")
        db_name = os.getenv("DB_NAME", "cp")
        
        if not all([db_host, db_user, db_password]):
            raise ValueError("필수 데이터베이스 환경변수가 설정되지 않았습니다.")
        
        print("=== CP 데이터베이스 연결 시도 ===")
        print(f"Host: {db_host}")
        print(f"Database: {db_name}")
        print("=" * 50)
        
        # cp 데이터베이스에 연결
        conn = await asyncpg.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name
        )
        
        print("✅ CP 데이터베이스 연결 성공!")
        
        # 현재 연결된 데이터베이스 확인
        current_db = await conn.fetchval("SELECT current_database();")
        print(f"현재 연결된 데이터베이스: {current_db}")
        
        # 모든 테이블 조회
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        print(f"\n=== CP 데이터베이스의 테이블들 ===")
        if tables:
            for table in tables:
                print(f"- {table['table_name']}")
        else:
            print("테이블이 없습니다.")
        
        # users 테이블 확인
        users_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            );
        """)
        
        print(f"\n=== users 테이블 상태 ===")
        if users_exists:
            print("✅ users 테이블 존재")
            
            # users 테이블 구조 확인
            columns = await conn.fetch("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position;
            """)
            
            print("테이블 구조:")
            for col in columns:
                print(f"  - {col['column_name']}: {col['data_type']} (nullable: {col['is_nullable']})")
            
            # users 테이블 데이터 확인
            users_count = await conn.fetchval("SELECT COUNT(*) FROM users;")
            print(f"\n등록된 사용자 수: {users_count}")
            
            if users_count > 0:
                users = await conn.fetch("SELECT id, username, email, created_at FROM users ORDER BY id;")
                print("등록된 사용자들:")
                for user in users:
                    print(f"  ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Created: {user['created_at']}")
            else:
                print("등록된 사용자가 없습니다.")
                
        else:
            print("❌ users 테이블이 존재하지 않습니다.")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(check_cp_database())