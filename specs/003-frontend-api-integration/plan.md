# Implementation Plan: Frontend Application & API Integration

**Branch**: `003-frontend-api-integration` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-api-integration/spec.md`

## Summary

Build a responsive Next.js 16 frontend application that consumes the existing FastAPI backend with JWT authentication. Implement complete task management user flows (CRUD operations) with proper error handling, loading states, and user isolation. The frontend will translate backend capabilities into intuitive user interfaces while maintaining strict security through JWT token validation on every API call.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router), Python 3.11+ (backend already implemented)
**Primary Dependencies**: Next.js 16+, React 18+, Tailwind CSS, FastAPI (backend), SQLModel (backend)
**Storage**: Neon Serverless PostgreSQL (already configured in backend)
**Testing**: Jest + React Testing Library (frontend), pytest (backend - already implemented)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions), responsive design (320px-1920px)
**Project Type**: Web application (frontend + backend separation)
**Performance Goals**: <2s task creation, <5s signin/dashboard load, <500ms UI feedback for all actions
**Constraints**: Mobile-first responsive (320px minimum), httpOnly cookies for JWT storage, no offline functionality
**Scale/Scope**: Multi-user application, 7 user stories, 20 functional requirements, full CRUD operations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Spec-Driven Development
- Specification complete and validated (all 16 checklist items passed)
- Following workflow: spec → plan → tasks → implementation
- No implementation has begun

### ✅ II. Security-First Architecture
- JWT authentication required for all protected routes
- Backend already implements JWT verification (BETTER_AUTH_SECRET)
- Frontend will attach JWT token to all API requests via Authorization header
- User ID validation already implemented in backend (user_id filtering)

### ✅ III. Correctness Over Convenience
- All requirements explicitly stated in spec.md
- No assumptions beyond specification
- 7 user stories with clear acceptance scenarios

### ✅ IV. Clear Separation of Concerns
- Frontend (Next.js) communicates with backend (FastAPI) exclusively via REST APIs
- Backend already implements proper JWT verification
- No direct database access from frontend
- Well-defined API boundaries already established

### ✅ V. Reproducibility & Traceability
- PHR will be created for this planning session
- All decisions will be documented in research.md
- ADRs will be suggested for significant architectural decisions

### ✅ VI. Agent-Generated Code Only
- Will use nextjs-ui-builder agent for all frontend components
- Will use secure-auth-handler agent for authentication flows
- No manual code writing

**Gate Status**: ✅ PASSED - All constitution requirements satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-api-integration/
├── spec.md              # Feature specification (complete)
├── checklists/
│   └── requirements.md  # Quality checklist (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/                 # Already implemented (002-auth-user-identity)
├── src/
│   ├── models/
│   │   ├── user.py     # User model with JWT support
│   │   └── task.py     # Task model with user_id FK
│   ├── api/
│   │   ├── auth.py     # JWT authentication endpoints
│   │   └── tasks.py    # Task CRUD endpoints with user filtering
│   ├── auth/
│   │   ├── jwt_handler.py      # JWT token creation/verification
│   │   └── dependencies.py     # Auth dependencies
│   └── database.py     # Neon PostgreSQL connection
└── tests/              # Backend tests (already implemented)

frontend/               # To be implemented in this feature
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home/landing page
│   │   ├── signin/
│   │   │   └── page.tsx        # Sign in page
│   │   ├── signup/
│   │   │   └── page.tsx        # Sign up page
│   │   └── tasks/
│   │       └── page.tsx        # Task dashboard (protected)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx  # Sign in form component
│   │   │   ├── SignUpForm.tsx  # Sign up form component
│   │   │   └── AuthProvider.tsx # Auth context provider
│   │   ├── tasks/
│   │   │   ├── TaskList.tsx    # Task list display
│   │   │   ├── TaskItem.tsx    # Individual task component
│   │   │   ├── CreateTaskForm.tsx # Task creation form
│   │   │   ├── EditTaskForm.tsx   # Task edit form
│   │   │   └── DeleteTaskDialog.tsx # Delete confirmation
│   │   └── ui/
│   │       ├── Button.tsx      # Reusable button component
│   │       ├── Input.tsx       # Reusable input component
│   │       ├── LoadingSpinner.tsx # Loading indicator
│   │       └── ErrorMessage.tsx   # Error display component
│   ├── lib/
│   │   ├── api-client.ts       # Centralized API client with JWT
│   │   ├── auth.ts             # Auth utility functions
│   │   └── error-handler.ts    # Error handling utilities
│   ├── types/
│   │   ├── user.ts             # User type definitions
│   │   └── task.ts             # Task type definitions
│   └── middleware.ts           # Route protection middleware
└── tests/
    ├── components/             # Component tests
    └── integration/            # Integration tests
```

**Structure Decision**: Web application structure with clear frontend/backend separation. Backend is already implemented with JWT authentication and task management endpoints. Frontend will be built using Next.js 16 App Router with Server Components by default and Client Components only where needed (forms, interactive elements). All API communication will go through a centralized API client that automatically attaches JWT tokens.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution requirements are satisfied.

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design completion*

### ✅ I. Spec-Driven Development
- All design artifacts created following spec → plan → tasks workflow
- Research.md documents all technical decisions with rationale
- Data-model.md defines all entities from spec requirements
- Contracts define API boundaries matching backend implementation
- Quickstart.md provides clear implementation roadmap

### ✅ II. Security-First Architecture
- API client automatically includes credentials for httpOnly cookies
- All protected routes use middleware for authentication checks
- Error handler prevents information leakage (generic messages)
- Client-side validation matches backend rules (defense in depth)
- No user_id sent from frontend (extracted from JWT by backend)
- CORS configuration documented for credential support

### ✅ III. Correctness Over Convenience
- All components map directly to functional requirements in spec
- No additional features beyond spec requirements
- Validation rules exactly match backend implementation
- Error scenarios explicitly handled per spec edge cases

### ✅ IV. Clear Separation of Concerns
- API client centralizes all backend communication
- Components organized by feature (auth, tasks, ui)
- No direct database access from frontend
- Type definitions separate from business logic
- Middleware handles route protection separately from pages

### ✅ V. Reproducibility & Traceability
- Research.md documents all architectural decisions
- Data-model.md traces types to backend models
- Contracts reference backend endpoints explicitly
- Quickstart.md provides step-by-step implementation guide
- PHR will be created for this planning session

### ✅ VI. Agent-Generated Code Only
- Quickstart specifies which agents to use for each phase
- Phase 5: secure-auth-handler for authentication
- Phases 6-9: nextjs-ui-builder for frontend components
- No manual code writing planned

**Post-Design Gate Status**: ✅ PASSED - All constitution requirements satisfied after design

### Architecture Decisions Summary

1. **Next.js 16 App Router**: Modern routing with Server Components by default
2. **httpOnly Cookies**: Maximum security for JWT token storage
3. **Centralized API Client**: Consistent error handling and credential management
4. **Optimistic Updates**: Immediate UI feedback with automatic reversion
5. **Atomic Design**: Three-tier component architecture (ui/feature/page)
6. **Client + Server Validation**: Defense in depth approach
7. **Error Categorization**: User-friendly messages with appropriate actions

No ADR suggestions at this stage - decisions are standard patterns for Next.js + JWT authentication. Will re-evaluate during implementation if novel architectural decisions emerge.
