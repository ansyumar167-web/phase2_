"""
User model for authentication and user management.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    """
    User entity representing a registered user account.

    Attributes:
        id: Unique user identifier (auto-generated)
        email: User's email address (unique, used for authentication)
        password_hash: Hashed password (never store plain text)
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "created_at": "2026-01-10T12:00:00Z",
                "updated_at": "2026-01-10T12:00:00Z"
            }
        }
