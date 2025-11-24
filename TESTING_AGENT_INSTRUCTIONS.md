# 🧪 Testing Agent - Getting Started

**Branch:** `feature/phase6-component-migration`
**Your Mission:** Test Phase 6 components + create foundation tests (store, utilities)

---

## 🚀 Quick Start (First Session)

```bash
# 1. Clone repo and checkout branch
git clone https://github.com/nsareen/study-planner-app.git
cd study-planner-app
git checkout feature/phase6-component-migration
git pull origin feature/phase6-component-migration

# 2. Install dependencies
npm install

# 3. Run session start protocol
AGENT_TYPE=test .github/scripts/agent-session-start.sh

# 4. Read coordination files
cat AGENT_COORDINATION.md          # Main coordination (read FIRST)
cat .dev-status.json                # What dev agent is doing
cat .github/AGENT_COORDINATION_README.md  # Full documentation

# 5. Start with Priority 1: Store tests
mkdir -p tests/unit/store
# Create: tests/unit/store/useStore.test.ts
```

---

## 📋 Your Priority Queue

### **Week 1 (This Week):**

**Priority 1: Store Tests (HIGHEST ROI)** 🎯
- File: `tests/unit/store/useStore.test.ts`
- Target: 95% coverage for `src/store/useStore.ts`
- Tests:
  - All computed getters (getChapters, getAssignments, etc.)
  - CRUD operations (addChapter, updateChapter, deleteChapter)
  - Timer state management (startActivity, pauseActivity, etc.)
  - User management (switchUser, logoutUser)
- **Why:** Foundation for ALL phases, enables confident deployment

**Priority 2: Utility Tests**
- Files:
  - `tests/unit/utils/prioritization.test.ts`
  - `tests/unit/utils/syllabusParser.test.ts`
- Target: 80% coverage
- **Why:** Critical algorithms used across app

**Priority 3: Phase 6 Component Tests**
- Files:
  - `tests/unit/pages/TodayPlan.test.tsx`
  - `tests/unit/pages/Subjects.test.tsx`
  - `tests/unit/hooks/useBackendSync.test.ts`
  - `tests/unit/store/backendStore.test.ts`
- **Why:** Test what dev agent just built (commits: 363e9a2, 1375f64, 7650fdd)

**Priority 4: Integration Tests**
- File: `tests/integration/backend-sync.integration.test.ts`
- Test: Full sync workflow (optimistic updates + backend sync)

---

## 📡 How to Coordinate with Dev Agent

### **Communication Channels (NO USER NEEDED):**

1. **AGENT_COORDINATION.md** (PRIMARY - Read First!)
   - Dev agent updates their status here
   - You update your status here
   - Check for "Ready for Testing" items
   - Add bugs you find to "Bugs Found" section

2. **Git Commit Flags** (Search for Signals)
   ```bash
   # Find features ready to test
   git log --grep="\[READY_FOR_TEST\]" --since="3 days ago"

   # Find bug fixes
   git log --grep="\[BUG_FIXED\]" --since="3 days ago"
   ```

3. **GitHub Issue #8** (Bug Reports)
   ```bash
   # View latest comments
   gh issue view 8 --comments | tail -30

   # Report a bug
   gh issue comment 8 --body "🐛 Bug: [description]
   File: src/store/useStore.ts:450
   Severity: Medium
   @dev-agent Please fix"
   ```

4. **Status Files** (Quick Check)
   ```bash
   cat .dev-status.json  # What dev agent is doing
   cat .test-status.json  # Your status (you update this)
   ```

---

## 🐛 When You Find a Bug

**Step-by-step:**

```bash
# 1. Create detailed issue comment
gh issue comment 8 --body "## 🐛 Bug Found

**File:** src/store/useStore.ts:450
**Function:** logoutUser()
**Issue:** Timer state not reset on logout

**Test:** tests/unit/store/useStore.test.ts:234
**Expected:** activeTimer should be null after logout
**Actual:** activeTimer persists

**Severity:** Medium
**Blocker:** No

@dev-agent Please fix when available"

# 2. Update AGENT_COORDINATION.md
# Add to "Testing Agent Status > Bugs Found" section

# 3. Commit with flag
git add tests/unit/store/useStore.test.ts
git commit -m "test(store): Found timer state bug [BUG_FOUND]

Timer state persists after logout. See issue #8 for details.
Tests: 23/24 passing (1 failing due to bug)"

# 4. Update your status file
# Edit .test-status.json - add to bugsFound array

# 5. Push
git push origin feature/phase6-component-migration
```

**Dev agent will:**
- See [BUG_FOUND] in git log
- Read AGENT_COORDINATION.md
- Check GitHub issue #8
- Fix the bug
- Commit with [BUG_FIXED]
- You verify the fix!

---

## ✅ When Tests Pass

```bash
# 1. Comment on issue
gh issue comment 8 --body "✅ Store tests complete!

Coverage: 95% (47/50 tests passing)
All computed getters tested
All CRUD operations tested
Timer state management tested

Moving to utility tests next."

# 2. Commit with flag
git commit -m "test(store): Store tests complete [TESTS_PASSING]

Achieved 95% coverage for useStore.ts
All 50 tests passing
Foundation testing complete"

# 3. Update AGENT_COORDINATION.md
# Move from "In Progress" to "Completed"

# 4. Update .test-status.json
# Update coverage, testsCompleted, etc.

# 5. Push
git push origin feature/phase6-component-migration
```

---

## 🔄 Session Start Protocol (Every Time)

**Option 1: Automated (Recommended)**
```bash
AGENT_TYPE=test .github/scripts/agent-session-start.sh
```

**Option 2: Manual**
```bash
# 1. Pull latest
git pull origin feature/phase6-component-migration

# 2. Read coordination
cat AGENT_COORDINATION.md

# 3. Check dev agent status
cat .dev-status.json

# 4. Look for features to test
git log --grep="\[READY_FOR_TEST\]" --since="3 days ago"

# 5. Look for bug fixes
git log --grep="\[BUG_FIXED\]" --since="3 days ago"

# 6. Check GitHub issue
gh issue view 8 --comments | tail -30
```

---

## 📤 Session End Protocol

```bash
# 1. Update your status file
# Edit .test-status.json with:
# - Current progress
# - Tests completed
# - Bugs found
# - Coverage metrics

# 2. Update coordination file
# Edit AGENT_COORDINATION.md:
# - Update "Testing Agent Status" section
# - Add session summary to timeline

# 3. Commit
git add .test-status.json AGENT_COORDINATION.md
git commit -m "chore(coord): Testing agent session end - [summary]"

# 4. Push
git push origin feature/phase6-component-migration
```

---

## 🚨 When to Ask User

**Only escalate to user when:**
- ❌ **BLOCKER:** Can't proceed (e.g., don't understand requirements)
- ❌ **CONFLICT:** Disagree with dev agent on approach
- ❌ **STRATEGIC:** Need direction (e.g., "Should we test X or Y first?")
- ❌ **REPEATED:** Bug can't be reproduced after 3 attempts

**For everything else:** Coordinate via AGENT_COORDINATION.md, GitHub issue, commit flags

---

## 📚 Helpful Resources

### **Testing Setup:**
- Testing strategy: `docs/TESTING_STRATEGY.md`
- Testing guidelines: `docs/TESTING_GUIDELINES.md`
- Existing tests: `tests/e2e/` (13 E2E tests already written)

### **Code to Test:**
- Store: `src/store/useStore.ts` (main state management)
- Backend store: `src/store/backendStore.ts` (optimistic updates)
- Utilities: `src/utils/prioritization.ts`, `src/utils/syllabusParser.ts`
- TodayPlan: `src/pages/TodayPlan.tsx` (timer operations)
- Subjects: `src/pages/Subjects.tsx` (CRUD operations)

### **Dev Agent's Work (Phase 6):**
- Commit 363e9a2: TodayPlan timer migration
- Commit 1375f64: Subjects CRUD migration
- Commit 7650fdd: Offline mode indicator
- Guide: `docs/BACKEND_INTEGRATION_GUIDE.md`

---

## 🎯 Success Criteria

**Week 1 Goals:**
- ✅ Store tests: 95% coverage (50+ tests)
- ✅ Utility tests: 80% coverage (30+ tests)
- ✅ Phase 6 tests: All components tested
- ✅ Integration tests: Backend sync workflow tested

**Communication Success:**
- Updated AGENT_COORDINATION.md 2-3x per session
- All bugs reported via issue #8 + coordination file
- Dev agent fixes bugs within 1-2 sessions
- User intervention <10% of time

---

## 💡 Pro Tips

1. **Read AGENT_COORDINATION.md FIRST** every session
2. **Use commit flags** consistently: [BUG_FOUND], [TESTS_PASSING]
3. **Report bugs immediately** - don't batch them
4. **Update status files** at session end
5. **Check git log** for dev agent signals
6. **Comment on issue #8** for all bugs (dev agent reads this)
7. **Start with store tests** - highest impact

---

## 🚀 Your First Task

**Right now:**

```bash
# 1. Session start
AGENT_TYPE=test .github/scripts/agent-session-start.sh

# 2. Create store test file
mkdir -p tests/unit/store
touch tests/unit/store/useStore.test.ts

# 3. Start writing tests
# See docs/TESTING_GUIDELINES.md for test templates

# 4. When done, update coordination
# Edit AGENT_COORDINATION.md
# Edit .test-status.json

# 5. Commit and push
git add tests/ AGENT_COORDINATION.md .test-status.json
git commit -m "test(store): Add initial store tests [in-progress]"
git push origin feature/phase6-component-migration
```

---

**Questions?**
- Check: `.github/AGENT_COORDINATION_README.md` (complete documentation)
- Update: `AGENT_COORDINATION.md` with questions for dev agent
- Escalate: Create GitHub issue with "blocker" label (only if truly blocked)

**You've got this! Dev agent is standing by to fix any bugs you find.** 🧪🚀
