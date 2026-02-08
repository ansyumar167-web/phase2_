# Data Model: Frontend Application & API Integration

**Feature**: 003-frontend-api-integration
**Date**: 2026-01-11
**Purpose**: Define TypeScript types and interfaces for frontend data structures

## Overview

The frontend data model mirrors the backend database schema but uses TypeScript types instead of SQLModel classes. All types are derived from the backend API responses to ensure consistency.

## Core Entities

### User

Represents an authenticated user account.

```typescript
// types/user.ts

export interface User {
  id: number;
  email: string;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
}

export interface AuthResponse {
  user: User;
  token: string;  // JWT token (also set in httpOnly cookie)
}
```

**Source**: Backend `User` model (backend/src/models/user.py)

**Validation Rules**:
- `email`: Valid email format (validated by backend)
- `password`: Not included in response (security)
- `created_at`, `updated_at`: ISO 8601 format from backend

**Relationships**:
- One user has many tasks (one-to-many)

**State Transitions**: None (user data is relatively static)

---

### Task

Represents a todo item owned by a user.

```typescript
// types/task.ts

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: number;
  created_at: string;  // ISO 8601 datetime string
  updated_at: string;  // ISO 8601 datetime string
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
```

**Source**: Backend `Task` model (backend/src/models/task.py)

**Validation Rules**:
- `title`: Required, max 200 characters (FR-008)
- `description`: Optional, max 1000 characters (FR-008)
- `completed`: Boolean, defaults to false
- `user_id`: Set by backend from JWT token (not provided by client)

**Relationships**:
- Each task belongs to one user (many-to-one)

**State Transitions**:
```
[Created] → completed: false
    ↓
[Toggle] → completed: true
    ↓
[Toggle] → completed: false
    ↓
[Deleted] → removed from database
```

---

### Session

Represents an authenticated session (stateless JWT).

```typescript
// types/session.ts

export interface Session {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends Session {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

**Source**: Frontend-only concept (JWT token stored in httpOnly cookie)

**Validation Rules**:
- JWT token validated by backend on every request
- Token expiration: 7 days (set by backend)
- No client-side token storage (httpOnly cookie only)

**State Transitions**:
```
[Unauthenticated] → isAuthenticated: false, user: null
    ↓ signIn/signUp
[Authenticated] → isAuthenticated: true, user: User
    ↓ signOut
[Unauthenticated] → isAuthenticated: false, user: null
    ↓ token expiration
[Session Expired] → redirect to /signin
```

---

## Form State Models

### SignUp Form

```typescript
// components/auth/SignUpForm.tsx (internal state)

interface SignUpFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}
```

**Validation Rules** (client-side, matches backend):
- `email`: Valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- `confirmPassword`: Must match password

---

### SignIn Form

```typescript
// components/auth/SignInForm.tsx (internal state)

interface SignInFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  fieldErrors: {
    email?: string;
    password?: string;
  };
}
```

**Validation Rules** (client-side):
- `email`: Valid email format
- `password`: Required (no strength validation on signin)

---

### Create Task Form

```typescript
// components/tasks/CreateTaskForm.tsx (internal state)

interface CreateTaskFormState {
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  fieldErrors: {
    title?: string;
    description?: string;
  };
}
```

**Validation Rules** (client-side, matches backend):
- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters

---

### Edit Task Form

```typescript
// components/tasks/EditTaskForm.tsx (internal state)

interface EditTaskFormState {
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  fieldErrors: {
    title?: string;
    description?: string;
  };
}
```

**Validation Rules** (same as Create Task Form):
- `title`: Required, max 200 characters
- `description`: Optional, max 1000 characters

---

## Error Models

### API Error

```typescript
// types/error.ts

export interface ApiError {
  status: number;
  detail: string;
  errors?: Record<string, string[]>;  // Field-level validation errors
}

export interface ErrorInfo {
  message: string;
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  shouldRetry: boolean;
  fieldErrors?: Record<string, string>;
  redirect?: string;
}
```

**Error Categories**:
- `network`: Failed to fetch (no internet connection)
- `auth`: 401 Unauthorized (session expired)
- `validation`: 400 Bad Request (invalid input)
- `server`: 500+ Server Error (backend issue)
- `unknown`: Unexpected error

---

## UI State Models

### Loading State

```typescript
// Used across all components with async operations

interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}
```

**Usage**: Disable buttons, show spinners during API calls

---

### Optimistic Update State

```typescript
// Used in TaskItem for completion toggle

interface OptimisticState<T> {
  current: T;
  previous: T | null;
  isPending: boolean;
}
```

**Usage**: Track optimistic updates and revert on failure

---

## Data Flow

### Authentication Flow

```
User Input (email, password)
    ↓
SignInForm/SignUpForm (validation)
    ↓
API Client (POST /api/auth/signin or /api/auth/signup)
    ↓
Backend (validate, create JWT, set cookie)
    ↓
AuthResponse (user + token)
    ↓
AuthContext (update session state)
    ↓
Redirect to /tasks
```

### Task CRUD Flow

```
User Action (create/update/delete)
    ↓
Task Component (validation, optimistic update)
    ↓
API Client (POST/PATCH/DELETE /api/tasks/*)
    ↓
Backend (validate JWT, filter by user_id, execute)
    ↓
Task Response
    ↓
Component State (confirm or revert)
    ↓
UI Update (reflect final state)
```

---

## Type Safety Guarantees

### Compile-Time Checks
- All API responses typed with TypeScript interfaces
- Form inputs validated against type constraints
- Component props strictly typed

### Runtime Validation
- Backend validates all inputs (Pydantic models)
- Frontend validates before submission (reduce API calls)
- API client transforms errors to ErrorInfo type

### Null Safety
- `description` explicitly typed as `string | null`
- Optional fields use `?` syntax
- Strict null checks enabled in tsconfig.json

---

## Summary

**Total Entities**: 3 core (User, Task, Session) + 4 form states + 2 error models + 2 UI state models

**Type Files to Create**:
- `types/user.ts` - User and AuthResponse
- `types/task.ts` - Task, CreateTaskRequest, UpdateTaskRequest
- `types/session.ts` - Session and AuthContextValue
- `types/error.ts` - ApiError and ErrorInfo

**Validation Strategy**: Client-side validation matches backend rules exactly (defense in depth)

**State Management**: React hooks (useState, useContext) - no Redux/MobX needed

**Data Consistency**: Optimistic updates with automatic reversion on API failure
