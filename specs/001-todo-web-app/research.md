# Research Findings: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-10
**Phase**: Phase 0 - Research & Technology Validation

## Overview

This document captures research findings and technical decisions for implementing the Todo Full-Stack Web Application. Each section addresses a specific technical question identified during planning.

---

## R1: Better Auth JWT Token Structure

### Question
What claims does Better Auth include in JWT tokens? How is user ID encoded?

### Research Findings

Better Auth JWT tokens follow standard JWT structure with these claims:
- `sub` (subject): User ID (primary identifier)
- `email`: User's email address
- `iat` (issued at): Token creation timestamp
- `exp` (expiration): Token expiration timestamp
- `jti` (JWT ID): Unique token identifier

### Decision

**Use `sub` claim for user ID extraction in FastAPI backend**

### Rationale

- `sub` is the standard JWT claim for subject/user identification (RFC 7519)
- Better Auth consistently uses `sub` for user ID across all authentication flows
- Aligns with industry best practices for JWT-based authentication
- Simplifies backend implementation (single claim to extract)

### Implementation Approach

```python
# Backend JWT verification will extract user_id from 'sub' claim
def get_current_user(token: str) -> int:
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return int(user_id)
```

### Alternatives Considered

- Using `email` as identifier: Rejected because email is mutable and not suitable as primary key
- Custom claim: Rejected because `sub` is standard and Better Auth already provides it

---

## R2: FastAPI JWT Verification Middleware

### Question
What's the recommended pattern for JWT verification in FastAPI dependencies?

### Research Findings

FastAPI supports dependency injection for authentication. Two main approaches:
1. **Dependency function**: Reusable function that extracts and verifies JWT
2. **Middleware**: Global middleware that runs on every request

Best practice: Use dependency function for protected endpoints, not global middleware.

### Decision

**Implement JWT verification as FastAPI dependency using `python-jose` library**

### Rationale

- Dependency injection is more flexible (can apply to specific routes)
- `python-jose` is well-maintained and widely used in FastAPI ecosystem
- Allows unprotected routes (health check) without modification
- Clear error handling with HTTPException
- Type-safe with Pydantic models

### Implementation Approach

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return int(user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

# Usage in endpoints
@app.get("/api/tasks")
async def get_tasks(user_id: int = Depends(get_current_user_id)):
    # user_id is automatically extracted and verified
    return await fetch_user_tasks(user_id)
```

### Alternatives Considered

- **PyJWT library**: Rejected because `python-jose` has better FastAPI integration
- **Global middleware**: Rejected because it would require exceptions for unprotected routes
- **Custom middleware class**: Rejected as unnecessarily complex for this use case

### Dependencies Required

```
python-jose[cryptography]==3.3.0
fastapi==0.109.0
```

---

## R3: Neon PostgreSQL with SQLModel

### Question
How to configure async database connections with Neon and SQLModel?

### Research Findings

Neon PostgreSQL supports standard PostgreSQL connection strings. SQLModel (built on SQLAlchemy) supports async operations via `asyncpg` driver.

Connection string format:
```
postgresql+asyncpg://user:password@host/database?sslmode=require
```

### Decision

**Use SQLModel with asyncpg driver and Alembic for migrations**

### Rationale

- SQLModel provides type-safe models with Pydantic integration
- `asyncpg` is the fastest PostgreSQL driver for Python
- Alembic provides robust migration management (better than create_all() for production)
- Neon requires SSL connections (sslmode=require)
- Async operations align with FastAPI's async nature

### Implementation Approach

**Database Configuration:**
```python
from sqlmodel import SQLModel, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
# Neon format: postgresql://user:pass@host/db
# Convert to async: postgresql+asyncpg://user:pass@host/db

engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True,
    future=True
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
```

**Migration Strategy:**
```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Create users and tasks tables"

# Apply migration
alembic upgrade head
```

### Alternatives Considered

- **SQLModel create_all()**: Rejected because it doesn't support migrations (can't modify schema later)
- **Raw SQL with psycopg2**: Rejected because SQLModel provides type safety and ORM benefits
- **Synchronous driver**: Rejected because async is more efficient with FastAPI

### Dependencies Required

```
sqlmodel==0.0.14
asyncpg==0.29.0
alembic==1.13.1
```

---

## R4: Next.js 16 App Router Auth Patterns

### Question
Where to store JWT tokens in Next.js App Router? How to protect routes?

### Research Findings

Next.js 16 App Router introduces Server Components and new authentication patterns. Token storage options:
1. **httpOnly cookies**: Server-side only, most secure
2. **localStorage**: Client-side, vulnerable to XSS
3. **sessionStorage**: Client-side, cleared on tab close

Better Auth supports httpOnly cookies by default.

### Decision

**Use httpOnly cookies for token storage with Next.js middleware for route protection**

### Rationale

- httpOnly cookies are immune to XSS attacks (JavaScript cannot access)
- Better Auth handles cookie management automatically
- Next.js middleware can verify tokens server-side before rendering
- Works seamlessly with Server Components
- Cookies are automatically sent with every request

### Implementation Approach

**Better Auth Configuration (frontend):**
```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Better Auth automatically uses httpOnly cookies
})
```

**Route Protection Middleware:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

**API Client with Token:**
```typescript
// lib/api.ts
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  // Cookies are automatically included in fetch requests
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to signin
      window.location.href = '/auth/signin'
    }
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
```

### Alternatives Considered

- **localStorage**: Rejected due to XSS vulnerability
- **sessionStorage**: Rejected because tokens should persist across tabs
- **Client-side only protection**: Rejected because it's bypassable

### Dependencies Required

```json
{
  "better-auth": "^1.0.0",
  "next": "^16.0.0"
}
```

---

## R5: CORS Configuration for Development and Production

### Question
What CORS settings are needed for localhost development and production deployment?

### Research Findings

CORS (Cross-Origin Resource Sharing) is required when frontend and backend are on different origins. FastAPI provides `CORSMiddleware` for configuration.

Development: Frontend (localhost:3000) → Backend (localhost:8000)
Production: Frontend (app.example.com) → Backend (api.example.com)

### Decision

**Use environment-based CORS configuration with explicit allowed origins**

### Rationale

- Prevents CORS errors during development
- Maintains security in production (no wildcard origins)
- Supports credentials (cookies) with explicit origins
- Easy to configure via environment variables

### Implementation Approach

**Backend CORS Configuration:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# Environment-based origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Explicit origins (no wildcard)
    allow_credentials=True,  # Required for cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
```

**Environment Variables:**
```bash
# Development (.env)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Production (.env.production)
ALLOWED_ORIGINS=https://app.example.com
```

**Frontend Configuration:**
```typescript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ]
  },
}
```

### Alternatives Considered

- **Wildcard origins (allow_origins=["*"])**: Rejected because it's insecure and doesn't support credentials
- **Same-origin deployment**: Rejected because it violates separation of concerns principle
- **Proxy all requests through Next.js**: Rejected because it adds unnecessary complexity

### Security Considerations

- Never use wildcard origins in production
- Always validate origin against whitelist
- Enable credentials only when necessary
- Log CORS errors for debugging

---

## Summary of Key Decisions

| Area | Decision | Library/Tool |
|------|----------|--------------|
| JWT Claims | Use `sub` claim for user ID | Better Auth (standard) |
| JWT Verification | FastAPI dependency injection | python-jose |
| Database Driver | Async PostgreSQL with SQLModel | asyncpg + SQLModel |
| Migrations | Alembic for schema management | Alembic |
| Token Storage | httpOnly cookies | Better Auth (built-in) |
| Route Protection | Next.js middleware | Next.js 16 |
| CORS | Environment-based explicit origins | FastAPI CORSMiddleware |

## Dependencies Summary

**Backend (requirements.txt):**
```
fastapi==0.109.0
sqlmodel==0.0.14
asyncpg==0.29.0
alembic==1.13.1
python-jose[cryptography]==3.3.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "better-auth": "^1.0.0"
  }
}
```

## Next Steps

1. Proceed to Phase 1: Design & Contracts
2. Create data-model.md with entity definitions
3. Create API contracts in contracts/ directory
4. Create quickstart.md with setup instructions
5. Update agent context with technology stack
