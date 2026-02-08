# Data Model: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-10
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data entities, relationships, and database schema for the Todo Full-Stack Web Application. The model enforces strict user isolation with foreign key relationships and appropriate indexes for query performance.

---

## Entity Definitions

### User Entity

Represents a registered user account with authentication credentials.

**Attributes:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | String(255) | UNIQUE, NOT NULL | User's email address (used for authentication) |
| password_hash | String(255) | NOT NULL | Hashed password (bcrypt/argon2) |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last modification timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email` (for fast lookup during authentication)

**Validation Rules:**
- Email must be valid format (validated by Better Auth)
- Password must be at least 8 characters (validated before hashing)
- Email is case-insensitive (normalize to lowercase before storage)

**Relationships:**
- One User has many Tasks (one-to-many)

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Security Considerations:**
- Password is NEVER stored in plain text
- Password hash uses bcrypt or argon2 with appropriate cost factor
- Email is unique constraint enforced at database level
- No sensitive data beyond authentication credentials

---

### Task Entity

Represents a single todo item owned by a user.

**Attributes:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique task identifier |
| user_id | Integer | FOREIGN KEY (users.id), NOT NULL, INDEX | Owner of the task |
| title | String(200) | NOT NULL | Task title/summary |
| description | Text | NULLABLE | Optional detailed description |
| is_completed | Boolean | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | DateTime | NOT NULL, DEFAULT NOW() | Task creation timestamp |
| updated_at | DateTime | NOT NULL, DEFAULT NOW(), ON UPDATE NOW() | Last modification timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `user_id` (critical for query performance - all queries filter by user_id)
- COMPOSITE INDEX on `(user_id, created_at)` (for ordered task lists)

**Validation Rules:**
- Title must not be empty (min length: 1, max length: 200)
- Description max length: 2000 characters
- user_id must reference existing user (foreign key constraint)
- is_completed defaults to false for new tasks

**Relationships:**
- Many Tasks belong to one User (many-to-one)

**SQLModel Definition:**
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Security Considerations:**
- user_id is ALWAYS set from authenticated JWT token (never from client input)
- All queries MUST include `WHERE user_id = {authenticated_user_id}` filter
- Foreign key constraint prevents orphaned tasks
- No cross-user references possible

---

## Entity Relationships

```
User (1) ----< (many) Task

- One User can have zero or many Tasks
- Each Task belongs to exactly one User
- Relationship enforced by foreign key: Task.user_id → User.id
- Cascade behavior: ON DELETE CASCADE (if user deleted, all their tasks deleted)
```

**Relationship Diagram:**
```
┌─────────────────┐
│     User        │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────┐
│     Task        │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │◄── CRITICAL: All queries filter by this
│ title           │
│ description     │
│ is_completed    │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

---

## Database Schema (SQL)

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
```

### Tasks Table

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

---

## Query Patterns

### User Isolation Pattern (CRITICAL)

**Every task query MUST follow this pattern:**

```python
# ✅ CORRECT: Filter by authenticated user_id
async def get_user_tasks(user_id: int, session: AsyncSession):
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()

# ❌ INCORRECT: No user_id filter (security violation)
async def get_all_tasks(session: AsyncSession):
    statement = select(Task)  # DANGER: Returns all users' tasks
    result = await session.execute(statement)
    return result.scalars().all()
```

### Common Query Examples

**Get all tasks for authenticated user:**
```python
SELECT * FROM tasks
WHERE user_id = {authenticated_user_id}
ORDER BY created_at DESC;
```

**Create task for authenticated user:**
```python
INSERT INTO tasks (user_id, title, description, is_completed)
VALUES ({authenticated_user_id}, 'Task title', 'Description', FALSE);
```

**Update task (with ownership verification):**
```python
UPDATE tasks
SET title = 'New title', updated_at = NOW()
WHERE id = {task_id} AND user_id = {authenticated_user_id};
-- Returns 0 rows if task doesn't exist or belongs to different user
```

**Delete task (with ownership verification):**
```python
DELETE FROM tasks
WHERE id = {task_id} AND user_id = {authenticated_user_id};
-- Returns 0 rows if task doesn't exist or belongs to different user
```

**Toggle completion status:**
```python
UPDATE tasks
SET is_completed = NOT is_completed, updated_at = NOW()
WHERE id = {task_id} AND user_id = {authenticated_user_id};
```

---

## Migration Strategy

### Initial Migration (Alembic)

**Migration file: `alembic/versions/001_create_users_and_tasks.py`**

```python
"""Create users and tasks tables

Revision ID: 001
Revises:
Create Date: 2026-01-10
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_created', 'tasks', ['user_id', 'created_at'])

def downgrade():
    op.drop_table('tasks')
    op.drop_table('users')
```

---

## Performance Considerations

### Index Strategy

1. **users.email (UNIQUE INDEX)**: Fast authentication lookups
2. **tasks.user_id (INDEX)**: Critical for all task queries (every query filters by user_id)
3. **tasks.(user_id, created_at) (COMPOSITE INDEX)**: Optimizes ordered task lists

### Query Optimization

- All task queries use indexed user_id filter
- Composite index supports `ORDER BY created_at` without additional sort
- Foreign key constraint enables efficient cascade deletes
- Timestamps use database default (reduces application overhead)

### Scalability

- Current design supports 1000s of users with 10000s of tasks per user
- Indexes ensure O(log n) query performance
- No N+1 query issues (single query per operation)
- Connection pooling handles concurrent requests

---

## Data Integrity Constraints

### Database-Level Constraints

1. **Primary Keys**: Ensure unique identifiers for all entities
2. **Foreign Keys**: Enforce referential integrity (tasks must have valid user_id)
3. **Unique Constraints**: Prevent duplicate emails
4. **NOT NULL Constraints**: Ensure required fields are always present
5. **Default Values**: Provide sensible defaults (is_completed = false)

### Application-Level Validation

1. **Email Format**: Validated by Better Auth before user creation
2. **Password Strength**: Minimum 8 characters enforced before hashing
3. **Title Length**: 1-200 characters enforced by Pydantic
4. **Description Length**: 0-2000 characters enforced by Pydantic
5. **User ID Extraction**: Always from JWT token, never from client input

---

## Security Guarantees

### User Isolation

✅ **Guaranteed by design:**
- Every task has user_id foreign key (database enforced)
- All queries filter by authenticated user_id (application enforced)
- No API endpoint accepts user_id from client (JWT only)
- Foreign key constraint prevents invalid user_id values

### Authorization Checks

✅ **Enforced at multiple layers:**
1. **JWT Verification**: Middleware extracts user_id from token
2. **Query Filtering**: All SELECT queries include user_id filter
3. **Update/Delete Verification**: WHERE clause includes user_id (returns 0 rows if unauthorized)
4. **Database Constraints**: Foreign key prevents orphaned tasks

### Attack Prevention

- **SQL Injection**: Prevented by SQLModel parameterized queries
- **Cross-User Access**: Prevented by mandatory user_id filtering
- **Token Forgery**: Prevented by JWT signature verification
- **Privilege Escalation**: Prevented by user_id extraction from token only

---

## Testing Strategy

### Data Model Tests

1. **Entity Creation**: Verify User and Task models can be created
2. **Relationship Integrity**: Verify foreign key constraints work
3. **Validation Rules**: Verify field constraints are enforced
4. **Index Performance**: Verify queries use indexes (EXPLAIN ANALYZE)

### Isolation Tests

1. **User A creates task**: Verify task.user_id = A
2. **User B queries tasks**: Verify User B sees 0 tasks (not User A's task)
3. **User B attempts to update User A's task**: Verify 0 rows affected
4. **User B attempts to delete User A's task**: Verify 0 rows affected

### Edge Cases

1. **Empty title**: Verify validation error
2. **Extremely long title**: Verify truncation or error
3. **Null user_id**: Verify foreign key constraint violation
4. **Invalid user_id**: Verify foreign key constraint violation
5. **Concurrent updates**: Verify updated_at timestamp changes

---

## Summary

This data model provides:
- ✅ Strict user isolation via foreign keys and query filtering
- ✅ Efficient queries via strategic indexes
- ✅ Data integrity via database constraints
- ✅ Security via JWT-based user_id extraction
- ✅ Scalability via optimized schema design

**Next Steps:**
1. Implement SQLModel models in backend/src/models/
2. Create Alembic migration
3. Apply migration to Neon PostgreSQL database
4. Write data model tests
