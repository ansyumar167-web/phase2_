"""
Authentication API endpoints for user signup, signin, signout, and session management.

Security Implementation:
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens signed with BETTER_AUTH_SECRET
- Token lifetime: 7 days
- httpOnly cookies for token storage
- Rate limiting applied via middleware
"""
from fastapi import APIRouter, HTTPException, status, Depends, Response
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr, Field, validator
from passlib.context import CryptContext
from typing import Optional
import re

from ..database import get_session
from ..models.user import User
from ..auth.jwt_handler import create_access_token
from ..auth.dependencies import get_current_user_id


# Router configuration
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Password hashing configuration (bcrypt with cost factor 12)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Request/Response Models
class SignupRequest(BaseModel):
    """User signup request with email and password."""
    email: EmailStr = Field(..., max_length=255, description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")

    @validator("password")
    def validate_password_strength(cls, v):
        """
        Validate password meets security requirements.

        Requirements:
        - At least 8 characters
        - Contains uppercase letter
        - Contains lowercase letter
        - Contains number
        """
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")

        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")

        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")

        return v


class SigninRequest(BaseModel):
    """User signin request with email and password."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class UserResponse(BaseModel):
    """User information response (excludes password_hash)."""
    id: int
    email: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response with user and token."""
    user: UserResponse
    token: str


# Helper Functions
def truncate_password_to_bytes(password: str, max_bytes: int = 72) -> str:
    """
    Truncate password to max_bytes without breaking UTF-8 character boundaries.

    Args:
        password: The password string to truncate
        max_bytes: Maximum number of bytes (default 72 for bcrypt)

    Returns:
        Truncated password string that encodes to at most max_bytes
    """
    encoded = password.encode('utf-8')
    if len(encoded) <= max_bytes:
        return password

    # Truncate at byte level
    truncated = encoded[:max_bytes]

    # Decode and drop any incomplete UTF-8 characters at the end
    # This ensures we don't break in the middle of a multi-byte character
    return truncated.decode('utf-8', errors='ignore')


def hash_password(password: str) -> str:
    """
    Hash password using bcrypt with cost factor 12.
    Truncates password to 72 bytes (bcrypt limit).
    """
    # Bcrypt has a 72-byte limit, truncate if necessary
    truncated = truncate_password_to_bytes(password, 72)
    return pwd_context.hash(truncated)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password against hash using constant-time comparison.
    Truncates password to 72 bytes (bcrypt limit).
    """
    # Bcrypt has a 72-byte limit, truncate if necessary
    truncated = truncate_password_to_bytes(plain_password, 72)
    return pwd_context.verify(truncated, hashed_password)


# Authentication Endpoints
@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignupRequest,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    """
    Register a new user account.

    Security:
    - Email uniqueness enforced
    - Password hashed with bcrypt (cost factor 12)
    - JWT token issued on successful registration
    - Token stored in httpOnly cookie

    Args:
        request: Signup request with email and password
        response: FastAPI response object (for setting cookies)
        session: Database session

    Returns:
        AuthResponse: User information and JWT token

    Raises:
        HTTPException 409: Email already exists
        HTTPException 400: Validation error
    """
    # Check if email already exists
    statement = select(User).where(User.email == request.email)
    result = await session.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists"
        )

    # Hash password
    password_hash = hash_password(request.password)

    # Create new user
    new_user = User(
        email=request.email,
        password_hash=password_hash
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    # Generate JWT token
    token = create_access_token(user_id=new_user.id, email=new_user.email)

    # Set httpOnly cookie
    # Note: For cross-origin requests (localhost -> Hugging Face),
    # cookies may not work due to browser security restrictions.
    # Consider using Authorization headers for cross-origin scenarios.
    response.set_cookie(
        key="auth-token",
        value=token,
        httponly=True,
        secure=True,  # Required for SameSite=None
        samesite="none",  # Allow cross-origin cookie sending
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    # Return user and token
    user_response = UserResponse(
        id=new_user.id,
        email=new_user.email,
        created_at=new_user.created_at.isoformat(),
        updated_at=new_user.updated_at.isoformat()
    )

    return AuthResponse(user=user_response, token=token)


@router.post("/signin", response_model=AuthResponse)
async def signin(
    request: SigninRequest,
    response: Response,
    session: AsyncSession = Depends(get_session)
):
    """
    Sign in to existing user account.

    Security:
    - Password verified using constant-time comparison
    - Generic error message to prevent user enumeration
    - JWT token issued on successful authentication
    - Token stored in httpOnly cookie

    Args:
        request: Signin request with email and password
        response: FastAPI response object (for setting cookies)
        session: Database session

    Returns:
        AuthResponse: User information and JWT token

    Raises:
        HTTPException 401: Invalid credentials
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    result = await session.execute(statement)
    user = result.scalars().first()

    # Verify password (use constant-time comparison)
    if not user or not verify_password(request.password, user.password_hash):
        # Generic error message to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Generate JWT token
    token = create_access_token(user_id=user.id, email=user.email)

    # Set httpOnly cookie
    # Note: For cross-origin requests (localhost -> Hugging Face),
    # cookies may not work due to browser security restrictions.
    # Consider using Authorization headers for cross-origin scenarios.
    response.set_cookie(
        key="auth-token",
        value=token,
        httponly=True,
        secure=True,  # Required for SameSite=None
        samesite="none",  # Allow cross-origin cookie sending
        max_age=7 * 24 * 60 * 60  # 7 days
    )

    # Return user and token
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat()
    )

    return AuthResponse(user=user_response, token=token)


# Endpoint to delete user account and all associated data

@router.post("/signout")
async def signout(response: Response):
    """
    Sign out current user by clearing authentication cookie.

    Note: Since JWT is stateless, the token itself is not invalidated
    on the server. The cookie is simply removed from the client.

    Args:
        response: FastAPI response object (for clearing cookies)

    Returns:
        dict: Success message
    """
    # Clear auth cookie
    response.delete_cookie(key="auth-token")

    return {"message": "Signed out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    user_id: int = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    Get current authenticated user's information.

    Security:
    - Requires valid JWT token in Authorization header
    - User ID extracted from token (not from request)

    Args:
        user_id: Authenticated user ID (from JWT token)
        session: Database session

    Returns:
        UserResponse: Current user information

    Raises:
        HTTPException 401: Invalid or expired token
        HTTPException 404: User not found
    """
    # Fetch user from database
    statement = select(User).where(User.id == user_id)
    result = await session.execute(statement)
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Return user information
    return UserResponse(
        id=user.id,
        email=user.email,
        created_at=user.created_at.isoformat(),
        updated_at=user.updated_at.isoformat()
    )
