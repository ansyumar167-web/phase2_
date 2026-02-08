# Research: Authentication & Frontend Integration

**Feature**: Frontend Application & API Integration
**Branch**: 002-frontend-api-integration
**Date**: 2026-01-10
**Status**: Completed

## Overview

This document consolidates research findings for implementing secure authentication in the Next.js frontend with Better Auth and JWT tokens. All technology decisions are documented with rationale and alternatives considered.

## Research Topics

### 1. Better Auth JWT Plugin Configuration

**Decision**: Use Better Auth with JWT plugin enabled, configured for stateless authentication

**Rationale**:
- Better Auth provides built-in JWT support with minimal configuration
- Stateless authentication scales better for multi-user applications
- JWT tokens contain all necessary user information (user_id, email)
- No server-side session storage required
- Compatible with FastAPI backend verification

**Configuration Approach**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  jwt: {
    enabled: true,
    expiresIn: "7d",  // 7 days token lifetime
    algorithm: "HS256",  // HMAC SHA-256 for symmetric signing
  },
  database: {
    // Better Auth will use backend API for user storage
    type: "custom",
    // Custom adapter to communicate with FastAPI backend
  }
})
```

**Alternatives Considered**:
- **NextAuth.js**: More popular but heavier, includes features we don't need
- **Clerk**: Third-party service, adds external dependency and cost
- **Custom JWT implementation**: More control but higher security risk and development time

**Best Practices Applied**:
- Use environment variables for secrets
- Set reasonable token expiration (7 days balances security and UX)
- Use HS256 algorithm (symmetric, simpler for single-secret setup)
- Document token claims structure for backend coordination

---

### 2. JWT Token Storage: httpOnly Cookies vs localStorage

**Decision**: Use httpOnly cookies for JWT token storage

**Rationale**:
- **Security**: httpOnly cookies are not accessible via JavaScript, preventing XSS attacks
- **Automatic transmission**: Browser automatically includes cookies in requests
- **CSRF protection**: Can be combined with SameSite attribute
- **Industry standard**: Recommended by OWASP for sensitive tokens

**Implementation**:
```typescript
// Better Auth automatically handles cookie storage
// Configuration:
{
  cookies: {
    httpOnly: true,      // Not accessible via JavaScript
    secure: true,        // HTTPS only in production
    sameSite: "lax",     // CSRF protection
    maxAge: 7 * 24 * 60 * 60  // 7 days in seconds
  }
}
```

**Alternatives Considered**:

| Storage Method | Security | Pros | Cons | Decision |
|----------------|----------|------|------|----------|
| **httpOnly Cookies** | ✅ High | XSS-proof, automatic transmission | Requires CORS configuration | ✅ **SELECTED** |
| **localStorage** | ❌ Low | Simple API, large storage | Vulnerable to XSS, manual header injection | ❌ Rejected |
| **sessionStorage** | ❌ Low | Tab-isolated | Vulnerable to XSS, lost on tab close | ❌ Rejected |
| **Memory only** | ✅ High | Most secure | Lost on page refresh, poor UX | ❌ Rejected |

**Security Comparison**:
- **XSS Attack**: httpOnly cookies are immune, localStorage is vulnerable
- **CSRF Attack**: Both vulnerable, but cookies can use SameSite attribute
- **Token Theft**: httpOnly cookies harder to steal via malicious scripts

**Best Practices Applied**:
- Enable httpOnly flag to prevent JavaScript access
- Use secure flag for HTTPS-only transmission in production
- Set SameSite=lax to prevent CSRF attacks
- Configure appropriate maxAge for token lifetime

---

### 3. Next.js Middleware for Route Protection

**Decision**: Implement Next.js middleware to protect authenticated routes

**Rationale**:
- Middleware runs before page rendering (server-side)
- Prevents flash of unauthenticated content
- Centralized authentication logic
- Works with App Router and Server Components

**Implementation Pattern**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')

  // Protected routes require authentication
  if (request.nextUrl.pathname.startsWith('/tasks')) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
  }

  // Auth routes redirect if already authenticated
  if (request.nextUrl.pathname.startsWith('/signin') ||
      request.nextUrl.pathname.startsWith('/signup')) {
    if (token) {
      return NextResponse.redirect(new URL('/tasks', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/tasks/:path*', '/signin', '/signup']
}
```

**Alternatives Considered**:
- **Client-side route guards**: Causes flash of content, poor UX
- **Server Component checks**: Works but requires duplication across pages
- **Layout-based protection**: Less centralized, harder to maintain

**Best Practices Applied**:
- Use middleware for centralized auth checks
- Redirect unauthenticated users to signin
- Redirect authenticated users away from auth pages
- Use matcher config for performance (only run on specific routes)

---

### 4. API Client with Automatic JWT Injection

**Decision**: Create a centralized API client wrapper that automatically attaches JWT tokens

**Rationale**:
- DRY principle: Single place to handle authentication headers
- Consistent error handling across all API calls
- Easy to add interceptors for token refresh or logging
- Type-safe with TypeScript

**Implementation Pattern**:
```typescript
// lib/api-client.ts
import { auth } from './auth'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  private async getAuthHeader(): Promise<HeadersInit> {
    const session = await auth.getSession()
    if (!session?.token) {
      throw new Error('Not authenticated')
    }
    return {
      'Authorization': `Bearer ${session.token}`,
      'Content-Type': 'application/json'
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeader()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    if (response.status === 401) {
      // Token expired, redirect to signin
      window.location.href = '/signin'
      throw new Error('Authentication expired')
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeader()
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    if (response.status === 401) {
      window.location.href = '/signin'
      throw new Error('Authentication expired')
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Similar methods for PUT, DELETE, PATCH
}

export const apiClient = new ApiClient()
```

**Usage Example**:
```typescript
// In a component
import { apiClient } from '@/lib/api-client'

const tasks = await apiClient.get<Task[]>('/api/tasks')
const newTask = await apiClient.post<Task>('/api/tasks', { title: 'New task' })
```

**Alternatives Considered**:
- **Manual header injection**: Error-prone, repetitive code
- **Axios with interceptors**: Additional dependency, overkill for simple needs
- **React Query with custom fetcher**: Good option but adds complexity
- **SWR with custom fetcher**: Similar to React Query

**Best Practices Applied**:
- Centralized authentication header logic
- Automatic 401 handling (redirect to signin)
- Type-safe with TypeScript generics
- Environment-based API URL configuration
- Consistent error handling

---

### 5. Token Refresh Strategy

**Decision**: Use long-lived tokens (7 days) without automatic refresh for MVP

**Rationale**:
- Simpler implementation for initial version
- 7-day expiration balances security and UX
- Users can re-authenticate when token expires
- Refresh tokens add complexity (additional storage, rotation logic)

**Token Lifecycle**:
1. User signs in → receives JWT with 7-day expiration
2. Token stored in httpOnly cookie
3. Token automatically included in all API requests
4. After 7 days, token expires → user redirected to signin
5. User signs in again → receives new token

**Future Enhancement** (if needed):
```typescript
// Refresh token pattern (not implemented in MVP)
{
  accessToken: "short-lived (15 min)",
  refreshToken: "long-lived (7 days)",
  // When accessToken expires, use refreshToken to get new accessToken
}
```

**Alternatives Considered**:
- **Short-lived tokens with refresh**: More secure but complex
- **Sliding expiration**: Extends token on each use, can lead to indefinite sessions
- **No expiration**: Security risk, not recommended

**Best Practices Applied**:
- Balance security (expiration) with UX (reasonable lifetime)
- Clear expiration handling (redirect to signin)
- Document future enhancement path
- Keep MVP simple, add complexity only if needed

---

### 6. Error Handling for Authentication Failures

**Decision**: Implement comprehensive error handling with user-friendly messages

**Rationale**:
- Users need clear feedback when authentication fails
- Different error types require different handling
- Graceful degradation improves user experience
- Security: Don't leak sensitive information in error messages

**Error Categories and Handling**:

| Error Type | HTTP Status | User Message | Action |
|------------|-------------|--------------|--------|
| **Invalid credentials** | 401 | "Email or password is incorrect" | Stay on signin page |
| **Token expired** | 401 | "Your session has expired. Please sign in again." | Redirect to signin |
| **Token invalid** | 401 | "Authentication error. Please sign in again." | Redirect to signin |
| **Network error** | N/A | "Unable to connect. Please check your internet connection." | Show retry button |
| **Server error** | 500 | "Something went wrong. Please try again later." | Show retry button |
| **Validation error** | 400 | Specific field errors (e.g., "Email is required") | Highlight form fields |

**Implementation Pattern**:
```typescript
// lib/error-handler.ts
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public userMessage?: string
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export function handleAuthError(error: unknown): string {
  if (error instanceof AuthError) {
    return error.userMessage || 'Authentication failed'
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.'
  }

  return 'Something went wrong. Please try again.'
}
```

**Component Usage**:
```typescript
// components/auth/SignInForm.tsx
const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: FormEvent) => {
  try {
    await auth.signIn(email, password)
    router.push('/tasks')
  } catch (err) {
    setError(handleAuthError(err))
  }
}

return (
  <form onSubmit={handleSubmit}>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {/* form fields */}
  </form>
)
```

**Best Practices Applied**:
- User-friendly error messages (no technical jargon)
- Don't leak sensitive information (e.g., "user exists" vs "user doesn't exist")
- Provide actionable guidance (retry, check connection)
- Consistent error handling across all auth flows
- Log detailed errors server-side for debugging

---

## Technology Stack Summary

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript 5.x
- **Authentication**: Better Auth with JWT plugin
- **HTTP Client**: Native fetch API with custom wrapper
- **State Management**: React hooks + Better Auth session
- **Styling**: TailwindCSS (assumed, to be confirmed)

### Backend (Coordination Required)
- **Framework**: FastAPI (Python)
- **JWT Verification**: PyJWT library
- **Database**: Neon PostgreSQL via SQLModel
- **ORM**: SQLModel with async support

### Shared Configuration
- **Secret**: BETTER_AUTH_SECRET (must be identical in both environments)
- **Token Algorithm**: HS256 (HMAC SHA-256)
- **Token Expiration**: 7 days
- **Token Claims**: user_id, email, iat, exp, iss

---

## Security Checklist

✅ JWT tokens stored in httpOnly cookies (XSS protection)
✅ Secure flag enabled for HTTPS-only transmission
✅ SameSite attribute set for CSRF protection
✅ Token signature verification on backend
✅ User ID validation on all protected endpoints
✅ Secrets stored in environment variables (not in code)
✅ CORS configured to allow only frontend origin
✅ Token expiration enforced (7 days)
✅ Clear error messages without sensitive information leakage
✅ HTTPS required in production

---

## Integration Points

### Frontend → Backend
1. **Signup**: POST /api/auth/signup → Create user, return JWT
2. **Signin**: POST /api/auth/signin → Verify credentials, return JWT
3. **Protected APIs**: All requests include Authorization: Bearer <token> header
4. **Token Verification**: Backend validates signature and extracts user_id

### Backend Requirements
- Implement JWT verification middleware
- Extract user_id from validated token
- Filter all database queries by user_id
- Return 401 for invalid/expired tokens
- Return 403 for user_id mismatches

---

## Open Questions (Resolved)

All research questions have been resolved. No blocking issues identified.

---

## Recommendations

1. **Start with MVP**: Implement basic auth without refresh tokens
2. **Monitor token expiration**: Track user complaints about re-authentication frequency
3. **Add refresh tokens later**: Only if 7-day expiration causes UX issues
4. **Implement rate limiting**: Protect signin endpoint from brute force attacks (backend)
5. **Add logging**: Track authentication failures for security monitoring
6. **Consider 2FA**: Future enhancement for high-security requirements

---

## Next Steps

1. ✅ Research completed
2. ⏳ Create data-model.md (Phase 1)
3. ⏳ Create API contracts (Phase 1)
4. ⏳ Create quickstart.md (Phase 1)
5. ⏳ Generate tasks.md (/sp.tasks command)
6. ⏳ Implement using specialized agents

---

**Research Status**: ✅ COMPLETE
**Blockers**: None
**Ready for Phase 1**: Yes
