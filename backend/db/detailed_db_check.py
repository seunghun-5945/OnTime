import asyncio
import asyncpg

async def detailed_check():
    try:
        print("=== 연결 시도 정보 ===")
        print(f"Host: cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com")
        print(f"Port: 5432")
        print(f"User: postgres")
        print(f"Database: postgres")
        print("=" * 50)
        
        # 데이터베이스 연결
        conn = await asyncpg.connect(
            host='cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com',
            port=5432,
            user='postgres',
            password='wnghks1278',
            database='postgres'
        )
        
        print("✅ 연결 성공!")
        
        # 현재 연결 정보 확인
        current_info = await conn.fetch("""
            SELECT 
                current_database() as database_name,
                current_user as user_name,
                inet_server_addr() as server_ip,
                inet_server_port() as server_port,
                version() as version
        """)
        
        print(f"\n=== 현재 연결 정보 ===")
        for info in current_info:
            print(f"데이터베이스: {info['database_name']}")
            print(f"사용자: {info['user_name']}")
            print(f"서버 IP: {info['server_ip']}")
            print(f"서버 포트: {info['server_port']}")
            print(f"PostgreSQL 버전: {info['version']}")
        
        # 서버의 모든 데이터베이스 조회
        databases = await conn.fetch("""
            SELECT datname as database_name 
            FROM pg_database 
            WHERE datistemplate = false
            ORDER BY datname;
        """)
        
        print(f"\n=== 서버의 모든 데이터베이스 ===")
        for db in databases:
            print(f"- {db['database_name']}")
        
        # 현재 데이터베이스의 모든 스키마 조회
        schemas = await conn.fetch("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
            ORDER BY schema_name;
        """)
        
        print(f"\n=== 현재 데이터베이스의 스키마 ===")
        for schema in schemas:
            print(f"- {schema['schema_name']}")
        
        # 각 스키마별 테이블 조회
        for schema in schemas:
            schema_name = schema['schema_name']
            tables = await conn.fetch("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = $1
                ORDER BY table_name;
            """, schema_name)
            
            print(f"\n=== {schema_name} 스키마의 테이블들 ===")
            if tables:
                for table in tables:
                    print(f"- {table['table_name']}")
                    
                    # users 테이블이면 데이터도 확인
                    if table['table_name'] == 'users':
                        try:
                            users_count = await conn.fetchval(f"SELECT COUNT(*) FROM {schema_name}.users;")
                            print(f"  👥 users 테이블의 데이터 수: {users_count}")
                            
                            if users_count > 0:
                                users = await conn.fetch(f"SELECT id, username, email, created_at FROM {schema_name}.users ORDER BY id LIMIT 10;")
                                print(f"  📋 등록된 사용자들 (최대 10개):")
                                for user in users:
                                    print(f"    ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Created: {user['created_at']}")
                        except Exception as e:
                            print(f"  ❌ users 테이블 조회 오류: {e}")
            else:
                print("  (테이블 없음)")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ 연결 실패: {e}")

if __name__ == "__main__":
    asyncio.run(detailed_check()) 