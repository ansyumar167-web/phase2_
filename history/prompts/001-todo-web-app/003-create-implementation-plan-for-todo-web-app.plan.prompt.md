---
id: 003
title: Create implementation plan for Todo web app
stage: plan
date: 2026-01-10
surface: agent
model: claude-opus-4-5-20251101
feature: 001-todo-web-app
branch: 001-todo-web-app
user: user
command: /sp.plan
labels: ["plan", "architecture", "design", "research", "contracts"]
links:
  spec: specs/001-todo-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-todo-web-app/plan.md
  - specs/001-todo-web-app/research.md
  - specs/001-todo-web-app/data-model.md
  - specs/001-todo-web-app/contracts/auth-api.yaml
  - specs/001-todo-web-app/contracts/tasks-api.yaml
  - specs/001-todo-web-app/quickstart.md
tests:
  - none
---

## Prompt

```text
/sp.plan Todo Full-Stack Web Application (Hackathon Phase 2)

Planning objectives:
- Translate the specification into an executable agentic plan
- Define a clear implementation order that minimizes risk
- Establish contracts between frontend, backend, and authentication layers
- Ensure security and user isolation are implemented first

High-level phases:
1. Authentication foundation
   - Configure Better Auth with JWT plugin
   - Define shared JWT secret usage
   - Establish frontend auth flow (signup/signin)
   - Define JWT structure and claims used by backend

2. Backend architecture
   - Initialize FastAPI project structure
   - Configure SQLModel and Neon PostgreSQL connection
   - Define Task database schema with user ownership
   - Implement JWT verification middleware
   - Enforce authenticated user context in all routes

3. REST API implementation
   - Implement all required task endpoints
   - Apply ownership filtering to every query
   - Handle authorization and error responses correctly
   - Validate request and response schemas

4. Frontend application
   - Build auth-protected routes using Next.js App Router
   - Implement task UI (list, create, update, delete, complete)
   - Create API client that attaches JWT to every request
   - Handle loading, error, and empty states

5. Integration & verification
   - Verify end-to-end auth flow
   - Test user isolation across multiple accounts
   - Validate persistence and data correctness
   - Ensure API behavior matches spec (401, 403, etc.)

Planning constraints:
- No implementation before planning is complete
- Each phase must be independently verifiable
- Security-related steps must precede feature development
- All assumptions must be explicitly documented

Plan output requirements:
- Ordered task list suitable for agent execution
- Clear inputs/outputs for each task
- Explicit dependencies between tasks
- No skipped or merged phases
```

## Response snapshot

Created comprehensive implementation plan with complete Phase 0 (Research) and Phase 1 (Design) deliverables.

**Plan Structure**:
- Technical Context: Python 3.11+, FastAPI, SQLModel, Next.js 16, Better Auth, Neon PostgreSQL
- Constitution Check: All 6 principles satisfied (✅ PASS)
- Project Structure: Web application with separate frontend/ and backend/ directories
- 4 Architectural Decision Records (ADRs) documented
- Risk Analysis: 5 risks identified with mitigation strategies
- Implementation Phases: 5 phases from Authentication Foundation to Integration & Verification

**Phase 0 Deliverables (Research)**:
- R1: Better Auth JWT structure (use `sub` claim for user ID)
- R2: FastAPI JWT verification (python-jose with dependency injection)
- R3: Neon PostgreSQL with SQLModel (asyncpg driver + Alembic migrations)
- R4: Next.js 16 auth patterns (httpOnly cookies + middleware)
- R5: CORS configuration (environment-based explicit origins)
- Dependencies documented for backend and frontend

**Phase 1 Deliverables (Design)**:
- Data Model: User and Task entities with relationships, indexes, validation rules
- API Contracts:
  - auth-api.yaml: Better Auth endpoints (signup, signin, signout)
  - tasks-api.yaml: Task CRUD endpoints (GET, POST, PUT, DELETE, PATCH)
- Quickstart Guide: Complete setup instructions with troubleshooting
- Security guarantees: User isolation enforced at database and application layers

**Key Architectural Decisions**:
- ADR-001: JWT-based authentication with Better Auth
- ADR-002: User ID filtering at database query level
- ADR-003: Separate frontend and backend repositories
- ADR-004: RESTful API design

**Security Measures**:
- JWT verification on all protected endpoints
- User ID extracted from JWT token only (never from client)
- All queries filtered by authenticated user_id
- httpOnly cookies prevent XSS attacks
- Foreign key constraints enforce referential integrity

## Outcome

- ✅ Impact: Complete implementation plan ready for task generation; establishes technical architecture, security patterns, and development workflow
- 🧪 Tests: N/A (planning phase - test strategy documented in data-model.md)
- 📁 Files: Created plan.md (400+ lines), research.md (300+ lines), data-model.md (400+ lines), contracts/auth-api.yaml (200+ lines), contracts/tasks-api.yaml (300+ lines), quickstart.md (500+ lines)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate implementation task list organized by user story
- 🧠 Reflection: Planning phase successfully completed with comprehensive research, design, and contracts. All technical unknowns resolved. Security-first architecture established with JWT verification and user isolation patterns. Ready for agent-driven implementation.

## Evaluation notes (flywheel)

- Failure modes observed: Agent context update script failed (template missing), but not blocking for planning phase
- Graders run and results (PASS/FAIL): Constitution Check - PASS (all 6 principles satisfied)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
