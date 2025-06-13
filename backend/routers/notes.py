from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.database import get_db
from schemas.schemas import NoteCreate, NoteUpdate, NoteResponse, UserResponse
from crud.crud import create_note, get_notes, get_note, update_note, delete_note
from routers.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("/", response_model=NoteResponse)
async def create_new_note(
    note: NoteCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """새 노트 생성"""
    return await create_note(db=db, note=note, user_id=current_user.id)

@router.get("/", response_model=List[NoteResponse])
async def read_notes(
    skip: int = Query(0, ge=0, description="건너뛸 항목 수"),
    limit: int = Query(100, ge=1, le=100, description="가져올 최대 항목 수"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 노트 목록 조회"""
    notes = await get_notes(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return notes

@router.get("/{note_id}", response_model=NoteResponse)
async def read_note(
    note_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """특정 노트 조회"""
    note = await get_note(db=db, note_id=note_id, user_id=current_user.id)
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="노트를 찾을 수 없습니다"
        )
    return note

@router.put("/{note_id}", response_model=NoteResponse)
async def update_existing_note(
    note_id: int,
    note_update: NoteUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """노트 수정"""
    note = await update_note(db=db, note_id=note_id, user_id=current_user.id, note_update=note_update)
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="노트를 찾을 수 없습니다"
        )
    return note

@router.delete("/{note_id}")
async def delete_existing_note(
    note_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """노트 삭제"""
    success = await delete_note(db=db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="노트를 찾을 수 없습니다"
        )
    return {"message": "노트가 성공적으로 삭제되었습니다"}