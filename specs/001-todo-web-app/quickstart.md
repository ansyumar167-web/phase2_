# Quickstart Guide: Todo Full-Stack Web Application

**Feature**: 001-todo-web-app
**Date**: 2026-01-10
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions to set up and run the Todo Full-Stack Web Application locally. The application consists of three main components:

1. **Frontend**: Next.js 16 application with Better Auth (port 3000)
2. **Backend**: FastAPI application with JWT verification (port 8000)
3. **Database**: Neon Serverless PostgreSQL (cloud-hosted)

**Estimated Setup Time**: 15-20 minutes

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **Python**: Version 3.11 or higher ([Download](https://www.python.org/))
- **npm** or **yarn**: Package manager for Node.js (comes with Node.js)
- **pip**: Package manager for Python (comes with Python)
- **Git**: Version control system ([Download](https://git-scm.com/))
- **Neon Account**: Free PostgreSQL database ([Sign up](https://neon.tech/))

**Verify installations:**
```bash
node --version    # Should show v18.x or higher
python --version  # Should show 3.11.x or higher
npm --version     # Should show 9.x or higher
git --version     # Should show 2.x or higher
```

---

## Step 1: Clone Repository and Navigate to Project

```bash
# Clone the repository
git clone <repository-url>
cd PHASE2

# Checkout the feature branch
git checkout 001-todo-web-app
```

---

## Step 2: Set Up Neon PostgreSQL Database

### 2.1 Create Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create Project"
3. Choose a project name (e.g., "todo-app")
4. Select a region closest to you
5. Click "Create Project"

### 2.2 Get Database Connection String

1. In the Neon Console, go to your project dashboard
2. Click "Connection Details"
3. Copy the connection string (format: `postgresql://user:password@host/database`)
4. Save this for the next step

**Example connection string:**
```
postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb
```

---

## Step 3: Configure Environment Variables

### 3.1 Root Environment Variables

Create `.env` file in the project root:

```bash
# Navigate to project root
cd PHASE2

# Create .env file
cat > .env << 'EOF'
# Shared JWT Secret (CRITICAL: Keep this secret!)
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production

# Database Connection
DATABASE_URL=postgresql://user:password@host/database

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
```

**⚠️ IMPORTANT**: Replace the placeholder values:
- `BETTER_AUTH_SECRET`: Generate a strong random string (32+ characters)
- `DATABASE_URL`: Paste your Neon connection string from Step 2.2

**Generate a secure secret:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3.2 Backend Environment Variables

Create `backend/.env` file:

```bash
# Navigate to backend directory
cd backend

# Create .env file
cat > .env << 'EOF'
# Database Connection (from Neon)
DATABASE_URL=postgresql://user:password@host/database

# JWT Secret (MUST match root .env)
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Server Configuration
HOST=0.0.0.0
PORT=8000
EOF
```

**⚠️ IMPORTANT**: Use the SAME `BETTER_AUTH_SECRET` as in root `.env`

### 3.3 Frontend Environment Variables

Create `frontend/.env.local` file:

```bash
# Navigate to frontend directory
cd ../frontend

# Create .env.local file
cat > .env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
EOF
```

**⚠️ IMPORTANT**: Use the SAME `BETTER_AUTH_SECRET` as in root `.env`

---

## Step 4: Set Up Backend (FastAPI)

### 4.1 Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Expected dependencies:**
- fastapi
- sqlmodel
- asyncpg
- alembic
- python-jose[cryptography]
- uvicorn[standard]
- python-dotenv

### 4.2 Run Database Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create initial migration
alembic revision --autogenerate -m "Create users and tasks tables"

# Apply migration to database
alembic upgrade head
```

**Verify migration:**
```bash
# Check Alembic version
alembic current

# Should show: "001 (head)"
```

### 4.3 Start Backend Server

```bash
# Start FastAPI server with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify backend is running:**
```bash
# In a new terminal, test health endpoint
curl http://localhost:8000/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-10T12:00:00Z"}
```

---

## Step 5: Set Up Frontend (Next.js)

### 5.1 Install Node Dependencies

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install
# or
yarn install
```

**Expected dependencies:**
- next (v16+)
- react (v18+)
- react-dom (v18+)
- better-auth

### 5.2 Start Frontend Development Server

```bash
# Start Next.js development server
npm run dev
# or
yarn dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.5s
```

**Verify frontend is running:**
Open browser and navigate to: http://localhost:3000

---

## Step 6: Verify Installation

### 6.1 Test User Registration

1. Open browser to http://localhost:3000
2. Navigate to "Sign Up" page
3. Enter email: `test@example.com`
4. Enter password: `TestPass123`
5. Click "Sign Up"
6. **Expected**: Redirected to dashboard with empty task list

### 6.2 Test Task Creation

1. On dashboard, enter task title: "Test Task"
2. (Optional) Enter description: "This is a test"
3. Click "Create Task"
4. **Expected**: Task appears in list immediately

### 6.3 Test User Isolation

1. Open browser in incognito/private mode
2. Navigate to http://localhost:3000
3. Sign up with different email: `test2@example.com`
4. **Expected**: Dashboard shows 0 tasks (not the first user's task)

### 6.4 Test Persistence

1. Create a task as first user
2. Sign out
3. Sign back in
4. **Expected**: Task is still present

### 6.5 Test API Endpoints

```bash
# Test health endpoint (no auth required)
curl http://localhost:8000/health

# Test tasks endpoint (requires auth - should return 401)
curl http://localhost:8000/api/tasks

# Expected: {"detail":"Not authenticated"}
```

---

## Step 7: Verify Security

### 7.1 Check JWT Token

1. Open browser DevTools (F12)
2. Go to Application → Cookies → http://localhost:3000
3. **Expected**: See `auth-token` cookie with HttpOnly flag

### 7.2 Verify User Isolation

1. Create task as User A
2. Copy task ID from response
3. Sign in as User B
4. Try to access User A's task via API:
   ```bash
   curl http://localhost:8000/api/tasks/{task_id} \
     -H "Authorization: Bearer {user_b_token}"
   ```
5. **Expected**: 404 Not Found (task doesn't belong to User B)

---

## Common Issues and Troubleshooting

### Issue 1: "Connection refused" when accessing backend

**Symptoms**: Frontend shows network error, backend not responding

**Solutions**:
1. Verify backend is running: `curl http://localhost:8000/health`
2. Check backend logs for errors
3. Verify PORT in backend/.env matches NEXT_PUBLIC_API_URL in frontend/.env.local
4. Check firewall settings (allow port 8000)

### Issue 2: "Invalid credentials" error during JWT verification

**Symptoms**: 401 Unauthorized on all protected endpoints

**Solutions**:
1. Verify BETTER_AUTH_SECRET is identical in all .env files
2. Restart both frontend and backend servers
3. Clear browser cookies and sign in again
4. Check backend logs for JWT verification errors

### Issue 3: Database connection errors

**Symptoms**: "Could not connect to database" or "Connection timeout"

**Solutions**:
1. Verify DATABASE_URL is correct in backend/.env
2. Check Neon dashboard - ensure database is active
3. Verify SSL mode: connection string should include `?sslmode=require`
4. Test connection: `psql $DATABASE_URL` (if psql installed)

### Issue 4: CORS errors in browser console

**Symptoms**: "Access-Control-Allow-Origin" error in browser DevTools

**Solutions**:
1. Verify ALLOWED_ORIGINS in backend/.env includes frontend URL
2. Restart backend server after changing CORS settings
3. Check frontend URL matches exactly (http://localhost:3000, not http://127.0.0.1:3000)
4. Clear browser cache and reload

### Issue 5: Migrations fail to apply

**Symptoms**: "Target database is not up to date" or migration errors

**Solutions**:
1. Check DATABASE_URL is correct
2. Verify Alembic is initialized: `alembic current`
3. Reset migrations (development only):
   ```bash
   alembic downgrade base
   alembic upgrade head
   ```
4. Check database permissions (user must have CREATE TABLE rights)

### Issue 6: Frontend shows "Module not found" errors

**Symptoms**: Import errors, missing dependencies

**Solutions**:
1. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Verify Node.js version: `node --version` (should be 18+)
3. Clear Next.js cache: `rm -rf .next`
4. Restart development server

---

## Development Workflow

### Starting Development Session

```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Stopping Services

```bash
# Press CTRL+C in each terminal to stop servers
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Viewing Logs

```bash
# Backend logs: Displayed in terminal running uvicorn

# Frontend logs: Displayed in terminal running npm run dev

# Database logs: Available in Neon Console → Monitoring
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate new BETTER_AUTH_SECRET (never use development secret)
- [ ] Update ALLOWED_ORIGINS to production frontend URL
- [ ] Update NEXT_PUBLIC_API_URL to production backend URL
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set secure cookie flags (Secure, SameSite=Strict)
- [ ] Configure production database (separate from development)
- [ ] Set up database backups in Neon
- [ ] Configure environment variables in hosting platform
- [ ] Test all user flows in production environment
- [ ] Verify user isolation with multiple test accounts
- [ ] Monitor logs for authentication errors
- [ ] Set up error tracking (e.g., Sentry)

---

## Architecture Overview

```
┌─────────────────┐
│   Browser       │
│  (localhost:    │
│     3000)       │
└────────┬────────┘
         │
         │ HTTP Requests
         │ (with JWT cookie)
         │
┌────────▼────────┐
│   Next.js       │
│   Frontend      │
│  (Better Auth)  │
└────────┬────────┘
         │
         │ REST API Calls
         │ (Authorization: Bearer {token})
         │
┌────────▼────────┐
│   FastAPI       │
│   Backend       │
│ (JWT Verify)    │
└────────┬────────┘
         │
         │ SQL Queries
         │ (filtered by user_id)
         │
┌────────▼────────┐
│   Neon          │
│  PostgreSQL     │
│  (Cloud DB)     │
└─────────────────┘
```

---

## Next Steps

After successful setup:

1. **Review Specification**: Read `specs/001-todo-web-app/spec.md` to understand requirements
2. **Review Data Model**: Read `specs/001-todo-web-app/data-model.md` to understand database schema
3. **Review API Contracts**: Read `specs/001-todo-web-app/contracts/*.yaml` to understand endpoints
4. **Generate Tasks**: Run `/sp.tasks` to create implementation task list
5. **Begin Implementation**: Execute tasks using specialized agents

---

## Support and Resources

- **Specification**: `specs/001-todo-web-app/spec.md`
- **Implementation Plan**: `specs/001-todo-web-app/plan.md`
- **Data Model**: `specs/001-todo-web-app/data-model.md`
- **API Contracts**: `specs/001-todo-web-app/contracts/`
- **Research Findings**: `specs/001-todo-web-app/research.md`

**External Documentation**:
- [Next.js 16 Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLModel Docs](https://sqlmodel.tiangolo.com/)
- [Better Auth Docs](https://better-auth.com/)
- [Neon Docs](https://neon.tech/docs)

---

## Security Reminders

🔒 **CRITICAL SECURITY PRACTICES**:

1. **Never commit .env files** - Add to .gitignore
2. **Never share BETTER_AUTH_SECRET** - Treat like a password
3. **Always use HTTPS in production** - No exceptions
4. **Verify user_id from JWT only** - Never trust client input
5. **Filter all queries by user_id** - Enforce at database level
6. **Use httpOnly cookies** - Prevent XSS attacks
7. **Validate all inputs** - Use Pydantic models
8. **Log authentication failures** - Monitor for attacks

---

**Setup Complete!** 🎉

You should now have a fully functional Todo Full-Stack Web Application running locally with:
- ✅ User registration and authentication
- ✅ JWT-based security
- ✅ Strict user data isolation
- ✅ Persistent storage in PostgreSQL
- ✅ Responsive web interface

If you encounter any issues, refer to the Troubleshooting section above or review the specification documents.
