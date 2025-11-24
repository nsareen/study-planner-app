# Backend Setup Guide

This guide walks you through setting up the Express.js + Prisma backend for the Study Planner application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Running the Backend](#running-the-backend)
5. [API Documentation](#api-documentation)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ and npm installed
- **PostgreSQL** database (local or Supabase)
- **Git** for version control

---

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

This installs all frontend and backend dependencies including:
- `express` - Web framework
- `@prisma/client` - Database ORM
- `prisma` - Database toolkit
- `cors` - CORS middleware
- `zod` - Runtime validation
- `tsx` - TypeScript execution

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/study_planner?schema=public"

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Important:** Never commit `.env` to git. It's already in `.gitignore`.

---

## Database Setup

### Option 1: Local PostgreSQL

#### Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
psql postgres
CREATE DATABASE study_planner;
CREATE USER study_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE study_planner TO study_user;
\q
```

Update your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://study_user:your_password@localhost:5432/study_planner?schema=public"
```

### Option 2: Supabase (Recommended for Production)

1. **Create Account:** Go to [supabase.com](https://supabase.com) and sign up
2. **Create Project:** Create a new project and note the database password
3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the "Connection string" under "Connection pooling"
   - Replace `[YOUR-PASSWORD]` with your database password

4. **Update `.env`:**
```env
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## Running Prisma Migrations

### 1. Generate Prisma Client

```bash
npm run prisma:generate
```

This creates the TypeScript Prisma client from your `prisma/schema.prisma` file.

### 2. Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all tables, indexes, and constraints in your database.

**Expected output:**
```
Applying migration `20250124000000_initial_migration`
Database schema is up to date!
✔ Generated Prisma Client
```

### 3. Verify Schema (Optional)

Open Prisma Studio to visualize your database:

```bash
npm run prisma:studio
```

This opens `http://localhost:5555` where you can browse tables.

---

## Running the Backend

### Development Mode (Single Server)

Run the Express server only:

```bash
npm run dev:server
```

**Expected output:**
```
🚀 Study Planner API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Environment: development
  Port:        3001
  URL:         http://localhost:3001
  Health:      http://localhost:3001/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Full Stack Development

Run both frontend (Vite) and backend (Express) concurrently:

```bash
npm run dev:full
```

This runs:
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:3001`

**Test the backend:**

```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-24T10:30:00.000Z",
  "uptime": 42.5
}
```

---

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

Currently, the API uses `userId` query parameters for user identification. In production, implement JWT or session-based auth.

---

### **Endpoints**

#### **Users**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/:id/stats` | Get user statistics |
| POST | `/api/users` | Create new user |
| PATCH | `/api/users/:id` | Update user |

**Example: Get User**
```bash
curl http://localhost:3001/api/users/ananya
```

**Response:**
```json
{
  "id": "ananya",
  "name": "Ananya",
  "email": null,
  "avatar": "👧",
  "grade": "9th",
  "streak": 5,
  "level": 3,
  "xp": 1500
}
```

---

#### **Chapters**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chapters?userId=xxx` | Get all chapters for user |
| GET | `/api/chapters/:id` | Get chapter by ID |
| GET | `/api/chapters/stats/:userId` | Get chapter statistics |
| POST | `/api/chapters` | Create chapter |
| PATCH | `/api/chapters/:id` | Update chapter |
| DELETE | `/api/chapters/:id` | Delete chapter |

**Example: Create Chapter**
```bash
curl -X POST http://localhost:3001/api/chapters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ananya",
    "subject": "Mathematics",
    "name": "Algebra Basics",
    "studyHours": 5,
    "revisionHours": 2
  }'
```

---

#### **Assignments**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments?userId=xxx&date=YYYY-MM-DD` | Get assignments |
| GET | `/api/assignments/date-range?userId=xxx&startDate=xxx&endDate=xxx` | Get assignments in date range |
| GET | `/api/assignments/:id` | Get assignment by ID |
| POST | `/api/assignments` | Create assignment |
| PATCH | `/api/assignments/:id` | Update assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |

**Example: Get Today's Assignments**
```bash
curl "http://localhost:3001/api/assignments?userId=ananya&date=2025-01-24"
```

---

#### **Sessions**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions?userId=xxx` | Get all sessions |
| GET | `/api/sessions/active?userId=xxx` | Get active session |
| POST | `/api/sessions` | Start new session |
| PATCH | `/api/sessions/:id/pause` | Pause session |
| PATCH | `/api/sessions/:id/resume` | Resume session |
| PATCH | `/api/sessions/:id/complete` | Complete session |

**Example: Start Session**
```bash
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ananya",
    "assignmentId": "assignment-123",
    "chapterId": "chapter-456",
    "date": "2025-01-24",
    "sessionId": "session-789"
  }'
```

---

#### **Study Plans**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/study-plans?userId=xxx` | Get all study plans |
| GET | `/api/study-plans/:id` | Get plan by ID |
| POST | `/api/study-plans` | Create plan |
| POST | `/api/study-plans/:id/activate` | Activate plan |
| PATCH | `/api/study-plans/:id` | Update plan |
| DELETE | `/api/study-plans/:id` | Delete plan |

---

#### **Cloud Sync**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync/push` | Push local data to cloud |
| GET | `/api/sync/pull?userId=xxx` | Pull cloud data |
| GET | `/api/sync/status?userId=xxx` | Get sync status |

**Example: Push to Cloud**
```bash
curl -X POST http://localhost:3001/api/sync/push \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "ananya",
    "data": {
      "chapters": [...],
      "assignments": [...],
      "version": 1
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "syncedAt": "2025-01-24T10:30:00.000Z",
  "version": 2
}
```

---

## Testing

### Manual API Testing

Use `curl`, Postman, or Thunder Client (VS Code extension).

**Install Thunder Client in VS Code:**
1. Install "Thunder Client" extension
2. Create new request
3. Set method, URL, headers, and body
4. Send request and view response

### Automated Testing

Create test files in `tests/api/`:

```typescript
// tests/api/chapters.test.ts
import { describe, it, expect } from 'vitest';

describe('Chapters API', () => {
  it('should create a chapter', async () => {
    // Test implementation
  });
});
```

Run tests:
```bash
npm run test
```

---

## Deployment

### Deploying to Vercel (Frontend + Serverless Functions)

See `docs/DEPLOYMENT.md` for full Vercel deployment guide.

### Deploying Backend to Railway/Render

#### Railway

1. **Create Account:** [railway.app](https://railway.app)
2. **New Project:** Click "New Project" → "Deploy from GitHub repo"
3. **Select Repo:** Connect your GitHub repository
4. **Add PostgreSQL:** Click "New" → "Database" → "Add PostgreSQL"
5. **Environment Variables:**
   - Railway auto-injects `DATABASE_URL`
   - Add `PORT`, `NODE_ENV`, `CORS_ORIGIN`
6. **Build Command:** `npm run build:server`
7. **Start Command:** `node server/dist/index.js`

#### Render

1. **Create Account:** [render.com](https://render.com)
2. **New Web Service:** Select your repo
3. **Build Command:** `npm install && npm run prisma:generate && npm run build:server`
4. **Start Command:** `node server/dist/index.js`
5. **Add PostgreSQL:** Create new PostgreSQL database in Render
6. **Environment Variables:** Add `DATABASE_URL`, `CORS_ORIGIN`

---

## Troubleshooting

### Database Connection Errors

**Error:** `Error: P1001: Can't reach database server`

**Solution:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Test connection: `psql -U study_user -d study_planner`

### Prisma Errors

**Error:** `Prisma Client not generated`

**Solution:**
```bash
npm run prisma:generate
```

**Error:** `Migration failed`

**Solution:**
```bash
# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# Re-run migrations
npm run prisma:migrate
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

Or change `PORT` in `.env` to `3002`.

---

## Next Steps

1. ✅ Backend is running - verify with `/health` endpoint
2. ✅ Database is set up - test with Prisma Studio
3. ✅ API endpoints work - test with curl/Postman
4. 🔜 Integrate frontend with backend - update `VITE_API_URL`
5. 🔜 Deploy to production - see `docs/DEPLOYMENT.md`

---

## Support

- **Documentation:** `docs/` directory
- **GitHub Issues:** Report bugs at repository issues page
- **Prisma Docs:** [prisma.io/docs](https://www.prisma.io/docs)
- **Express Docs:** [expressjs.com](https://expressjs.com)

---

**Last Updated:** January 24, 2025
**Version:** 1.0
