# Quickstart Guide: Frontend Application & API Integration

**Feature**: Frontend Application & API Integration with Authentication
**Branch**: 002-frontend-api-integration
**Last Updated**: 2026-01-10

## Overview

This guide helps developers set up and run the Todo application frontend with authentication locally. Follow these steps to get the authentication system working with the backend API.

## Prerequisites

Before starting, ensure you have:

- **Node.js**: 18.x or higher
- **npm** or **yarn**: Latest version
- **Python**: 3.11 or higher (for backend)
- **PostgreSQL**: Neon database connection string
- **Git**: For version control

## Architecture Overview

```
┌─────────────────┐         JWT Token          ┌─────────────────┐
│   Next.js 16    │◄──────────────────────────►│   FastAPI       │
│   Frontend      │    Authorization Header     │   Backend       │
│  (Port 3000)    │                             │  (Port 8000)    │
└────────┬────────┘                             └────────┬────────┘
         │                                               │
         │ Better Auth                                   │ SQLModel
         │ (JWT Plugin)                                  │
         │                                               │
         ▼                                               ▼
  httpOnly Cookie                              ┌─────────────────┐
  (auth-token)                                 │ Neon PostgreSQL │
                                               │    Database     │
                                               └─────────────────┘
```

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone <repository-url>
cd PHASE2

# Checkout the feature branch
git checkout 002-frontend-api-integration

# Verify you're on the correct branch
git branch --show-current
# Should output: 002-frontend-api-integration
```

## Step 2: Backend Setup

### 2.1 Install Backend Dependencies

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2.2 Configure Backend Environment

Create `.env` file in `backend/` directory:

```bash
# backend/.env

# Authentication Secret (MUST match frontend)
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production

# Database Configuration
DATABASE_URL=postgresql://user:password@host/database
# Example for Neon:
# DATABASE_URL=postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb

# CORS Configuration (allow frontend origin)
CORS_ORIGINS=http://localhost:3000

# FastAPI Configuration
DEBUG=true
```

**Important**: Generate a strong secret for `BETTER_AUTH_SECRET`:
```bash
# Generate a random secret (32 bytes, base64 encoded)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.3 Run Database Migrations

```bash
# Still in backend/ directory with venv activated

# Run migrations to create tables
alembic upgrade head

# Verify tables were created
# You should see: users, tasks, alembic_version
```

### 2.4 Start Backend Server

```bash
# Start FastAPI development server
uvicorn src.main:app --reload --port 8000

# Server should start at: http://localhost:8000
# API docs available at: http://localhost:8000/docs
```

**Verify Backend**:
- Open http://localhost:8000/docs in browser
- You should see Swagger UI with API endpoints
- Try the health check endpoint if available

## Step 3: Frontend Setup

### 3.1 Install Frontend Dependencies

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 3.2 Configure Frontend Environment

Create `.env.local` file in `frontend/` directory:

```bash
# frontend/.env.local

# Authentication Secret (MUST match backend)
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production

# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Next.js Configuration
NODE_ENV=development
```

**Critical**: The `BETTER_AUTH_SECRET` must be **identical** in both frontend and backend `.env` files.

### 3.3 Start Frontend Development Server

```bash
# Still in frontend/ directory

# Start Next.js development server
npm run dev
# or
yarn dev

# Server should start at: http://localhost:3000
```

**Verify Frontend**:
- Open http://localhost:3000 in browser
- You should see the landing page
- No errors in browser console

## Step 4: Test Authentication Flow

### 4.1 Test User Signup

1. Navigate to http://localhost:3000/signup
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `TestPass123`
3. Click "Sign Up"
4. You should be redirected to `/tasks` page
5. Check browser DevTools → Application → Cookies
   - You should see `auth-token` cookie (httpOnly)

### 4.2 Test User Signin

1. Sign out (if signed in)
2. Navigate to http://localhost:3000/signin
3. Enter the same credentials:
   - Email: `test@example.com`
   - Password: `TestPass123`
4. Click "Sign In"
5. You should be redirected to `/tasks` page

### 4.3 Test Protected Routes

1. While signed in, navigate to http://localhost:3000/tasks
   - You should see the tasks page (empty initially)
2. Sign out
3. Try to access http://localhost:3000/tasks again
   - You should be redirected to `/signin`

### 4.4 Test Task Creation

1. Sign in as `test@example.com`
2. On the tasks page, create a new task:
   - Title: "Test Task"
   - Description: "This is a test"
3. Click "Create"
4. Task should appear in the list immediately
5. Refresh the page
   - Task should still be there (persisted)

### 4.5 Test Multi-User Isolation

1. Sign out from `test@example.com`
2. Sign up with a different email: `test2@example.com`
3. Create a task as `test2@example.com`
4. Sign out and sign back in as `test@example.com`
5. Verify you **only** see tasks from `test@example.com`
   - You should NOT see tasks from `test2@example.com`

## Step 5: Verify JWT Token

### 5.1 Inspect JWT Token

1. Sign in to the application
2. Open browser DevTools → Console
3. Run this code to decode the JWT (for debugging only):

```javascript
// Get the token from cookie (won't work due to httpOnly, but you can get it from API response)
// Or check Network tab → Response for signin/signup request

// Example token (from API response):
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Decode JWT (base64 decode the payload)
const payload = JSON.parse(atob(token.split('.')[1]))
console.log(payload)

// Should show:
// {
//   user_id: 1,
//   email: "test@example.com",
//   iat: 1673456789,
//   exp: 1674061589,
//   iss: "better-auth"
// }
```

### 5.2 Verify Token in API Requests

1. Sign in to the application
2. Open browser DevTools → Network tab
3. Create a task or fetch tasks
4. Click on the API request (e.g., `POST /api/tasks`)
5. Check Request Headers:
   - You should see: `Authorization: Bearer eyJhbGc...`
   - Or the cookie is automatically sent

## Troubleshooting

### Issue: "CORS Error" in Browser Console

**Symptom**: Frontend can't connect to backend, CORS error in console

**Solution**:
1. Check backend `.env` file has correct `CORS_ORIGINS`
2. Ensure backend is running on port 8000
3. Restart backend server after changing `.env`

```bash
# backend/.env
CORS_ORIGINS=http://localhost:3000  # Must match frontend URL
```

### Issue: "Invalid Token" or "Authentication Failed"

**Symptom**: Can't sign in, or get 401 errors on API requests

**Solution**:
1. Verify `BETTER_AUTH_SECRET` is **identical** in both `.env` files
2. Check for typos or extra spaces in the secret
3. Restart both frontend and backend servers
4. Clear browser cookies and try again

```bash
# Both files must have the EXACT same value:
# frontend/.env.local
BETTER_AUTH_SECRET=abc123xyz

# backend/.env
BETTER_AUTH_SECRET=abc123xyz
```

### Issue: "Database Connection Error"

**Symptom**: Backend crashes with database connection error

**Solution**:
1. Verify `DATABASE_URL` in backend `.env` is correct
2. Check Neon database is accessible
3. Ensure database migrations have run:

```bash
cd backend
alembic upgrade head
```

### Issue: "Port Already in Use"

**Symptom**: Can't start frontend or backend, port is busy

**Solution**:
```bash
# Find and kill process using port 3000 (frontend)
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Same for port 8000 (backend)
```

### Issue: "Module Not Found" Errors

**Symptom**: Import errors when starting servers

**Solution**:
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Tasks Not Persisting

**Symptom**: Tasks disappear after page refresh

**Solution**:
1. Check backend logs for database errors
2. Verify database migrations ran successfully
3. Check Network tab for failed API requests
4. Ensure JWT token is being sent with requests

## Development Workflow

### Making Changes

1. **Frontend Changes**:
   - Edit files in `frontend/src/`
   - Next.js hot-reloads automatically
   - Check browser console for errors

2. **Backend Changes**:
   - Edit files in `backend/src/`
   - FastAPI auto-reloads with `--reload` flag
   - Check terminal for errors

3. **Database Changes**:
   - Create new migration: `alembic revision --autogenerate -m "description"`
   - Apply migration: `alembic upgrade head`
   - Rollback if needed: `alembic downgrade -1`

### Testing Checklist

Before committing changes, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] User can sign up with new account
- [ ] User can sign in with existing account
- [ ] User can create tasks
- [ ] User can view only their own tasks
- [ ] User can update tasks
- [ ] User can delete tasks
- [ ] User can sign out
- [ ] Protected routes redirect when not authenticated
- [ ] No console errors in browser
- [ ] No errors in backend logs

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Yes | JWT signing secret (must match backend) | `abc123xyz...` |
| `BETTER_AUTH_URL` | Yes | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `http://localhost:8000` |
| `NODE_ENV` | No | Environment mode | `development` |

### Backend (.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Yes | JWT signing secret (must match frontend) | `abc123xyz...` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `CORS_ORIGINS` | Yes | Allowed frontend origins | `http://localhost:3000` |
| `DEBUG` | No | Enable debug mode | `true` |

## Next Steps

After completing this quickstart:

1. **Run Tests**: Execute test suite to verify functionality
2. **Review Code**: Familiarize yourself with the codebase structure
3. **Read Docs**: Review `plan.md`, `research.md`, and `data-model.md`
4. **Start Development**: Begin implementing tasks from `tasks.md`

## Useful Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Backend
uvicorn src.main:app --reload  # Start development server
alembic upgrade head            # Run migrations
alembic downgrade -1            # Rollback one migration
pytest                          # Run tests

# Database
alembic revision --autogenerate -m "message"  # Create migration
alembic current                                # Show current version
alembic history                                # Show migration history
```

## Support

If you encounter issues not covered in this guide:

1. Check the [API documentation](http://localhost:8000/docs)
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Consult `plan.md` for architecture details
5. Ask the team for help

---

**Quickstart Status**: ✅ COMPLETE
**Last Tested**: 2026-01-10
**Tested By**: Development Team
