# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `001-todo-web-app` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-web-app/spec.md`

## Summary

Transform a console-based Todo application into a secure, multi-user web application with JWT-based authentication, persistent storage, and strict user data isolation. The system enables users to register, authenticate, and manage their personal task lists through a responsive web interface. The implementation prioritizes security-first architecture with JWT token verification on all protected endpoints and database-level user isolation.

**Technical Approach**: Three-tier architecture with Next.js 16 frontend (App Router), Python FastAPI backend, and Neon PostgreSQL database. Better Auth handles user registration and JWT token issuance. Backend implements JWT verification middleware to extract and validate user identity on every request. All database queries are scoped to the authenticated user to ensure zero cross-user data leakage.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript/JavaScript (frontend with Next.js 16)
**Primary Dependencies**: FastAPI, SQLModel, Neon PostgreSQL driver, Better Auth, Next.js 16, React 18+
**Storage**: Neon Serverless PostgreSQL with connection pooling
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), Linux/Windows server for backend
**Project Type**: Web application (separate frontend and backend services)
**Performance Goals**: <2 second response time for all user operations, support 50+ concurrent users
**Constraints**: JWT token verification required on every protected request, all queries filtered by user_id, <200ms p95 latency for API endpoints
**Scale/Scope**: Single-tenant per user, estimated 100-1000 users, 10-10000 tasks per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅
- **Status**: PASS
- **Evidence**: Specification completed and validated before planning phase. This plan follows spec → plan → tasks → implementation workflow.
- **Next**: Tasks.md will be generated after plan approval, implementation will follow tasks.

### Principle II: Security-First Architecture ✅
- **Status**: PASS
- **Evidence**: JWT authentication is foundational (Phase 1). All API endpoints will implement JWT verification middleware before any feature endpoints are created. User isolation enforced at database query level.
- **Implementation**: JWT verification middleware created before task CRUD endpoints. All queries include `WHERE user_id = {authenticated_user_id}` filter.

### Principle III: Correctness Over Convenience ✅
- **Status**: PASS
- **Evidence**: All requirements from spec.md are explicitly addressed. No additional features beyond spec. Assumptions documented in spec.
- **Validation**: Each functional requirement (FR-001 through FR-025) maps to specific implementation tasks.

### Principle IV: Clear Separation of Concerns ✅
- **Status**: PASS
- **Evidence**: Frontend (Next.js) and Backend (FastAPI) are separate projects with defined API contract. Better Auth handles authentication, backend handles authorization. Database access only through backend.
- **Structure**: `frontend/` and `backend/` directories with independent dependencies and deployment.

### Principle V: Reproducibility & Traceability ✅
- **Status**: PASS
- **Evidence**: This plan documents all decisions. PHR will be created for this planning phase. ADRs will be created for significant architectural decisions (JWT structure, database schema, API design).
- **Artifacts**: plan.md, research.md, data-model.md, contracts/, quickstart.md, PHR

### Principle VI: Agent-Generated Code Only ✅
- **Status**: PASS
- **Evidence**: Implementation will use specialized agents: secure-auth-handler (authentication), fastapi-backend-architect (API), neon-db-manager (database), nextjs-ui-builder (frontend).
- **Workflow**: Each implementation task will specify which agent to use.

**Constitution Check Result**: ✅ ALL PRINCIPLES SATISFIED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-web-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-api.yaml    # Authentication endpoints (Better Auth)
│   └── tasks-api.yaml   # Task management endpoints (FastAPI)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLModel
│   │   └── task.py          # Task SQLModel
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py          # JWT verification middleware
│   ├── api/
│   │   ├── __init__.py
│   │   ├── tasks.py         # Task CRUD endpoints
│   │   └── health.py        # Health check endpoint
│   ├── database.py          # Database connection and session management
│   ├── config.py            # Environment variables and configuration
│   └── main.py              # FastAPI application entry point
├── tests/
│   ├── test_auth.py         # Authentication tests
│   ├── test_tasks.py        # Task endpoint tests
│   └── test_isolation.py    # User isolation tests
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variable template
└── README.md                # Backend setup instructions

frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Landing/redirect page
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx # Sign-in page
│   │   │   └── signup/
│   │   │       └── page.tsx # Sign-up page
│   │   └── dashboard/
│   │       └── page.tsx     # Task dashboard (protected)
│   ├── components/
│   │   ├── TaskList.tsx     # Task list component
│   │   ├── TaskItem.tsx     # Individual task component
│   │   ├── TaskForm.tsx     # Create/edit task form
│   │   └── AuthForm.tsx     # Reusable auth form
│   ├── lib/
│   │   ├── api.ts           # API client with JWT attachment
│   │   ├── auth.ts          # Better Auth client configuration
│   │   └── types.ts         # TypeScript types
│   └── middleware.ts        # Next.js middleware for route protection
├── public/
├── tests/
│   └── components/          # Component tests
├── package.json             # Node dependencies
├── .env.local.example       # Environment variable template
├── next.config.js           # Next.js configuration
└── README.md                # Frontend setup instructions

.env.example                 # Root environment variables (shared secret)
README.md                    # Project overview and setup
```

**Structure Decision**: Web application structure selected because the feature requires separate frontend (Next.js) and backend (FastAPI) services. This enables independent development, testing, and deployment of each layer. The backend/ directory contains the Python FastAPI application with SQLModel models and JWT middleware. The frontend/ directory contains the Next.js 16 application with App Router. Both services communicate via REST API with JWT authentication.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied by the planned architecture.

## Phase 0: Research & Technology Validation

### Research Objectives

1. **Better Auth JWT Integration**: Understand how Better Auth issues JWT tokens and what claims are included
2. **JWT Verification in FastAPI**: Research best practices for JWT verification middleware in FastAPI
3. **Neon PostgreSQL Connection**: Validate connection pooling and async support with SQLModel
4. **Next.js 16 App Router Authentication**: Research authentication patterns for App Router (Server Components vs Client Components)
5. **CORS Configuration**: Determine correct CORS settings for frontend-backend communication

### Research Tasks

**R1: Better Auth JWT Token Structure**
- **Question**: What claims does Better Auth include in JWT tokens? How is user ID encoded?
- **Method**: Review Better Auth documentation for JWT plugin configuration
- **Output**: Document JWT payload structure (user_id, email, exp, iat claims)
- **Decision Needed**: Confirm which claim contains user ID for backend verification

**R2: FastAPI JWT Verification Middleware**
- **Question**: What's the recommended pattern for JWT verification in FastAPI dependencies?
- **Method**: Research FastAPI security documentation and JWT libraries (python-jose, PyJWT)
- **Output**: Code pattern for JWT verification dependency that extracts user_id
- **Decision Needed**: Choose JWT library (python-jose vs PyJWT) and verification approach

**R3: Neon PostgreSQL with SQLModel**
- **Question**: How to configure async database connections with Neon and SQLModel?
- **Method**: Review Neon documentation for Python, SQLModel async patterns
- **Output**: Connection string format, session management pattern, migration strategy
- **Decision Needed**: Use Alembic for migrations or SQLModel's create_all()

**R4: Next.js 16 App Router Auth Patterns**
- **Question**: Where to store JWT tokens in Next.js App Router? How to protect routes?
- **Method**: Research Next.js 16 authentication patterns, Better Auth Next.js integration
- **Output**: Token storage strategy (httpOnly cookies vs localStorage), middleware pattern for route protection
- **Decision Needed**: Client-side vs server-side token storage and verification

**R5: CORS Configuration for Development and Production**
- **Question**: What CORS settings are needed for localhost development and production deployment?
- **Method**: Review FastAPI CORS middleware documentation
- **Output**: CORS configuration for allowed origins, methods, headers
- **Decision Needed**: Development vs production origin configuration

### Research Deliverable: research.md

Document all findings, decisions, and rationale in `specs/001-todo-web-app/research.md`.

## Phase 1: Design & Contracts

### Prerequisites
- research.md completed with all decisions documented

### Design Tasks

**D1: Data Model Design**
- **Input**: Key Entities from spec.md (User, Task)
- **Output**: `data-model.md` with complete entity definitions
- **Content**:
  - User entity: id (UUID/int), email (unique), password_hash, created_at, updated_at
  - Task entity: id (UUID/int), user_id (foreign key), title, description (nullable), is_completed (boolean), created_at, updated_at
  - Relationships: User has many Tasks (one-to-many)
  - Indexes: user_id on tasks table for query performance
  - Constraints: email uniqueness, task.user_id NOT NULL, title NOT NULL

**D2: API Contract Design**
- **Input**: Functional Requirements from spec.md (FR-001 through FR-025)
- **Output**: OpenAPI specifications in `contracts/` directory
- **Content**:
  - `auth-api.yaml`: Better Auth endpoints (POST /auth/signup, POST /auth/signin, POST /auth/signout)
  - `tasks-api.yaml`: Task CRUD endpoints
    - GET /api/tasks - List all user's tasks
    - POST /api/tasks - Create new task
    - GET /api/tasks/{id} - Get single task
    - PUT /api/tasks/{id} - Update task
    - DELETE /api/tasks/{id} - Delete task
    - PATCH /api/tasks/{id}/complete - Toggle completion status
  - All task endpoints require Authorization: Bearer {token} header
  - Error responses: 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Validation Error)

**D3: Quickstart Guide**
- **Input**: Project structure, research findings, data model, API contracts
- **Output**: `quickstart.md` with step-by-step setup instructions
- **Content**:
  - Prerequisites (Node.js, Python, Neon account)
  - Environment variable setup (.env configuration)
  - Backend setup (install dependencies, run migrations, start server)
  - Frontend setup (install dependencies, configure Better Auth, start dev server)
  - Verification steps (create account, create task, verify isolation)
  - Troubleshooting common issues

**D4: Environment Variables Documentation**
- **Input**: Research findings on configuration needs
- **Output**: `.env.example` files for backend, frontend, and root
- **Content**:
  - BETTER_AUTH_SECRET (shared between Better Auth and FastAPI)
  - DATABASE_URL (Neon PostgreSQL connection string)
  - NEXT_PUBLIC_API_URL (backend API base URL)
  - NEXTAUTH_URL (Better Auth configuration)
  - Environment-specific values (development vs production)

### Design Deliverables

1. `specs/001-todo-web-app/data-model.md` - Complete entity definitions with relationships
2. `specs/001-todo-web-app/contracts/auth-api.yaml` - Authentication API specification
3. `specs/001-todo-web-app/contracts/tasks-api.yaml` - Task management API specification
4. `specs/001-todo-web-app/quickstart.md` - Setup and verification guide
5. `.env.example` files - Environment variable templates

### Agent Context Update

After Phase 1 completion, run:
```bash
powershell.exe -ExecutionPolicy Bypass -File ".specify/scripts/powershell/update-agent-context.ps1" -AgentType claude
```

This updates the agent context file with technology stack information from this plan, ensuring future agents have proper context.

## Phase 2: Task Generation (Separate Command)

**Note**: Phase 2 is executed via `/sp.tasks` command, NOT by `/sp.plan`.

The `/sp.tasks` command will:
1. Read this plan.md, spec.md, data-model.md, and contracts/
2. Generate tasks.md with implementation tasks organized by user story
3. Include proper task dependencies and parallel execution opportunities
4. Specify which specialized agent to use for each task

## Implementation Phases Overview

### Phase 1: Authentication Foundation (Blocking)
- Setup Better Auth with JWT plugin
- Configure shared secret (BETTER_AUTH_SECRET)
- Implement JWT verification middleware in FastAPI
- Create User model and authentication endpoints
- Build frontend auth pages (signup, signin)
- **Checkpoint**: Users can register and sign in, JWT tokens are issued and verified

### Phase 2: Database & Backend Core (Blocking)
- Setup Neon PostgreSQL connection
- Create Task model with user_id foreign key
- Implement database migrations
- Create health check endpoint
- **Checkpoint**: Database connected, models created, backend running

### Phase 3: Task API Implementation (User Stories P2-P6)
- Implement GET /api/tasks (list user's tasks)
- Implement POST /api/tasks (create task)
- Implement PUT /api/tasks/{id} (update task)
- Implement DELETE /api/tasks/{id} (delete task)
- Implement PATCH /api/tasks/{id}/complete (toggle completion)
- All endpoints enforce JWT verification and user_id filtering
- **Checkpoint**: All task endpoints functional with proper authorization

### Phase 4: Frontend Task Management (User Stories P2-P6)
- Create protected dashboard route
- Build TaskList component
- Build TaskItem component with completion toggle
- Build TaskForm component (create/edit)
- Implement API client with JWT attachment
- Handle loading, error, and empty states
- **Checkpoint**: Full task management UI functional

### Phase 5: Integration & Verification
- Test end-to-end auth flow
- Verify user isolation (create multiple accounts, verify no cross-user access)
- Test all CRUD operations
- Verify persistence across sessions
- Validate error handling (401, 403, 422)
- **Checkpoint**: All acceptance criteria from spec.md satisfied

## Key Architectural Decisions

### ADR-001: JWT-Based Authentication with Better Auth
- **Decision**: Use Better Auth to issue JWT tokens, FastAPI to verify them
- **Rationale**: Separates authentication (Better Auth) from authorization (FastAPI), enables stateless API, supports multi-device sessions
- **Alternatives**: Session-based auth (rejected: requires shared session store), OAuth2 only (rejected: adds complexity for simple use case)
- **Implications**: Shared secret must be securely managed, token expiration must be handled, frontend must attach token to every request

### ADR-002: User ID Filtering at Database Query Level
- **Decision**: Every database query includes `WHERE user_id = {authenticated_user_id}` filter
- **Rationale**: Ensures zero cross-user data leakage, enforces isolation at data layer, prevents authorization bugs
- **Alternatives**: Application-level filtering (rejected: error-prone), database row-level security (rejected: adds complexity)
- **Implications**: All task queries must extract user_id from JWT, queries must be tested for proper filtering

### ADR-003: Separate Frontend and Backend Repositories/Directories
- **Decision**: Maintain separate `frontend/` and `backend/` directories with independent dependencies
- **Rationale**: Enables independent deployment, clear separation of concerns, different technology stacks
- **Alternatives**: Monorepo with shared code (rejected: no shared code needed), single Next.js app with API routes (rejected: violates separation principle)
- **Implications**: CORS must be configured, API contract must be well-defined, separate deployment processes

### ADR-004: RESTful API Design
- **Decision**: Use REST conventions for task endpoints (GET, POST, PUT, DELETE, PATCH)
- **Rationale**: Standard HTTP semantics, well-understood patterns, simple to implement and test
- **Alternatives**: GraphQL (rejected: overkill for simple CRUD), RPC-style (rejected: less standard)
- **Implications**: Multiple endpoints for different operations, standard HTTP status codes, clear resource naming

## Risk Analysis

### Risk 1: JWT Secret Exposure
- **Probability**: Medium
- **Impact**: Critical (complete security breach)
- **Mitigation**: Store in .env files (never commit), use environment variables, document in quickstart.md, add .env to .gitignore
- **Contingency**: If exposed, rotate secret immediately, invalidate all tokens, force re-authentication

### Risk 2: Cross-User Data Leakage
- **Probability**: Medium (if implementation error)
- **Impact**: Critical (privacy violation)
- **Mitigation**: Enforce user_id filtering in middleware, write isolation tests, code review all queries
- **Contingency**: If detected, audit all affected data, notify users, fix immediately

### Risk 3: Token Expiration Handling
- **Probability**: High (will occur during normal use)
- **Impact**: Low (user inconvenience)
- **Mitigation**: Implement token refresh mechanism, clear error messages, automatic redirect to signin
- **Contingency**: User re-authenticates, no data loss

### Risk 4: Database Connection Issues
- **Probability**: Low (Neon is reliable)
- **Impact**: High (application unavailable)
- **Mitigation**: Connection pooling, retry logic, health check endpoint, monitoring
- **Contingency**: Display error message, log for debugging, automatic retry

### Risk 5: CORS Configuration Errors
- **Probability**: Medium (common in development)
- **Impact**: Medium (frontend cannot call backend)
- **Mitigation**: Document correct CORS settings, test in development, separate dev/prod configs
- **Contingency**: Update CORS settings, restart backend, verify with browser dev tools

## Success Metrics

### Technical Metrics
- All 25 functional requirements (FR-001 through FR-025) implemented and tested
- 100% of API endpoints enforce JWT verification
- 0% cross-user data leakage in isolation tests
- <2 second response time for all operations
- 50+ concurrent users supported without degradation

### Process Metrics
- Spec → Plan → Tasks → Implementation workflow followed
- All code generated by specialized agents (no manual coding)
- PHRs created for all major phases
- ADRs created for all significant decisions
- All artifacts traceable to spec requirements

### User Experience Metrics
- Users can register and sign in within 1 minute
- Task operations complete within 2 seconds
- Clear error messages for all failure scenarios
- Responsive UI on desktop and mobile browsers
- Data persists correctly across sessions

## Next Steps

1. **Review and approve this plan** - Ensure all stakeholders agree with architectural decisions
2. **Execute Phase 0 (Research)** - Generate research.md with all findings
3. **Execute Phase 1 (Design)** - Generate data-model.md, contracts/, quickstart.md
4. **Update agent context** - Run update-agent-context.ps1 script
5. **Generate tasks** - Run `/sp.tasks` to create implementation task list
6. **Begin implementation** - Execute tasks using specialized agents

**Estimated Effort**:
- Phase 0 (Research): 2-4 hours
- Phase 1 (Design): 4-6 hours
- Phase 2 (Task Generation): 1-2 hours
- Implementation: 20-30 hours (varies by agent efficiency)

**Critical Path**: Authentication → Database → Task API → Frontend UI → Integration Testing
