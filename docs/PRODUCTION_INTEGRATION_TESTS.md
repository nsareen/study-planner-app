# Production Integration Test Checklist

**For:** Testing Agent
**Purpose:** Validate production deployment before go-live
**Last Updated:** 2025-12-30

---

## Overview

This checklist is specifically for the **testing agent** to validate production infrastructure after deployment. These tests verify end-to-end functionality with real production services (Supabase, Railway, Vercel).

**Prerequisites:**
- Production backend deployed to Railway
- Production database created in Supabase
- Production frontend deployed to Vercel (or ready to deploy)
- Environment variables configured

**Estimated Time:** 30-45 minutes

---

## Test Environment Setup

###Before Starting Tests

- [ ] Production backend URL obtained: `https://_________.railway.app`
- [ ] Production frontend URL obtained: `https://_________.vercel.app`
- [ ] Backend health endpoint responding: `/health`
- [ ] Supabase database accessible
- [ ] Test user credentials ready (if authentication enabled)

### Tools Needed
- [ ] `curl` or Postman for API testing
- [ ] Browser with DevTools (Chrome recommended)
- [ ] Optional: Automated test suite (Playwright E2E tests updated with production URLs)

---

## Part 1: Backend API Integration Tests

### Test 1.1: Health Check
**Endpoint:** `GET /health`

```bash
curl https://your-backend.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-30T...",
  "database": "connected"
}
```

- [ ] Status code: 200
- [ ] Response contains `"status": "ok"`
- [ ] Database connection confirmed
- [ ] Response time <500ms

### Test 1.2: User CRUD Operations
**Create User:**
```bash
curl -X POST https://your-backend.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "prod-test-user-1",
    "name": "Production Test User",
    "avatar": "🧪",
    "grade": 9,
    "streak": 0,
    "level": 1,
    "totalStudyHours": 0
  }'
```

- [ ] Status code: 200 or 201
- [ ] Response contains `"success": true`
- [ ] User object returned with ID

**Fetch User:**
```bash
curl https://your-backend.railway.app/api/users/prod-test-user-1
```

- [ ] Status code: 200
- [ ] User data matches created data
- [ ] Response time <200ms

**Update User:**
```bash
curl -X PUT https://your-backend.railway.app/api/users/prod-test-user-1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test User"}'
```

- [ ] Status code: 200
- [ ] Name updated successfully
- [ ] Other fields unchanged

**Delete User (at end of tests):**
```bash
curl -X DELETE https://your-backend.railway.app/api/users/prod-test-user-1
```

- [ ] Status code: 200 or 204
- [ ] User removed from database

### Test 1.3: Chapter CRUD Operations
**Create Chapter:**
```bash
curl -X POST https://your-backend.railway.app/api/chapters \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "prod-test-user-1",
    "subject": "Production Test Subject",
    "chapter": "Test Chapter 1",
    "studyHours": 5,
    "revisionHours": 2,
    "completedStudyHours": 0,
    "completedRevisionHours": 0
  }'
```

- [ ] Status code: 200 or 201
- [ ] Chapter created with valid ID
- [ ] Response time <300ms

**List Chapters:**
```bash
curl https://your-backend.railway.app/api/chapters?userId=prod-test-user-1
```

- [ ] Status code: 200
- [ ] Response contains test chapter
- [ ] Array format correct
- [ ] User isolation verified (only user's chapters returned)

**Update Chapter:**
```bash
curl -X PUT https://your-backend.railway.app/api/chapters/{chapterId} \
  -H "Content-Type: application/json" \
  -d '{"completedStudyHours": 2.5}'
```

- [ ] Status code: 200
- [ ] Progress updated
- [ ] Other fields unchanged

**Delete Chapter:**
```bash
curl -X DELETE https://your-backend.railway.app/api/chapters/{chapterId}
```

- [ ] Status code: 200 or 204
- [ ] Chapter removed
- [ ] Cascading deletes work (assignments, sessions)

### Test 1.4: Activity Session Operations
**Start Session:**
```bash
curl -X POST https://your-backend.railway.app/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "test-assignment-1",
    "userId": "prod-test-user-1",
    "chapterId": "{chapterId}"
  }'
```

- [ ] Status code: 200 or 201
- [ ] Session created with ID
- [ ] `isActive: true`
- [ ] `startTime` set correctly

**Pause Session:**
```bash
curl -X POST https://your-backend.railway.app/api/sessions/{sessionId}/pause \
  -H "Content-Type: application/json"
```

- [ ] Status code: 200
- [ ] `isActive: false`
- [ ] Pause interval created

**Resume Session:**
```bash
curl -X POST https://your-backend.railway.app/api/sessions/{sessionId}/resume \
  -H "Content-Type: application/json"
```

- [ ] Status code: 200
- [ ] `isActive: true`
- [ ] Pause interval closed

**Complete Session:**
```bash
curl -X POST https://your-backend.railway.app/api/sessions/{sessionId}/complete \
  -H "Content-Type: application/json" \
  -d '{"actualMinutes": 45}'
```

- [ ] Status code: 200
- [ ] `endTime` set
- [ ] `duration` calculated correctly
- [ ] Session marked complete

### Test 1.5: Error Handling
**Invalid Data:**
```bash
curl -X POST https://your-backend.railway.app/api/chapters \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

- [ ] Status code: 400 (Bad Request)
- [ ] Error message clear and helpful
- [ ] Response contains `"success": false`

**Not Found:**
```bash
curl https://your-backend.railway.app/api/chapters/non-existent-id
```

- [ ] Status code: 404 (Not Found)
- [ ] Error message appropriate

**Unauthorized (if auth enabled):**
```bash
curl https://your-backend.railway.app/api/chapters \
  -H "Authorization: Bearer invalid-token"
```

- [ ] Status code: 401 (Unauthorized)
- [ ] Auth error returned

### Test 1.6: CORS Configuration
**Options Preflight:**
```bash
curl -X OPTIONS https://your-backend.railway.app/api/chapters \
  -H "Origin: https://study-planner-v2.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

- [ ] Status code: 200 or 204
- [ ] `Access-Control-Allow-Origin` header present
- [ ] `Access-Control-Allow-Methods` includes GET, POST, PUT, DELETE
- [ ] `Access-Control-Allow-Headers` includes Content-Type

**Actual Request:**
```bash
curl https://your-backend.railway.app/api/chapters \
  -H "Origin: https://study-planner-v2.vercel.app" \
  -v
```

- [ ] CORS headers in response
- [ ] No CORS errors

---

## Part 2: Database Integration Tests

### Test 2.1: Direct Database Verification
**Via Supabase Dashboard:**

- [ ] Opened Supabase dashboard → Table Editor
- [ ] Checked `User` table:
  - [ ] Test user visible
  - [ ] Fields populated correctly
- [ ] Checked `Chapter` table:
  - [ ] Test chapters visible
  - [ ] Foreign key to User valid
- [ ] Checked `ActivitySession` table:
  - [ ] Test sessions visible
  - [ ] Timestamps correct
  - [ ] `isActive` field accurate

**Via SQL Query:**
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as user_count FROM "User";
SELECT COUNT(*) as chapter_count FROM "Chapter";
SELECT COUNT(*) as session_count FROM "ActivitySession";
```

- [ ] Counts match API responses
- [ ] Query execution time <100ms

### Test 2.2: Data Persistence
**Create Data via API:**
- [ ] Created user via API
- [ ] Created chapter via API
- [ ] Created session via API

**Verify in Database:**
- [ ] All records visible in Supabase
- [ ] Timestamps accurate
- [ ] UUIDs valid format
- [ ] Foreign keys linked correctly

**Update via API:**
- [ ] Updated chapter progress
- [ ] Checked database immediately
- [ ] Update reflected instantly

### Test 2.3: Connection Pool
**Simulate Concurrent Requests:**
```bash
# Run 10 concurrent requests
for i in {1..10}; do
  curl https://your-backend.railway.app/api/chapters?userId=prod-test-user-1 &
done
wait
```

- [ ] All requests succeeded
- [ ] No connection pool exhaustion
- [ ] Response times consistent
- [ ] No database errors in Railway logs

### Test 2.4: Transaction Integrity
**Delete User (cascading delete):**
```bash
curl -X DELETE https://your-backend.railway.app/api/users/prod-test-user-1
```

- [ ] User deleted
- [ ] Checked Supabase:
  - [ ] User removed from `User` table
  - [ ] Related chapters removed from `Chapter` table
  - [ ] Related sessions removed from `ActivitySession` table
- [ ] Cascading deletes work correctly
- [ ] No orphaned records

---

## Part 3: Frontend Integration Tests

### Test 3.1: Environment Variables
**Check Variables Loaded:**
- [ ] Opened production frontend URL
- [ ] Opened DevTools → Console
- [ ] Ran: `console.log(import.meta.env.VITE_API_URL)`
- [ ] Output matches Railway backend URL
- [ ] Ran: `console.log(import.meta.env.VITE_SUPABASE_URL)`
- [ ] Output matches Supabase project URL

### Test 3.2: API Connectivity
**Network Tab Verification:**
- [ ] Opened production frontend
- [ ] Opened DevTools → Network tab
- [ ] Performed user action (create chapter)
- [ ] Verified:
  - [ ] Request goes to Railway backend (not localhost)
  - [ ] HTTPS used (not HTTP)
  - [ ] CORS headers present
  - [ ] Response status 200

### Test 3.3: Cloud Sync Flow
**Enable Cloud Sync:**
- [ ] Navigated to Settings
- [ ] Toggled "Enable Cloud Sync" ON
- [ ] Checked Network tab:
  - [ ] Health check request sent
  - [ ] Status shows "Online"

**Create Chapter:**
- [ ] Added new chapter
- [ ] Observed Network tab:
  - [ ] POST request to `/api/chapters`
  - [ ] Request payload correct
  - [ ] Response 200 OK
- [ ] Chapter appeared in UI immediately (optimistic update)
- [ ] Chapter persisted after page refresh

**Verify in Database:**
- [ ] Opened Supabase → Chapter table
- [ ] New chapter visible
- [ ] Data matches frontend input

### Test 3.4: Offline Mode
**Simulate Offline:**
- [ ] DevTools → Network → Throttling → "Offline"
- [ ] Attempted to create chapter
- [ ] Verified:
  - [ ] Orange "Offline" badge appeared
  - [ ] Chapter saved to localStorage
  - [ ] No API request sent (Network tab)

**Restore Online:**
- [ ] Set Throttling back to "Online"
- [ ] Observed:
  - [ ] Auto-sync triggered
  - [ ] POST request sent to backend
  - [ ] Backend accepted sync
- [ ] Refreshed page
- [ ] Chapter persisted (both localStorage and backend)

### Test 3.5: Error Handling
**Backend Down Simulation:**
- [ ] Paused Railway backend (Settings → Pause)
- [ ] Attempted frontend action
- [ ] Verified:
  - [ ] Error toast/message shown
  - [ ] Graceful degradation to localStorage
  - [ ] No app crash

- [ ] Resumed Railway backend
- [ ] App recovered automatically

**Invalid Data Submission:**
- [ ] Attempted to create chapter with missing required field
- [ ] Verified:
  - [ ] Frontend validation caught error
  - [ ] Clear error message shown
  - [ ] API not called if frontend validation failed

### Test 3.6: Timer Operations
**Start Timer:**
- [ ] Scheduled chapter for today
- [ ] Clicked "Start" button
- [ ] Verified:
  - [ ] POST to `/api/sessions/start`
  - [ ] Response includes session ID
  - [ ] Timer displays elapsed time
  - [ ] UI shows "Active" status

**Pause Timer:**
- [ ] Clicked "Pause"
- [ ] Verified:
  - [ ] POST to `/api/sessions/{id}/pause`
  - [ ] Timer stopped
  - [ ] UI shows "Paused" status

**Complete Session:**
- [ ] Clicked "Complete"
- [ ] Verified:
  - [ ] POST to `/api/sessions/{id}/complete`
  - [ ] Session marked complete
  - [ ] Progress updated in UI
- [ ] Checked Supabase:
  - [ ] Session record has `endTime`
  - [ ] `duration` calculated correctly

---

## Part 4: Performance Tests

### Test 4.1: API Response Times
**Measure with curl:**
```bash
curl -w "@curl-format.txt" -o /dev/null -s https://your-backend.railway.app/api/chapters?userId=test

# Create curl-format.txt:
# time_total: %{time_total}s\n
```

- [ ] `/health` response time: _____ ms (target: <200ms)
- [ ] `/api/users` response time: _____ ms (target: <300ms)
- [ ] `/api/chapters` response time: _____ ms (target: <300ms)
- [ ] `/api/sessions/start` response time: _____ ms (target: <500ms)

### Test 4.2: Frontend Load Time
**Initial Load:**
- [ ] Hard refresh (Cmd/Ctrl + Shift + R)
- [ ] DevTools → Network → Finish time: _____ s (target: <3s)
- [ ] DevTools → Performance → LCP: _____ s (target: <2.5s)
- [ ] DevTools → Performance → FID: _____ ms (target: <100ms)
- [ ] DevTools → Performance → CLS: _____ (target: <0.1)

**Subsequent Navigation:**
- [ ] Navigate to different pages
- [ ] Each page load <1 second
- [ ] Smooth transitions

### Test 4.3: Database Query Performance
**Via Supabase Dashboard:**
- [ ] Opened Supabase → Database → Performance
- [ ] Checked slow queries (if any)
- [ ] Average query time: _____ ms (target: <50ms)

**Optimization Check:**
- [ ] Indexes exist on frequently queried columns (userId, chapterId)
- [ ] No full table scans on large tables
- [ ] Connection pool not exhausted

---

## Part 5: Data Integrity Tests

### Test 5.1: User Isolation
**Create Two Users:**
```bash
# User 1
curl -X POST .../api/users -d '{"userId":"user-1",...}'

# User 2
curl -X POST .../api/users -d '{"userId":"user-2",...}'
```

**Create Chapters for Each:**
```bash
# Chapter for User 1
curl -X POST .../api/chapters -d '{"userId":"user-1",...}'

# Chapter for User 2
curl -X POST .../api/chapters -d '{"userId":"user-2",...}'
```

**Verify Isolation:**
```bash
# Fetch User 1's chapters
curl .../api/chapters?userId=user-1
```

- [ ] Only User 1's chapters returned
- [ ] User 2's chapters NOT visible
- [ ] User isolation verified

### Test 5.2: Concurrent Updates
**Simulate Race Condition:**
```bash
# Two concurrent updates to same chapter
curl -X PUT .../api/chapters/{id} -d '{"completedStudyHours":2}' &
curl -X PUT .../api/chapters/{id} -d '{"completedStudyHours":3}' &
wait
```

- [ ] Both requests succeeded
- [ ] Final state is consistent (last write wins or merge logic)
- [ ] No data corruption

### Test 5.3: Foreign Key Constraints
**Attempt Invalid Reference:**
```bash
# Create assignment with non-existent chapter ID
curl -X POST .../api/assignments \
  -d '{"chapterId":"non-existent-id",...}'
```

- [ ] Request rejected (400 or 500)
- [ ] Error message indicates foreign key violation
- [ ] Database integrity maintained

---

## Part 6: Security Tests

### Test 6.1: HTTPS Enforcement
**HTTP Request:**
```bash
curl -v http://your-backend.railway.app/health
```

- [ ] Redirected to HTTPS (301/302)
- [ ] Or connection refused
- [ ] HTTPS enforced

### Test 6.2: SQL Injection Prevention
**Malicious Input:**
```bash
curl -X POST .../api/chapters \
  -d '{"chapter":"Test'; DROP TABLE Chapter;--",...}'
```

- [ ] Request handled safely
- [ ] No database modification
- [ ] Input sanitized/escaped
- [ ] Table still exists in Supabase

### Test 6.3: Environment Variable Security
**Check Logs:**
- [ ] Opened Railway → Logs
- [ ] Verified sensitive values NOT logged:
  - [ ] DATABASE_URL not visible
  - [ ] JWT_SECRET not visible
  - [ ] SUPABASE_SERVICE_KEY not visible

### Test 6.4: Rate Limiting (if implemented)
**Spam Requests:**
```bash
for i in {1..200}; do
  curl https://your-backend.railway.app/api/chapters &
done
```

- [ ] Rate limit triggered (429 Too Many Requests)
- [ ] Or requests throttled
- [ ] Server not overwhelmed

---

## Part 7: Rollback Verification

### Test 7.1: Backend Rollback
**Simulate Issue:**
- [ ] Identified last working Railway deployment
- [ ] Clicked "..." → "Redeploy"
- [ ] Verified:
  - [ ] Previous version deployed
  - [ ] Health check passing
  - [ ] API functional

### Test 7.2: Frontend Rollback
**Simulate Issue:**
- [ ] Opened Vercel → Deployments
- [ ] Found previous working deployment
- [ ] Clicked "Promote to Production"
- [ ] Verified:
  - [ ] Previous version live
  - [ ] Frontend functional
  - [ ] API calls work

### Test 7.3: Database Backup Restore
**Verify Backup Exists:**
- [ ] Opened Supabase → Database → Backups
- [ ] Latest backup timestamp: _________
- [ ] Backup size: _____ MB
- [ ] Restore procedure documented

---

## Part 8: Final Validation

### Test 8.1: Complete User Journey
**Full Workflow Test:**
1. [ ] User selects profile
2. [ ] Dashboard loads
3. [ ] User enables cloud sync
4. [ ] User adds a chapter
5. [ ] Chapter syncs to backend
6. [ ] User schedules chapter for today
7. [ ] User starts timer
8. [ ] User pauses timer
9. [ ] User resumes timer
10. [ ] User completes session
11. [ ] Progress updates
12. [ ] User refreshes page
13. [ ] All data persists
14. [ ] User logs out
15. [ ] User logs back in
16. [ ] Data still there

**All Steps Passed:** ✅

### Test 8.2: Multi-Device Sync (Optional)
- [ ] Logged in on Device 1
- [ ] Created chapter on Device 1
- [ ] Logged in on Device 2 (different browser)
- [ ] Verified chapter appears on Device 2
- [ ] Multi-device sync works

### Test 8.3: Browser Compatibility
- [ ] Tested on Chrome (version: _____)
- [ ] Tested on Firefox (version: _____)
- [ ] Tested on Safari (version: _____)
- [ ] Tested on Edge (version: _____)
- [ ] All browsers functional

### Test 8.4: Mobile Responsiveness
- [ ] Tested on mobile device (or DevTools responsive mode)
- [ ] Layout adapts correctly
- [ ] All features accessible
- [ ] Touch interactions work

---

## Test Results Summary

**Total Tests:** _____
**Passed:** _____
**Failed:** _____
**Pass Rate:** _____% (target: 95%+)

**Critical Issues Found:** _____
**Non-Critical Issues Found:** _____

**Production Ready:** ✅ YES / ❌ NO

**Blocker Issues (if any):**
1. _____
2. _____

**Recommendations:**
1. _____
2. _____

**Sign-Off:**

**Tested By (Testing Agent):** _________
**Date:** _________
**Time Spent:** _____ minutes

**Dev Agent Notified:** ✅ YES / ❌ NO
**Signal Sent:** `[TESTS_PASSING]` or `[BUG_FOUND]`

---

**Production Integration Tests - Version 1.0**
**Last Updated:** 2025-12-30
