"""
Order model for testing purposes.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Order(SQLModel, table=True):
    """Order model for tracking customer orders."""

    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    total_amount: float = Field(nullable=False, ge=0)
    status: str = Field(
        max_length=50,
        nullable=False,
        default="pending",
        index=True
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "total_amount": 149.99,
                "status": "pending"
            }
        }
