# Research: Frontend Application & API Integration

**Feature**: 003-frontend-api-integration
**Date**: 2026-01-11
**Purpose**: Document research findings, best practices, and architectural decisions for Next.js frontend implementation

## Research Questions

### 1. Next.js 16 App Router Architecture
**Question**: What are the best practices for organizing a Next.js 16 App Router application with authentication?

**Decision**: Use App Router with route groups for authentication pages and middleware for route protection

**Rationale**:
- App Router is the recommended approach for Next.js 16+ (Pages Router is legacy)
- Route groups `(auth)` allow logical grouping without affecting URL structure
- Middleware provides centralized route protection before page rendering
- Server Components by default reduce client-side JavaScript bundle size
- Client Components only for interactive elements (forms, buttons with state)

**Alternatives Considered**:
- Pages Router: Rejected - legacy approach, not recommended for new projects
- Client-side only routing: Rejected - misses SSR benefits and SEO advantages
- No route groups: Rejected - less organized, harder to apply layout patterns

**Implementation Pattern**:
```typescript
// app/layout.tsx - Root layout with global providers
// app/page.tsx - Public landing page
// app/signin/page.tsx - Sign in page (public)
// app/signup/page.tsx - Sign up page (public)
// app/tasks/page.tsx - Task dashboard (protected)
// middleware.ts - Route protection logic
```

---

### 2. JWT Token Storage Strategy
**Question**: Where should JWT tokens be stored in the browser for maximum security?

**Decision**: Use httpOnly cookies set by the backend (already implemented)

**Rationale**:
- httpOnly cookies cannot be accessed by JavaScript, preventing XSS attacks
- Backend already sets `auth-token` cookie with httpOnly, secure, and samesite flags
- Cookies are automatically included in requests with `credentials: 'include'`
- No need for manual token management in frontend code
- Tokens are automatically sent with every request to the same domain

**Alternatives Considered**:
- localStorage: Rejected - vulnerable to XSS attacks, tokens accessible to any JavaScript
- sessionStorage: Rejected - same XSS vulnerability as localStorage
- Memory only (React state): Rejected - lost on page refresh, poor UX
- Authorization header with localStorage: Rejected - requires manual token management and vulnerable to XSS

**Implementation Pattern**:
```typescript
// Backend sets cookie (already implemented):
response.set_cookie(
  key="auth-token",
  value=token,
  httponly=True,
  secure=True,
  samesite="lax",
  max_age=7 * 24 * 60 * 60
)

// Frontend includes cookie automatically:
fetch(url, {
  credentials: 'include'  // Includes httpOnly cookies
})
```

---

### 3. API Client Architecture
**Question**: How should the frontend organize API calls to ensure consistent JWT token handling and error management?

**Decision**: Create a centralized API client utility with automatic token handling and error transformation

**Rationale**:
- Single source of truth for API base URL and request configuration
- Automatic inclusion of credentials for httpOnly cookie transmission
- Consistent error handling across all API calls
- Easy to add interceptors for logging, retry logic, or token refresh
- Type-safe request/response handling with TypeScript

**Alternatives Considered**:
- Direct fetch calls in components: Rejected - duplicated error handling, inconsistent patterns
- Third-party library (axios, ky): Rejected - adds dependency, fetch API is sufficient
- React Query/SWR: Considered for future enhancement, not required for MVP

**Implementation Pattern**:
```typescript
// lib/api-client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include', // Include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error.detail || 'Request failed');
  }

  return response.json();
}

// Usage in components:
const tasks = await apiRequest<Task[]>('/api/tasks');
```

---

### 4. Error Handling Strategy
**Question**: How should different types of errors (network, auth, validation, server) be handled and displayed to users?

**Decision**: Implement error categorization with user-friendly messages and retry mechanisms

**Rationale**:
- Different error types require different user actions (retry vs re-authenticate vs fix input)
- Generic error messages prevent information leakage
- Retry buttons for transient errors improve UX
- Field-level validation errors guide users to fix specific issues
- Consistent error display across all components

**Alternatives Considered**:
- Show raw API errors: Rejected - exposes technical details, poor UX
- Single generic error message: Rejected - doesn't guide users on how to fix issues
- Toast notifications only: Rejected - errors may be missed, no persistent display

**Implementation Pattern**:
```typescript
// lib/error-handler.ts
export function handleApiError(error: unknown): ErrorInfo {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      message: 'Unable to connect. Please check your internet connection.',
      shouldRetry: true,
      type: 'network'
    };
  }

  if (error.status === 401) {
    return {
      message: 'Your session has expired. Please sign in again.',
      shouldRetry: false,
      type: 'auth',
      redirect: '/signin'
    };
  }

  if (error.status === 400) {
    return {
      message: error.detail || 'Invalid input. Please check your data.',
      fieldErrors: error.errors,
      shouldRetry: false,
      type: 'validation'
    };
  }

  if (error.status >= 500) {
    return {
      message: 'Something went wrong on our end. Please try again.',
      shouldRetry: true,
      type: 'server'
    };
  }

  return {
    message: 'An unexpected error occurred.',
    shouldRetry: false,
    type: 'unknown'
  };
}
```

---

### 5. Optimistic UI Updates
**Question**: How should the UI handle user actions before receiving server confirmation?

**Decision**: Implement optimistic updates with automatic reversion on failure

**Rationale**:
- Immediate feedback improves perceived performance
- Users don't wait for network round-trip for every action
- Automatic reversion maintains data consistency on failure
- Clear error messages explain why action failed
- Follows modern web application patterns (Gmail, Trello, etc.)

**Alternatives Considered**:
- Wait for server response: Rejected - poor UX, feels slow
- Optimistic only, no reversion: Rejected - data inconsistency on failure
- Disable UI during request: Considered as fallback for critical operations

**Implementation Pattern**:
```typescript
// components/tasks/TaskItem.tsx
const [isCompleted, setIsCompleted] = useState(task.completed);

const handleToggleComplete = async () => {
  // Optimistic update
  const previousState = isCompleted;
  setIsCompleted(!isCompleted);

  try {
    await apiRequest(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !isCompleted })
    });
  } catch (error) {
    // Revert on failure
    setIsCompleted(previousState);
    showError(handleApiError(error));
  }
};
```

---

### 6. Form Validation Strategy
**Question**: Should validation be client-side only, server-side only, or both?

**Decision**: Implement both client-side and server-side validation

**Rationale**:
- Client-side validation provides immediate feedback without network round-trip
- Server-side validation is security requirement (never trust client)
- Backend already implements validation (Pydantic models)
- Client-side validation matches backend rules for consistency
- Reduces unnecessary API calls for invalid data

**Alternatives Considered**:
- Client-side only: Rejected - security vulnerability, can be bypassed
- Server-side only: Rejected - poor UX, requires network round-trip for every validation error
- Different validation rules: Rejected - confusing UX, inconsistent behavior

**Implementation Pattern**:
```typescript
// Client-side validation (matches backend rules)
const validatePassword = (pwd: string): string | null => {
  if (pwd.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(pwd)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(pwd)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/\d/.test(pwd)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Server-side validation (already implemented in backend)
class SignupRequest(BaseModel):
    email: EmailStr = Field(..., max_length=255)
    password: str = Field(..., min_length=8)

    @validator("password")
    def validate_password_strength(cls, v):
        # Same rules as client-side
```

---

### 7. Component Architecture
**Question**: How should components be organized for reusability and maintainability?

**Decision**: Use atomic design principles with three component tiers: ui (atoms), feature-specific (molecules), and page-level (organisms)

**Rationale**:
- Clear separation between generic UI components and feature-specific logic
- Reusable UI components (Button, Input) can be used across features
- Feature-specific components (TaskItem, SignInForm) encapsulate business logic
- Page-level components compose feature components into complete views
- Easy to test components in isolation

**Alternatives Considered**:
- Flat component structure: Rejected - hard to find components, unclear dependencies
- Feature folders with duplicated UI: Rejected - code duplication, inconsistent styling
- Single component per file: Accepted - easier to navigate and test

**Implementation Pattern**:
```
components/
├── ui/                    # Generic, reusable UI components (atoms)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorMessage.tsx
├── auth/                  # Authentication feature components (molecules)
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   └── AuthProvider.tsx
└── tasks/                 # Task management feature components (molecules)
    ├── TaskList.tsx
    ├── TaskItem.tsx
    ├── CreateTaskForm.tsx
    ├── EditTaskForm.tsx
    └── DeleteTaskDialog.tsx
```

---

## Technology Stack Decisions

### Frontend Framework
- **Choice**: Next.js 16+ with App Router
- **Rationale**: Modern React framework with SSR, routing, and optimization built-in
- **Version**: 16.0.0 or later (App Router stable)

### Styling
- **Choice**: Tailwind CSS
- **Rationale**: Utility-first CSS framework, rapid development, consistent design system
- **Version**: 3.4.0 or later

### State Management
- **Choice**: React hooks (useState, useEffect, useContext)
- **Rationale**: Sufficient for application complexity, no need for Redux/MobX
- **Future**: Consider React Query/SWR for server state caching if needed

### Type Safety
- **Choice**: TypeScript with strict mode
- **Rationale**: Type safety prevents runtime errors, better IDE support, self-documenting code
- **Version**: 5.0.0 or later

### Testing
- **Choice**: Jest + React Testing Library
- **Rationale**: Industry standard for React testing, component-focused, user-centric assertions
- **Version**: Jest 29+, RTL 14+

---

## Security Considerations

### Authentication Flow
1. User submits credentials on signin/signup page
2. Backend validates credentials and issues JWT token
3. Backend sets httpOnly cookie with token
4. Frontend redirects to protected route (/tasks)
5. Middleware checks for auth-token cookie
6. If missing, redirect to /signin
7. If present, allow access to protected route
8. All API requests automatically include cookie

### CORS Configuration
- Backend must allow credentials from frontend origin
- Frontend must use `credentials: 'include'` in all fetch requests
- Backend already configured with CORS middleware

### XSS Prevention
- httpOnly cookies prevent JavaScript access to tokens
- Input sanitization on backend (Pydantic validation)
- React automatically escapes rendered content

### CSRF Protection
- SameSite=lax cookie attribute prevents CSRF attacks
- Backend already implements this in cookie configuration

---

## Performance Optimization

### Code Splitting
- Next.js automatically code-splits by route
- Dynamic imports for heavy components if needed
- Server Components reduce client-side JavaScript

### Image Optimization
- Use Next.js Image component for optimized loading
- Not required for MVP (no images in spec)

### API Request Optimization
- Implement loading states to prevent duplicate requests
- Disable buttons during API calls
- Consider request deduplication for future enhancement

### Bundle Size
- Server Components by default minimize client bundle
- Only use Client Components for interactive elements
- Tree-shaking removes unused code automatically

---

## Deployment Considerations

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- Set in `.env.local` for development
- Set in deployment platform for production

### Build Process
- `npm run build`: Production build with optimization
- `npm run start`: Production server
- `npm run dev`: Development server with hot reload

### Backend Integration
- Development: Backend on localhost:8001, Frontend on localhost:3000
- Production: Both behind reverse proxy or separate domains with CORS

---

## Summary

All research questions resolved. Key decisions:
1. ✅ Next.js 16 App Router with route groups and middleware
2. ✅ httpOnly cookies for JWT storage (already implemented by backend)
3. ✅ Centralized API client with automatic credential inclusion
4. ✅ Categorized error handling with user-friendly messages
5. ✅ Optimistic UI updates with automatic reversion
6. ✅ Client-side + server-side validation (defense in depth)
7. ✅ Atomic design component architecture (ui/feature/page tiers)

No blockers identified. Ready to proceed to Phase 1: Design & Contracts.
