# Phase 7 Production Deployment Checklist

**Deployment Date:** _________
**Deployed By:** _________
**Version:** v2.0.0

---

## Pre-Deployment Checklist

### Code Quality & Testing
- [ ] All tests passing (confirmed by testing agent)
  - [ ] Store tests: 196/196 passing
  - [ ] Utility tests: 95/95 passing
  - [ ] Component tests: 384/384 passing
  - [ ] Backend hook tests: 54/54 passing
  - [ ] Overall: 729/729 tests passing (100%)
- [ ] Testing agent has signaled `[TESTS_PASSING]`
- [ ] No critical bugs in GitHub issues
- [ ] Code reviewed (if team has reviewers)
- [ ] `main` branch is up to date with latest changes
- [ ] All merge conflicts resolved

### Documentation
- [ ] `PRODUCTION_DEPLOYMENT.md` reviewed
- [ ] `PLATFORM_COMPARISON.md` reviewed
- [ ] `.env.production.example` and `.env.railway.example` created
- [ ] Rollback procedures documented and understood

### Accounts & Access
- [ ] Supabase account created
- [ ] Railway account created
- [ ] Vercel account exists (already using for V1)
- [ ] GitHub repository access confirmed
- [ ] Credit card added to Railway (for usage beyond $5 free credit)

### Local Testing
- [ ] Production build tested locally:
  ```bash
  npm run build
  npm run preview
  ```
- [ ] No build errors or warnings
- [ ] Frontend works in production mode (localhost:4173)
- [ ] All critical user flows tested locally

### Credentials & Security
- [ ] Secure credentials storage prepared (1Password, LastPass, etc.)
- [ ] `.gitignore` includes `.env.production` and `.env.railway`
- [ ] Production secrets generated:
  - [ ] JWT_SECRET (64-byte random hex)
  - [ ] Supabase database password
- [ ] Team members have access to credentials (if applicable)

---

## Phase 1: Supabase Database Setup

### Create Supabase Project
- [ ] Visited https://supabase.com and signed up
- [ ] Created new project: `study-planner-v2`
- [ ] Selected region: _________ (closest to users)
- [ ] Set strong database password (saved securely)
- [ ] Selected **Free** pricing plan
- [ ] Waited for project provisioning (~2-3 minutes)

### Get Database Credentials
- [ ] Navigated to Project Settings → Database
- [ ] Copied connection string (URI mode)
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Connection string saved in: _________
- [ ] Navigated to Project Settings → API
- [ ] Copied Project URL: `https://_________.supabase.co`
- [ ] Copied anon/public key (saved)
- [ ] Copied service_role key (saved securely)

### Configure Database
- [ ] Enabled connection pooling
- [ ] Enabled SSL enforcement (Require SSL = ON)
- [ ] Tested database with SQL query:
  ```sql
  SELECT version();
  ```
- [ ] PostgreSQL version confirmed: _________

### Document Credentials
- [ ] Created secure credentials file (NOT in git repo)
- [ ] Documented:
  - [ ] Project URL
  - [ ] Project ID
  - [ ] Database password
  - [ ] Connection string
  - [ ] Anon key
  - [ ] Service role key
  - [ ] Creation date

**Phase 1 Complete:** ✅ (Date: ________)

---

## Phase 2: Backend Deployment (Railway)

### Create Railway Account
- [ ] Visited https://railway.app
- [ ] Signed up with GitHub
- [ ] Authorized Railway to access repository
- [ ] Created new project: "Deploy from GitHub repo"
- [ ] Selected repository: `study-planner-app`
- [ ] Selected branch: `main` (or current production branch)

### Configure Backend Service
- [ ] Set root directory: `server`
- [ ] Set build command: `npm install && npx prisma generate`
- [ ] Set start command: `npm start`
- [ ] Verified configuration saved

### Set Environment Variables
- [ ] Added `DATABASE_URL` (Supabase connection string)
- [ ] Added `PORT` = `3000`
- [ ] Added `NODE_ENV` = `production`
- [ ] Added `FRONTEND_URL` (will update after Vercel deployment)
- [ ] Added `ALLOWED_ORIGINS` (will update after Vercel deployment)
- [ ] Generated JWT_SECRET:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Added `JWT_SECRET` (generated value)
- [ ] Added `JWT_EXPIRY` = `7d`
- [ ] Added `SUPABASE_URL` (from Phase 1)
- [ ] Added `SUPABASE_ANON_KEY` (from Phase 1)
- [ ] Added `SUPABASE_SERVICE_KEY` (from Phase 1)
- [ ] Added `LOG_LEVEL` = `info`

### Deploy Backend
- [ ] Clicked "Deploy" in Railway dashboard
- [ ] Watched build logs (no errors)
- [ ] Build completed successfully (2-5 minutes)
- [ ] Deployment status: "Live"

### Get Backend URL
- [ ] Navigated to Settings → Domains
- [ ] Clicked "Generate Domain" (if not auto-generated)
- [ ] Backend URL obtained: `https://_________.railway.app`
- [ ] URL saved for frontend configuration

### Verify Backend Running
- [ ] Tested health endpoint:
  ```bash
  curl https://_________.railway.app/health
  ```
- [ ] Response status: 200 OK
- [ ] Response body includes: `{"status": "ok", "database": "connected"}`

**Phase 2 Complete:** ✅ (Date: ________)

---

## Phase 3: Database Migration

### Run Prisma Migrations

**Option A: Railway CLI (Preferred)**
- [ ] Installed Railway CLI:
  ```bash
  npm install -g @railway/cli
  ```
- [ ] Logged in to Railway:
  ```bash
  railway login
  ```
- [ ] Linked to project:
  ```bash
  cd server
  railway link
  ```
- [ ] Selected correct project and service
- [ ] Ran migrations:
  ```bash
  railway run npx prisma migrate deploy
  ```
- [ ] Migration output: No errors
- [ ] All migrations applied successfully

**Option B: Supabase SQL Editor (Alternative)**
- [ ] Generated SQL migration:
  ```bash
  npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
  ```
- [ ] Opened Supabase dashboard → SQL Editor
- [ ] Pasted migration SQL
- [ ] Clicked "Run"
- [ ] Execution successful

### Verify Database Schema
- [ ] Opened Supabase dashboard → Table Editor
- [ ] Confirmed tables exist:
  - [ ] User
  - [ ] Chapter
  - [ ] ChapterAssignment
  - [ ] ActivitySession
  - [ ] StudyPlan
  - [ ] Exam
  - [ ] ExamGroup
  - [ ] DailyLog
  - [ ] DailyTask
  - [ ] OffDay
  - [ ] Settings
- [ ] All 11 tables created successfully

**Phase 3 Complete:** ✅ (Date: ________)

---

## Phase 4: Backend Testing

### Test Core API Endpoints

**Create Test User:**
- [ ] Ran command:
  ```bash
  curl -X POST https://_________.railway.app/api/users \
    -H "Content-Type: application/json" \
    -d '{"userId":"test-1","name":"Test","avatar":"👤","grade":9}'
  ```
- [ ] Response: `{"user": {...}, "success": true}`

**Create Test Chapter:**
- [ ] Ran command:
  ```bash
  curl -X POST https://_________.railway.app/api/chapters \
    -H "Content-Type: application/json" \
    -d '{"userId":"test-1","subject":"Math","chapter":"Test","studyHours":5,"revisionHours":2}'
  ```
- [ ] Response: `{"chapter": {...}, "success": true}`

**Fetch Chapters:**
- [ ] Ran command:
  ```bash
  curl https://_________.railway.app/api/chapters?userId=test-1
  ```
- [ ] Response: `{"chapters": [{...}]}`
- [ ] Test chapter appears in response

**Test Error Handling:**
- [ ] Ran command with invalid data:
  ```bash
  curl -X POST https://_________.railway.app/api/chapters \
    -H "Content-Type: application/json" \
    -d '{"invalid":"data"}'
  ```
- [ ] Response: `{"error": "...", "success": false}`

**Test CORS:**
- [ ] Ran command (will update FRONTEND_URL after Phase 5):
  ```bash
  curl -X OPTIONS https://_________.railway.app/api/chapters \
    -H "Origin: https://study-planner-v2.vercel.app" \
    -H "Access-Control-Request-Method: GET" -v
  ```
- [ ] Response includes `Access-Control-Allow-Origin` header
- [ ] CORS configuration verified

**Clean Up Test Data:**
- [ ] Deleted test chapter (using ID from response)
- [ ] Deleted test user: `curl -X DELETE https://_________.railway.app/api/users/test-1`

**Phase 4 Complete:** ✅ (Date: ________)

---

## Phase 5: Frontend Deployment (Vercel)

### Create Production Environment File
- [ ] Created `.env.production` in project root
- [ ] Added variables:
  ```bash
  VITE_API_URL=https://_________.railway.app
  VITE_SUPABASE_URL=https://_________.supabase.co
  VITE_SUPABASE_ANON_KEY=_________
  VITE_ENABLE_CLOUD_SYNC=true
  VITE_ENABLE_ANALYTICS=false
  ```
- [ ] Verified `.env.production` is in `.gitignore`

### Test Production Build Locally
- [ ] Ran build:
  ```bash
  npm run build
  ```
- [ ] Build successful (no errors)
- [ ] Ran preview:
  ```bash
  npm run preview
  ```
- [ ] Tested on localhost:4173:
  - [ ] User selection works
  - [ ] Dashboard loads
  - [ ] Chapter creation works
  - [ ] API calls go to Railway backend (check Network tab)

### Deploy to Vercel

**Via Vercel Dashboard:**
- [ ] Logged in to https://vercel.com
- [ ] Clicked "Add New" → "Project"
- [ ] Imported `study-planner-app` repository
- [ ] Configured project:
  - [ ] Framework: Vite
  - [ ] Root directory: `./`
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Install command: `npm install`
- [ ] Added environment variables (Production):
  - [ ] `VITE_API_URL`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_ENABLE_CLOUD_SYNC`
- [ ] Clicked "Deploy"
- [ ] Build completed (2-3 minutes)
- [ ] Deployment successful

**Get Production URL:**
- [ ] Production URL: `https://_________.vercel.app`
- [ ] URL saved and shared with team

### Update Railway CORS
- [ ] Opened Railway dashboard → Backend service → Variables
- [ ] Updated `FRONTEND_URL` = Production Vercel URL
- [ ] Updated `ALLOWED_ORIGINS` = Production + Preview URLs
- [ ] Railway service restarted automatically

**Phase 5 Complete:** ✅ (Date: ________)

---

## Phase 6: Production Verification

### End-to-End User Flow Test

**Basic Functionality:**
- [ ] Opened production URL in browser
- [ ] User selection page loads
- [ ] Selected user (e.g., "Ananya")
- [ ] Redirected to `/dashboard`
- [ ] Dashboard displays correctly

**Cloud Sync Test:**
- [ ] Navigated to Settings
- [ ] Toggled "Enable Cloud Sync" ON
- [ ] Status shows "Online" (green badge)
- [ ] No errors in browser console

**Chapter Creation Test:**
- [ ] Navigated to Subjects page
- [ ] Added new chapter:
  - [ ] Subject: "Production Test"
  - [ ] Chapter: "Test Chapter"
  - [ ] Study Hours: 3
  - [ ] Revision Hours: 1
- [ ] Clicked "Add Chapter"
- [ ] Loading spinner appeared
- [ ] Chapter added successfully
- [ ] Checked Network tab:
  - [ ] POST request to Railway backend visible
  - [ ] Response: 200 OK

**Backend Sync Verification:**
- [ ] Opened Supabase dashboard → Table Editor → Chapter
- [ ] Test chapter appears in database
- [ ] User ID matches
- [ ] Data persisted correctly

**Offline Mode Test:**
- [ ] Opened DevTools → Network → Set to "Offline"
- [ ] Added another chapter
- [ ] Orange "Offline" badge appeared
- [ ] Chapter saved to localStorage
- [ ] Set Network back to "Online"
- [ ] Auto-sync occurred (check Network tab)
- [ ] Chapter synced to backend

**Timer Operations Test:**
- [ ] Navigated to Today's Plan
- [ ] Scheduled a chapter for today
- [ ] Clicked "Start" on timer
- [ ] Timer running
- [ ] Network tab shows POST to `/api/sessions/start`
- [ ] Clicked "Pause"
- [ ] Timer paused
- [ ] Clicked "Resume"
- [ ] Timer resumed
- [ ] Clicked "Complete"
- [ ] Session completed
- [ ] Checked Supabase → ActivitySession table
- [ ] Session record created

### Performance Verification

**Lighthouse Audit:**
- [ ] Opened production URL in Chrome
- [ ] DevTools → Lighthouse
- [ ] Selected all categories
- [ ] Ran audit
- [ ] Scores recorded:
  - Performance: _____ / 100 (target: 80+)
  - Accessibility: _____ / 100 (target: 90+)
  - Best Practices: _____ / 100 (target: 90+)
  - SEO: _____ / 100 (target: 90+)

**Load Time Test:**
- [ ] Hard refresh (Cmd/Ctrl + Shift + R)
- [ ] Checked Network tab → "Finish" time
- [ ] Load time: _____ seconds (target: <3s)

**Bundle Size Check:**
- [ ] Checked Vercel deployment logs
- [ ] Main bundle size (gzipped): _____ KB (target: <500 KB)

### Multi-Device Test (Optional)
- [ ] Tested on different browser (Chrome, Firefox, Safari)
- [ ] Tested on mobile device
- [ ] All core functions work
- [ ] Responsive design looks good

**Phase 6 Complete:** ✅ (Date: ________)

---

## Post-Deployment Tasks

### Monitoring Setup
- [ ] Set up uptime monitoring (UptimeRobot or similar):
  - [ ] Monitor: `https://_________.railway.app/health`
  - [ ] Check interval: 5 minutes
  - [ ] Alert email: _________
- [ ] (Optional) Set up error tracking:
  - [ ] Sentry project created
  - [ ] DSN added to Railway environment
  - [ ] Sentry DSN added to Vercel environment
  - [ ] Test error logged successfully

### Documentation Updates
- [ ] Updated `PROGRESS.md`:
  - [ ] Phase 7 marked as "Complete"
  - [ ] Overall V2 progress: 100%
  - [ ] Deployment date recorded
- [ ] Updated `README.md` (if needed):
  - [ ] Production URL added
  - [ ] V2 features documented
- [ ] Created GitHub release:
  - [ ] Tag: `v2.0.0`
  - [ ] Release notes written
  - [ ] Assets uploaded (if any)

### Team Communication
- [ ] Notified team/users of V2 launch
- [ ] Shared production URL: _________
- [ ] Documented new features:
  - [ ] Cloud sync capability
  - [ ] Offline mode support
  - [ ] Improved performance
  - [ ] Better error handling
- [ ] Collected initial feedback

### Testing Agent Handoff
- [ ] Shared production credentials with testing agent (if needed for validation)
- [ ] Provided production integration test checklist
- [ ] Testing agent validated deployment
- [ ] Testing agent confirmed all systems operational

### GitHub Issues
- [ ] Closed Phase 7 GitHub issue
- [ ] Updated project board (if using)
- [ ] Created V2.5 planning issue (next features)

**Post-Deployment Complete:** ✅ (Date: ________)

---

## Rollback Plan (If Needed)

### Trigger Conditions
- [ ] Critical bugs affecting >50% of users
- [ ] Database connection failures
- [ ] Performance degradation >50%
- [ ] Security vulnerability discovered

### Rollback Steps

**Frontend Rollback (Vercel):**
1. [ ] Opened Vercel dashboard → Deployments
2. [ ] Found last working V1 deployment
3. [ ] Clicked "..." → "Promote to Production"
4. [ ] Verified V1 is live
5. [ ] Notified users of temporary rollback

**Backend Rollback (Railway):**
1. [ ] Opened Railway dashboard → Deployments
2. [ ] Found last working deployment
3. [ ] Clicked "..." → "Redeploy"
4. [ ] Verified backend is operational

**Database Rollback (If migrations broke):**
1. [ ] Opened Supabase SQL Editor
2. [ ] Ran rollback commands (if prepared)
3. [ ] Or restored from backup (Supabase → Backups)

**Notify Team:**
- [ ] Created incident report
- [ ] Documented rollback reason
- [ ] Planned fix and redeployment

---

## 24-Hour Monitoring Checklist

### Day 1 After Deployment
- [ ] Hour 1: Check Railway logs (no errors)
- [ ] Hour 4: Check Vercel logs (no build issues)
- [ ] Hour 8: Check Supabase metrics (connection pool OK)
- [ ] Hour 12: Review user feedback (no critical bugs)
- [ ] Hour 24: Performance metrics (load time stable)

### Day 2-7 After Deployment
- [ ] Day 2: Check error tracking (Sentry if enabled)
- [ ] Day 3: Review database performance (slow queries?)
- [ ] Day 5: Check Railway credit usage (on track?)
- [ ] Day 7: Gather user feedback, plan V2.1 improvements

---

## Success Criteria

**Deployment is successful if:**
- ✅ All checklist items completed
- ✅ Production URL accessible to all users
- ✅ 0 critical bugs in first 24 hours
- ✅ Backend API response time <500ms average
- ✅ Frontend load time <3 seconds
- ✅ Cloud sync works end-to-end
- ✅ Offline mode works correctly
- ✅ Data persists across sessions
- ✅ Testing agent confirms all systems operational

**Metrics to Track:**
- Daily active users (compared to V1)
- API error rate (<1% target)
- Database query performance (<100ms average)
- Railway credit usage (should last 1-2 months on free tier)
- User satisfaction feedback

---

## Sign-Off

**Deployment Completed By:** _________

**Date:** _________

**Signature:** _________

**Verified By (Testing Agent/Team Lead):** _________

**Date:** _________

**Notes/Issues Encountered:**
```
(Add any deployment notes, issues encountered, workarounds used, etc.)


```

---

**V2 Production Deployment Checklist - Version 1.0**
**Last Updated:** 2025-12-30
