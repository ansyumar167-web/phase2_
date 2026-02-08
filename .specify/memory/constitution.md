<!--
Sync Impact Report:
- Version: 1.0.0 (Initial ratification)
- New constitution created for Todo Full-Stack Web Application
- Principles defined: 6 core principles established
- Sections added: Technology Stack & Architecture, Security & Development Standards
- Templates status:
  ✅ spec-template.md - Aligned (functional requirements match security constraints)
  ✅ plan-template.md - Aligned (constitution check section ready for use)
  ✅ tasks-template.md - Aligned (task organization supports spec-driven workflow)
- Follow-up: None - all placeholders filled
-->

# Todo Full-Stack Web Application Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST follow the Agentic Dev Stack workflow: spec → plan → tasks → implementation. No implementation work may begin without a written specification. Each phase must be completed and approved before proceeding to the next. This ensures all requirements are documented, understood, and traceable.

**Rationale**: Prevents scope creep, ensures reproducibility, and maintains clear audit trail of all decisions and changes.

### II. Security-First Architecture (NON-NEGOTIABLE)

All API endpoints MUST enforce JWT-based authentication and authorization. Every protected endpoint MUST verify token signature using the shared secret (BETTER_AUTH_SECRET). User ID extracted from JWT MUST match the user context in all database queries. Cross-user data access is strictly prohibited under any condition.

**Rationale**: Multi-user applications require strict data isolation. Security cannot be retrofitted; it must be designed in from the start.

### III. Correctness Over Convenience

No assumptions may be made beyond what is explicitly stated in the specification. When requirements are unclear or missing, implementation MUST stop and clarification MUST be requested. Convenience features or "helpful" additions outside the spec are prohibited.

**Rationale**: Prevents feature drift and ensures delivered functionality matches user expectations exactly.

### IV. Clear Separation of Concerns

Frontend (Next.js), Backend (FastAPI), and Authentication (Better Auth) MUST be treated as separate services with well-defined boundaries. Frontend communicates with backend exclusively through REST APIs. Backend never trusts client-provided user IDs without JWT verification. Database access is encapsulated in the backend layer only.

**Rationale**: Enables independent testing, deployment, and scaling of each layer. Reduces coupling and improves maintainability.

### V. Reproducibility & Traceability

All development steps, prompts, decisions, and iterations MUST be recorded. Prompt History Records (PHRs) are mandatory for every user interaction. Architectural Decision Records (ADRs) MUST be created for significant technical decisions. Every change must be traceable to a specific requirement in the spec.

**Rationale**: Enables learning, debugging, and auditing. Ensures knowledge is captured and not lost.

### VI. Agent-Generated Code Only (NON-NEGOTIABLE)

No manual code writing is permitted. All code MUST be generated through the agent workflow using specialized agents (secure-auth-handler, nextjs-ui-builder, neon-db-manager, fastapi-backend-architect). This ensures consistency, adherence to standards, and proper documentation.

**Rationale**: Maintains code quality standards, ensures security best practices, and validates the agent-driven development approach.

## Technology Stack & Architecture

### Mandatory Technology Choices

- **Frontend**: Next.js 16+ with App Router (Server Components by default, Client Components only when needed)
- **Backend**: Python FastAPI with async/await for all database operations
- **ORM**: SQLModel with proper type hints and relationships
- **Database**: Neon Serverless PostgreSQL with connection pooling
- **Authentication**: Better Auth with JWT tokens (shared secret via BETTER_AUTH_SECRET environment variable)

### Architecture Requirements

- REST API MUST follow standard HTTP semantics (proper status codes, methods, headers)
- All user-owned resources MUST include user_id foreign key for data isolation
- Frontend MUST attach JWT token to all protected API calls via Authorization header
- Backend MUST implement JWT verification middleware for all protected endpoints
- Environment variables MUST be documented and stored in .env files (never committed)
- Database migrations MUST be used for all schema changes

### API Security Protocol

1. User authenticates via Better Auth → receives JWT token
2. Frontend includes token in Authorization: Bearer <token> header
3. Backend extracts and verifies token signature using shared secret
4. Backend decodes token to extract user ID and claims
5. Backend validates user ID matches request context
6. Backend filters all queries by authenticated user ID
7. Invalid/expired tokens return 401 Unauthorized
8. User ID mismatches return 403 Forbidden

## Security & Development Standards

### Security Constraints (NON-NEGOTIABLE)

- JWT secret (BETTER_AUTH_SECRET) MUST NEVER be exposed in code or version control
- All protected endpoints MUST require valid JWT token
- Token signature MUST be verified on every request
- User ID from JWT MUST match user context in all database operations
- Password hashing MUST use bcrypt or argon2 (never plain text)
- SQL injection MUST be prevented via parameterized queries (SQLModel handles this)
- Authentication failures MUST be logged for security monitoring

### Development Workflow Standards

- No skipping steps: spec → plan → tasks → implementation (strictly enforced)
- Each spec MUST be independently verifiable with clear acceptance criteria
- All code changes MUST map to specific tasks in tasks.md
- Tasks MUST be organized by user story for independent testing
- Smallest viable changes only - no refactoring of unrelated code
- Code references MUST use file_path:line_number format
- All API endpoints MUST be documented with OpenAPI/Swagger

### Quality Gates

- Functional requirements MUST be testable and measurable
- Error handling MUST cover all failure scenarios explicitly
- Database queries MUST use proper indexes for performance
- Frontend MUST implement proper loading and error states
- CORS MUST be configured correctly for frontend-backend communication
- All environment variables MUST be documented in README or .env.example

## Governance

### Amendment Process

This constitution supersedes all other development practices. Amendments require:
1. Documented justification for the change
2. Impact analysis on existing specs, plans, and tasks
3. User approval before implementation
4. Migration plan for affected artifacts
5. Version bump following semantic versioning rules

### Versioning Policy

- **MAJOR**: Backward-incompatible changes to core principles or removal of constraints
- **MINOR**: New principles added or material expansion of existing guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance

- All PRs and code reviews MUST verify compliance with this constitution
- Complexity beyond these principles MUST be explicitly justified
- Violations MUST be documented in plan.md Complexity Tracking section
- Security violations are never acceptable and MUST be fixed immediately

### Success Criteria for Project

The project is considered successful when:
1. All 5 basic-level Todo features are implemented as a web application
2. Multi-user support with strict user data isolation is verified
3. REST API with JWT-based security is fully functional
4. Frontend successfully authenticates and consumes backend APIs
5. Persistent storage via Neon PostgreSQL is working correctly
6. Spec-to-implementation consistency review passes
7. No security violations or authentication bypasses are detected

**Version**: 1.0.0 | **Ratified**: 2026-01-10 | **Last Amended**: 2026-01-10
