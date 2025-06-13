from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.database import get_db
from schemas.schemas import TodoCreate, TodoUpdate, TodoResponse, UserResponse
from crud.crud import create_todo, get_todos, get_todo, update_todo, delete_todo
from routers.auth import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("/", response_model=TodoResponse)
async def create_new_todo(
    todo: TodoCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """새 할일 생성"""
    return await create_todo(db=db, todo=todo, user_id=current_user.id)

@router.get("/", response_model=List[TodoResponse])
async def read_todos(
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(100, ge=1, le=100, description="가져올 최대 항목 수"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 할일 목록 조회"""
    todos = await get_todos(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return todos

@router.get("/{todo_id}", response_model=TodoResponse)
async def read_todo(
    todo_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """특정 할일 조회"""
    todo = await get_todo(db=db, todo_id=todo_id, user_id=current_user.id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할일을 찾을 수 없습니다"
        )
    return todo

@router.put("/{todo_id}", response_model=TodoResponse)
async def update_existing_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """할일 수정"""
    todo = await update_todo(db=db, todo_id=todo_id, user_id=current_user.id, todo_update=todo_update)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할일을 찾을 수 없습니다"
        )
    return todo

@router.delete("/{todo_id}")
async def delete_existing_todo(
    todo_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """할일 삭제"""
    success = await delete_todo(db=db, todo_id=todo_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할일을 찾을 수 없습니다"
        )
    return {"message": "할일이 성공적으로 삭제되었습니다"}

@router.patch("/{todo_id}/complete")
async def toggle_todo_completion(
    todo_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """할일 완료 상태 토글"""
    todo = await get_todo(db=db, todo_id=todo_id, user_id=current_user.id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="할일을 찾을 수 없습니다"
        )
    
    todo_update = TodoUpdate(completed=not todo.completed)
    updated_todo = await update_todo(db=db, todo_id=todo_id, user_id=current_user.id, todo_update=todo_update)
    return updated_todo