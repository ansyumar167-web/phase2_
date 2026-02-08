---

description: "Task list for Todo Full-Stack Web Application implementation"
---

# Tasks: Todo Full-Stack Web Application

**Input**: Design documents from `/specs/001-todo-web-app/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Tests are OPTIONAL and not explicitly requested in the specification. Tasks focus on implementation of functional requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Backend: Python FastAPI with SQLModel
- Frontend: Next.js 16 with App Router
- Database: Neon Serverless PostgreSQL

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure with src/, tests/, and configuration files
- [x] T002 Initialize Python project with requirements.txt including fastapi, sqlmodel, asyncpg, alembic, python-jose, uvicorn, python-dotenv
- [x] T003 Create frontend directory structure with Next.js 16 App Router layout
- [x] T004 Initialize Node.js project with package.json including next, react, react-dom, better-auth
- [x] T005 [P] Create root .env.example file with BETTER_AUTH_SECRET, DATABASE_URL, ALLOWED_ORIGINS
- [x] T006 [P] Create backend/.env.example file with DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_ORIGINS, HOST, PORT
- [x] T007 [P] Create frontend/.env.local.example file with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, NEXTAUTH_URL
- [x] T008 [P] Create backend/src/config.py for environment variable loading and validation
- [x] T009 [P] Add .gitignore files to exclude .env, venv/, node_modules/, .next/

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create backend/src/database.py with async SQLModel engine configuration for Neon PostgreSQL
- [x] T011 Initialize Alembic in backend/ directory with alembic init alembic command
- [x] T012 Configure Alembic env.py to use SQLModel metadata and async engine
- [x] T013 [P] Create backend/src/models/__init__.py as package initializer
- [x] T014 [P] Create backend/src/middleware/__init__.py as package initializer
- [x] T015 [P] Create backend/src/api/__init__.py as package initializer
- [x] T016 Create backend/src/models/user.py with User SQLModel (id, email, password_hash, created_at, updated_at)
- [x] T017 Create Alembic migration for users table with alembic revision --autogenerate -m "Create users table"
- [x] T018 Create backend/src/middleware/auth.py with JWT verification dependency using python-jose
- [x] T019 Create backend/src/main.py with FastAPI app initialization and CORS middleware configuration
- [x] T020 Add health check endpoint GET /health in backend/src/api/health.py
- [x] T021 [P] Configure Better Auth in frontend/src/lib/auth.ts with JWT plugin and httpOnly cookies
- [x] T022 [P] Create frontend/src/middleware.ts for Next.js route protection (redirect unauthenticated users)
- [x] T023 [P] Create frontend/src/lib/types.ts with TypeScript interfaces for User and Task

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable users to register accounts, sign in, and sign out with JWT-based authentication

**Independent Test**: Register a new account with email/password, sign out, sign in again, verify JWT token is issued and stored in httpOnly cookie

### Implementation for User Story 1

- [x] T024 [P] [US1] Create frontend/src/app/auth/signup/page.tsx with registration form (email, password fields)
- [x] T025 [P] [US1] Create frontend/src/app/auth/signin/page.tsx with sign-in form (email, password fields)
- [x] T026 [P] [US1] Create frontend/src/components/AuthForm.tsx reusable component for auth forms with validation
- [x] T027 [US1] Implement Better Auth signup endpoint integration in frontend (POST /api/auth/signup)
- [x] T028 [US1] Implement Better Auth signin endpoint integration in frontend (POST /api/auth/signin)
- [x] T029 [US1] Implement Better Auth signout endpoint integration in frontend (POST /api/auth/signout)
- [x] T030 [US1] Add authentication error handling and user feedback in frontend auth pages
- [x] T031 [US1] Create frontend/src/app/page.tsx landing page with redirect logic (authenticated → dashboard, unauthenticated → signin)

**Checkpoint**: ✅ MVP COMPLETE - User Story 1 is fully implemented. Users can register, sign in, and sign out.

---

## Phase 4: User Story 2 - Create New Tasks (Priority: P2) ✅ COMPLETE

**Goal**: Enable authenticated users to create new tasks with title and optional description

**Independent Test**: Sign in as a user, create a task with title "Buy groceries", refresh the page, verify task persists

### Implementation for User Story 2

- [x] T032 [P] [US2] Create backend/src/models/task.py with Task SQLModel (id, user_id, title, description, is_completed, created_at, updated_at)
- [x] T033 [US2] Create Alembic migration for tasks table with alembic revision --autogenerate -m "Create tasks table"
- [x] T034 [US2] Apply migrations to database with alembic upgrade head
- [x] T035 [US2] Create backend/src/api/tasks.py with FastAPI router initialization
- [x] T036 [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py with JWT verification and user_id extraction
- [x] T037 [US2] Add request validation for task creation (title required, max lengths) using Pydantic models
- [x] T038 [US2] Implement database insert with user_id from JWT token in POST /api/tasks endpoint
- [x] T039 [US2] Register tasks router in backend/src/main.py
- [x] T040 [P] [US2] Create frontend/src/lib/api.ts with API client that includes JWT token from cookies
- [x] T041 [P] [US2] Create frontend/src/app/dashboard/page.tsx protected route for task management
- [x] T042 [US2] Create frontend/src/components/TaskForm.tsx component for creating tasks
- [x] T043 [US2] Implement createTask API call in frontend with POST /api/tasks
- [x] T044 [US2] Add form validation and error handling in TaskForm component
- [x] T045 [US2] Display newly created task immediately in dashboard (optimistic UI update)

**Checkpoint**: ✅ User Stories 1 AND 2 complete. Users can register, sign in, and create tasks with persistence.

---

## Phase 5: User Story 3 - View All Personal Tasks (Priority: P3)

**Goal**: Enable authenticated users to view all their tasks with strict user isolation

**Independent Test**: Create 3 tasks as User A, sign in as User B and verify they see zero tasks, sign back in as User A and verify all 3 tasks are visible

### Implementation for User Story 3

- [x] T046 [US3] Implement GET /api/tasks endpoint in backend/src/api/tasks.py with user_id filtering
- [x] T047 [US3] Add database query with WHERE user_id = {authenticated_user_id} filter
- [x] T048 [US3] Implement response serialization with task list in GET /api/tasks endpoint
- [x] T049 [P] [US3] Create frontend/src/components/TaskList.tsx component to display task array
- [x] T050 [P] [US3] Create frontend/src/components/TaskItem.tsx component for individual task display
- [x] T051 [US3] Implement getTasks API call in frontend with GET /api/tasks
- [x] T052 [US3] Add loading state handling in TaskList component
- [x] T053 [US3] Add empty state message when user has no tasks
- [x] T054 [US3] Display task title, description, and completion status in TaskItem component
- [x] T055 [US3] Integrate TaskList component into dashboard page

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can view their complete task list with proper isolation.

---

## Phase 6: User Story 4 - Mark Tasks Complete/Incomplete (Priority: P4)

**Goal**: Enable authenticated users to toggle task completion status

**Independent Test**: Create a task, mark it complete, verify visual indication changes, refresh page and verify status persists, mark it incomplete and verify it returns to incomplete state

### Implementation for User Story 4

- [x] T056 [US4] Implement PATCH /api/tasks/{id}/complete endpoint in backend/src/api/tasks.py
- [x] T057 [US4] Add ownership verification in PATCH endpoint (WHERE id = {task_id} AND user_id = {authenticated_user_id})
- [x] T058 [US4] Implement is_completed toggle logic (NOT is_completed) in database update
- [x] T059 [US4] Return 404 if task not found or belongs to different user
- [x] T060 [US4] Add checkbox UI element in TaskItem component for completion toggle
- [x] T061 [US4] Implement toggleTaskCompletion API call in frontend with PATCH /api/tasks/{id}/complete
- [x] T062 [US4] Add visual styling to distinguish completed tasks (strikethrough, opacity, color)
- [x] T063 [US4] Update task state immediately on toggle (optimistic UI update)
- [x] T064 [US4] Handle toggle errors and revert UI state if API call fails

**Checkpoint**: At this point, User Stories 1-4 should all work independently. Users can mark tasks as complete/incomplete with visual feedback.

---

## Phase 7: User Story 5 - Edit Existing Tasks (Priority: P5)

**Goal**: Enable authenticated users to modify task title and description

**Independent Test**: Create a task with title "Buy milk", edit it to "Buy organic milk and bread", verify change appears immediately, refresh page and verify edit persists

### Implementation for User Story 5

- [x] T065 [US5] Implement PUT /api/tasks/{id} endpoint in backend/src/api/tasks.py
- [x] T066 [US5] Add ownership verification in PUT endpoint (WHERE id = {task_id} AND user_id = {authenticated_user_id})
- [x] T067 [US5] Implement task update logic with title and description fields
- [x] T068 [US5] Add request validation for task updates (title required, max lengths)
- [x] T069 [US5] Return 404 if task not found or belongs to different user
- [x] T070 [US5] Update updated_at timestamp on task modification
- [x] T071 [US5] Add edit mode toggle in TaskItem component (show form when editing)
- [x] T072 [US5] Create inline edit form in TaskItem with pre-filled current values
- [x] T073 [US5] Implement updateTask API call in frontend with PUT /api/tasks/{id}
- [x] T074 [US5] Add form validation for edit form (title required)
- [x] T075 [US5] Update task display immediately after successful edit
- [x] T076 [US5] Add cancel button to exit edit mode without saving

**Checkpoint**: At this point, User Stories 1-5 should all work independently. Users can edit their tasks with proper validation.

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P6)

**Goal**: Enable authenticated users to permanently delete tasks

**Independent Test**: Create a task, delete it, verify it disappears from list, refresh page and verify it remains deleted, sign in as another user and verify their tasks are unaffected

### Implementation for User Story 6

- [x] T077 [US6] Implement DELETE /api/tasks/{id} endpoint in backend/src/api/tasks.py
- [x] T078 [US6] Add ownership verification in DELETE endpoint (WHERE id = {task_id} AND user_id = {authenticated_user_id})
- [x] T079 [US6] Implement task deletion from database
- [x] T080 [US6] Return 204 No Content on successful deletion
- [x] T081 [US6] Return 404 if task not found or belongs to different user
- [x] T082 [US6] Add delete button in TaskItem component
- [x] T083 [US6] Implement confirmation dialog before deletion (prevent accidental deletes)
- [x] T084 [US6] Implement deleteTask API call in frontend with DELETE /api/tasks/{id}
- [x] T085 [US6] Remove task from UI immediately after successful deletion
- [x] T086 [US6] Handle deletion errors and show error message to user

**Checkpoint**: All user stories (1-6) should now be independently functional. Complete CRUD operations available.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T087 [P] Add loading spinners for all async operations in frontend
- [x] T088 [P] Implement error boundary component in frontend for graceful error handling
- [ ] T089 [P] Add toast notifications for success/error messages across all operations
- [x] T090 [P] Implement proper HTTP status codes for all error scenarios (401, 403, 404, 422)
- [x] T091 [P] Add request/response logging in backend for debugging
- [x] T092 [P] Implement rate limiting middleware in backend to prevent abuse
- [x] T093 [P] Add input sanitization for all user inputs (XSS prevention)
- [x] T094 [P] Optimize database queries with proper indexes (user_id, created_at)
- [x] T095 [P] Add API documentation with OpenAPI/Swagger UI in backend
- [x] T096 [P] Implement responsive design for mobile devices in frontend
- [ ] T097 [P] Add keyboard shortcuts for common actions (Ctrl+N for new task, etc.)
- [ ] T098 Verify quickstart.md instructions work end-to-end
- [x] T099 Create README.md in project root with setup overview and links to documentation
- [ ] T100 Final integration test: Create multiple users, verify complete isolation and all CRUD operations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 for authentication context
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US2 for tasks to view
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Requires US2 and US3 for tasks to complete
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Requires US2 and US3 for tasks to edit
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Requires US2 and US3 for tasks to delete

### Within Each User Story

- Backend models before API endpoints
- API endpoints before frontend integration
- Core implementation before UI polish
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Within each user story, tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (after Foundational phase)

---

## Parallel Example: User Story 2

```bash
# Launch backend and frontend tasks together (after T034 migration applied):
Task: "Create frontend/src/lib/api.ts with API client" (T040)
Task: "Create frontend/src/app/dashboard/page.tsx" (T041)

# These can run in parallel because they touch different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Authentication)
4. **STOP and VALIDATE**: Test authentication flow independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Authentication) - MUST complete first
   - After US1 complete:
     - Developer A: User Story 2 (Create Tasks)
     - Developer B: User Story 4 (Complete Tasks) - can start after US2
     - Developer C: User Story 5 (Edit Tasks) - can start after US2
3. Stories complete and integrate independently

---

## Specialized Agent Assignments

**Recommended agents for each phase:**

- **Phase 1 (Setup)**: General-purpose agent or manual setup
- **Phase 2 (Foundational)**:
  - Database tasks (T010-T017): neon-db-manager
  - Auth middleware (T018): secure-auth-handler
  - FastAPI setup (T019-T020): fastapi-backend-architect
  - Frontend auth (T021-T023): nextjs-ui-builder
- **Phase 3 (US1 - Authentication)**: secure-auth-handler + nextjs-ui-builder
- **Phase 4 (US2 - Create Tasks)**: neon-db-manager + fastapi-backend-architect + nextjs-ui-builder
- **Phase 5 (US3 - View Tasks)**: fastapi-backend-architect + nextjs-ui-builder
- **Phase 6 (US4 - Complete Tasks)**: fastapi-backend-architect + nextjs-ui-builder
- **Phase 7 (US5 - Edit Tasks)**: fastapi-backend-architect + nextjs-ui-builder
- **Phase 8 (US6 - Delete Tasks)**: fastapi-backend-architect + nextjs-ui-builder
- **Phase 9 (Polish)**: General-purpose agent for cross-cutting concerns

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Summary

**Total Tasks**: 100
- Phase 1 (Setup): 9 tasks
- Phase 2 (Foundational): 14 tasks (BLOCKING)
- Phase 3 (US1 - Authentication): 8 tasks
- Phase 4 (US2 - Create Tasks): 14 tasks
- Phase 5 (US3 - View Tasks): 10 tasks
- Phase 6 (US4 - Complete Tasks): 9 tasks
- Phase 7 (US5 - Edit Tasks): 12 tasks
- Phase 8 (US6 - Delete Tasks): 10 tasks
- Phase 9 (Polish): 14 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**MVP Scope**: Phases 1-3 (31 tasks) deliver authentication foundation

**Full Feature Set**: All 100 tasks deliver complete Todo application with all 6 user stories
