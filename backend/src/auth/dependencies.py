"""
FastAPI dependencies for authentication and authorization.

Usage:
    @router.get("/api/tasks")
    async def get_tasks(user_id: int = Depends(get_current_user_id)):
        # user_id is automatically extracted and verified from JWT
        return await fetch_user_tasks(user_id)
"""
from fastapi import Depends, HTTPException, status, Request
from typing import Optional
from .jwt_handler import extract_user_id_from_token


async def get_current_user_id(request: Request) -> int:
    """
    Extract and verify user ID from JWT token.

    Supports two authentication methods:
    1. Authorization header: Bearer <token> (preferred for cross-origin)
    2. Cookie: auth-token (for same-origin)

    This dependency:
    1. Extracts JWT token from Authorization header or cookie
    2. Verifies token signature and expiration
    3. Extracts user_id from token claims
    4. Returns authenticated user_id

    Args:
        request: FastAPI request object

    Returns:
        int: Authenticated user ID

    Raises:
        HTTPException: 403 if token is invalid, expired, or missing

    Security:
        - Token signature verified using BETTER_AUTH_SECRET
        - Expired tokens rejected
        - Invalid tokens rejected
        - User ID extracted from 'sub' claim
    """
    token = None

    # Try Authorization header first (for cross-origin requests)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "")

    # Fallback to cookie (for same-origin requests)
    if not token:
        token = request.cookies.get("auth-token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authentication required",
        )

    user_id = extract_user_id_from_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired authentication token",
        )

    return user_id


async def get_optional_user_id(
    request: Request
) -> Optional[int]:
    """
    Extract user ID from JWT token if present (optional authentication).

    This dependency allows endpoints to work for both authenticated
    and unauthenticated users.

    Args:
        request: FastAPI request object

    Returns:
        int: User ID if authenticated, None otherwise
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    user_id = extract_user_id_from_token(token)

    return user_id
