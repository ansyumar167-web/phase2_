# Quickstart Guide: Frontend Application & API Integration

**Feature**: 003-frontend-api-integration
**Date**: 2026-01-11
**Purpose**: Step-by-step guide for implementing the Next.js frontend

## Prerequisites

- Backend API running on http://localhost:8001 (feature 002-auth-user-identity)
- Node.js 18+ installed
- npm or yarn package manager
- Git branch: `003-frontend-api-integration`

## Implementation Phases

### Phase 1: Project Setup & Configuration

**Goal**: Initialize Next.js project with TypeScript and Tailwind CSS

**Steps**:
1. Navigate to frontend directory
2. Verify Next.js 16+ is installed
3. Configure TypeScript with strict mode
4. Set up Tailwind CSS
5. Create environment variables file

**Files to Create/Modify**:
- `frontend/.env.local` - Environment variables
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tailwind.config.js` - Tailwind configuration

**Environment Variables**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

**Acceptance Criteria**:
- [ ] Next.js dev server starts without errors
- [ ] TypeScript compilation works
- [ ] Tailwind CSS classes are applied

---

### Phase 2: Type Definitions

**Goal**: Create TypeScript types for all data models

**Steps**:
1. Create `types/` directory
2. Define User and AuthResponse types
3. Define Task and request types
4. Define Session and AuthContext types
5. Define Error types

**Files to Create**:
- `frontend/src/types/user.ts`
- `frontend/src/types/task.ts`
- `frontend/src/types/session.ts`
- `frontend/src/types/error.ts`

**Reference**: See `data-model.md` for complete type definitions

**Acceptance Criteria**:
- [ ] All types compile without errors
- [ ] Types match backend API responses
- [ ] Null safety properly handled

---

### Phase 3: API Client & Error Handling

**Goal**: Create centralized API client with automatic JWT handling

**Steps**:
1. Create `lib/` directory
2. Implement API client utility
3. Implement error handler utility
4. Add request/response interceptors

**Files to Create**:
- `frontend/src/lib/api-client.ts`
- `frontend/src/lib/error-handler.ts`

**Key Features**:
- Automatic `credentials: 'include'` for httpOnly cookies
- Consistent error transformation
- Type-safe request/response handling

**Reference**: See `research.md` section 3 for implementation pattern

**Acceptance Criteria**:
- [ ] API client successfully calls backend endpoints
- [ ] Errors are properly categorized and transformed
- [ ] JWT cookie is automatically included in requests

---

### Phase 4: UI Components (Atoms)

**Goal**: Create reusable UI components

**Steps**:
1. Create `components/ui/` directory
2. Implement Button component with loading state
3. Implement Input component with error display
4. Implement LoadingSpinner component
5. Implement ErrorMessage component with retry

**Files to Create**:
- `frontend/src/components/ui/Button.tsx`
- `frontend/src/components/ui/Input.tsx`
- `frontend/src/components/ui/LoadingSpinner.tsx`
- `frontend/src/components/ui/ErrorMessage.tsx`

**Design Requirements**:
- Consistent styling with Tailwind CSS
- Accessible (ARIA labels, keyboard navigation)
- Responsive (mobile-first)

**Acceptance Criteria**:
- [ ] Components render correctly
- [ ] Loading states work properly
- [ ] Error messages display with retry buttons
- [ ] Components are accessible

---

### Phase 5: Authentication Components

**Goal**: Implement authentication forms and context

**Agent**: Use `secure-auth-handler` agent for this phase

**Steps**:
1. Create `components/auth/` directory
2. Implement AuthProvider with React Context
3. Implement SignUpForm with validation
4. Implement SignInForm with validation
5. Create auth utility functions

**Files to Create**:
- `frontend/src/components/auth/AuthProvider.tsx`
- `frontend/src/components/auth/SignUpForm.tsx`
- `frontend/src/components/auth/SignInForm.tsx`
- `frontend/src/lib/auth.ts`

**Validation Rules** (must match backend):
- Email: Valid format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number

**Reference**: See `contracts/auth-api.md` for API endpoints

**Acceptance Criteria**:
- [ ] SignUp form validates input correctly
- [ ] SignIn form submits credentials
- [ ] JWT token is stored in httpOnly cookie
- [ ] AuthContext provides session state
- [ ] Error messages are user-friendly

---

### Phase 6: Authentication Pages & Routing

**Goal**: Create authentication pages and route protection

**Agent**: Use `nextjs-ui-builder` agent for this phase

**Steps**:
1. Create signin page
2. Create signup page
3. Implement middleware for route protection
4. Add redirects for authenticated/unauthenticated users

**Files to Create**:
- `frontend/src/app/signin/page.tsx`
- `frontend/src/app/signup/page.tsx`
- `frontend/src/middleware.ts`

**Route Protection Logic**:
- Unauthenticated users accessing `/tasks` → redirect to `/signin`
- Authenticated users accessing `/signin` or `/signup` → redirect to `/tasks`

**Reference**: See `research.md` section 1 for routing patterns

**Acceptance Criteria**:
- [ ] Signin page renders correctly
- [ ] Signup page renders correctly
- [ ] Middleware protects `/tasks` route
- [ ] Redirects work properly
- [ ] Responsive design (320px-1920px)

---

### Phase 7: Task Management Components

**Goal**: Implement task CRUD components

**Agent**: Use `nextjs-ui-builder` agent for this phase

**Steps**:
1. Create `components/tasks/` directory
2. Implement TaskList component
3. Implement TaskItem component with completion toggle
4. Implement CreateTaskForm component
5. Implement EditTaskForm component
6. Implement DeleteTaskDialog component

**Files to Create**:
- `frontend/src/components/tasks/TaskList.tsx`
- `frontend/src/components/tasks/TaskItem.tsx`
- `frontend/src/components/tasks/CreateTaskForm.tsx`
- `frontend/src/components/tasks/EditTaskForm.tsx`
- `frontend/src/components/tasks/DeleteTaskDialog.tsx`

**Key Features**:
- Optimistic updates for completion toggle
- Character counters for title (200) and description (1000)
- Confirmation dialog for deletion
- Loading states during API calls
- Error handling with retry

**Reference**: See `contracts/tasks-api.md` for API endpoints

**Acceptance Criteria**:
- [ ] TaskList fetches and displays tasks
- [ ] TaskItem shows task details correctly
- [ ] CreateTaskForm validates and submits
- [ ] EditTaskForm pre-populates and updates
- [ ] DeleteTaskDialog confirms before deletion
- [ ] Optimistic updates work correctly
- [ ] All error scenarios handled

---

### Phase 8: Task Dashboard Page

**Goal**: Create protected task dashboard page

**Agent**: Use `nextjs-ui-builder` agent for this phase

**Steps**:
1. Create tasks page
2. Integrate TaskList component
3. Integrate CreateTaskForm component
4. Add empty state for no tasks
5. Add signout functionality

**Files to Create**:
- `frontend/src/app/tasks/page.tsx`

**Layout Requirements**:
- Header with user email and signout button
- Create task form at top
- Task list below
- Empty state message if no tasks
- Responsive layout

**Acceptance Criteria**:
- [ ] Page is protected (requires authentication)
- [ ] Tasks load on page mount
- [ ] Create form adds tasks to list
- [ ] Empty state displays correctly
- [ ] Signout redirects to signin page
- [ ] Responsive design works

---

### Phase 9: Root Layout & Landing Page

**Goal**: Create root layout and landing page

**Agent**: Use `nextjs-ui-builder` agent for this phase

**Steps**:
1. Update root layout with AuthProvider
2. Create landing page with navigation
3. Add global styles

**Files to Create/Modify**:
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`

**Landing Page Content**:
- Hero section with app description
- Links to signin and signup pages
- Redirect to tasks if already authenticated

**Acceptance Criteria**:
- [ ] Root layout wraps all pages
- [ ] AuthProvider is available globally
- [ ] Landing page renders correctly
- [ ] Navigation links work
- [ ] Authenticated users redirected to tasks

---

### Phase 10: Testing & Validation

**Goal**: Test all user flows and edge cases

**Steps**:
1. Test signup flow
2. Test signin flow
3. Test task CRUD operations
4. Test error scenarios
5. Test responsive design
6. Test session expiration

**Test Scenarios**:
- [ ] New user can sign up and access dashboard
- [ ] Existing user can sign in
- [ ] User can create task with title only
- [ ] User can create task with title and description
- [ ] User can toggle task completion
- [ ] User can edit task
- [ ] User can delete task with confirmation
- [ ] Invalid email shows error
- [ ] Weak password shows error
- [ ] Empty title shows error
- [ ] Title over 200 chars shows error
- [ ] Network error shows retry button
- [ ] Session expiration redirects to signin
- [ ] User A cannot see User B's tasks
- [ ] Mobile layout works (320px width)
- [ ] Desktop layout works (1920px width)

**Acceptance Criteria**:
- [ ] All 7 user stories pass acceptance scenarios
- [ ] All 20 functional requirements satisfied
- [ ] All 15 success criteria met
- [ ] No console errors
- [ ] No TypeScript errors

---

## Development Workflow

### Starting Development Servers

**Backend** (Terminal 1):
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload --port 8001
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

### Testing Flow

1. **Manual Testing**:
   - Open http://localhost:3000
   - Test signup → signin → task CRUD → signout flow
   - Test error scenarios (invalid input, network errors)
   - Test responsive design (browser dev tools)

2. **Component Testing** (future):
   - Jest + React Testing Library
   - Test individual components in isolation

3. **Integration Testing** (future):
   - Test complete user flows
   - Mock API responses

---

## Common Issues & Solutions

### Issue: CORS Error
**Symptom**: "Access to fetch has been blocked by CORS policy"
**Solution**: Verify backend CORS middleware allows frontend origin and credentials

### Issue: 401 Unauthorized
**Symptom**: All API requests return 401
**Solution**: Check that `credentials: 'include'` is set in fetch requests

### Issue: Cookie Not Set
**Symptom**: JWT token not stored after signin/signup
**Solution**: Verify backend sets httpOnly cookie and frontend uses `credentials: 'include'`

### Issue: Session Expired
**Symptom**: Redirected to signin after some time
**Solution**: Expected behavior - JWT tokens expire after 7 days

### Issue: User Sees Other User's Tasks
**Symptom**: Tasks from different users visible
**Solution**: Backend bug - verify user_id filtering in backend queries

---

## Next Steps After Implementation

1. Run `/sp.tasks` to generate detailed task breakdown
2. Run `/sp.implement` to execute tasks with agents
3. Test all user flows manually
4. Create PHR for planning session
5. Suggest ADRs for significant decisions

---

## Reference Documents

- **Specification**: `specs/003-frontend-api-integration/spec.md`
- **Research**: `specs/003-frontend-api-integration/research.md`
- **Data Model**: `specs/003-frontend-api-integration/data-model.md`
- **API Contracts**: `specs/003-frontend-api-integration/contracts/`
- **Constitution**: `.specify/memory/constitution.md`
