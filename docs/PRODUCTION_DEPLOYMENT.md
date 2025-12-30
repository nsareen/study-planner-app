# Study Planner V2 - Production Deployment Guide

**Version:** 2.0.0
**Last Updated:** 2025-12-30
**Estimated Time:** 2-3 hours (first deployment)

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: Supabase PostgreSQL Setup](#phase-1-supabase-postgresql-setup)
4. [Phase 2: Backend Deployment (Railway)](#phase-2-backend-deployment-railway)
5. [Phase 3: Database Migration](#phase-3-database-migration)
6. [Phase 4: Backend Testing](#phase-4-backend-testing)
7. [Phase 5: Frontend Deployment (Vercel)](#phase-5-frontend-deployment-vercel)
8. [Phase 6: Production Verification](#phase-6-production-verification)
9. [Rollback Procedures](#rollback-procedures)
10. [Troubleshooting](#troubleshooting)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts (Free Tiers Available)
- ✅ GitHub account (existing)
- ✅ Vercel account (connect via GitHub)
- ⏳ Supabase account (create new)
- ⏳ Railway account (create new) OR Render account

### Required Tools
```bash
# Verify installations:
node --version    # Should be v18+ or v20+
npm --version     # Should be v9+ or v10+
git --version     # Should be v2+

# Install if missing:
# Node.js: https://nodejs.org/
# Git: https://git-scm.com/
```

### Required Access
- GitHub repository write access
- Ability to create cloud accounts (credit card for identity verification, but using free tiers)

---

## Architecture Overview

**Production Stack:**
```
┌─────────────────────────────────────────────────────┐
│                    USERS                             │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Vercel CDN (Frontend)                              │
│  - React + Vite                                     │
│  - Static assets                                    │
│  - Environment: production                          │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Railway (Backend API)                              │
│  - Express.js + Node.js                             │
│  - REST API endpoints                               │
│  - Auto-scaling                                     │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Supabase (Database + Auth)                         │
│  - PostgreSQL database                              │
│  - Authentication (future)                          │
│  - Real-time subscriptions (future)                 │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User visits `https://study-planner-v2.vercel.app`
2. Frontend loads from Vercel CDN
3. User actions trigger API calls to Railway backend
4. Backend queries/updates Supabase PostgreSQL
5. Optimistic updates: localStorage → Backend sync (background)

---

## Phase 1: Supabase PostgreSQL Setup

**Time:** 15-20 minutes

### Step 1.1: Create Supabase Project

1. **Go to Supabase:**
   - Visit: https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (recommended)

2. **Create New Project:**
   - Click "New Project"
   - Organization: Create new or use existing
   - Project Name: `study-planner-v2`
   - Database Password: Generate strong password (save this!)
   - Region: Choose closest to your users (e.g., `us-east-1`)
   - Pricing Plan: **Free** (includes 500MB database, 2GB bandwidth)
   - Click "Create new project"

3. **Wait for Setup:**
   - Takes ~2-3 minutes to provision
   - You'll see "Setting up project..." spinner
   - Don't close the browser tab

### Step 1.2: Get Database Connection String

1. **Navigate to Database Settings:**
   - In Supabase dashboard, click "Project Settings" (gear icon)
   - Click "Database" in sidebar
   - Scroll to "Connection string" section

2. **Copy Connection String:**
   - Select "URI" tab (not "Session" or "Transaction")
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.abc123.supabase.co:5432/postgres
     ```
   - **Important:** Replace `[YOUR-PASSWORD]` with the password you set in Step 1.1
   - Save this in a secure location (you'll need it in Phase 2)

3. **Copy Project URL and Keys:**
   - Go to "Project Settings" → "API"
   - Copy and save these values:
     - **Project URL:** `https://abc123.supabase.co`
     - **anon/public key:** `eyJhbGc...` (long JWT token)
     - **service_role key:** `eyJhbGc...` (different JWT token)

### Step 1.3: Configure Database Access

1. **Allow External Connections:**
   - In Supabase dashboard, go to "Project Settings" → "Database"
   - Under "Connection pooling", ensure "Enable connection pooling" is ON
   - Under "SSL enforcement", ensure "Require SSL" is ON

2. **Verify Database is Ready:**
   - In Supabase dashboard, click "SQL Editor" (in sidebar)
   - Run this test query:
     ```sql
     SELECT version();
     ```
   - You should see PostgreSQL version info
   - If this works, database is ready! ✅

### Step 1.4: Save Supabase Credentials (SECURE)

Create a secure file (NOT in git repo) with your credentials:

```bash
# Create credentials file (local only, NOT committed):
touch ~/study-planner-production-credentials.txt

# Add this content (replace with your actual values):
# SUPABASE CREDENTIALS
# ===================
# Project URL: https://abc123.supabase.co
# Project ID: abc123
# Database Password: [your-strong-password]
# Connection String: postgresql://postgres:[password]@db.abc123.supabase.co:5432/postgres
# Anon Key: eyJhbGc...
# Service Role Key: eyJhbGc...
# Created: 2025-12-30
```

**🔒 SECURITY NOTE:** Keep this file secure. Add to `.gitignore` if in project directory.

---

## Phase 2: Backend Deployment (Railway)

**Time:** 20-30 minutes

**Why Railway?**
- ✅ Easiest setup (GitHub integration)
- ✅ Automatic HTTPS
- ✅ Free tier: $5/month credit (enough for MVP)
- ✅ PostgreSQL addon available (though we're using Supabase)
- ✅ Automatic deployments from GitHub

*(See `docs/PLATFORM_COMPARISON.md` for Railway vs Render comparison)*

### Step 2.1: Create Railway Account

1. **Sign Up:**
   - Visit: https://railway.app
   - Click "Login" → "Login with GitHub"
   - Authorize Railway to access your GitHub account
   - No credit card required for signup (free trial)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repository
   - Select: `study-planner-app` repository
   - Branch: `feature/phase6-component-migration` (or `main` if merged)

### Step 2.2: Configure Backend Service

1. **Set Root Directory:**
   - Railway will detect your repo
   - Click on the created service
   - Go to "Settings" tab
   - Under "Build", set:
     - **Root Directory:** `server`
     - **Build Command:** `npm install && npx prisma generate`
     - **Start Command:** `npm start`

2. **Set Environment Variables:**
   - In Railway service, click "Variables" tab
   - Click "+ New Variable"
   - Add these variables one by one:

   ```bash
   # Database (from Supabase)
   DATABASE_URL=postgresql://postgres:[password]@db.abc123.supabase.co:5432/postgres

   # Server Configuration
   PORT=3000
   NODE_ENV=production

   # CORS Configuration (update with your Vercel URL later)
   FRONTEND_URL=https://study-planner-v2.vercel.app
   ALLOWED_ORIGINS=https://study-planner-v2.vercel.app,https://study-planner-v2-preview.vercel.app

   # Authentication
   JWT_SECRET=GENERATE_THIS_IN_STEP_2_3
   JWT_EXPIRY=7d

   # Supabase (from Step 1.3)
   SUPABASE_URL=https://abc123.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...

   # Logging
   LOG_LEVEL=info
   ```

3. **Generate JWT Secret:**
   ```bash
   # On your local machine, run:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Copy the output (64-character hex string)
   # Add to Railway as JWT_SECRET variable
   ```

### Step 2.3: Deploy Backend

1. **Trigger Deployment:**
   - In Railway service dashboard
   - Click "Deployments" tab
   - Click "Deploy" button (or it auto-deploys on variable save)
   - Watch build logs

2. **Wait for Build:**
   - Build takes ~2-5 minutes
   - You'll see:
     - ✅ Installing dependencies
     - ✅ Running Prisma generate
     - ✅ Starting server
   - Look for: "Deployment Live"

3. **Get Backend URL:**
   - In Railway service, go to "Settings" tab
   - Under "Domains", you'll see auto-generated domain:
     - Example: `study-planner-api.railway.app`
   - Click "Generate Domain" if not shown
   - **Save this URL** (you'll need it for frontend)

### Step 2.4: Verify Backend is Running

```bash
# Test health endpoint (replace with your Railway URL):
curl https://study-planner-api.railway.app/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2025-12-30T...",
#   "database": "connected"
# }
```

If you see the above, backend is deployed! ✅

---

## Phase 3: Database Migration

**Time:** 10-15 minutes

### Step 3.1: Run Prisma Migrations

**Option A: Via Railway CLI (Recommended)**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   # Opens browser for authentication
   ```

3. **Link to Project:**
   ```bash
   cd server
   railway link
   # Select your study-planner project
   # Select the backend service
   ```

4. **Run Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

5. **Verify Migration:**
   ```bash
   railway run npx prisma db seed  # Optional: if you have seed data
   ```

**Option B: Via Supabase SQL Editor (Alternative)**

1. **Generate SQL Migration:**
   ```bash
   cd server
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > migration.sql
   ```

2. **Run in Supabase:**
   - Open Supabase dashboard → SQL Editor
   - Copy contents of `migration.sql`
   - Paste and click "Run"

### Step 3.2: Verify Database Schema

1. **Check Tables Created:**
   - In Supabase dashboard → Table Editor
   - You should see tables:
     - `User`
     - `Chapter`
     - `ChapterAssignment`
     - `ActivitySession`
     - `StudyPlan`
     - `Exam`
     - `ExamGroup`
     - `DailyLog`
     - `DailyTask`
     - `OffDay`
     - `Settings`

2. **Test Database Connection from Backend:**
   ```bash
   curl https://study-planner-api.railway.app/api/users
   # Should return: {"users": []} (empty array, not an error)
   ```

If tables exist and API responds, migrations successful! ✅

---

## Phase 4: Backend Testing

**Time:** 10-15 minutes

### Step 4.1: Test Core Endpoints

**Create Test User:**
```bash
curl -X POST https://study-planner-api.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "name": "Test User",
    "avatar": "👤",
    "grade": 9
  }'

# Expected: {"user": {...}, "success": true}
```

**Create Test Chapter:**
```bash
curl -X POST https://study-planner-api.railway.app/api/chapters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "subject": "Math",
    "chapter": "Algebra Basics",
    "studyHours": 5,
    "revisionHours": 2
  }'

# Expected: {"chapter": {...}, "success": true}
```

**Fetch Chapters:**
```bash
curl https://study-planner-api.railway.app/api/chapters?userId=test-user-1

# Expected: {"chapters": [{...}]}
```

**Delete Test Data:**
```bash
# Get chapter ID from previous response, then:
curl -X DELETE https://study-planner-api.railway.app/api/chapters/{chapterId}

# Delete user:
curl -X DELETE https://study-planner-api.railway.app/api/users/test-user-1
```

### Step 4.2: Test Error Handling

**Test Invalid Data:**
```bash
curl -X POST https://study-planner-api.railway.app/api/chapters \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'

# Expected: {"error": "...", "success": false}
```

**Test CORS:**
```bash
curl -X OPTIONS https://study-planner-api.railway.app/api/chapters \
  -H "Origin: https://study-planner-v2.vercel.app" \
  -H "Access-Control-Request-Method: GET"

# Expected: Access-Control-Allow-Origin header in response
```

If all tests pass, backend is production-ready! ✅

---

## Phase 5: Frontend Deployment (Vercel)

**Time:** 15-20 minutes

### Step 5.1: Configure Production Environment

1. **Create Production Environment File:**
   ```bash
   # In project root, create .env.production:
   touch .env.production
   ```

2. **Add Production Variables:**
   ```bash
   # .env.production content:
   VITE_API_URL=https://study-planner-api.railway.app
   VITE_SUPABASE_URL=https://abc123.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   VITE_ENABLE_CLOUD_SYNC=true
   VITE_ENABLE_ANALYTICS=false
   ```

3. **Test Production Build Locally:**
   ```bash
   npm run build
   # Should complete without errors

   npm run preview
   # Opens production build on localhost:4173
   # Test basic functionality
   ```

### Step 5.2: Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. **Connect to Vercel:**
   - Visit: https://vercel.com
   - Login with GitHub
   - Click "Add New" → "Project"
   - Import `study-planner-app` repository

2. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave empty, not `study-planner-app`)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Under "Environment Variables" section
   - Add each variable from `.env.production`:
     - `VITE_API_URL` = `https://study-planner-api.railway.app`
     - `VITE_SUPABASE_URL` = `https://abc123.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGc...`
     - `VITE_ENABLE_CLOUD_SYNC` = `true`
   - Environment: **Production**

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - You'll get a URL: `https://study-planner-app-abc123.vercel.app`

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI:
npm install -g vercel

# Login:
vercel login

# Deploy to production:
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: study-planner-v2
# - Directory: ./ (current directory)
# - Override settings? No

# After deployment, set environment variables:
vercel env add VITE_API_URL production
# Enter: https://study-planner-api.railway.app

vercel env add VITE_SUPABASE_URL production
# Enter: https://abc123.supabase.co

# Redeploy with environment variables:
vercel --prod
```

### Step 5.3: Configure Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Project Settings → Domains
   - Click "Add"
   - Enter your domain: `study-planner.yourdomain.com`
   - Follow DNS configuration instructions

2. **Update Railway CORS:**
   - Go to Railway → Backend Service → Variables
   - Update `FRONTEND_URL` and `ALLOWED_ORIGINS` with your custom domain

---

## Phase 6: Production Verification

**Time:** 15-20 minutes

### Step 6.1: End-to-End User Flow Test

1. **Open Production URL:**
   - Visit: `https://study-planner-v2.vercel.app` (or your custom domain)

2. **Test User Selection:**
   - Click on a user (e.g., "Ananya")
   - Should redirect to `/dashboard`

3. **Test Cloud Sync (if enabled):**
   - Go to Settings → Cloud Sync
   - Toggle "Enable Cloud Sync" ON
   - Should show "Online" status

4. **Test Chapter Creation:**
   - Go to Subjects page
   - Add a new chapter:
     - Subject: "Test Subject"
     - Chapter: "Test Chapter"
     - Study Hours: 5
     - Revision Hours: 2
   - Click "Add Chapter"
   - Should see loading spinner, then success

5. **Verify Backend Sync:**
   - Open browser DevTools → Network tab
   - Add another chapter
   - Look for POST request to `https://study-planner-api.railway.app/api/chapters`
   - Should return 200 OK

6. **Test Offline Mode:**
   - In DevTools → Network tab, set "Throttling" to "Offline"
   - Try to add a chapter
   - Should show offline indicator (orange badge)
   - Chapter should be saved to localStorage
   - Set back to "Online"
   - Should auto-sync to backend (check Network tab)

7. **Test Timer Operations:**
   - Go to Today's Plan
   - Schedule a chapter for today
   - Click "Start" on timer
   - Should see timer running
   - Check Network tab for POST to `/api/sessions/start`

### Step 6.2: Verify Data Persistence

1. **Create Test Data:**
   - Add 2-3 chapters in Subjects
   - Schedule them in Today's Plan
   - Start and complete a timer session

2. **Check Supabase Database:**
   - Open Supabase dashboard → Table Editor
   - Check `Chapter` table → Should have your test chapters
   - Check `ActivitySession` table → Should have session record

3. **Test Multi-Device Sync (if available):**
   - Open production URL in different browser/device
   - Login as same user
   - Should see same data (chapters, assignments, sessions)

### Step 6.3: Performance Check

1. **Run Lighthouse Audit:**
   - Open production URL in Chrome
   - DevTools → Lighthouse tab
   - Select: Performance, Accessibility, Best Practices, SEO
   - Click "Analyze page load"
   - Target scores:
     - Performance: 80+ (acceptable), 90+ (excellent)
     - Accessibility: 90+
     - Best Practices: 90+
     - SEO: 90+

2. **Check Bundle Size:**
   - In Vercel deployment logs, check "Build Output"
   - Main bundle should be <500 KB (gzipped)

3. **Test Load Time:**
   - Use Chrome DevTools → Network tab
   - Hard refresh (Cmd/Ctrl + Shift + R)
   - Check "Finish" time: Should be <3 seconds

If all verifications pass, production is LIVE! 🚀

---

## Rollback Procedures

### Scenario 1: Frontend Deployment Broken

**Quick Rollback (Vercel):**
```bash
# Via Vercel dashboard:
# 1. Go to Deployments tab
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI:
vercel rollback https://study-planner-v2-abc123.vercel.app
```

**Fix and Redeploy:**
```bash
git revert <broken-commit-hash>
git push origin main
# Vercel auto-deploys
```

### Scenario 2: Backend API Broken

**Quick Rollback (Railway):**
1. Go to Railway → Backend Service → Deployments
2. Find previous working deployment
3. Click "..." → "Redeploy"

**Database Migration Rollback:**
```bash
# If migration caused issues:
railway run npx prisma migrate rollback

# Or manually in Supabase SQL Editor:
DROP TABLE IF EXISTS NewTable;
ALTER TABLE OldTable RENAME TO OriginalName;
```

### Scenario 3: Database Connection Issues

**Switch to Emergency Maintenance Mode:**
```bash
# In Railway, update environment variable:
MAINTENANCE_MODE=true

# Backend should respond with 503 Service Unavailable
# Add maintenance message in API
```

**Investigate:**
- Check Supabase dashboard for database status
- Verify DATABASE_URL is correct
- Check Railway logs for connection errors

### Scenario 4: Complete Rollback to V1

If V2 deployment fails completely:

```bash
# 1. Redeploy V1 frontend:
git checkout v1.2.0  # or your V1 tag
vercel --prod

# 2. Disable backend:
# In Railway → Settings → Pause service

# 3. Notify users:
# Add banner: "V2 deployment temporarily paused, V1 active"

# 4. Debug offline, redeploy when ready
```

---

## Troubleshooting

### Issue: Backend Returns 500 Errors

**Diagnosis:**
```bash
# Check Railway logs:
railway logs

# Look for:
# - Database connection errors
# - Prisma client errors
# - Uncaught exceptions
```

**Solutions:**
- Verify DATABASE_URL is correct in Railway variables
- Check Supabase database is not paused (free tier)
- Restart Railway service: Settings → Restart

### Issue: CORS Errors in Frontend

**Symptoms:**
- Browser console shows: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solutions:**
1. Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
2. Check `ALLOWED_ORIGINS` includes all Vercel preview URLs
3. Restart Railway service after updating variables

**Test CORS:**
```bash
curl -X OPTIONS https://study-planner-api.railway.app/api/chapters \
  -H "Origin: https://study-planner-v2.vercel.app" \
  -v
# Should see Access-Control-Allow-Origin header
```

### Issue: Environment Variables Not Loading

**Frontend (Vercel):**
- Variables must start with `VITE_` to be exposed to client
- After adding variables, redeploy (variables need rebuild)
- Check: `console.log(import.meta.env.VITE_API_URL)` in code

**Backend (Railway):**
- Variables are available immediately, no redeploy needed (usually)
- Check: `process.env.DATABASE_URL` in code
- Restart service if variables not appearing

### Issue: Database Migrations Fail

**Error: "Table already exists"**
```bash
# Reset migration state:
railway run npx prisma migrate reset --force

# Reapply migrations:
railway run npx prisma migrate deploy
```

**Error: "Connection timeout"**
- Check Supabase database is running (not paused)
- Verify DATABASE_URL connection string is correct
- Check IP allowlist in Supabase (should allow all IPs for Railway)

### Issue: Slow API Response Times

**Diagnosis:**
- Railway free tier has cold starts (~1-2 seconds for first request)
- Check Railway metrics: Dashboard → Service → Metrics

**Solutions:**
- Upgrade to Railway Pro ($5/month, no cold starts)
- Implement caching in backend (Redis addon)
- Use Vercel serverless functions for simple endpoints (future)

### Issue: Vercel Build Fails

**Common Causes:**
1. TypeScript errors (strict mode)
2. Missing environment variables
3. Import path issues

**Check Build Logs:**
- Vercel Dashboard → Deployments → Click failed deployment → View logs

**Fix:**
```bash
# Test build locally:
npm run build
# Fix any TypeScript errors

# If build succeeds locally but fails on Vercel:
# - Check Node.js version in Vercel settings
# - Ensure all dependencies in package.json (not just devDependencies)
```

---

## Monitoring & Maintenance

### Daily Checks (Automated Recommended)

**1. Uptime Monitoring:**
- Use: https://uptimerobot.com (free)
- Monitor: `https://study-planner-api.railway.app/health`
- Alert if down for >5 minutes

**2. Error Tracking:**
- Recommended: Sentry (https://sentry.io)
- Add to backend:
  ```bash
  npm install @sentry/node
  ```
- Add DSN to Railway environment variables

**3. Database Health:**
- Supabase free tier: Check dashboard for resource usage
- Watch for:
  - Database size approaching 500MB limit
  - Connection pool exhaustion

### Weekly Maintenance

**1. Review Railway Logs:**
```bash
railway logs --filter "ERROR"
# Look for recurring errors
```

**2. Check Database Performance:**
- In Supabase → Database → Performance
- Look for slow queries
- Add indexes if needed

**3. Update Dependencies:**
```bash
# Check for security updates:
npm audit

# Update non-breaking:
npm update

# Test locally, then deploy
```

### Monthly Maintenance

**1. Database Backup:**
- Supabase auto-backups (free tier: 7 days retention)
- Manual backup:
  - Supabase → Database → Backups → Download

**2. Review Costs:**
- Railway: Check monthly credit usage
- Supabase: Check bandwidth/storage usage
- Vercel: Check bandwidth/build minutes

**3. Performance Optimization:**
- Review Lighthouse scores
- Check bundle size growth
- Optimize images/assets if needed

---

## Production Checklist

Use this checklist on deployment day:

### Pre-Deployment

- [ ] All tests passing (confirmed by testing agent)
- [ ] Code reviewed and merged to `main` branch
- [ ] Supabase account created
- [ ] Railway account created
- [ ] All credentials documented securely
- [ ] `.env.production` created and verified
- [ ] Production build tested locally (`npm run build && npm run preview`)

### Deployment

- [ ] Supabase database created and verified
- [ ] Railway backend deployed and health check passing
- [ ] Prisma migrations applied to production database
- [ ] Backend API endpoints tested (CRUD operations work)
- [ ] Vercel frontend deployed
- [ ] Environment variables set in Vercel
- [ ] CORS configured correctly (tested with curl)

### Post-Deployment

- [ ] Production URL accessible
- [ ] User can login and see dashboard
- [ ] Chapter creation works (backend sync verified)
- [ ] Timer operations work (session tracking)
- [ ] Offline mode works (localStorage fallback)
- [ ] Data persists across page refreshes
- [ ] Lighthouse audit scores acceptable (80+ performance)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring configured
- [ ] Documentation updated with production URLs

### Rollback Plan

- [ ] V1 deployment URL documented (fallback)
- [ ] Railway rollback procedure tested
- [ ] Database backup taken before migration
- [ ] Rollback commands documented and accessible

---

## Next Steps After Deployment

1. **Monitor First 24 Hours:**
   - Check Railway logs for errors
   - Monitor user feedback
   - Watch for performance issues

2. **User Communication:**
   - Announce V2 launch
   - Share new production URL
   - Document new features (cloud sync, offline mode)

3. **Phase 7 Complete:**
   - Tag release: `git tag v2.0.0`
   - Update PROGRESS.md
   - Close GitHub issue for Phase 7

4. **V2.5 Planning:**
   - Parent monitoring features
   - Real-time collaboration
   - Advanced analytics

---

## Support & Resources

**Documentation:**
- Backend Setup: `docs/BACKEND_SETUP.md`
- Backend Integration: `docs/BACKEND_INTEGRATION_GUIDE.md`
- Platform Comparison: `docs/PLATFORM_COMPARISON.md`

**External Resources:**
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

**Getting Help:**
- Railway Discord: https://discord.gg/railway
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create issue in repository

---

**Deployment Guide Version:** 1.0
**Last Updated:** 2025-12-30
**Next Review:** After first production deployment

**Good luck with your V2 launch! 🚀**
