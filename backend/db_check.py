import asyncio
import asyncpg

async def check_database():
    try:
        # 데이터베이스 연결
        conn = await asyncpg.connect(
            host='cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com',
            port=5432,
            user='postgres',
            password='wnghks1278',
            database='postgres'
        )
        
        print("=== 데이터베이스 연결 정보 ===")
        print(f"Host: cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com")
        print(f"Database: postgres")
        print(f"User: postgres")
        print("연결 성공! ✅")
        
        # 현재 데이터베이스 이름 확인
        current_db = await conn.fetchval("SELECT current_database();")
        print(f"현재 연결된 데이터베이스: {current_db}")
        
        # 모든 테이블 조회
        tables = await conn.fetch("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        print(f"\n=== 데이터베이스의 모든 테이블 ===")
        for table in tables:
            print(f"- {table['table_name']}")
        
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
            print("users 테이블 존재: ✅")
            
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
            print("users 테이블 존재하지 않음: ❌")
        
        await conn.close()
        
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(check_database()) 