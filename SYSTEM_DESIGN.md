# Society Maintenance Tracker - System Design Document

## 1. Overall Architecture

Society Maintenance Tracker is a full-stack, multi-tenant-ready apartment management platform engineered using a decoupled client-server architecture:

```
[ React 18 + Vite + Tailwind CSS ] 
             │  (REST API / JWT Bearer)
             ▼
[ Express.js + Node.js Application Layer ]
   ├── Authentication & RBAC Guard
   ├── Dynamic Overdue Engine
   ├── Multer + Cloudinary Storage Pipeline
   └── Nodemailer / SMTP Async Notification Service
             │
             ▼
[ PostgreSQL Relational Database ]
```

- **Frontend**: Single-Page Application (SPA) powered by React 18, React Router v6, Axios interceptors, and Tailwind CSS.
- **Backend**: Express.js REST API providing strict input validation (`express-validator`), role-based authorization, non-blocking email dispatch, and centralized error handling.
- **Persistence**: Relational PostgreSQL database with constraints, cascade rules, and query indexes.

---

## 2. Database Schema & Relationships

The relational design enforces referential integrity and zero data loss:

1. **`users`**: Stores resident and administrator profiles (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `flat_number`, timestamps).
2. **`complaints`**: Primary maintenance tickets (`id`, `resident_id` → `users.id`, `category`, `title`, `description`, `photo_url`, `status`, `priority`, `created_at`, `updated_at`, `resolved_at`).
3. **`complaint_history`**: Immutable audit trail (`id`, `complaint_id` → `complaints.id` ON DELETE CASCADE, `previous_status`, `new_status`, `note`, `actor_id` → `users.id`, `created_at`).
4. **`notices`**: Society bulletins (`id`, `title`, `content`, `is_important`, `created_by` → `users.id`, `created_at`, `updated_at`).

---

## 3. Complaint History & Audit Model

Every maintenance complaint implements an append-only audit lifecycle:
- Upon complaint submission, an initial history record is created (`previous_status: NULL`, `new_status: 'Open'`, `actor_id: resident_id`).
- When an administrator updates a status (`Open` → `In Progress` → `Resolved`), the update executes atomically:
  1. The complaint's `status` and `updated_at` (and `resolved_at` if transitioning to `Resolved`) are updated.
  2. A new entry is appended to `complaint_history` with the previous status, new status, timestamp, actor ID, and optional technician remarks.
- The history table is never mutated or deleted on updates, ensuring compliance and transparent dispute resolution.

---

## 4. Dynamic Overdue Detection Engine

Overdue evaluation is computed dynamically rather than stored as a stale static boolean:
- **Threshold**: Configured via the `OVERDUE_DAYS` environment variable (default: `3` days).
- **Condition**: A complaint is flagged as overdue if and only if:
  $$\text{status} \neq \text{'Resolved'} \quad \text{AND} \quad (\text{now} - \text{created\_at}) \ge \text{OVERDUE\_DAYS}$$
- Overdue complaints are automatically prioritized to appear at the top of the admin table and dashboard alerts, and are flagged with an animated warning indicator in resident views.

---

## 5. Photo Upload & Storage Pipeline

1. **Multer Middleware**: Enforces a 5MB maximum file size limit and restricts MIME types to image formats (`image/jpeg`, `image/png`, `image/webp`, `image/gif`).
2. **Cloudinary Stream**: If Cloudinary credentials are provided, buffers are streamed directly to Cloudinary secure cloud storage (`folder: 'society_maintenance'`).
3. **Local Disk Fallback**: If cloud storage credentials are not provided (e.g. offline dev mode), buffers are written to the local `/uploads/` directory and served statically.
4. Only the resulting HTTPS/HTTP URL is stored in the `complaints.photo_url` column.

---

## 6. Asynchronous Notification Flow

Email notifications run asynchronously using `nodemailer` and custom branded HTML templates:
1. **Complaint Status Change**: When an admin updates ticket status, an email is dispatched to the filing resident containing Complaint ID, Category, Status transition, Admin Note, and direct ticket link.
2. **Important Society Notice**: When a notice is published with `is_important = true`, the system broadcasts an announcement email to all active society residents.
3. **Non-Blocking Resilience**: Email errors are caught and logged without failing the parent database transaction or HTTP response.

---

## 7. Authentication & Role-Based Access Control (RBAC)

- **Password Security**: Passwords are encrypted using `bcryptjs` with 10 salt rounds. Plaintext passwords are never stored or logged.
- **Session Tokens**: Stateless JSON Web Tokens (JWT) signed with `HS256` containing `userId`, `email`, and `role`, with a 7-day expiration.
- **Middleware Guards**:
  - `authenticateToken`: Validates Bearer token header and attaches the user model to `req.user`.
  - `requireRole('admin')`: Restricts administrative endpoints (status updates, priority management, dashboard analytics, notice broadcasts) exclusively to admin users.
  - Resident routes enforce that residents may only query or access their own tickets (`WHERE resident_id = req.user.id`).
