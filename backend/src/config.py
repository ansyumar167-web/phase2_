"""
Configuration module for loading and validating environment variables.
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = Field(..., alias="DATABASE_URL")

    # Authentication
    better_auth_secret: str = Field(..., alias="BETTER_AUTH_SECRET")

    # CORS
    allowed_origins: str = Field(
        default="http://localhost:3000",
        alias="ALLOWED_ORIGINS"
    )

    # Server
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse ALLOWED_ORIGINS into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
