"""
Task model for todo items.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class Task(SQLModel, table=True):
    """
    Task entity representing a single todo item.

    Attributes:
        id: Unique task identifier (auto-generated)
        user_id: Owner of the task (foreign key to users.id)
        title: Task title/summary (required)
        description: Optional detailed description
        is_completed: Completion status (default: False)
        created_at: Task creation timestamp
        updated_at: Last modification timestamp
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "is_completed": False,
                "created_at": "2026-01-10T12:00:00Z",
                "updated_at": "2026-01-10T12:00:00Z"
            }
        }
