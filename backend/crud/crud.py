from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from db.database import User, Todo, Note
from utils.auth_utils import get_password_hash, verify_password
from schemas.schemas import RegisterRequest, TodoCreate, TodoUpdate, NoteCreate, NoteUpdate
from typing import List, Optional

# ==================== User CRUD ====================
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

# ==================== Todo CRUD ====================
async def create_todo(db: AsyncSession, todo: TodoCreate, user_id: int):
    """새 할일 생성"""
    db_todo = Todo(
        user_id=user_id,
        task=todo.task,
        due_date=todo.due_date
    )
    db.add(db_todo)
    await db.commit()
    await db.refresh(db_todo)
    return db_todo

async def get_todos(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """사용자의 할일 목록 조회"""
    result = await db.execute(
        select(Todo)
        .filter(Todo.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(Todo.created_at.desc())
    )
    return result.scalars().all()

async def get_todo(db: AsyncSession, todo_id: int, user_id: int):
    """특정 할일 조회"""
    result = await db.execute(
        select(Todo).filter(and_(Todo.id == todo_id, Todo.user_id == user_id))
    )
    return result.scalars().first()

async def update_todo(db: AsyncSession, todo_id: int, user_id: int, todo_update: TodoUpdate):
    """할일 수정"""
    todo = await get_todo(db, todo_id, user_id)
    if not todo:
        return None
    
    update_data = todo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(todo, field, value)
    
    await db.commit()
    await db.refresh(todo)
    return todo

async def delete_todo(db: AsyncSession, todo_id: int, user_id: int):
    """할일 삭제"""
    todo = await get_todo(db, todo_id, user_id)
    if not todo:
        return False
    
    await db.delete(todo)
    await db.commit()
    return True

# ==================== Note CRUD ====================
async def create_note(db: AsyncSession, note: NoteCreate, user_id: int):
    """새 노트 생성"""
    db_note = Note(
        user_id=user_id,
        content=note.content
    )
    db.add(db_note)
    await db.commit()
    await db.refresh(db_note)
    return db_note

async def get_notes(db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100):
    """사용자의 노트 목록 조회"""
    result = await db.execute(
        select(Note)
        .filter(Note.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(Note.updated_at.desc())
    )
    return result.scalars().all()

async def get_note(db: AsyncSession, note_id: int, user_id: int):
    """특정 노트 조회"""
    result = await db.execute(
        select(Note).filter(and_(Note.id == note_id, Note.user_id == user_id))
    )
    return result.scalars().first()

async def update_note(db: AsyncSession, note_id: int, user_id: int, note_update: NoteUpdate):
    """노트 수정"""
    note = await get_note(db, note_id, user_id)
    if not note:
        return None
    
    note.content = note_update.content
    await db.commit()
    await db.refresh(note)
    return note

async def delete_note(db: AsyncSession, note_id: int, user_id: int):
    """노트 삭제"""
    note = await get_note(db, note_id, user_id)
    if not note:
        return False
    
    await db.delete(note)
    await db.commit()
    return True