import asyncio
import asyncpg
import aiohttp
import json

async def test_api_and_db():
    try:
        print("=== API 테스트 시작 ===")
        
        # 1. 먼저 CP 데이터베이스 현재 상태 확인
        print("\n🔍 API 호출 전 CP 데이터베이스 상태:")
        conn = await asyncpg.connect(
            host='cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com',
            port=5432,
            user='postgres',
            password='wnghks1278',
            database='cp'
        )
        
        users_before = await conn.fetch("SELECT id, username, email, created_at FROM users ORDER BY id;")
        print(f"등록된 사용자 수: {len(users_before)}")
        for user in users_before:
            print(f"  - ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
        
        await conn.close()
        
        # 2. API 호출 시도
        print(f"\n📡 API 호출 시도...")
        test_user = {
            "username": "newuser123",
            "email": "newuser@example.com", 
            "password": "testpass123"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    'http://localhost:8000/auth/register',
                    json=test_user,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    response_text = await response.text()
                    print(f"응답 상태: {response.status}")
                    print(f"응답 내용: {response_text}")
                    
            except Exception as e:
                print(f"API 호출 오류: {e}")
        
        # 3. API 호출 후 데이터베이스 상태 다시 확인
        print(f"\n🔍 API 호출 후 CP 데이터베이스 상태:")
        conn = await asyncpg.connect(
            host='cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com',
            port=5432,
            user='postgres',
            password='wnghks1278',
            database='cp'
        )
        
        users_after = await conn.fetch("SELECT id, username, email, created_at FROM users ORDER BY id;")
        print(f"등록된 사용자 수: {len(users_after)}")
        for user in users_after:
            print(f"  - ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
            
        if len(users_after) > len(users_before):
            print("✅ 새로운 사용자가 추가되었습니다!")
        else:
            print("❌ 사용자가 추가되지 않았습니다.")
        
        await conn.close()
        
        # 4. 다른 username으로도 시도
        print(f"\n📡 다른 사용자명으로 재시도...")
        test_user2 = {
            "username": "anotheruser456",
            "email": "another@example.com", 
            "password": "testpass456"
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    'http://localhost:8000/auth/register',
                    json=test_user2,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    response_text = await response.text()
                    print(f"응답 상태: {response.status}")
                    print(f"응답 내용: {response_text}")
                    
            except Exception as e:
                print(f"API 호출 오류: {e}")
        
        # 5. 최종 데이터베이스 상태 확인
        print(f"\n🔍 최종 CP 데이터베이스 상태:")
        conn = await asyncpg.connect(
            host='cpdb.c1oage4oaeyi.ap-northeast-2.rds.amazonaws.com',
            port=5432,
            user='postgres',
            password='wnghks1278',
            database='cp'
        )
        
        users_final = await conn.fetch("SELECT id, username, email, created_at FROM users ORDER BY id;")
        print(f"등록된 사용자 수: {len(users_final)}")
        for user in users_final:
            print(f"  - ID: {user['id']}, Username: {user['username']}, Email: {user['email']}")
        
        await conn.close()
        
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {e}")

if __name__ == "__main__":
    asyncio.run(test_api_and_db()) 