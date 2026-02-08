# Data Model: Frontend Application & API Integration

**Feature**: Frontend Application & API Integration
**Branch**: 002-frontend-api-integration
**Date**: 2026-01-10
**Status**: Completed

## Overview

This document defines the data entities, their relationships, validation rules, and state transitions for the Todo application frontend. The data model is designed to support multi-user task management with strict user isolation enforced by JWT authentication.

## Entity Definitions

### 1. User

**Description**: Represents an authenticated user account in the system. Users own tasks and can only access their own data.

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | integer | Yes | Primary key, auto-increment | Unique user identifier |
| `email` | string | Yes | Unique, valid email format, max 255 chars | User's email address (used for signin) |
| `password_hash` | string | Yes | Min 60 chars (bcrypt hash) | Hashed password (never plain text) |
| `created_at` | datetime | Yes | Auto-generated on creation | Account creation timestamp |
| `updated_at` | datetime | Yes | Auto-updated on modification | Last modification timestamp |

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Email must be unique across all users
- Password must be at least 8 characters before hashing
- Password must contain at least one uppercase, one lowercase, one number
- created_at and updated_at are system-managed (not user-editable)

**Relationships**:
- One user has many tasks (one-to-many)
- User deletion cascades to all owned tasks

**Security Constraints**:
- Password hash never exposed in API responses
- User can only access their own user record
- Email uniqueness prevents duplicate accounts

**Frontend Representation** (TypeScript):
```typescript
interface User {
  id: number
  email: string
  // password_hash is NEVER included in frontend types
  created_at: string  // ISO 8601 format
  updated_at: string  // ISO 8601 format
}

// For authentication responses
interface AuthResponse {
  user: User
  token: string  // JWT token
}
```

---

### 2. Task

**Description**: Represents a todo item owned by a specific user. Tasks are the core entity for task management functionality.

**Attributes**:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | integer | Yes | Primary key, auto-increment | Unique task identifier |
| `user_id` | integer | Yes | Foreign key to User.id, indexed | Owner of the task |
| `title` | string | Yes | Min 1 char, max 200 chars | Task title/summary |
| `description` | string | No | Max 1000 chars, nullable | Optional detailed description |
| `is_completed` | boolean | Yes | Default: false | Completion status |
| `created_at` | datetime | Yes | Auto-generated on creation | Task creation timestamp |
| `updated_at` | datetime | Yes | Auto-updated on modification | Last modification timestamp |

**Validation Rules**:
- Title cannot be empty or whitespace-only
- Title max length: 200 characters
- Description max length: 1000 characters (if provided)
- is_completed must be boolean (true/false)
- user_id must reference an existing user
- created_at and updated_at are system-managed

**Relationships**:
- Many tasks belong to one user (many-to-one)
- Task deletion does not affect user

**Security Constraints**:
- Tasks are always filtered by authenticated user_id
- Users can only view/modify their own tasks
- user_id in request body is ignored (extracted from JWT)
- Cross-user task access returns 403 Forbidden

**Frontend Representation** (TypeScript):
```typescript
interface Task {
  id: number
  user_id: number  // Always matches authenticated user
  title: string
  description: string | null
  is_completed: boolean
  created_at: string  // ISO 8601 format
  updated_at: string  // ISO 8601 format
}

// For task creation (user_id not included, extracted from JWT)
interface CreateTaskRequest {
  title: string
  description?: string
}

// For task updates
interface UpdateTaskRequest {
  title?: string
  description?: string
  is_completed?: boolean
}
```

---

### 3. Session (Implicit)

**Description**: Represents an authenticated user session. Not stored in database (stateless JWT), but conceptually important for understanding authentication flow.

**Attributes** (JWT Claims):

| Claim | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | integer | Yes | Authenticated user's ID |
| `email` | string | Yes | Authenticated user's email |
| `iat` | integer | Yes | Issued at timestamp (Unix epoch) |
| `exp` | integer | Yes | Expiration timestamp (Unix epoch) |
| `iss` | string | Yes | Issuer (Better Auth) |

**Lifecycle**:
1. Created on successful signin/signup
2. Stored in httpOnly cookie
3. Included in all API requests via Authorization header
4. Verified by backend on each request
5. Expires after 7 days (configurable)
6. Destroyed on signout (cookie cleared)

**Frontend Representation** (TypeScript):
```typescript
interface Session {
  user: User
  token: string  // JWT token (opaque to frontend)
  expiresAt: string  // ISO 8601 format
}
```

---

## Entity Relationships

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N (one user has many tasks)
         │
         ▼
┌─────────────────┐
│      Task       │
│─────────────────│
│ id (PK)         │
│ user_id (FK)    │◄── Foreign key to User.id
│ title           │
│ description     │
│ is_completed    │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

**Relationship Rules**:
- One user can have zero or many tasks
- Each task belongs to exactly one user
- Deleting a user cascades to delete all their tasks
- Deleting a task does not affect the user

---

## State Transitions

### Task Completion State

Tasks have a simple two-state lifecycle:

```
┌──────────────┐
│  Incomplete  │ (is_completed = false)
│  (default)   │
└──────┬───────┘
       │
       │ User marks complete
       ▼
┌──────────────┐
│   Completed  │ (is_completed = true)
│              │
└──────┬───────┘
       │
       │ User marks incomplete
       ▼
┌──────────────┐
│  Incomplete  │ (is_completed = false)
└──────────────┘
```

**State Transition Rules**:
- Tasks are created in incomplete state by default
- Users can toggle between complete/incomplete any number of times
- Completion state is independent of other task properties
- State changes are immediately persisted to database

### User Authentication State

Users have a session-based authentication state:

```
┌──────────────┐
│ Unauthenticated │
└──────┬───────┘
       │
       │ Signup or Signin
       ▼
┌──────────────┐
│ Authenticated │ (has valid JWT token)
└──────┬───────┘
       │
       │ Signout or Token Expiration
       ▼
┌──────────────┐
│ Unauthenticated │
└──────────────┘
```

**State Transition Rules**:
- New users start unauthenticated
- Successful signup/signin transitions to authenticated
- Signout or token expiration transitions to unauthenticated
- Authenticated state required for all protected operations

---

## Data Validation

### Frontend Validation (Pre-submission)

**User Registration**:
- Email: Required, valid format, max 255 chars
- Password: Required, min 8 chars, complexity requirements
- Confirm password: Must match password

**User Signin**:
- Email: Required, valid format
- Password: Required

**Task Creation**:
- Title: Required, min 1 char, max 200 chars
- Description: Optional, max 1000 chars

**Task Update**:
- Title: If provided, min 1 char, max 200 chars
- Description: If provided, max 1000 chars
- is_completed: If provided, must be boolean

### Backend Validation (Enforcement)

All frontend validations are re-enforced on backend:
- Email uniqueness checked against database
- Password hash strength verified
- user_id extracted from JWT (not trusted from request body)
- Task ownership verified (user_id matches JWT)
- SQL injection prevented via parameterized queries (SQLModel)

---

## Database Indexes

**Performance Optimization**:

```sql
-- User table
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Task table
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at);
```

**Index Rationale**:
- `idx_users_email`: Fast user lookup during signin (unique constraint)
- `idx_tasks_user_id`: Fast task filtering by user
- `idx_tasks_user_created`: Optimized for "get user's tasks ordered by creation date" query

---

## Data Access Patterns

### Common Queries

**Get all tasks for authenticated user**:
```sql
SELECT * FROM tasks
WHERE user_id = :authenticated_user_id
ORDER BY created_at DESC;
```

**Create task for authenticated user**:
```sql
INSERT INTO tasks (user_id, title, description, is_completed, created_at, updated_at)
VALUES (:authenticated_user_id, :title, :description, false, NOW(), NOW());
```

**Update task (with ownership check)**:
```sql
UPDATE tasks
SET title = :title, description = :description, is_completed = :is_completed, updated_at = NOW()
WHERE id = :task_id AND user_id = :authenticated_user_id;
```

**Delete task (with ownership check)**:
```sql
DELETE FROM tasks
WHERE id = :task_id AND user_id = :authenticated_user_id;
```

**Key Pattern**: All task queries include `user_id = :authenticated_user_id` filter to enforce data isolation.

---

## Frontend State Management

### Local State (Component-level)

**Form State**:
- Signin form: email, password, error, loading
- Signup form: email, password, confirmPassword, error, loading
- Create task form: title, description, error, loading
- Edit task form: title, description, error, loading

**UI State**:
- Task list: tasks[], loading, error
- Task item: isEditing, isDeleting

### Global State (Application-level)

**Authentication State** (via Better Auth):
- session: Session | null
- user: User | null
- isAuthenticated: boolean
- isLoading: boolean

**No Global Task State**: Tasks are fetched per-page, not stored globally (simpler for MVP)

---

## Data Flow

### Authentication Flow

```
User Input (email, password)
    ↓
Frontend Validation
    ↓
API Request (POST /api/auth/signin)
    ↓
Backend Validation
    ↓
Database Query (verify credentials)
    ↓
JWT Generation (with user_id, email)
    ↓
Response (user, token)
    ↓
Store in httpOnly Cookie
    ↓
Update Frontend State (authenticated)
```

### Task Creation Flow

```
User Input (title, description)
    ↓
Frontend Validation
    ↓
Extract JWT from Cookie
    ↓
API Request (POST /api/tasks, Authorization: Bearer <token>)
    ↓
Backend JWT Verification
    ↓
Extract user_id from JWT
    ↓
Database Insert (with user_id from JWT)
    ↓
Response (created task)
    ↓
Update Frontend State (add to task list)
```

### Task List Fetch Flow

```
Page Load
    ↓
Extract JWT from Cookie
    ↓
API Request (GET /api/tasks, Authorization: Bearer <token>)
    ↓
Backend JWT Verification
    ↓
Extract user_id from JWT
    ↓
Database Query (WHERE user_id = :user_id)
    ↓
Response (tasks array)
    ↓
Render Task List
```

---

## Security Considerations

### Data Isolation
- All task queries filtered by authenticated user_id
- user_id never accepted from request body (extracted from JWT)
- Cross-user access attempts return 403 Forbidden

### Sensitive Data Protection
- Password hashes never exposed in API responses
- JWT tokens stored in httpOnly cookies (not accessible via JavaScript)
- Tokens transmitted via HTTPS in production

### Input Validation
- All user input validated on frontend and backend
- SQL injection prevented via ORM (SQLModel)
- XSS prevented via React's automatic escaping

---

## TypeScript Type Definitions

**Complete type definitions for frontend**:

```typescript
// types.ts

// User entity
export interface User {
  id: number
  email: string
  created_at: string
  updated_at: string
}

// Task entity
export interface Task {
  id: number
  user_id: number
  title: string
  description: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

// Authentication
export interface AuthResponse {
  user: User
  token: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

// API Request/Response types
export interface SignupRequest {
  email: string
  password: string
}

export interface SigninRequest {
  email: string
  password: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  is_completed?: boolean
}

// Error types
export interface ApiError {
  message: string
  statusCode: number
  details?: Record<string, string[]>
}
```

---

## Summary

**Entities**: 2 primary (User, Task) + 1 implicit (Session)
**Relationships**: 1:N (User → Tasks)
**Security**: JWT-based authentication with user_id filtering
**Validation**: Frontend + Backend dual validation
**State Management**: Component-level + Better Auth session
**Performance**: Indexed queries for fast user-specific data access

**Data Model Status**: ✅ COMPLETE
**Ready for API Contracts**: Yes
