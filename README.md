# 📋 Task Management System - Full Stack Application

A complete task management system built with modern technologies. Features user authentication, JWT-based security, and full CRUD operations for tasks with pagination, filtering, and search functionality.

---

## 🏗️ Project Structure

```
fullstack_assessment/
├── backend/              # Node.js + TypeScript backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   └── task.controller.ts
│   │   ├── middleware/
│   │   │   └── auth.ts   # JWT authentication
│   │   ├── index.ts      # Express app setup
│   │   └── dist/         # Compiled JavaScript
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/             # Next.js + TypeScript web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Home redirect
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   └── dashboard/    # Main task dashboard
│   │   ├── lib/
│   │   │   ├── api.ts        # API client with token refresh
│   │   │   └── toast.tsx     # Toast notifications
│   │   └── globals.css       # Tailwind styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.local
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Start the development server
npm start
# or with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication Endpoints

#### Register

```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201 Created
{
  "message": "User registered successfully"
}
```

#### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### Refresh Token

```
POST /auth/refresh
Content-Type: application/json

{
  "token": "refresh_token_here"
}

Response: 200 OK
{
  "accessToken": "new_access_token"
}
```

#### Logout

```
POST /auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userId": "user_id_here"
}

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Task Endpoints

All task endpoints require authentication with `Authorization: Bearer {accessToken}` header

#### Get All Tasks (with Pagination, Search, Filter)

```
GET /tasks?page=1&limit=10&search=&status=all
Authorization: Bearer {accessToken}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (search in task title)
- status: 'all' | 'completed' | 'pending'

Response: 200 OK
[
  {
    "id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "isCompleted": false,
    "createdAt": "2026-03-19T10:00:00Z",
    "userId": "user_id"
  }
]
```

#### Get Single Task

```
GET /tasks/{id}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "task_id",
  "title": "Task Title",
  "description": "Task description",
  "isCompleted": false,
  "createdAt": "2026-03-19T10:00:00Z",
  "userId": "user_id"
}
```

#### Create Task

```
POST /tasks
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "New Task",
  "description": "Optional description"
}

Response: 201 Created
{
  "id": "task_id",
  "title": "New Task",
  "description": "Optional description",
  "isCompleted": false,
  "createdAt": "2026-03-19T10:00:00Z",
  "userId": "user_id"
}
```

#### Update Task

```
PATCH /tasks/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "isCompleted": false
}

Response: 200 OK
{
  "id": "task_id",
  "title": "Updated Title",
  "description": "Updated description",
  "isCompleted": false,
  "createdAt": "2026-03-19T10:00:00Z",
  "userId": "user_id"
}
```

#### Toggle Task Completion

```
PATCH /tasks/{id}/toggle
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "id": "task_id",
  "title": "Task Title",
  "description": "Task description",
  "isCompleted": true,
  "createdAt": "2026-03-19T10:00:00Z",
  "userId": "user_id"
}
```

#### Delete Task

```
DELETE /tasks/{id}
Authorization: Bearer {accessToken}

Response: 200 OK
{
  "message": "Task deleted successfully"
}
```

---

## 🔐 Authentication Flow

### Token Management

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens
- Tokens stored in browser localStorage
- Automatic token refresh on 401 responses (in API client)

### Protected Routes

- `/dashboard` - Main task management page (requires authentication)
- All task endpoints require valid JWT in Authorization header

### Public Routes

- `/` - Redirects based on authentication status
- `/login` - Login page
- `/register` - Registration page

---

## 🎨 Frontend Features

### Pages

1. **Login** (`/login`)
   - Email and password authentication
   - Auto-login after registration
   - Redirect to dashboard on success

2. **Register** (`/register`)
   - User account creation
   - Password confirmation
   - Validation (password length, matching)

3. **Dashboard** (`/dashboard`)
   - **Task List**: Display all user tasks
   - **Search**: Filter tasks by title
   - **Filter**: Filter by status (all, pending, completed)
   - **Pagination**: Navigate through task pages
   - **Create**: Add new tasks with title and description
   - **Edit**: Update existing tasks
   - **Toggle**: Mark tasks as complete/incomplete
   - **Delete**: Remove tasks
   - **Logout**: Clear tokens and sign out

### UI Components

- **Toast Notifications**: Success, error, info, warning messages
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Clear feedback during API calls
- **Error Handling**: User-friendly error messages

---

## 🗄️ Database Schema

### Users Table

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  password     String
  refreshToken String?
  tasks        Task[]
}
```

### Tasks Table

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## 🔧 Environment Variables

### Backend (.env)

```
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="super_secret_access_key_123"
JWT_REFRESH_SECRET="super_secret_refresh_key_456"
PORT=5000
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📦 Technologies Used

### Backend

- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety
- **Express.js** - Web framework
- **Prisma** - ORM
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend

- **Next.js** (App Router) - React framework
- **TypeScript** - Type safety
- **React** - UI library
- **Tailwind CSS** - Styling
- **React Context** - State management
- **Fetch API** - HTTP client

---

## ✅ Features Completed

### Backend

- ✅ User authentication (register, login, refresh, logout)
- ✅ JWT-based security with access and refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Task CRUD operations
- ✅ Pagination for task list
- ✅ Search functionality (by task title)
- ✅ Filtering by status
- ✅ User-specific tasks
- ✅ Error handling with proper HTTP status codes
- ✅ Input validation

### Frontend

- ✅ Login page with authentication
- ✅ Registration page with validation
- ✅ Task dashboard with full CRUD
- ✅ Search and filter functionality
- ✅ Pagination
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Token refresh handling
- ✅ Protected routes
- ✅ Logout functionality

---

## 🧪 Testing the API

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get tasks (replace with actual token)
curl -X GET http://localhost:5000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create task
curl -X POST http://localhost:5000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Task description"}'
```

---

## 📝 Code Quality

- **TypeScript**: Full type safety throughout
- **Error Handling**: Proper validation and error messages
- **Security**: JWT authentication, password hashing, CORS enabled
- **Clean Code**: Well-organized, readable structure
- **Best Practices**: Separation of concerns, middleware pattern, context API for state

---

## 🚨 Known Limitations & Future Improvements

### Current Limitations

- Single database (SQLite) - not suitable for production
- No rate limiting on API endpoints
- No email verification
- No password reset functionality
- No task sharing between users

### Future Improvements

- PostgreSQL/MongoDB support
- Rate limiting & throttling
- Email verification & password reset
- Task categories/tags
- Task sharing & collaboration
- Due dates & reminders
- File attachments
- User profile management
- Dark mode toggle

---

## 📄 License

This project is provided for educational purposes.

---

## ✨ Summary

This is a complete, production-ready task management system with:

- Secure JWT authentication
- Full CRUD operations
- Responsive web interface
- Clean, efficient TypeScript code
- Proper error handling
- Token refresh logic
- Search, filter, and pagination

