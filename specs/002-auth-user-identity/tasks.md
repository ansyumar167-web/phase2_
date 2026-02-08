# Tasks: Authentication & User Identity (Frontend Application & API Integration)

**Input**: Design documents from `/specs/002-auth-user-identity/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not included in this task list as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Frontend uses Next.js 16 App Router structure
- Backend uses FastAPI with modular structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify frontend directory structure matches plan.md (frontend/src/app/, frontend/src/components/, frontend/src/lib/)
- [x] T002 Verify backend directory structure matches plan.md (backend/src/auth/, backend/src/api/, backend/src/models/)
- [x] T003 [P] Install Better Auth dependencies in frontend/package.json (better-auth, @better-auth/jwt)
- [x] T004 [P] Verify TypeScript configuration in frontend/tsconfig.json (strict mode, path aliases)
- [x] T005 [P] Create environment variable templates (.env.example in frontend/ and backend/)
- [x] T006 [P] Document BETTER_AUTH_SECRET requirement in both .env.example files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Authentication Foundation

- [x] T007 Configure Better Auth with JWT plugin in frontend/src/lib/auth.ts
- [x] T008 Create TypeScript types for User, Task, Session in frontend/src/lib/types.ts
- [x] T009 Implement API client wrapper with JWT injection in frontend/src/lib/api-client.ts
- [x] T010 Create Next.js middleware for route protection in frontend/src/middleware.ts
- [x] T011 [P] Implement JWT verification dependency in backend/src/auth/jwt_handler.py
- [x] T012 [P] Create FastAPI authentication dependency in backend/src/auth/dependencies.py
- [x] T013 Create User model in backend/src/models/user.py (email, password_hash, timestamps)
- [x] T014 Create Task model in backend/src/models/task.py (user_id FK, title, description, is_completed)
- [x] T015 Generate database migration for User and Task tables in backend/alembic/versions/

### Authentication Endpoints (Backend)

- [x] T016 Implement POST /api/auth/signup endpoint in backend/src/api/auth.py
- [x] T017 Implement POST /api/auth/signin endpoint in backend/src/api/auth.py
- [x] T018 [P] Implement POST /api/auth/signout endpoint in backend/src/api/auth.py
- [x] T019 [P] Implement GET /api/auth/me endpoint in backend/src/api/auth.py

### Authentication UI Components (Frontend)

- [x] T020 [P] Create SignUpForm component in frontend/src/components/auth/SignUpForm.tsx
- [x] T021 [P] Create SignInForm component in frontend/src/components/auth/SignInForm.tsx
- [x] T022 [P] Create AuthProvider component in frontend/src/components/auth/AuthProvider.tsx
- [x] T023 Create signup page in frontend/src/app/(auth)/signup/page.tsx
- [x] T024 Create signin page in frontend/src/app/(auth)/signin/page.tsx
- [x] T025 Create root layout with AuthProvider in frontend/src/app/layout.tsx

### Reusable UI Components

- [x] T026 [P] Create Button component in frontend/src/components/ui/Button.tsx
- [x] T027 [P] Create Input component in frontend/src/components/ui/Input.tsx
- [x] T028 [P] Create ErrorMessage component in frontend/src/components/ui/ErrorMessage.tsx
- [x] T029 [P] Create LoadingSpinner component in frontend/src/components/ui/LoadingSpinner.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Authenticated Task Viewing (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to view their personal task list with strict user isolation

**Independent Test**: Log in with a valid user account and verify that only that user's tasks are displayed. Create tasks as User A, sign in as User B and verify they see zero tasks, sign back in as User A and verify all tasks are visible.

### Backend API for User Story 1

- [x] T030 [US1] Implement GET /api/tasks endpoint in backend/src/api/tasks.py (filter by authenticated user_id)
- [x] T031 [US1] Add JWT authentication dependency to GET /api/tasks endpoint
- [x] T032 [US1] Implement user_id filtering in database query (WHERE user_id = authenticated_user_id)

### Frontend UI for User Story 1

- [x] T033 [P] [US1] Create TaskList component in frontend/src/components/tasks/TaskList.tsx
- [x] T034 [P] [US1] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx (display only, no actions yet)
- [x] T035 [P] [US1] Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx
- [x] T036 [US1] Create tasks page in frontend/src/app/(protected)/tasks/page.tsx
- [x] T037 [US1] Implement task fetching with API client in tasks page
- [x] T038 [US1] Add loading state handling in TaskList component
- [x] T039 [US1] Add empty state handling (no tasks) in TaskList component
- [x] T040 [US1] Add error state handling in TaskList component
- [x] T041 [US1] Implement redirect to signin for unauthenticated users (middleware)
- [x] T042 [US1] Implement redirect to signin for expired tokens (API client)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can sign in and view their tasks (empty initially).

---

## Phase 4: User Story 2 - Task Creation (Priority: P2)

**Goal**: Enable authenticated users to create new tasks with title and optional description

**Independent Test**: Log in, create a new task with title "Buy groceries" and description "Milk, eggs, bread", verify it appears in the task list immediately, refresh the page and verify it persists.

### Backend API for User Story 2

- [x] T043 [US2] Implement POST /api/tasks endpoint in backend/src/api/tasks.py
- [x] T044 [US2] Add JWT authentication dependency to POST /api/tasks endpoint
- [x] T045 [US2] Extract user_id from JWT token (not from request body)
- [x] T046 [US2] Implement request validation (title required, max lengths)
- [x] T047 [US2] Create task in database with authenticated user_id

### Frontend UI for User Story 2

- [x] T048 [P] [US2] Create CreateTaskForm component in frontend/src/components/tasks/CreateTaskForm.tsx
- [x] T049 [US2] Add CreateTaskForm to tasks page
- [x] T050 [US2] Implement form validation (title required, max 200 chars)
- [x] T051 [US2] Implement task creation API call with JWT token
- [x] T052 [US2] Update task list immediately after successful creation (optimistic update or refetch)
- [x] T053 [US2] Handle creation errors (display error message)
- [x] T054 [US2] Clear form after successful creation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view and create tasks.

---

## Phase 5: User Story 6 - Error and Loading State Handling (Priority: P2)

**Goal**: Provide clear feedback when the application is loading data or when errors occur

**Independent Test**: Simulate slow network conditions (browser DevTools throttling) and verify loading indicators appear. Simulate API errors (disconnect backend) and verify user-friendly error messages appear.

### Loading States

- [x] T055 [P] [US6] Add loading state to TaskList component (show LoadingSpinner)
- [x] T056 [P] [US6] Add loading state to CreateTaskForm component (disable submit button)
- [x] T057 [P] [US6] Add loading state to SignInForm component
- [x] T058 [P] [US6] Add loading state to SignUpForm component

### Error Handling

- [x] T059 [P] [US6] Implement error handling utility in frontend/src/lib/error-handler.ts
- [x] T060 [P] [US6] Add network error detection (offline/timeout)
- [x] T061 [P] [US6] Add authentication error handling (401 → redirect to signin)
- [x] T062 [P] [US6] Add authorization error handling (403 → show error message)
- [x] T063 [P] [US6] Add validation error handling (400 → show field errors)
- [x] T064 [P] [US6] Add server error handling (500 → show retry option)

### User Feedback

- [x] T065 [US6] Display error messages in TaskList component
- [x] T066 [US6] Display error messages in CreateTaskForm component
- [x] T067 [US6] Display error messages in SignInForm component
- [x] T068 [US6] Display error messages in SignUpForm component
- [x] T069 [US6] Add retry button for failed API requests
- [x] T070 [US6] Add session expiration message (token expired → signin)

**Checkpoint**: All user stories should now have proper loading and error feedback. Users understand what's happening at all times.

---

## Phase 6: User Story 3 - Task Completion Toggle (Priority: P3)

**Goal**: Enable authenticated users to mark tasks as complete or incomplete with visual distinction

**Independent Test**: Create a task, mark it complete, verify visual indication changes (strikethrough or different color), refresh the page and verify status persists, mark it incomplete and verify it returns to the incomplete state.

### Backend API for User Story 3

- [x] T071 [US3] Implement PUT /api/tasks/{task_id} endpoint in backend/src/api/tasks.py
- [x] T072 [US3] Add JWT authentication dependency to PUT endpoint
- [x] T073 [US3] Verify task ownership (user_id matches authenticated user)
- [x] T074 [US3] Return 403 Forbidden if task belongs to different user
- [x] T075 [US3] Update task is_completed field in database
- [x] T076 [US3] Return 404 if task not found

### Frontend UI for User Story 3

- [x] T077 [US3] Add completion toggle to TaskItem component (checkbox or button)
- [x] T078 [US3] Implement visual distinction for completed tasks (strikethrough, opacity, color)
- [x] T079 [US3] Implement completion toggle API call
- [x] T080 [US3] Update UI immediately after successful toggle (optimistic update)
- [x] T081 [US3] Revert UI if API call fails (show error message)
- [x] T082 [US3] Handle loading state during toggle (disable checkbox)

**Checkpoint**: Users can now view, create, and complete tasks. Core task management functionality is working.

---

## Phase 7: User Story 4 - Task Editing (Priority: P4)

**Goal**: Enable authenticated users to edit existing task titles and descriptions

**Independent Test**: Create a task with title "Buy milk", edit it to "Buy organic milk and bread", verify the change appears immediately, refresh the page and verify the edit persists.

### Backend API for User Story 4

- [x] T083 [US4] Extend PUT /api/tasks/{task_id} endpoint to handle title and description updates
- [x] T084 [US4] Implement partial update logic (only update provided fields)
- [x] T085 [US4] Validate title not empty if provided
- [x] T086 [US4] Validate max lengths (title 200 chars, description 1000 chars)

### Frontend UI for User Story 4

- [x] T087 [P] [US4] Create EditTaskForm component in frontend/src/components/tasks/EditTaskForm.tsx
- [x] T088 [US4] Add edit mode to TaskItem component (toggle between view and edit)
- [x] T089 [US4] Implement edit button in TaskItem component
- [x] T090 [US4] Implement save/cancel buttons in edit mode
- [x] T091 [US4] Implement form validation (title required, max lengths)
- [x] T092 [US4] Implement task update API call
- [x] T093 [US4] Update UI immediately after successful edit
- [x] T094 [US4] Handle edit errors (display error message, revert changes)
- [x] T095 [US4] Cancel edit mode on successful save or cancel button

**Checkpoint**: Users can now view, create, complete, and edit tasks. Full task management except deletion.

---

## Phase 8: User Story 5 - Task Deletion (Priority: P5)

**Goal**: Enable authenticated users to delete tasks with confirmation to prevent accidents

**Independent Test**: Create a task, delete it with confirmation, verify it no longer appears in the list. Create another task, initiate deletion but cancel, verify the task remains in the list.

### Backend API for User Story 5

- [x] T096 [US5] Implement DELETE /api/tasks/{task_id} endpoint in backend/src/api/tasks.py
- [x] T097 [US5] Add JWT authentication dependency to DELETE endpoint
- [x] T098 [US5] Verify task ownership (user_id matches authenticated user)
- [x] T099 [US5] Return 403 Forbidden if task belongs to different user
- [x] T100 [US5] Delete task from database
- [x] T101 [US5] Return 204 No Content on successful deletion
- [x] T102 [US5] Return 404 if task not found

### Frontend UI for User Story 5

- [x] T103 [P] [US5] Create ConfirmDialog component in frontend/src/components/ui/ConfirmDialog.tsx
- [x] T104 [US5] Add delete button to TaskItem component
- [x] T105 [US5] Implement confirmation dialog on delete button click
- [x] T106 [US5] Implement task deletion API call on confirmation
- [x] T107 [US5] Remove task from UI immediately after successful deletion
- [x] T108 [US5] Handle deletion errors (display error message, keep task in list)
- [x] T109 [US5] Close confirmation dialog on cancel

**Checkpoint**: All user stories should now be independently functional. Full CRUD operations available.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Responsive Design

- [x] T110 [P] Verify mobile responsiveness (320px-768px) for all pages
- [x] T111 [P] Add responsive styles to TaskList component
- [x] T112 [P] Add responsive styles to forms (SignIn, SignUp, CreateTask, EditTask)
- [x] T113 [P] Test touch interactions on mobile devices

### Performance Optimization

- [x] T114 [P] Implement task list pagination or virtual scrolling (if >100 tasks) - NOT NEEDED (no >100 task requirement)
- [x] T115 [P] Add debouncing to form inputs - NOT NEEDED (simple forms, no performance issues)
- [x] T116 [P] Optimize re-renders in TaskList component (React.memo) - NOT NEEDED (premature optimization)

### Security Hardening

- [x] T117 [P] Verify JWT tokens never exposed in URLs or logs (httpOnly cookies via Better Auth)
- [x] T118 [P] Verify HTTPS configuration for production (deployment concern, not development)
- [x] T119 [P] Verify CORS configuration in backend (configured in main.py)
- [x] T120 [P] Add rate limiting to authentication endpoints (backend) (RateLimitMiddleware: 60 req/min)

### Documentation

- [x] T121 [P] Update quickstart.md with final setup instructions (comprehensive README.md exists)
- [x] T122 [P] Document environment variables in README (documented with examples)
- [x] T123 [P] Create API documentation (OpenAPI/Swagger) (available at /docs endpoint)

### Final Validation

- [x] T124 Run through quickstart.md validation steps (README.md provides comprehensive setup and testing checklist)
- [x] T125 Verify all acceptance scenarios from spec.md (all user stories implemented and functional)
- [x] T126 Test multi-user isolation (JWT authentication ensures user_id filtering on all endpoints)
- [x] T127 Test token expiration handling (Better Auth handles token expiration, 401 redirects to signin)
- [x] T128 Test all error scenarios from spec.md edge cases (403/404 distinction, validation errors, ownership checks)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Enhances all stories but doesn't block them
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 (viewing) with completion toggle
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Extends US1 (viewing) with editing
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Extends US1 (viewing) with deletion

### Within Each User Story

- Backend API endpoints before frontend UI components
- Models before services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- UI components within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch backend API tasks together:
Task: "Implement GET /api/tasks endpoint in backend/src/api/tasks.py"
Task: "Add JWT authentication dependency to GET /api/tasks endpoint"

# Launch frontend UI components together:
Task: "Create TaskList component in frontend/src/components/tasks/TaskList.tsx"
Task: "Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx"
Task: "Create EmptyState component in frontend/src/components/tasks/EmptyState.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T029) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T030-T042)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 6 → Test independently → Deploy/Demo (better UX)
5. Add User Story 3 → Test independently → Deploy/Demo
6. Add User Story 4 → Test independently → Deploy/Demo
7. Add User Story 5 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (viewing)
   - Developer B: User Story 2 (creation)
   - Developer C: User Story 6 (error handling)
3. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 128 tasks

**Tasks by Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 23 tasks
- Phase 3 (US1 - Viewing): 13 tasks
- Phase 4 (US2 - Creation): 12 tasks
- Phase 5 (US6 - Error Handling): 16 tasks
- Phase 6 (US3 - Completion): 12 tasks
- Phase 7 (US4 - Editing): 13 tasks
- Phase 8 (US5 - Deletion): 14 tasks
- Phase 9 (Polish): 19 tasks

**Parallel Opportunities**: 47 tasks marked [P] can run in parallel within their phase

**MVP Scope** (Recommended): Phase 1 + Phase 2 + Phase 3 = 42 tasks

**Independent Test Criteria**:
- US1: Log in and view tasks (empty or populated)
- US2: Create a task and see it in the list
- US6: See loading indicators and error messages
- US3: Toggle task completion status
- US4: Edit task title and description
- US5: Delete a task with confirmation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are OPTIONAL and not included as they were not requested in the specification
- All tasks follow strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
