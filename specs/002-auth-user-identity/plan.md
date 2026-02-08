# Implementation Plan: Frontend Application & API Integration with Authentication

**Branch**: `002-frontend-api-integration` | **Date**: 2026-01-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-frontend-api-integration/spec.md`

## Summary

This plan establishes a secure, stateless authentication foundation for the Todo application frontend, integrating Better Auth with JWT tokens to enable secure communication with the FastAPI backend. The implementation ensures strict user data isolation, prevents authentication bypass, and provides a seamless user experience for signup, signin, and authenticated task management operations.

**Primary Requirements**:
- Implement Better Auth with JWT plugin in Next.js 16 App Router
- Configure shared secret (BETTER_AUTH_SECRET) for token verification
- Build signup and signin flows with secure session management
- Attach JWT tokens to all API requests via Authorization header
- Handle token expiration and authentication errors gracefully
- Ensure frontend never exposes sensitive authentication data

**Technical Approach**:
- Use Better Auth library for authentication state management
- Store JWT tokens securely (httpOnly cookies preferred)
- Implement API client wrapper to automatically attach auth headers
- Use Next.js middleware for route protection
- Coordinate with backend JWT verification layer

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16+ (App Router)
**Primary Dependencies**:
- better-auth (authentication library with JWT plugin)
- next (16+, App Router for SSR/SSG)
- react (18+)
- TypeScript (5.x for type safety)

**Storage**:
- Session storage: httpOnly cookies (secure, not accessible via JavaScript)
- Backend API: Neon PostgreSQL (via FastAPI backend)

**Testing**:
- Jest + React Testing Library (component tests)
- Playwright or Cypress (E2E authentication flows)
- Manual testing for token verification

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)

**Project Type**: Web application (frontend + backend separation)

**Performance Goals**:
- Authentication flow completes within 2 seconds
- Token verification adds <50ms overhead per API request
- Page load with auth check <1 second

**Constraints**:
- JWT tokens must be transmitted securely (HTTPS in production)
- Tokens must not be exposed in URLs or localStorage
- Token expiration must be handled gracefully
- No direct database access from frontend

**Scale/Scope**:
- Support 100+ concurrent authenticated users
- Handle 1000+ API requests per minute
- Manage sessions for multiple browser tabs/devices per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Security-First Architecture (NON-NEGOTIABLE)
✅ **PASS** - All API endpoints will require JWT authentication via Authorization header
✅ **PASS** - JWT tokens will be verified using shared secret (BETTER_AUTH_SECRET)
✅ **PASS** - User ID from JWT will be used for all data access (backend enforces this)
✅ **PASS** - Cross-user data access prevented by backend validation

### Spec-Driven Development (NON-NEGOTIABLE)
✅ **PASS** - Specification exists at specs/002-frontend-api-integration/spec.md
✅ **PASS** - This plan follows spec → plan → tasks → implementation workflow
✅ **PASS** - All requirements traced to spec functional requirements

### Clear Separation of Concerns
✅ **PASS** - Frontend communicates with backend exclusively through REST APIs
✅ **PASS** - Frontend never accesses database directly
✅ **PASS** - Authentication layer (Better Auth) is separate from UI components
✅ **PASS** - Backend handles all JWT verification independently

### Agent-Generated Code Only (NON-NEGOTIABLE)
✅ **PASS** - Implementation will use nextjs-ui-builder agent for frontend
✅ **PASS** - Implementation will use secure-auth-handler agent for auth flows
✅ **PASS** - Implementation will use fastapi-backend-architect agent for backend coordination

### Correctness Over Convenience
✅ **PASS** - No assumptions beyond spec requirements
✅ **PASS** - Authentication requirements explicitly defined in spec FR-001 through FR-015
✅ **PASS** - Error handling and edge cases documented in spec

### Reproducibility & Traceability
✅ **PASS** - PHR will be created for this planning session
✅ **PASS** - ADR will be suggested for JWT token storage decision
✅ **PASS** - All decisions documented in research.md

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-api-integration/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── auth-api.yaml    # Authentication API contract
│   └── tasks-api.yaml   # Tasks API contract
├── checklists/          # Quality validation
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── signin/        # Sign in page
│   │   │   └── signup/        # Sign up page
│   │   ├── (protected)/       # Protected route group
│   │   │   └── tasks/         # Tasks dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home/landing page
│   ├── components/            # React components
│   │   ├── auth/              # Auth-related components
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── tasks/             # Task management components
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── CreateTaskForm.tsx
│   │   │   └── EditTaskForm.tsx
│   │   └── ui/                # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── ErrorMessage.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Better Auth configuration
│   │   ├── api-client.ts      # API client with JWT injection
│   │   └── types.ts           # TypeScript types
│   └── middleware.ts          # Next.js middleware for route protection
├── public/                    # Static assets
├── .env.local                 # Environment variables (not committed)
├── .env.example               # Environment variable template
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies

backend/
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── jwt_handler.py     # JWT verification logic
│   │   └── dependencies.py    # FastAPI dependencies for auth
│   ├── api/                   # API endpoints
│   │   ├── auth.py            # Auth endpoints (if needed)
│   │   └── tasks.py           # Task endpoints (protected)
│   ├── models/                # SQLModel models
│   │   ├── user.py            # User model
│   │   └── task.py            # Task model
│   └── main.py                # FastAPI application
├── alembic/                   # Database migrations
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment variable template
└── requirements.txt           # Python dependencies
```

**Structure Decision**: Web application structure with clear frontend/backend separation. Frontend uses Next.js 16 App Router with route groups for authentication and protected routes. Backend uses FastAPI with modular structure for auth and API endpoints. Shared secret (BETTER_AUTH_SECRET) configured in both environments.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution requirements are satisfied by the planned architecture.

## Authentication Architecture

### Identity Contract

**JWT Token Claims** (issued by Better Auth, verified by backend):
```json
{
  "user_id": "integer",      // Primary user identifier
  "email": "string",          // User email address
  "iat": "timestamp",         // Issued at
  "exp": "timestamp",         // Expiration time
  "iss": "string"             // Issuer (Better Auth)
}
```

**Token Lifecycle**:
1. User signs up/signs in via Better Auth
2. Better Auth generates JWT with user claims
3. Frontend stores token securely (httpOnly cookie)
4. Frontend attaches token to all API requests
5. Backend extracts and verifies token signature
6. Backend decodes token to get user_id
7. Backend uses user_id for data filtering

### Security Guarantees

1. **Stateless Authentication**: No server-side session storage required
2. **Token Integrity**: Signature verification prevents tampering
3. **User Isolation**: Backend filters all queries by authenticated user_id
4. **Expiration Handling**: Expired tokens trigger re-authentication
5. **Secret Protection**: BETTER_AUTH_SECRET never exposed in client code

### Authentication Flow Diagrams

**Signup Flow**:
```
User → Frontend (signup form) → Better Auth → Database (create user)
                                      ↓
                                  JWT Token
                                      ↓
                              httpOnly Cookie
                                      ↓
                            Redirect to /tasks
```

**Signin Flow**:
```
User → Frontend (signin form) → Better Auth → Database (verify credentials)
                                      ↓
                                  JWT Token
                                      ↓
                              httpOnly Cookie
                                      ↓
                            Redirect to /tasks
```

**Protected API Request Flow**:
```
Frontend → Extract JWT from cookie → Add Authorization: Bearer <token> header
              ↓
        Backend API Endpoint
              ↓
        JWT Verification Middleware
              ↓
        Decode token → Extract user_id
              ↓
        Database Query (filtered by user_id)
              ↓
        Response → Frontend
```

## Phase Breakdown

### Phase 0: Research & Decision Making
**Status**: To be completed
**Output**: research.md

**Research Tasks**:
1. Better Auth JWT plugin configuration best practices
2. httpOnly cookie vs localStorage for JWT storage (security comparison)
3. Next.js middleware patterns for route protection
4. API client patterns for automatic header injection
5. Token refresh strategies (if needed)
6. Error handling patterns for expired/invalid tokens

### Phase 1: Design & Contracts
**Status**: To be completed
**Output**: data-model.md, contracts/, quickstart.md

**Design Tasks**:
1. Define User and Task data models
2. Create OpenAPI contracts for auth and task endpoints
3. Design API client interface
4. Document environment variable requirements
5. Create quickstart guide for local development

### Phase 2: Task Breakdown
**Status**: Not started (separate /sp.tasks command)
**Output**: tasks.md

**Task Categories** (preview):
1. Better Auth setup and configuration
2. Signup/signin UI components
3. API client with JWT injection
4. Route protection middleware
5. Backend JWT verification
6. Error handling and loading states
7. Integration testing

## Environment Variables

### Frontend (.env.local)
```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=<shared-secret-key>  # Must match backend
BETTER_AUTH_URL=http://localhost:3000   # Frontend URL
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL

# Next.js Configuration
NODE_ENV=development
```

### Backend (.env)
```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=<shared-secret-key>  # Must match frontend

# Database Configuration
DATABASE_URL=postgresql://user:pass@host/db  # Neon PostgreSQL

# FastAPI Configuration
CORS_ORIGINS=http://localhost:3000  # Frontend URL
```

**Critical**: BETTER_AUTH_SECRET must be identical in both frontend and backend for JWT verification to work.

## Risk Analysis

### High Priority Risks

1. **Token Storage Security**
   - Risk: JWT exposed via localStorage vulnerable to XSS
   - Mitigation: Use httpOnly cookies (not accessible via JavaScript)
   - Fallback: Implement Content Security Policy (CSP)

2. **Secret Key Exposure**
   - Risk: BETTER_AUTH_SECRET committed to version control
   - Mitigation: Use .env files, add to .gitignore
   - Validation: Pre-commit hooks to check for secrets

3. **Token Expiration Handling**
   - Risk: Poor UX when token expires during user activity
   - Mitigation: Implement graceful redirect with session restoration
   - Enhancement: Token refresh mechanism (if needed)

4. **CORS Configuration**
   - Risk: Backend rejects frontend requests due to CORS
   - Mitigation: Configure CORS_ORIGINS in backend .env
   - Testing: Verify preflight requests work correctly

### Medium Priority Risks

5. **Concurrent Tab Sessions**
   - Risk: User signs out in one tab, other tabs still authenticated
   - Mitigation: Implement session synchronization across tabs
   - Alternative: Accept eventual consistency

6. **Network Errors During Auth**
   - Risk: User stuck in loading state if auth request fails
   - Mitigation: Implement timeout and retry logic
   - UX: Clear error messages with retry button

## Next Steps

1. ✅ Complete Phase 0: Create research.md with technology decisions
2. ✅ Complete Phase 1: Create data-model.md and API contracts
3. ⏳ Run /sp.tasks to generate task breakdown
4. ⏳ Execute tasks using specialized agents
5. ⏳ Integration testing and validation

## Notes

- This plan focuses on authentication as the foundation for the frontend feature
- Task management UI will be built on top of this authentication layer
- Backend JWT verification must be implemented in parallel (coordinate with backend team)
- All agents (nextjs-ui-builder, secure-auth-handler) will reference this plan during implementation
