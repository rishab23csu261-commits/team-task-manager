# Team Task Manager

A full-stack collaborative task management application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication**: JWT-based login/signup with secure password hashing.
- **Role-Based Access Control**: `Admin` and `Member` roles.
  - Admins can create projects, assign members, and manage tasks.
  - Members can view assigned tasks and update task statuses.
- **Project Management**: Create and manage projects. Add users to projects.
- **Task Management**: Kanban-style status tracking (To Do, In Progress, Completed), priorities, and due dates.
- **Dashboard**: Real-time statistics, task status breakdown, and recent tasks overview.
- **Modern UI**: Dark mode glassmorphism interface built with Tailwind CSS v4 and React Router.

## Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS v4, Axios, React Router v6
- **Backend**: Node.js, Express.js, Mongoose, JWT, bcryptjs
- **Database**: MongoDB

## Running Locally

### 1. Backend Setup

```bash
cd server
npm install
# Ensure you have a MongoDB instance running locally or update MONGO_URI in .env
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:5000`.

## API Documentation

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate a user
- `GET /api/auth/me` - Get current user profile
- `GET /api/projects` - Get projects (All for Admin, assigned for Member)
- `POST /api/projects` - Create a project (Admin)
- `GET /api/tasks` - Get tasks
- `POST /api/tasks` - Create a task (Admin)
- `PUT /api/tasks/:id` - Update task status
- `GET /api/dashboard` - Get dashboard statistics
