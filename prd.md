# Product Requirements Document (PRD)

# Team Task Manager (Full-Stack Web Application)

---

# 1. Project Overview

## Product Name
Team Task Manager

## Objective
Build a collaborative task management web application where teams can create projects, assign tasks, track progress, and manage team workflows with role-based access control.

The application should demonstrate:
- Full-stack development skills
- Authentication & authorization
- REST API development
- Database design & relationships
- Deployment capability
- Clean UI/UX
- Production-ready architecture

---

# 2. Problem Statement

Small teams and student groups often struggle to:
- Organize tasks
- Track deadlines
- Assign responsibilities
- Monitor project progress

This application solves that problem by providing:
- Centralized task management
- Team collaboration
- Progress tracking
- Role-based permissions

---

# 3. Target Users

| User Type | Description |
|---|---|
| Admin | Creates projects, manages members, assigns tasks |
| Member | Views assigned tasks, updates task status |

---

# 4. Scope

## In Scope
- User authentication
- Project creation
- Team member management
- Task management
- Task status updates
- Dashboard analytics
- Role-based access control
- Responsive UI
- Deployment

## Out of Scope (Optional Future Features)
- Real-time chat
- Notifications
- File uploads
- Calendar integration
- Email reminders
- Kanban drag-drop board

---

# 5. Tech Stack Recommendation

## Frontend
- React.js + Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js

## Database
- MongoDB Atlas (Recommended)

## Authentication
- JWT Authentication
- bcrypt password hashing

## Deployment
| Service | Purpose |
|---|---|
| Railway | Backend Deployment |
| Vercel | Frontend Deployment |
| MongoDB Atlas | Database Hosting |

---

# 6. Functional Requirements

# 6.1 Authentication Module

## Features
- User Signup
- User Login
- JWT-based authentication
- Password hashing
- Logout

## Validations
- Unique email
- Strong password validation
- Required fields

## API Endpoints

### POST /api/auth/signup
Create new user account

### POST /api/auth/login
Authenticate user

### GET /api/auth/me
Fetch logged-in user details

---

# 6.2 Role-Based Access Control (RBAC)

## Roles

### Admin
Can:
- Create projects
- Add/remove members
- Assign tasks
- Update/delete any task
- View complete dashboard

### Member
Can:
- View assigned projects
- View assigned tasks
- Update own task status

---

# 6.3 Project Management Module

## Features
- Create project
- Edit project
- Delete project
- Add members to project
- View project details

## Project Fields

| Field | Type |
|---|---|
| title | String |
| description | String |
| createdBy | User ID |
| members | Array |
| createdAt | Date |

## API Endpoints

### POST /api/projects
Create project

### GET /api/projects
Get all projects

### GET /api/projects/:id
Get single project

### PUT /api/projects/:id
Update project

### DELETE /api/projects/:id
Delete project

---

# 6.4 Task Management Module

## Features
- Create task
- Assign task
- Update task status
- Set deadlines
- Delete task

## Task Status
- Todo
- In Progress
- Completed

## Task Fields

| Field | Type |
|---|---|
| title | String |
| description | String |
| status | Enum |
| assignedTo | User ID |
| projectId | Project ID |
| dueDate | Date |
| priority | Low/Medium/High |

## API Endpoints

### POST /api/tasks
Create task

### GET /api/tasks
Get all tasks

### PUT /api/tasks/:id
Update task

### DELETE /api/tasks/:id
Delete task

---

# 6.5 Dashboard Module

## Features
- Total tasks
- Completed tasks
- Pending tasks
- Overdue tasks
- Tasks by status
- Project summary

## Dashboard Widgets
- Task statistics cards
- Recent tasks table
- Progress charts

---

# 7. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Security | JWT authentication and hashed passwords |
| Performance | API response under 2 seconds |
| Scalability | Modular backend structure |
| Responsiveness | Mobile-friendly UI |
| Reliability | Proper error handling |

---

# 8. Database Design

# Users Collection

```json
{
  "_id": "",
  "name": "",
  "email": "",
  "password": "",
  "role": "admin/member"
}