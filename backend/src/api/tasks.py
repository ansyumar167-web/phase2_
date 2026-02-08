"""
Task management API endpoints.
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from pydantic import BaseModel, Field

from ..database import get_session
from ..auth.dependencies import get_current_user_id
from ..models.task import Task


router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


# Request/Response models
class TaskCreate(BaseModel):
    """Request model for creating a new task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskUpdate(BaseModel):
    """Request model for updating an existing task (partial updates allowed)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: Optional[bool] = Field(default=None)


class TaskResponse(BaseModel):
    """Response model for task data."""
    id: int
    user_id: int
    title: str
    description: Optional[str]
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new task for the authenticated user.

    - **title**: Task title (required, 1-200 characters)
    - **description**: Optional task description (max 1000 characters)

    Returns the created task with auto-generated ID and timestamps.
    User ID is automatically set from the JWT token.
    """
    # Create new task with user_id from JWT token
    new_task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
        is_completed=False
    )

    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    return new_task


@router.get("", response_model=List[TaskResponse])
async def get_tasks(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Get all tasks for the authenticated user.

    Returns a list of tasks filtered by user_id from JWT token.
    Tasks are ordered by creation date (newest first).
    """
    # Query tasks with user_id filter (CRITICAL for user isolation)
    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await session.execute(statement)
    tasks = result.scalars().all()

    return tasks


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Update an existing task (partial updates supported).

    - **task_id**: ID of the task to update
    - **title**: New task title (optional, 1-200 characters)
    - **description**: New task description (optional, max 1000 characters)
    - **is_completed**: Completion status (optional, boolean)

    Returns the updated task.
    Returns 404 if task not found.
    Returns 403 if task belongs to different user.
    """
    # First, query task by ID only to distinguish between not found and forbidden
    statement = select(Task).where(Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    # Return 404 if task doesn't exist
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return 403 if task belongs to different user (ownership violation)
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this task"
        )

    # Update only the fields that are provided (partial update)
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.is_completed is not None:
        task.is_completed = task_data.is_completed

    # Always update the timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return task


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Toggle the completion status of a task.

    - **task_id**: ID of the task to toggle

    Returns the updated task with toggled is_completed status.
    Returns 404 if task not found or belongs to different user.
    """
    # Query task with both id and user_id for ownership verification
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    # Return 404 if task not found or belongs to different user
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Delete a task permanently.

    - **task_id**: ID of the task to delete

    Returns 204 No Content on successful deletion.
    Returns 404 if task not found.
    Returns 403 if task belongs to different user.
    """
    # First, query task by ID only to distinguish between not found and forbidden
    statement = select(Task).where(Task.id == task_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    # Return 404 if task doesn't exist
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Return 403 if task belongs to different user (ownership violation)
    if task.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this task"
        )

    # Delete task from database
    await session.delete(task)
    await session.commit()

    # Return 204 No Content (no response body)
    return None
