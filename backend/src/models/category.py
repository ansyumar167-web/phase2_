"""
Category model for testing purposes.
"""
from typing import Optional
from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    """Category model for organizing products."""

    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, nullable=False, unique=True, index=True)
    description: Optional[str] = Field(default=None, max_length=500)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Electronics",
                "description": "Electronic devices and accessories"
            }
        }
