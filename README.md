# Todo Full-Stack Web Application

A secure, multi-user Todo application built with Next.js 16, FastAPI, and Neon PostgreSQL. This project demonstrates spec-driven development with JWT-based authentication and strict user data isolation.

## 🚀 Features

- **User Authentication**: Secure signup/signin with JWT tokens and httpOnly cookies
- **Task Management**: Complete CRUD operations for tasks
  - ✅ Create new tasks with title and description
  - 📋 View all personal tasks with user isolation
  - ✔️ Mark tasks as complete/incomplete with visual feedback
  - ✏️ Edit task title and description inline
  - 🗑️ Delete tasks with confirmation dialog
- **Security-First**: JWT verification on all protected endpoints, user data isolation
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Real-time Updates**: Optimistic UI updates for instant feedback

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript |
| **Backend** | Python FastAPI, SQLModel, Pydantic |
| **Database** | Neon Serverless PostgreSQL |
| **Authentication** | Better Auth (JWT-based) |
| **Styling** | Tailwind CSS |
| **ORM** | SQLModel with AsyncPG |
| **Migrations** | Alembic |

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Neon PostgreSQL** account and database URL
- **Git** for version control

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd PHASE2
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Configure backend/.env:**
```env
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
ALLOWED_ORIGINS=http://localhost:3000
HOST=0.0.0.0
PORT=8000
```

**Run database migrations:**
```bash
# Apply migrations to create tables
alembic upgrade head
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

**Configure frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000
```

**Important:** Use the same `BETTER_AUTH_SECRET` in both backend and frontend.

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
# Ensure virtual environment is activated
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📖 Usage

1. **Sign Up**: Navigate to http://localhost:3000 and create a new account
2. **Sign In**: Use your credentials to sign in
3. **Create Tasks**: Use the form on the dashboard to create new tasks
4. **Manage Tasks**:
   - Click the checkbox to mark tasks as complete/incomplete
   - Click "Edit" to modify task title or description
   - Click "Delete" to remove tasks (with confirmation)
5. **Sign Out**: Click "Sign Out" button in the header

## 🔒 Security Features

- **JWT Authentication**: All protected endpoints require valid JWT tokens
- **User Isolation**: Database queries filter by authenticated user_id
- **Ownership Verification**: All task operations verify ownership before execution
- **Password Security**: Passwords are hashed before storage (via Better Auth)
- **CORS Protection**: Configured to allow only specified origins
- **Input Validation**: Pydantic models validate all request data
- **SQL Injection Prevention**: SQLModel ORM with parameterized queries

## 📁 Project Structure

```
PHASE2/
├── backend/
│   ├── src/
│   │   ├── api/          # API endpoints (health, tasks)
│   │   ├── middleware/   # JWT authentication middleware
│   │   ├── models/       # SQLModel database models
│   │   ├── config.py     # Environment configuration
│   │   ├── database.py   # Database connection
│   │   └── main.py       # FastAPI application
│   ├── alembic/          # Database migrations
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, auth, types
│   │   └── middleware.ts # Route protection
│   ├── package.json      # Node.js dependencies
│   └── .env.local        # Frontend environment variables
├── specs/                # Specification documents
│   └── 001-todo-web-app/
│       ├── spec.md       # Feature specification
│       ├── plan.md       # Implementation plan
│       └── tasks.md      # Task breakdown
└── README.md             # This file
```

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new email and password
- [ ] Sign in with existing credentials
- [ ] Sign out and verify redirect to sign-in page
- [ ] Verify unauthenticated users cannot access dashboard

**Task Creation:**
- [ ] Create task with title only
- [ ] Create task with title and description
- [ ] Verify task appears immediately in list
- [ ] Refresh page and verify task persists

**Task Viewing:**
- [ ] View all personal tasks
- [ ] Verify tasks are ordered by creation date (newest first)
- [ ] Sign in as different user and verify task isolation

**Task Completion:**
- [ ] Mark task as complete (checkbox)
- [ ] Verify visual styling changes (strikethrough, opacity)
- [ ] Refresh page and verify completion status persists
- [ ] Mark task as incomplete and verify it returns to normal state

**Task Editing:**
- [ ] Click "Edit" button on a task
- [ ] Modify title and description
- [ ] Click "Save" and verify changes appear immediately
- [ ] Click "Cancel" and verify no changes are made
- [ ] Refresh page and verify edits persist

**Task Deletion:**
- [ ] Click "Delete" button on a task
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel" and verify task remains
- [ ] Click "Delete" again and confirm
- [ ] Verify task disappears from list
- [ ] Refresh page and verify task remains deleted

**Multi-User Isolation:**
- [ ] Create tasks as User A
- [ ] Sign in as User B
- [ ] Verify User B sees zero tasks
- [ ] Create tasks as User B
- [ ] Sign back in as User A
- [ ] Verify User A only sees their own tasks

## 🐛 Troubleshooting

**Backend won't start:**
- Verify DATABASE_URL is correct and database is accessible
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Ensure migrations are applied: `alembic upgrade head`

**Frontend won't start:**
- Verify Node.js version is 18+: `node --version`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that .env.local file exists with correct values

**Authentication not working:**
- Verify BETTER_AUTH_SECRET is the same in both backend and frontend
- Check that backend is running and accessible at NEXT_PUBLIC_API_URL
- Clear browser cookies and try again

**Database connection errors:**
- Verify Neon database is active and accessible
- Check that DATABASE_URL includes `?sslmode=require` for Neon
- Ensure connection string uses `postgresql+asyncpg://` protocol

## 📚 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation powered by Swagger UI.

### Key Endpoints

**Authentication:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in and receive JWT token
- `POST /api/auth/signout` - Sign out and clear session

**Tasks:**
- `GET /api/tasks` - Get all tasks for authenticated user
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task title/description
- `PATCH /api/tasks/{id}/complete` - Toggle task completion status
- `DELETE /api/tasks/{id}` - Delete task permanently

**Health:**
- `GET /health` - Check API health status

## 🎯 Development Approach

This project was built using **Spec-Driven Development (SDD)** with the Agentic Dev Stack workflow:

1. **Constitution** → Project principles and standards
2. **Specification** → Feature requirements and success criteria
3. **Plan** → Architecture decisions and implementation strategy
4. **Tasks** → Granular, testable task breakdown
5. **Implementation** → Agent-generated code following the plan

All artifacts are available in the `specs/001-todo-web-app/` directory.

## 📝 License

This project is part of a hackathon demonstration and is provided as-is for educational purposes.

## 🤝 Contributing

This is a hackathon project. For questions or issues, please refer to the specification documents in the `specs/` directory.

## 📞 Support

For detailed implementation information, see:
- **Specification**: `specs/001-todo-web-app/spec.md`
- **Implementation Plan**: `specs/001-todo-web-app/plan.md`
- **Task Breakdown**: `specs/001-todo-web-app/tasks.md`
- **API Contracts**: `specs/001-todo-web-app/contracts/`
- **Quickstart Guide**: `specs/001-todo-web-app/quickstart.md`

---

**Built with ❤️ using Claude Code and Spec-Driven Development**
