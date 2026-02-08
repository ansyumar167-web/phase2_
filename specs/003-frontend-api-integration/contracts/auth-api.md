# API Contract: Authentication Endpoints

**Base URL**: `http://localhost:8001` (development) / `${NEXT_PUBLIC_API_URL}` (production)
**Authentication**: JWT token in httpOnly cookie (`auth-token`)

## Endpoints

### POST /api/auth/signup

Register a new user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Request Schema**:
- `email` (string, required): Valid email address, max 255 characters
- `password` (string, required): Min 8 characters, must contain uppercase, lowercase, and number

**Response** (201 Created):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-11T10:30:00Z",
    "updated_at": "2026-01-11T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Headers**:
```
Set-Cookie: auth-token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

**Error Responses**:

**409 Conflict** - Email already exists:
```json
{
  "detail": "Email already exists"
}
```

**400 Bad Request** - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "Password must contain at least one uppercase letter",
      "type": "value_error"
    }
  ]
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
```

---

### POST /api/auth/signin

Sign in to existing user account.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Request Schema**:
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Response** (200 OK):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-11T10:30:00Z",
    "updated_at": "2026-01-11T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Headers**:
```
Set-Cookie: auth-token=<jwt_token>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800
```

**Error Responses**:

**401 Unauthorized** - Invalid credentials:
```json
{
  "detail": "Invalid email or password"
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
```

---

### POST /api/auth/signout

Sign out current user by clearing authentication cookie.

**Request**: No body required

**Response** (200 OK):
```json
{
  "message": "Signed out successfully"
}
```

**Response Headers**:
```
Set-Cookie: auth-token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/signout`, {
  method: 'POST',
  credentials: 'include'
});
```

---

### GET /api/auth/me

Get current authenticated user's information.

**Authentication**: Required (JWT token in cookie)

**Request**: No body required

**Response** (200 OK):
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T10:30:00Z"
}
```

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found** - User not found:
```json
{
  "detail": "User not found"
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
  credentials: 'include'
});
```

---

## Security Notes

1. **httpOnly Cookies**: JWT tokens are stored in httpOnly cookies to prevent XSS attacks
2. **Secure Flag**: Cookies use Secure flag (HTTPS only in production)
3. **SameSite**: Cookies use SameSite=Lax to prevent CSRF attacks
4. **Token Expiration**: Tokens expire after 7 days (604800 seconds)
5. **Generic Error Messages**: Authentication errors use generic messages to prevent user enumeration
6. **Password Hashing**: Passwords are hashed with bcrypt (cost factor 12) on the backend

## CORS Configuration

Backend must allow credentials from frontend origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Frontend must include credentials in all requests:

```typescript
fetch(url, {
  credentials: 'include'  // Required for httpOnly cookies
})
```
