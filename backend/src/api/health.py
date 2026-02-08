"""
Health check endpoint for service monitoring.
"""
from datetime import datetime
from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint (no authentication required).

    Returns:
        dict: Service status and timestamp

    Example response:
        {
            "status": "healthy",
            "timestamp": "2026-01-10T12:00:00Z"
        }
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
