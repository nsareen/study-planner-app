# 🤖 Agent Coordination System

This directory contains the autonomous coordination system for dev and testing agents working in parallel.

## 📁 Files Overview

### Core Coordination Files (Root Directory)

1. **`AGENT_COORDINATION.md`** - Main coordination file (PRIMARY)
   - Single source of truth for agent-to-agent communication
   - Both agents read FIRST at every session start
   - Both agents update when status changes
   - Contains: current status, ready-for-test items, bugs found, messages, questions

2. **`.dev-status.json`** - Dev agent status snapshot
   - Updated by dev agent at session end
   - Read by testing agent to check for features ready to test
   - JSON format for easy parsing

3. **`.test-status.json`** - Testing agent status snapshot
   - Updated by testing agent at session end
   - Read by dev agent to check for bugs found
   - JSON format for easy parsing

### Scripts (`.github/scripts/`)

4. **`agent-session-start.sh`** - Session start protocol (OPTIONAL)
   - Automates the session start checklist
   - Pulls latest changes, reads coordination files, checks for signals
   - Usage: `AGENT_TYPE=dev .github/scripts/agent-session-start.sh`
   - Usage: `AGENT_TYPE=test .github/scripts/agent-session-start.sh`

## 🚀 Quick Start

### For Dev Agent

**At Session Start:**
```bash
# Option 1: Manual
git pull origin feature/phase6-component-migration
cat AGENT_COORDINATION.md
cat .test-status.json
git log --grep="\[BUG_FOUND\]" --since="3 days ago"
gh issue view 8 --comments | tail -30

# Option 2: Automated
AGENT_TYPE=dev .github/scripts/agent-session-start.sh
```

**During Work:**
```bash
# When you complete a feature ready for testing
git commit -m "feat(phase7): Feature X complete [READY_FOR_TEST]"

# When you fix a bug
git commit -m "fix(phase6): Fixed bug in useStore [BUG_FIXED]"

# Update coordination file
# Edit AGENT_COORDINATION.md - update Dev Agent Status section
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Dev agent status update"
```

**At Session End:**
```bash
# Update status file
# Edit .dev-status.json with current status
git add .dev-status.json
git commit -m "chore(status): Dev agent session end"
git push origin <current-branch>
```

### For Testing Agent

**At Session Start:**
```bash
# Option 1: Manual
git pull origin feature/phase6-component-migration
cat AGENT_COORDINATION.md
cat .dev-status.json
git log --grep="\[READY_FOR_TEST\]" --since="3 days ago"
git log --grep="\[BUG_FIXED\]" --since="3 days ago"
gh issue view 8 --comments | tail -30

# Option 2: Automated
AGENT_TYPE=test .github/scripts/agent-session-start.sh
```

**During Work:**
```bash
# When you find a bug
gh issue comment 8 --body "🐛 Bug: [description] in file.ts:123"
# Edit AGENT_COORDINATION.md - add to Bugs Found section
git commit -m "test(store): Found bug in timer state [BUG_FOUND]"

# When tests pass
gh issue comment 8 --body "✅ Tests passing: [details]"
git commit -m "test(store): Store tests complete [TESTS_PASSING]"

# Update coordination file
# Edit AGENT_COORDINATION.md - update Testing Agent Status section
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Testing agent status update"
```

**At Session End:**
```bash
# Update status file
# Edit .test-status.json with current status, bugs found, coverage
git add .test-status.json
git commit -m "chore(status): Testing agent session end"
git push origin <current-branch>
```

## 📡 Communication Protocol

### Priority Order:
1. **AGENT_COORDINATION.md** - Read first, update always
2. **Git commit flags** - Search for signals ([READY_FOR_TEST], [BUG_FOUND], etc.)
3. **GitHub issue #8** - Detailed bug reports and discussions
4. **Status files** - Quick snapshot of current state
5. **User escalation** - Blockers only

### Commit Message Flags:

**Dev Agent Uses:**
- `[READY_FOR_TEST]` - Feature complete, ready for testing agent
- `[BUG_FIXED]` - Bug fixed, ready for testing agent to verify

**Testing Agent Uses:**
- `[BUG_FOUND]` - Bug discovered, dev agent should fix
- `[TESTS_PASSING]` - All tests passing, feature validated

**Both Use:**
- `[BLOCKER]` - Can't proceed, need user intervention

### Search for Signals:
```bash
# Testing agent: Find features to test
git log --all --grep="\[READY_FOR_TEST\]" --since="3 days ago" --oneline

# Dev agent: Find bugs to fix
git log --all --grep="\[BUG_FOUND\]" --since="3 days ago" --oneline

# Both: Check for completions
git log --all --grep="\[TESTS_PASSING\]\|\[BUG_FIXED\]" --since="3 days ago" --oneline
```

## 🚨 Escalation to User

**Only escalate when:**
- BLOCKER: Can't proceed with work
- CONFLICT: Agents disagree on approach
- STRATEGIC: Need direction outside tactical scope
- REPEATED FAILURE: Bug can't be fixed after 3 attempts
- SCOPE CHANGE: Task expanding beyond original plan

**How to escalate:**
```bash
gh issue create \
  --title "🚨 BLOCKER: [description]" \
  --body "Agent: [dev/test]\nIssue: [details]\nOptions: [list]\nRecommendation: [if any]" \
  --label "blocker,needs-decision"

# Then update AGENT_COORDINATION.md
# Set: BLOCKER: true
# Set: ESCALATE_TO_USER: Issue #[number]
```

## 📋 Workflow Example

### Scenario: Dev completes feature, Testing tests it, finds bug, Dev fixes

**1. Dev Agent (Session 1):**
```bash
# Complete feature
git commit -m "feat(phase7): Deploy backend [READY_FOR_TEST]"

# Update coordination
# Edit AGENT_COORDINATION.md:
# - Add to "Ready for Testing"
# - Add message for testing agent
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Backend deployment ready for test"

# Comment on GitHub
gh issue comment 8 --body "✅ Backend deployed! Ready for E2E testing. Commit: abc123"

# Update status
# Edit .dev-status.json: readyForTest: ["backend-deployment"]
git add .dev-status.json
git commit -m "chore(status): Session end"

git push
```

**2. Testing Agent (Session 2 - next day):**
```bash
# Session start - sees [READY_FOR_TEST] signal
AGENT_TYPE=test .github/scripts/agent-session-start.sh
# Output shows: dev agent commit with [READY_FOR_TEST]

# Pull changes
git pull origin feature/phase7-deployment

# Test feature - find bug!
npm run test:e2e
# FAIL: Backend returns 500 on /api/chapters

# Report bug
gh issue comment 8 --body "🐛 Bug: Backend /api/chapters returns 500
Test: tests/e2e/chapters.spec.ts
Expected: 200 with chapters array
Actual: 500 Internal Server Error
@dev-agent Please investigate"

# Update coordination
# Edit AGENT_COORDINATION.md:
# - Add to "Bugs Found"
# - Add message for dev agent
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Bug found in backend API"

# Commit test with flag
git commit -m "test(e2e): Backend API tests [BUG_FOUND]" --allow-empty

# Update status
# Edit .test-status.json: bugsFound: [{file, severity, issue}]
git add .test-status.json
git commit -m "chore(status): Session end"

git push
```

**3. Dev Agent (Session 3 - same day):**
```bash
# Session start - sees [BUG_FOUND] signal
AGENT_TYPE=dev .github/scripts/agent-session-start.sh
# Output shows: testing agent commit with [BUG_FOUND]

# Read coordination file
cat AGENT_COORDINATION.md | grep "Bugs Found" -A 10

# Check GitHub issue
gh issue view 8 --comments | tail -20

# Pull and investigate
git pull origin feature/phase7-deployment

# Fix bug (missing error handling)
# Edit backend code
git add server/src/controllers/chapters.ts
git commit -m "fix(backend): Add error handling for /api/chapters [BUG_FIXED]"

# Comment on issue
gh issue comment 8 --body "✅ Bug fixed! Added try-catch in chapters controller. Ready for retest."

# Update coordination
# Edit AGENT_COORDINATION.md:
# - Remove from "Bugs Found"
# - Add message "Bug fixed, ready for retest"
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Backend bug fixed"

git push
```

**4. Testing Agent (Session 4):**
```bash
# Session start - sees [BUG_FIXED]
AGENT_TYPE=test .github/scripts/agent-session-start.sh

# Pull and retest
git pull origin feature/phase7-deployment
npm run test:e2e
# PASS: All tests passing!

# Verify and comment
gh issue comment 8 --body "✅ Bug verified fixed! All E2E tests passing (15/15)"

git commit -m "test(e2e): Backend tests [TESTS_PASSING]" --allow-empty

# Update coordination
# Edit AGENT_COORDINATION.md: Mark tests complete
git add AGENT_COORDINATION.md
git commit -m "chore(coord): Backend tests complete"

git push
```

**Result: Full cycle completed without user intervention! ✅**

## 📊 Best Practices

### Both Agents:
- Read `AGENT_COORDINATION.md` FIRST every session
- Update coordination file whenever status changes
- Commit coordination file separately from code changes
- Use commit message flags consistently
- Update status files at session end
- Check GitHub issue #8 for detailed discussions

### Dev Agent:
- Mark features [READY_FOR_TEST] when complete
- Fix bugs within 24-48 hours when possible
- Answer testing agent questions in coordination file
- Don't deploy to production until [TESTS_PASSING]

### Testing Agent:
- Start with Priority 1 tests (store, utilities)
- Report bugs immediately via issue comments + coordination file
- Include file:line, reproduction steps, severity
- Verify bug fixes and comment on issue
- Update coverage metrics in status file

## 🎯 Success Metrics

**Good coordination looks like:**
- Coordination file updated 2-3x per session
- Bugs reported and fixed within 1-2 sessions
- GitHub issue #8 has detailed discussions
- Both agents know what the other is doing
- User intervention only for blockers (<10% of time)

**Poor coordination looks like:**
- Coordination file not updated
- Bugs found but not reported
- Duplicate work
- Agents blocked waiting for each other
- User constantly mediating

## 🆘 Troubleshooting

**Problem: Other agent not updating coordination file**
- Check their last commit timestamp
- Check if they're on a different branch
- Escalate to user if >24 hours without update

**Problem: Merge conflicts in coordination file**
- Both agents editing same sections
- Solution: Agree on who updates which sections
- Dev updates "Dev Agent Status", Test updates "Testing Agent Status"
- Both can add to shared sections (bugs, flags, timeline)

**Problem: GitHub CLI (gh) not working**
- Install: `brew install gh` (macOS) or equivalent
- Login: `gh auth login`
- Alternative: Use GitHub web UI for issue comments

**Problem: Can't find commit flags**
- Use: `git log --all --grep="\[READY_FOR_TEST\]"`
- Check if correct flag format (brackets required)
- Search last 7 days: `--since="1 week ago"`

## 📚 Resources

- Main coordination: `AGENT_COORDINATION.md` (root)
- Status files: `.dev-status.json`, `.test-status.json` (root)
- GitHub issue: #8 (Phase 6 implementation)
- Testing strategy: `docs/TESTING_STRATEGY.md`
- Backend guide: `docs/BACKEND_INTEGRATION_GUIDE.md`

---

**Questions? Update AGENT_COORDINATION.md with your question for the other agent, or escalate to user if blocker.**
