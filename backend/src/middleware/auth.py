"""
JWT authentication middleware for FastAPI.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from ..config import settings


security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """
    Extract and verify user ID from JWT token.

    This dependency should be used on all protected endpoints to:
    1. Verify the JWT token signature
    2. Extract the user ID from the 'sub' claim
    3. Return the authenticated user ID

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        int: Authenticated user ID

    Raises:
        HTTPException: 401 if token is invalid or missing

    Usage:
        @app.get("/api/tasks")
        async def get_tasks(user_id: int = Depends(get_current_user_id)):
            # user_id is automatically extracted and verified
            return await fetch_user_tasks(user_id)
    """
    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            credentials.credentials,
            settings.better_auth_secret,
            algorithms=["HS256"]
        )

        # Extract user ID from 'sub' claim
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return int(user_id)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format",
            headers={"WWW-Authenticate": "Bearer"},
        )
