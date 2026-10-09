# Society Maintenance Tracker 🏢

A production-ready full-stack apartment maintenance management platform built with React, Node.js, Express, PostgreSQL, and Tailwind CSS.

---

## 1. Project Overview

**Society Maintenance Tracker** is designed for residential apartment societies to streamline complaint lodging, status tracking, technician assignment, and community announcements.

- **Residents** can register, raise maintenance tickets with photos, track the chronological audit trail of repairs, and stay informed via pinned society notices and email notifications.
- **Admins** have access to an executive dashboard with statistics, overdue ticket escalation, priority management, and broadcast notice publishing.

---

## 2. Key Features

- **Role-Based Portals**: Distinct interfaces and secure permissions for **Resident** and **Admin** users.
- **Complaint Lifecycle Management**: Track complaints through `Open` → `In Progress` → `Resolved`.
- **Immutable Status & Audit History**: Every status transition logs the actor, timestamp, and optional technician note in chronological order.
- **Dynamic Overdue Engine**: Tickets unresolved beyond a configurable threshold (e.g., `OVERDUE_DAYS=3`) are automatically flagged, highlighted, and escalated to the top of lists.
- **Priority System**: Categorize issues as `Low`, `Medium`, or `High` with visual indicators.
- **Photo Upload Pipeline**: Optional image attachments with Cloudinary cloud storage and local disk fallback.
- **Interactive Notice Board**: Pinned high-priority announcements with instant broadcast email delivery to all residents.
- **Automated Email Notifications**: Branded HTML notifications for ticket status updates and important society notices.
- **Executive Admin Analytics**: Real-time KPI summary cards, breakdown charts by status/category/priority, and live activity streams.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (JWT), bcryptjs |
| **Database** | PostgreSQL (Relational schema with foreign keys, constraints & indexes) |
| **Storage** | Cloudinary SDK with Multer + Local disk storage fallback |
| **Email** | Nodemailer with SMTP (Resend, Brevo, Gmail) + Mock transport fallback |
| **Testing** | Node.js Native Test Runner (`node --test`) with API integration suite |

---

## 4. Folder Structure

```
society-maintenance-tracker/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # PostgreSQL DDL schema & indexes
│   │   └── seed.js              # Database seeder (Admin, Residents, Complaints, Notices)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js            # Unified DB connection & query pool
│   │   │   ├── cloudinary.js    # Cloudinary storage config
│   │   │   └── email.js         # Nodemailer transporter config
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   ├── noticeController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verify & RBAC middleware
│   │   │   ├── upload.js        # Multer image upload & storage pipeline
│   │   │   ├── validate.js      # Request schema validator
│   │   │   └── errorHandler.js  # Centralized error & 404 handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── noticeRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/
│   │   │   └── emailService.js  # Async email notification dispatcher
│   │   ├── utils/
│   │   │   └── emailTemplates.js# Responsive HTML email templates
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Server entrypoint & DB initializer
│   ├── tests/
│   │   └── api.test.js          # 15+ automated API integration tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # StatusBadge, PriorityBadge, OverdueTag, StatCard, etc.
│   │   │   └── complaints/      # StatusHistoryTimeline, StatusUpdateModal, PriorityUpdateModal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Authentication state & token persistence
│   │   │   └── ToastContext.jsx # Toast alerts
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx   # Sidebar, Navbar & Content shell
│   │   │   └── AuthLayout.jsx   # Authentication layout
│   │   ├── pages/
│   │   │   ├── auth/            # Login (with 1-click demo fill), Register
│   │   │   ├── resident/        # ResidentDashboard, RaiseComplaint, MyComplaints, Details, Notices, Profile
│   │   │   └── admin/           # AdminDashboard, AllComplaints, NoticeManagement
│   │   ├── services/            # Axios API wrappers
│   │   ├── utils/               # Formatters & style tokens
│   │   ├── App.jsx              # Application router & route guards
│   │   ├── index.css            # Tailwind & custom glassmorphism styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
├── SYSTEM_DESIGN.md
└── .env.example
```

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL Database** (Neon, Supabase, Render, or local PostgreSQL instance). *Note: An automated SQLite fallback is built-in for zero-setup local offline execution.*

---

## 6. Quick Start & Installation

### Step 1: Clone the repository & install dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Environment Configuration
Copy the sample environment file in `backend/`:
```bash
cd ../backend
cp .env.example .env
```

Configure your `.env` settings (or leave defaults for local mock mode):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
OVERDUE_DAYS=3
JWT_SECRET=your_jwt_secret_society_maintenance_2026
DATABASE_URL=postgresql://user:password@localhost:5432/society_db
```

### Step 3: Seed Database
Seed initial demo users, overdue tickets, and pinned notices:
```bash
npm run seed
```

### Step 4: Run the Backend API
```bash
npm start
# Server starts at http://localhost:5000
```

### Step 5: Run the Frontend Application
In a separate terminal window:
```bash
cd ../frontend
npm run dev
# App starts at http://localhost:5173
```

---

## 7. Demo Login Credentials

> [!NOTE]
> For demonstration and evaluation purposes, the login page features **1-Click Quick Fill buttons** for both Admin and Resident roles.

| Role | Email | Password | Flat Number |
|---|---|---|---|
| **Administrator** | `admin@example.com` | `Admin@123` | Management Office A-101 |
| **Resident 1** | `john@example.com` | `Resident@123` | Tower B - Flat 402 |
| **Resident 2** | `sarah@example.com` | `Resident@123` | Tower A - Flat 701 |
| **Resident 3** | `rahul@example.com` | `Resident@123` | Tower C - Flat 204 |

---

## 8. Complete API Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
- **Auth**: Public
- **Body**: `{ "name": "Jane Doe", "email": "jane@example.com", "password": "Password@123", "phone": "555-0101", "flat_number": "Flat 301" }`
- **Response (201)**: `{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }`

#### `POST /api/auth/login`
- **Auth**: Public
- **Body**: `{ "email": "admin@example.com", "password": "Admin@123" }`
- **Response (200)**: `{ "success": true, "data": { "user": { ... }, "token": "jwt..." } }`

#### `GET /api/auth/me`
- **Auth**: Bearer Token (Any Role)
- **Response (200)**: `{ "success": true, "data": { "user": { ... } } }`

---

### Resident Complaint Endpoints

#### `POST /api/complaints`
- **Auth**: Bearer Token (`resident`)
- **Content-Type**: `multipart/form-data`
- **Body**: `category` (string), `title` (string), `description` (string), `photo` (file, optional)
- **Response (201)**: `{ "success": true, "data": { "complaint": { "id": 1, "status": "Open", ... } } }`

#### `GET /api/complaints/my`
- **Auth**: Bearer Token (`resident`)
- **Query Params**: `status`, `category`, `priority`, `search`
- **Response (200)**: `{ "success": true, "data": { "complaints": [...], "total": 5, "overdueCount": 1 } }`

#### `GET /api/complaints/:id`
- **Auth**: Bearer Token (Owner Resident or Admin)
- **Response (200)**: `{ "success": true, "data": { "complaint": { ... }, "history": [...] } }`

---

### Admin Complaint Endpoints

#### `GET /api/admin/complaints`
- **Auth**: Bearer Token (`admin`)
- **Query Params**: `status`, `category`, `priority`, `is_overdue` (`true`/`false`), `search`, `startDate`, `endDate`
- **Response (200)**: `{ "success": true, "data": { "complaints": [...], "total": 12, "overdueCount": 2 } }`

#### `PATCH /api/admin/complaints/:id/status`
- **Auth**: Bearer Token (`admin`)
- **Body**: `{ "status": "In Progress" | "Resolved", "note": "Technician dispatched" }`
- **Response (200)**: `{ "success": true, "message": "...", "data": { "complaint": { ... }, "history": [...] } }`

#### `PATCH /api/admin/complaints/:id/priority`
- **Auth**: Bearer Token (`admin`)
- **Body**: `{ "priority": "High" | "Medium" | "Low" }`
- **Response (200)**: `{ "success": true, "data": { "complaint": { ... } } }`

---

### Notice Endpoints

#### `GET /api/notices`
- **Auth**: Bearer Token (Any Role)
- **Response (200)**: `{ "success": true, "data": { "notices": [...], "importantCount": 2 } }`

#### `POST /api/admin/notices`
- **Auth**: Bearer Token (`admin`)
- **Body**: `{ "title": "Water Tank Cleaning", "content": "Schedule details...", "is_important": true }`
- **Response (201)**: `{ "success": true, "message": "...", "data": { "notice": { ... } } }`

#### `PATCH /api/admin/notices/:id`
- **Auth**: Bearer Token (`admin`)
- **Body**: `{ "title": "Updated Title", "content": "...", "is_important": true }`
- **Response (200)**: `{ "success": true, "data": { "notice": { ... } } }`

#### `DELETE /api/admin/notices/:id`
- **Auth**: Bearer Token (`admin`)
- **Response (200)**: `{ "success": true, "message": "Notice deleted successfully" }`

---

### Dashboard Endpoints

#### `GET /api/admin/dashboard`
- **Auth**: Bearer Token (`admin`)
- **Response (200)**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalComplaints": 7,
      "openComplaints": 3,
      "inProgressComplaints": 2,
      "resolvedComplaints": 2,
      "overdueComplaints": 2,
      "overdueDaysThreshold": 3
    },
    "byStatus": [...],
    "byCategory": [...],
    "byPriority": [...],
    "overdueList": [...],
    "recentActivity": [...]
  }
}
```

---

## 9. Automated Testing

Run the automated integration test suite covering registration, authentication, role access guards, complaint creation, status updates with audit history, priority updates, overdue calculation, notice pinning, and dashboard analytics:

```bash
cd backend
npm test
```

---

## 10. Deployment Guide

### Full-Stack Render Deployment (24/7)

This repository includes a Render Blueprint (`render.yaml`) that deploys the Vite frontend and Express API together, with managed PostgreSQL in Singapore. The web service serves the built frontend and API from the same origin. The Blueprint uses an always-on paid web plan and a paid PostgreSQL plan; Render's current baseline pricing is about **$13/month** before any extra bandwidth or storage.

1. In the Render Dashboard, create a new **Blueprint** and select this GitHub repository.
2. Review the web service and PostgreSQL resources and their estimated charges.
3. Create the Blueprint to build and deploy. Render generates `JWT_SECRET` and supplies the database connection automatically.
4. Use the web service's `onrender.com` URL as the public app link.

### Database (Neon / Supabase / Render PostgreSQL)
1. Create a PostgreSQL database instance on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).
2. Copy the Connection URI.
3. Apply `backend/database/schema.sql` (or run `npm run seed` with `DATABASE_URL` set).

### Backend (Render / Railway)
1. Push your repository to GitHub.
2. In Render/Railway, create a new **Web Service** with root directory `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `node src/server.js`
5. Set Environment Variables:
   - `DATABASE_URL`: *Your PostgreSQL Connection String*
   - `JWT_SECRET`: *Strong Random Secret*
   - `CLIENT_URL`: *Your Frontend Vercel URL*
   - `OVERDUE_DAYS`: `3`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
4. Deploy!
