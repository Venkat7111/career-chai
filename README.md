# Career With Chaithanya 🚀

> **Learn. Complete. Grow.**

A professional career and task management platform built with React + Vite, Node.js + Express.js, and Supabase PostgreSQL.

---

## Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | React 18 + Vite     |
| Backend   | Node.js + Express   |
| Database  | Supabase PostgreSQL |
| Auth      | JWT (httpOnly cookie) + bcrypt |
| Email     | Nodemailer (SMTP)   |
| Deployment| Vercel (single project) |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo>
cd career_with_chai
npm run install:all
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_DB_URL` — Your Supabase PostgreSQL connection string
- `ADMIN_PASSWORD` — Password for the admin account
- `JWT_SECRET` — A long random string for JWT signing
- `MAIL_USERNAME` / `MAIL_PASSWORD` — SMTP credentials

### 3. Set Up the Database

Run the SQL schema in your **Supabase SQL Editor**:

```
backend/database/schema.sql
```

### 4. Seed the Admin Account

```bash
npm run seed
```

This creates the admin account: `careerwithchaithanya@gmail.com`

### 5. Run Locally

**Backend** (port 5000):
```bash
npm run dev:backend
```

**Frontend** (port 5173):
```bash
npm run dev:frontend
```

The Vite dev server proxies `/api/*` → `http://localhost:5000`.

---

## Deployment (Vercel)

1. Push this repo to GitHub
2. Create a new **Vercel project** and import the repo
3. Set root directory to the repo root (not frontend/)
4. Add all environment variables from `.env` in Vercel dashboard
5. Deploy — Vercel handles the frontend build + backend serverless API

---

## Admin Login

- **Email:** `careerwithchaithanya@gmail.com`
- **Password:** Set via `ADMIN_PASSWORD` env variable

---

## User Flow

```
Sign Up → PENDING → Admin Approves → ACTIVE → Browse Tasks → Take Task → Start → Submit Proof → Completed
```

---

## Features

### Users
- ✅ Sign up / Login / Logout
- ✅ Dashboard with stats
- ✅ Browse & take official tasks
- ✅ Start, submit proof, complete tasks
- ✅ View task history
- ✅ View submitted results
- ✅ Private personal To-Do list (CRUD, priority, due date)
- ✅ Profile page

### Admin
- ✅ Dashboard with platform stats
- ✅ User management (approve/reject/revoke/disable/enable)
- ✅ Task management (create/edit/publish/remove)
- ✅ Assignment oversight (search/filter/remove with email notification)
- ✅ Results review
- ✅ Statistics page

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in httpOnly secure cookies
- User ID always read from JWT server-side
- Admin routes double-protected by role check
- Todos are row-level isolated per user
