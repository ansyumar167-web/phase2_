"""
JWT token generation and verification utilities.

Security Notes:
- Tokens are signed with BETTER_AUTH_SECRET (must match frontend)
- Token lifetime: 7 days (configurable)
- Claims include: user_id, email, iat, exp, iss
"""
from datetime import datetime, timedelta
from typing import Dict, Optional
from jose import JWTError, jwt
from ..config import settings


# JWT Configuration
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7
ISSUER = "todo-app-backend"


def create_access_token(user_id: int, email: str) -> str:
    """
    Generate a JWT access token for authenticated user.

    Args:
        user_id: User's unique identifier
        email: User's email address

    Returns:
        str: Signed JWT token

    Security:
        - Token signed with BETTER_AUTH_SECRET
        - Includes expiration time (7 days)
        - Contains minimal claims (user_id, email)
    """
    now = datetime.utcnow()
    expire = now + timedelta(days=TOKEN_EXPIRE_DAYS)

    payload = {
        "sub": str(user_id),  # Subject (user ID)
        "email": email,
        "iat": now,  # Issued at
        "exp": expire,  # Expiration
        "iss": ISSUER,  # Issuer
    }

    token = jwt.encode(
        payload,
        settings.better_auth_secret,
        algorithm=ALGORITHM
    )

    return token


def verify_token(token: str) -> Optional[Dict]:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token string

    Returns:
        Dict: Decoded token payload if valid, None otherwise

    Security:
        - Verifies signature using BETTER_AUTH_SECRET
        - Checks expiration time
        - Validates token structure
    """
    try:
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def extract_user_id_from_token(token: str) -> Optional[int]:
    """
    Extract user ID from JWT token.

    Args:
        token: JWT token string

    Returns:
        int: User ID if token is valid, None otherwise
    """
    payload = verify_token(token)
    if payload is None:
        return None

    try:
        user_id = int(payload.get("sub"))
        return user_id
    except (ValueError, TypeError):
        return None
