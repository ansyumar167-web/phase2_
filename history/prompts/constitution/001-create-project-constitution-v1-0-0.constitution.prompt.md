---
id: 001
title: Create project constitution v1.0.0
stage: constitution
date: 2026-01-10
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "governance", "principles", "security", "spec-driven"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text
Project: Todo Full-Stack Web Application (Hackathon Phase 2)

Core principles:
- Spec-driven development (spec → plan → tasks → implementation)
- Security-first architecture (JWT-based authentication & authorization)
- Correctness over convenience (no assumptions beyond spec)
- Clear separation of concerns (auth, backend, frontend)
- Reproducibility (all steps, prompts, and decisions traceable)
- No manual coding (agent-generated code only)

Key standards:
- All features must map directly to written specs
- Every API endpoint must enforce authentication & user isolation
- JWT verification must be implemented on backend for every request
- Frontend must attach JWT token to all protected API calls
- Backend must never trust client-provided user IDs without token verification
- Database access must always be scoped to authenticated user
- REST API must follow standard HTTP semantics (status codes, methods)

Technology constraints:
- Frontend: Next.js 16+ (App Router)
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (JWT-based)
- Auth secret shared via environment variable (BETTER_AUTH_SECRET)

Security constraints:
- All protected endpoints require valid JWT token
- Requests without token return 401 Unauthorized
- Token signature must be verified using shared secret
- User ID in JWT must match user context used in queries
- No cross-user data access allowed under any condition

Development constraints:
- No manual code writing; all code generated via agent workflow
- No skipping steps in Agentic Dev Stack:
  spec → plan → tasks → implementation
- Each spec must be independently verifiable
- Environment variables must be explicitly documented
- Backend and frontend treated as separate services

Success criteria:
- All 5 basic-level Todo features implemented as a web app
- Multi-user support with strict user data isolation
- Fully functional REST API with JWT-based security
- Frontend successfully authenticates and consumes backend APIs
- Persistent storage working via Neon PostgreSQL
- Project passes spec-to-implementation consistency review
- No security violations or auth bypasses detected
```

## Response snapshot

Created constitution v1.0.0 for Todo Full-Stack Web Application with 6 core principles:

1. **Spec-Driven Development (NON-NEGOTIABLE)**: Enforces spec → plan → tasks → implementation workflow
2. **Security-First Architecture (NON-NEGOTIABLE)**: Mandates JWT authentication on all endpoints with strict user isolation
3. **Correctness Over Convenience**: Prohibits assumptions beyond spec; requires clarification when unclear
4. **Clear Separation of Concerns**: Enforces boundaries between Frontend (Next.js), Backend (FastAPI), and Auth (Better Auth)
5. **Reproducibility & Traceability**: Requires PHRs for all interactions and ADRs for significant decisions
6. **Agent-Generated Code Only (NON-NEGOTIABLE)**: Prohibits manual coding; all code via specialized agents

Added sections:
- Technology Stack & Architecture: Mandatory tech choices and API security protocol
- Security & Development Standards: Security constraints, workflow standards, quality gates
- Governance: Amendment process, versioning policy, compliance requirements

All template placeholders filled. No follow-up actions required.

## Outcome

- ✅ Impact: Constitution v1.0.0 ratified; establishes governance framework for entire project
- 🧪 Tests: N/A (governance document)
- 📁 Files: Created .specify/memory/constitution.md (150 lines)
- 🔁 Next prompts: Ready for feature specification creation via /sp.specify
- 🧠 Reflection: Constitution successfully captures security-first, spec-driven approach with clear non-negotiable principles. All 6 principles are testable and enforceable.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (initial constitution creation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
