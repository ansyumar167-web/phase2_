"""
Database configuration and session management for Neon PostgreSQL.
"""
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from .config import settings


# Convert PostgreSQL URL to async format for asyncpg
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Create async engine
engine = create_async_engine(
    database_url,
    echo=True,  # Set to False in production
    future=True,
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncSession:
    """
    Dependency for getting async database sessions.

    Usage in FastAPI endpoints:
        @app.get("/endpoint")
        async def endpoint(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with async_session() as session:
        yield session


async def init_db():
    """
    Initialize database tables.
    Note: In production, use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
