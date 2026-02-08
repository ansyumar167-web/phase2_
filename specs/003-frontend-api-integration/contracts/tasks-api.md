# API Contract: Task Management Endpoints

**Base URL**: `http://localhost:8001` (development) / `${NEXT_PUBLIC_API_URL}` (production)
**Authentication**: Required - JWT token in httpOnly cookie (`auth-token`)

## Endpoints

### GET /api/tasks

Get all tasks for the authenticated user.

**Authentication**: Required

**Request**: No body required

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the API",
    "completed": false,
    "user_id": 1,
    "created_at": "2026-01-11T10:30:00Z",
    "updated_at": "2026-01-11T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Review pull requests",
    "description": null,
    "completed": true,
    "user_id": 1,
    "created_at": "2026-01-11T09:15:00Z",
    "updated_at": "2026-01-11T11:45:00Z"
  }
]
```

**Response Schema**:
- Array of Task objects
- Empty array `[]` if user has no tasks
- Tasks are filtered by authenticated user's ID (backend enforces this)

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Not authenticated"
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/tasks`, {
  credentials: 'include'
});
const tasks: Task[] = await response.json();
```

---

### POST /api/tasks

Create a new task for the authenticated user.

**Authentication**: Required

**Request**:
```json
{
  "title": "New task title",
  "description": "Optional task description"
}
```

**Request Schema**:
- `title` (string, required): Max 200 characters
- `description` (string, optional): Max 1000 characters, can be null or omitted

**Response** (201 Created):
```json
{
  "id": 3,
  "title": "New task title",
  "description": "Optional task description",
  "completed": false,
  "user_id": 1,
  "created_at": "2026-01-11T12:00:00Z",
  "updated_at": "2026-01-11T12:00:00Z"
}
```

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Not authenticated"
}
```

**400 Bad Request** - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**422 Unprocessable Entity** - Title too long:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 200 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/tasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ title, description })
});
const task: Task = await response.json();
```

---

### GET /api/tasks/{task_id}

Get a specific task by ID (must belong to authenticated user).

**Authentication**: Required

**Path Parameters**:
- `task_id` (integer, required): Task ID

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the API",
  "completed": false,
  "user_id": 1,
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

**404 Not Found** - Task not found or doesn't belong to user:
```json
{
  "detail": "Task not found"
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
  credentials: 'include'
});
const task: Task = await response.json();
```

---

### PATCH /api/tasks/{task_id}

Update a specific task (must belong to authenticated user).

**Authentication**: Required

**Path Parameters**:
- `task_id` (integer, required): Task ID

**Request** (all fields optional):
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true
}
```

**Request Schema**:
- `title` (string, optional): Max 200 characters
- `description` (string, optional): Max 1000 characters, can be null
- `completed` (boolean, optional): Task completion status

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true,
  "user_id": 1,
  "created_at": "2026-01-11T10:30:00Z",
  "updated_at": "2026-01-11T12:15:00Z"
}
```

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found** - Task not found or doesn't belong to user:
```json
{
  "detail": "Task not found"
}
```

**400 Bad Request** - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at most 200 characters",
      "type": "value_error.any_str.max_length"
    }
  ]
}
```

**Frontend Usage**:
```typescript
// Toggle completion
const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ completed: !task.completed })
});

// Update title and description
const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ title, description })
});
```

---

### DELETE /api/tasks/{task_id}

Delete a specific task (must belong to authenticated user).

**Authentication**: Required

**Path Parameters**:
- `task_id` (integer, required): Task ID

**Request**: No body required

**Response** (200 OK):
```json
{
  "message": "Task deleted successfully"
}
```

**Error Responses**:

**401 Unauthorized** - Missing or invalid token:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found** - Task not found or doesn't belong to user:
```json
{
  "detail": "Task not found"
}
```

**Frontend Usage**:
```typescript
const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
  method: 'DELETE',
  credentials: 'include'
});
```

---

## Security Notes

1. **User Isolation**: All endpoints automatically filter tasks by authenticated user's ID
2. **Authorization**: Backend extracts user_id from JWT token (not from request body)
3. **Cross-User Access Prevention**: Attempting to access another user's task returns 404 (not 403 to prevent information leakage)
4. **Token Validation**: Every request validates JWT signature and expiration
5. **SQL Injection Prevention**: SQLModel uses parameterized queries automatically

## Data Isolation

Backend enforces user isolation with this pattern:

```python
# Get tasks for authenticated user only
statement = select(Task).where(Task.user_id == user_id)
tasks = session.exec(statement).all()

# Get specific task (must belong to user)
statement = select(Task).where(
    Task.id == task_id,
    Task.user_id == user_id  # Critical: prevents cross-user access
)
task = session.exec(statement).first()
```

Frontend should NEVER send user_id in requests - backend extracts it from JWT token.

## Error Handling

Frontend should handle these error scenarios:

1. **401 Unauthorized**: Redirect to /signin (session expired)
2. **404 Not Found**: Show "Task not found" message
3. **400/422 Validation**: Display field-level errors
4. **500 Server Error**: Show "Something went wrong" with retry button
5. **Network Error**: Show "Unable to connect" with retry button

## Rate Limiting

Backend implements rate limiting (configured in middleware):
- 100 requests per minute per IP address
- 429 Too Many Requests response if exceeded

Frontend should implement exponential backoff for retries.
