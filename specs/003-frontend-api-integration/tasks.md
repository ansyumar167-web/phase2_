# Tasks: Frontend Application & API Integration

**Input**: Design documents from `/specs/003-frontend-api-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` for all source code
- **Backend**: Already implemented in `backend/src/` (feature 002-auth-user-identity)
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration

- [x] T001 Verify Next.js 16+ is installed in frontend/ directory
- [x] T002 Create frontend/.env.local with NEXT_PUBLIC_API_URL=http://localhost:8001
- [x] T003 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [x] T004 [P] Verify Tailwind CSS configuration in frontend/tailwind.config.js
- [x] T005 [P] Create frontend/src/types/ directory for TypeScript definitions
- [x] T006 [P] Create frontend/src/lib/ directory for utilities
- [x] T007 [P] Create frontend/src/components/ directory structure (ui/, auth/, tasks/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [x] T008 [P] Create User and AuthResponse types in frontend/src/types/user.ts
- [x] T009 [P] Create Task, CreateTaskRequest, UpdateTaskRequest types in frontend/src/types/task.ts
- [x] T010 [P] Create Session and AuthContextValue types in frontend/src/types/session.ts
- [x] T011 [P] Create ApiError and ErrorInfo types in frontend/src/types/error.ts

### API Client & Error Handling

- [x] T012 Create centralized API client with credentials: 'include' in frontend/src/lib/api-client.ts
- [x] T013 Create error handler with categorization (network, auth, validation, server) in frontend/src/lib/error-handler.ts

### UI Components (Atoms)

- [x] T014 [P] Create Button component with loading state in frontend/src/components/ui/Button.tsx
- [x] T015 [P] Create Input component with error display in frontend/src/components/ui/Input.tsx
- [x] T016 [P] Create LoadingSpinner component in frontend/src/components/ui/LoadingSpinner.tsx
- [x] T017 [P] Create ErrorMessage component with retry button in frontend/src/components/ui/ErrorMessage.tsx

### Route Protection

- [x] T018 Create middleware for route protection (redirect unauthenticated users) in frontend/src/middleware.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + 2 - Authentication & View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can sign up, sign in, sign out, and view their personal task list. This forms the minimum viable product.

**Independent Test**: Create account → Sign in → View empty task dashboard → Sign out → Sign in again → Verify session persists

### User Story 1: Authentication Flow

- [x] T019 [P] [US1] Create AuthProvider with React Context in frontend/src/components/auth/AuthProvider.tsx
- [x] T020 [P] [US1] Create auth utility functions (signUp, signIn, signOut) in frontend/src/lib/auth.ts
- [x] T021 [US1] Create SignUpForm with validation (email format, password strength) in frontend/src/components/auth/SignUpForm.tsx
- [x] T022 [US1] Create SignInForm with validation in frontend/src/components/auth/SignInForm.tsx
- [x] T023 [P] [US1] Create signup page in frontend/src/app/signup/page.tsx
- [x] T024 [P] [US1] Create signin page in frontend/src/app/signin/page.tsx
- [x] T025 [US1] Update root layout to wrap with AuthProvider in frontend/src/app/layout.tsx

### User Story 2: View Personal Task List

- [x] T026 [P] [US2] Create TaskList component to fetch and display tasks in frontend/src/components/tasks/TaskList.tsx
- [x] T027 [P] [US2] Create TaskItem component to display individual task in frontend/src/components/tasks/TaskItem.tsx
- [x] T028 [US2] Create tasks dashboard page with TaskList in frontend/src/app/tasks/page.tsx
- [x] T029 [US2] Add empty state message for no tasks in TaskList component
- [x] T030 [US2] Add signout button to tasks page header

### Integration & Landing Page

- [x] T031 Create landing page with navigation to signin/signup in frontend/src/app/page.tsx
- [x] T032 Test authentication flow: signup → signin → view dashboard → signout
- [x] T033 Test user isolation: User A creates account → User B creates account → Verify User B sees empty list

**Checkpoint**: MVP complete - users can authenticate and view their task list

---

## Phase 4: User Story 7 - Error and Loading State Handling (Priority: P2)

**Goal**: All operations show clear loading indicators and user-friendly error messages

**Independent Test**: Simulate slow network (browser throttling) → Verify loading spinners appear. Disconnect backend → Verify error messages with retry buttons appear.

- [x] T034 [P] [US7] Add loading state to SignUpForm (disable button, show spinner)
- [x] T035 [P] [US7] Add loading state to SignInForm (disable button, show spinner)
- [x] T036 [P] [US7] Add error handling to SignUpForm (field errors, retry button)
- [x] T037 [P] [US7] Add error handling to SignInForm (generic error message)
- [x] T038 [US7] Add loading state to TaskList (show spinner while fetching)
- [x] T039 [US7] Add error handling to TaskList (network error, session expired)
- [x] T040 [US7] Test session expiration: Wait for token to expire → Attempt action → Verify redirect to signin

**Checkpoint**: All existing features now have proper loading and error states

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P2)

**Goal**: Users can create new tasks with title and optional description

**Independent Test**: Sign in → Fill create task form → Submit → Verify task appears in list immediately → Refresh page → Verify task persists

- [x] T041 [P] [US3] Create CreateTaskForm component with validation in frontend/src/components/tasks/CreateTaskForm.tsx
- [x] T042 [US3] Add character counter for title (max 200) and description (max 1000) to CreateTaskForm
- [x] T043 [US3] Integrate CreateTaskForm into tasks dashboard page
- [x] T044 [US3] Add loading state to CreateTaskForm (disable button during submission)
- [x] T045 [US3] Add error handling to CreateTaskForm (validation errors, network errors)
- [x] T046 [US3] Clear form inputs after successful task creation
- [x] T047 [US3] Test task creation: Create task with title only → Verify appears in list
- [x] T048 [US3] Test task creation: Create task with title and description → Verify both saved
- [x] T049 [US3] Test validation: Submit empty title → Verify error message
- [x] T050 [US3] Test validation: Submit title over 200 chars → Verify error message

**Checkpoint**: Users can now create tasks in addition to viewing them

---

## Phase 6: User Story 4 - Mark Tasks Complete/Incomplete (Priority: P3)

**Goal**: Users can toggle task completion status with visual feedback

**Independent Test**: Create task → Click completion checkbox → Verify strikethrough applied → Refresh page → Verify status persists → Click again → Verify strikethrough removed

- [x] T051 [US4] Add completion checkbox to TaskItem component
- [x] T052 [US4] Implement optimistic update for completion toggle in TaskItem
- [x] T053 [US4] Add visual indication for completed tasks (strikethrough, reduced opacity)
- [x] T054 [US4] Add error handling for completion toggle (revert on failure)
- [x] T055 [US4] Add loading state during completion toggle (disable checkbox)
- [x] T056 [US4] Test completion toggle: Mark task complete → Verify visual change
- [x] T057 [US4] Test completion toggle: Mark task incomplete → Verify visual change removed
- [x] T058 [US4] Test persistence: Toggle completion → Refresh page → Verify status persists
- [x] T059 [US4] Test error handling: Simulate API failure → Verify UI reverts to previous state

**Checkpoint**: Users can now track task completion

---

## Phase 7: User Story 5 - Edit Existing Tasks (Priority: P4)

**Goal**: Users can edit task titles and descriptions

**Independent Test**: Create task → Click edit button → Modify title/description → Save → Verify changes appear immediately → Refresh page → Verify changes persist

- [x] T060 [P] [US5] Create EditTaskForm component with validation in frontend/src/components/tasks/EditTaskForm.tsx
- [x] T061 [US5] Add edit mode toggle to TaskItem component
- [x] T062 [US5] Pre-populate EditTaskForm with existing task data
- [x] T063 [US5] Add character counter for title and description to EditTaskForm
- [x] T064 [US5] Implement save functionality in EditTaskForm
- [x] T065 [US5] Implement cancel functionality (discard changes, return to view mode)
- [x] T066 [US5] Add loading state to EditTaskForm (disable buttons during save)
- [x] T067 [US5] Add error handling to EditTaskForm (validation errors, network errors)
- [x] T068 [US5] Test edit: Modify title → Save → Verify changes appear
- [x] T069 [US5] Test edit: Modify description → Save → Verify changes appear
- [x] T070 [US5] Test cancel: Modify title → Cancel → Verify changes discarded
- [x] T071 [US5] Test validation: Save empty title → Verify error message

**Checkpoint**: Users can now edit existing tasks

---

## Phase 8: User Story 6 - Delete Tasks (Priority: P5)

**Goal**: Users can delete tasks with confirmation dialog

**Independent Test**: Create task → Click delete button → Verify confirmation dialog appears → Confirm → Verify task removed from list → Refresh page → Verify task doesn't reappear

- [x] T072 [P] [US6] Create DeleteTaskDialog component with confirmation in frontend/src/components/tasks/DeleteTaskDialog.tsx
- [x] T073 [US6] Add delete button to TaskItem component
- [x] T074 [US6] Integrate DeleteTaskDialog with TaskItem
- [x] T075 [US6] Implement delete functionality (remove from list on success)
- [x] T076 [US6] Add loading state to DeleteTaskDialog (disable buttons during deletion)
- [x] T077 [US6] Add error handling to DeleteTaskDialog (network errors, keep task on failure)
- [x] T078 [US6] Test delete: Click delete → Confirm → Verify task removed
- [x] T079 [US6] Test cancel: Click delete → Cancel → Verify task remains
- [x] T080 [US6] Test persistence: Delete task → Refresh page → Verify task doesn't reappear
- [x] T081 [US6] Test error handling: Simulate API failure → Verify task remains in list

**Checkpoint**: Users can now delete tasks

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and improvements

- [x] T082 [P] Add responsive design testing (320px, 768px, 1920px widths)
- [x] T083 [P] Verify all forms prevent duplicate submissions (button disabled during API calls)
- [x] T084 [P] Test rapid successive actions (click create multiple times → verify only one task created)
- [x] T085 Test complete user journey: Signup → Create 3 tasks → Mark 1 complete → Edit 1 task → Delete 1 task → Signout → Signin → Verify 2 tasks remain with correct states
- [x] T086 Test concurrent edits: Open task in two tabs → Edit in tab 1 → Refresh tab 2 → Verify changes appear
- [x] T087 Test cross-user isolation: User A creates tasks → User B signs in → Verify User B cannot see User A's tasks
- [x] T088 [P] Verify all error scenarios display user-friendly messages (no technical jargon)
- [x] T089 [P] Verify all loading states are visible for operations >500ms
- [x] T090 Run quickstart.md validation checklist (all 16 test scenarios)
- [x] T091 Code cleanup: Remove console.logs, unused imports, commented code
- [x] T092 Verify TypeScript compilation with no errors
- [x] T093 Final integration test: Complete all 7 user story acceptance scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories 1+2 (Phase 3)**: Depends on Foundational phase - MVP
- **User Story 7 (Phase 4)**: Depends on Phase 3 - Enhances existing features
- **User Story 3 (Phase 5)**: Depends on Phases 3+4 - Adds create functionality
- **User Story 4 (Phase 6)**: Depends on Phases 3+4 - Adds completion toggle
- **User Story 5 (Phase 7)**: Depends on Phases 3+4 - Adds edit functionality
- **User Story 6 (Phase 8)**: Depends on Phases 3+4 - Adds delete functionality
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Authentication - No dependencies on other stories
- **User Story 2 (P1)**: View Tasks - Depends on US1 (must be authenticated to view)
- **User Story 7 (P2)**: Error/Loading - Enhances US1+US2, required before US3-US6
- **User Story 3 (P2)**: Create Tasks - Depends on US1+US2+US7
- **User Story 4 (P3)**: Toggle Completion - Depends on US1+US2+US7 (needs tasks to toggle)
- **User Story 5 (P4)**: Edit Tasks - Depends on US1+US2+US7 (needs tasks to edit)
- **User Story 6 (P5)**: Delete Tasks - Depends on US1+US2+US7 (needs tasks to delete)

### Within Each Phase

- Type definitions (T008-T011) can all run in parallel
- UI components (T014-T017) can all run in parallel
- Auth components (T019-T022) can run in parallel after AuthProvider
- Pages (T023-T024) can run in parallel after forms
- Task components (T026-T027) can run in parallel
- Error/loading enhancements (T034-T037) can run in parallel

### Parallel Opportunities

**Phase 2 Foundational** (after T007):
- Launch T008, T009, T010, T011 together (type definitions)
- Launch T014, T015, T016, T017 together (UI components)

**Phase 3 User Story 1** (after T020):
- Launch T021, T022 together (auth forms)
- Launch T023, T024 together (auth pages)

**Phase 3 User Story 2** (after T025):
- Launch T026, T027 together (task components)

**Phase 4 User Story 7**:
- Launch T034, T035, T036, T037 together (auth error/loading)

**Phase 9 Polish**:
- Launch T082, T083, T084, T088, T089 together (validation tasks)

---

## Parallel Example: Foundational Phase

```bash
# Launch all type definitions together:
Task: "Create User and AuthResponse types in frontend/src/types/user.ts"
Task: "Create Task types in frontend/src/types/task.ts"
Task: "Create Session types in frontend/src/types/session.ts"
Task: "Create Error types in frontend/src/types/error.ts"

# Then launch all UI components together:
Task: "Create Button component in frontend/src/components/ui/Button.tsx"
Task: "Create Input component in frontend/src/components/ui/Input.tsx"
Task: "Create LoadingSpinner component in frontend/src/components/ui/LoadingSpinner.tsx"
Task: "Create ErrorMessage component in frontend/src/components/ui/ErrorMessage.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T018) - CRITICAL
3. Complete Phase 3: User Stories 1+2 (T019-T033)
4. **STOP and VALIDATE**: Test authentication and task viewing independently
5. Deploy/demo MVP if ready

**MVP Scope**: 33 tasks (T001-T033)
**MVP Value**: Users can sign up, sign in, and view their personal task list

### Incremental Delivery

1. **Foundation** (T001-T018) → Infrastructure ready
2. **MVP** (T019-T033) → Authentication + View Tasks → Deploy/Demo
3. **Enhanced UX** (T034-T040) → Error/Loading States → Deploy/Demo
4. **Create** (T041-T050) → Add task creation → Deploy/Demo
5. **Complete** (T051-T059) → Add completion toggle → Deploy/Demo
6. **Edit** (T060-T071) → Add editing → Deploy/Demo
7. **Delete** (T072-T081) → Add deletion → Deploy/Demo
8. **Polish** (T082-T093) → Final validation → Deploy/Demo

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T018)
2. **Once Foundational is done**:
   - Developer A: User Stories 1+2 (T019-T033)
   - Developer B: Can start on UI polish or wait
3. **After MVP**:
   - Developer A: User Story 7 (T034-T040)
   - Developer B: User Story 3 (T041-T050)
4. **Continue in parallel**:
   - Developer A: User Story 4 (T051-T059)
   - Developer B: User Story 5 (T060-T071)
   - Developer C: User Story 6 (T072-T081)

---

## Agent Assignments

**Specialized agents to use for implementation**:

- **Phase 2 (T008-T018)**: General implementation (types, utilities, basic components)
- **Phase 3 (T019-T033)**:
  - T019-T025: Use `secure-auth-handler` agent for authentication components
  - T026-T033: Use `nextjs-ui-builder` agent for task viewing pages
- **Phase 4-8 (T034-T081)**: Use `nextjs-ui-builder` agent for all task management features
- **Phase 9 (T082-T093)**: General testing and validation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Backend API already implemented (feature 002-auth-user-identity)
- No tests included (not requested in specification)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = 33 tasks (T001-T033) for authentication + view tasks
- Total tasks = 93 (full feature implementation)
