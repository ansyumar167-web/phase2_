"""
Product model for testing purposes.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Product(SQLModel, table=True):
    """Product model with basic e-commerce fields."""

    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, nullable=False, index=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    price: float = Field(nullable=False, ge=0)  # Greater than or equal to 0
    stock: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Wireless Mouse",
                "description": "Ergonomic wireless mouse with USB receiver",
                "price": 29.99,
                "stock": 150
            }
        }
