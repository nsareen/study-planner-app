# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A comprehensive study planner web application for 9th grade students, built with React + TypeScript + Vite. The app features intelligent study planning with exam groups, multiple study plans, collaborative features, and gamification elements to enhance student engagement.

## Development Commands

### Setup
```bash
cd study-planner-app
npm install
```

### Development
```bash
npm run dev                    # Start dev server (auto port)
npm run dev:stable             # Start on localhost:5173
npm run dev:auto              # Start with auto-configuration script
```

### Build & Preview
```bash
npm run build                  # TypeScript check + production build
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

### Testing
```bash
# Unit Tests (Vitest)
npm run test                  # Run tests in watch mode
npm run test:unit            # Run tests once
npm run test:coverage        # Run with coverage report
npm run test:watch           # Watch mode (alias)

# E2E Tests (Playwright)
npm run test:e2e             # Run all E2E tests
npm run test:e2e:ui          # Run with Playwright UI
npm run test:debug           # Debug mode

# Specific E2E Test Suites
npm run test:url-import      # URL import feature tests
npm run test:url-import:debug  # Debug URL import tests
npm run test:url-import:ui   # URL import tests with UI
```

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.8
- **Build Tool**: Vite 4
- **State Management**: Zustand 5 with localStorage persistence
- **Styling**: TailwindCSS 3 with custom gradients and glassmorphism
- **UI Components**: Lucide React icons
- **Charts**: Recharts 3
- **Date Utilities**: date-fns 4
- **Routing**: React Router DOM 7
- **Testing**: Vitest + React Testing Library + Playwright
- **PWA**: vite-plugin-pwa (offline-first capabilities)

## Architecture

### State Management (Zustand)

The application uses Zustand with middleware for state persistence. Store location: `src/store/useStore.ts`

**Key Store Structure:**
- Multi-user system with profile isolation
- User-specific data buckets (chapters, exams, logs, settings)
- localStorage persistence key: `study-planner-storage`
- Type-safe actions and selectors

**Core Store Slices:**
- **User Management**: `addUser`, `switchUser`, `logoutUser`, `updateUserProfile`
- **Exam Groups**: `addExamGroup`, `updateExamGroup`, `deleteExamGroup`, `applyExamGroup`
- **Study Plans**: `addStudyPlan`, `updateStudyPlan`, `setActiveStudyPlan`, `duplicateStudyPlan`
- **Chapters**: `addChapter`, `updateChapter`, `updateChapterProgress`
- **Assignments**: `scheduleChapter`, `getAssignmentsForDate`, `linkAssignmentToPlan`
- **Activity Sessions**: `startActivity`, `pauseActivity`, `completeActivity`
- **Daily Logs**: `addDailyLog`, `updateDailyTask`

### Data Model (TypeScript Types)

Core types defined in `src/types/index.ts`:

**ExamGroup**: Hierarchical exam structure with multiple subject exam dates
- Contains `SubjectExam[]` with individual dates per subject
- Has `offDays[]` for automatic holiday scheduling
- Status: `draft | published | applied`
- Supports templating with `isTemplate` flag

**StudyPlan**: Versioned study plan system
- Status: `draft | active | completed | archived`
- Links to ChapterAssignments via `assignments[]`
- Supports duplication and archival

**Chapter**: Study content with dual-phase tracking
- **Study Phase**: `studyHours`, `completedStudyHours`, `actualStudyHours`
- **Revision Phase**: `revisionHours`, `completedRevisionHours`, `actualRevisionHours`
- Status: `not_started | in_progress | complete | mastered`
- Separate status tracking: `studyStatus` and `revisionStatus`

**ChapterAssignment**: Calendar scheduling
- Links chapter to specific date and activity type
- Tracks planned vs actual minutes
- Associated with StudyPlan via `planId`

**ActivitySession**: Timer tracking
- Real-time study session monitoring
- Pause/resume capability
- Links to ChapterAssignment

### Smart Prioritization Algorithm

Location: `src/utils/prioritization.ts`

**Formula:**
```
Priority = RemainingHours × ExamTypeWeight × (2 × Urgency + Scarcity)
```

**Factors:**
- **Urgency**: Inversely proportional to days until exam
- **Scarcity**: Based on available study days
- **ExamTypeWeight**: final (1.5) > mid-term (1.3) > quarterly (1.2) > monthly (1.1) > weekly (1.0)
- **RemainingHours**: Total study + revision hours needed

### Component Structure

**Pages** (`src/pages/`):
- `SmartPlanner.tsx` - Matrix view with calendar integration, main planning interface
- `TodayPlan.tsx` - Daily agenda with integrated timer
- `Subjects.tsx` - Chapter and subject CRUD operations
- `Calendar.tsx` - Exam group management and off-day scheduling
- `Progress.tsx` - Analytics with Recharts visualizations
- `Collaboration.tsx` - Study rooms, chat, games
- `Settings.tsx` - User preferences, data import/export
- `Help.tsx` - Documentation and tutorials

**Key Components** (`src/components/`):
- `Layout.tsx` - Navigation shell with user context
- `UserSelection.tsx` - Multi-user login screen
- `MatrixPlannerView.tsx` - Chapter-to-calendar scheduling interface
- `PlannerTutorial.tsx` - 6-step interactive onboarding
- `CurriculumImport.tsx` - Bulk import from educational websites
- `Timer/SmartTimer.tsx` - Study session timer with pause/resume
- `Calendar/FlexibleCalendar.tsx` - Interactive calendar with exam highlighting

### Routing

Defined in `src/App.tsx` using React Router 7:
- `/` - User selection or redirect to dashboard
- `/dashboard` - Today's overview
- `/smart-planner` - Smart planner with matrix view
- `/today` - Daily plan with timer
- `/subjects` - Subject management
- `/calendar` - Exam scheduling
- `/progress` - Analytics
- `/collaboration` - Study rooms
- `/settings` - Settings

Protected routes require `currentUserId` in store.

## Key Features

### Exam Groups System
- Create hierarchical exam structures with multiple subject dates
- Automatic off-day generation between exams
- One-click application to calendar
- Template support for recurring exam patterns
- Status tracking: draft → published → applied

### Multiple Study Plans
- Create concurrent plans (e.g., "Regular Plan", "Intensive Plan")
- Version control with history tracking
- Duplicate and modify existing plans
- Archive completed plans
- Move chapters between plans

### Smart Planner Matrix View
- Visual chapter-to-calendar assignment
- "Add to Calendar" button-based workflow (replaced drag-drop)
- Editable study/revision hours with inline editing
- Exam date highlighting in calendar
- Bulk operations for multiple chapters

### Curriculum Import
Location: `src/utils/syllabusParser.ts`

Supports bulk chapter import from educational websites:
- BYJU's (Science, Social Science patterns)
- Auto-detection of subject and chapter names
- Duplicate prevention
- Batch processing

### Timer & Activity Tracking
- Real-time study timer with pause/resume
- Tracks planned vs actual study time
- Links to specific chapter assignments
- Velocity indicators for productivity
- Session history and analytics

### Multi-User System
Pre-configured users: Ananya, Saanvi, Sara, Arshita
- Complete data isolation per user
- Profile with avatar, grade, streak, level
- Achievement system with badges
- Friend list and online status (UI only, no backend)

## Design System

### Colors
- **Primary**: Purple gradients (`#c91af4` to `#aa0dd7`)
- **Secondary**: Cyan gradients (`#00bde6` to `#0099bf`)
- **Accents**: Yellow (`#FFD93D`), Orange (`#FF6B6B`), Green (`#4ECDC4`), Pink (`#FF69B4`)

### Styling Patterns
- Glassmorphism: `backdrop-blur-md` with semi-transparent backgrounds
- Gradient backgrounds: `bg-gradient-to-br from-[color1] to-[color2]`
- Rounded corners: `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Hover effects: `hover:scale-105 transition-transform`
- Shadow depths: `shadow-lg`, `shadow-xl`, `shadow-2xl`

### Responsive Breakpoints
- Mobile: `< 640px`
- Tablet: `640px - 1024px`
- Desktop: `> 1024px`

Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

## Data Persistence

### localStorage Strategy
- Automatic persistence via Zustand middleware
- Storage key: `study-planner-storage`
- User-scoped data in nested structure
- Import/Export functionality in Settings page

### Data Cleanup Utilities
Location: `src/store/dataSync.ts`

Functions:
- `cleanupChapterData()` - Remove orphaned chapters
- `cleanupStudyPlanData()` - Validate plan references
- `validateDataIntegrity()` - Check data consistency
- `prepareExportData()` - Serialize for export
- `validateImportData()` - Validate imported JSON

Call `cleanupOrphanedData()` and `validateDataIntegrity()` when debugging data issues.

## Testing

### Unit Tests (Vitest)
- Location: `tests/unit/`
- Setup: `tests/setup.ts`
- Run with: `npm run test:unit`
- Example: `tests/unit/components/UserSelection.test.tsx`

**Test Patterns:**
- Mock Zustand store with `vi.mock()`
- Wrap components in `BrowserRouter` for routing
- Use `@testing-library/react` utilities
- Test data-testid attributes

### E2E Tests (Playwright)
- Location: `tests/e2e/`
- Config: `playwright.config.ts`
- Run with: `npm run test:e2e`

**Test Suites:**
- `user-onboarding.spec.ts` - User selection and setup
- `subjects-management.spec.ts` - Chapter CRUD
- `navigation.spec.ts` - Routing and navigation
- `url-import-*.spec.ts` - Curriculum import features
- `plan-completion.spec.ts` - Study plan lifecycle

**Playwright Tips:**
- Use `page.waitForSelector()` for dynamic content
- Test with `data-testid` attributes
- Screenshots on failure enabled by default

## Important Patterns

### User Context
Always check `currentUserId` exists before rendering user-specific data:
```tsx
const currentUserId = useStore((state) => state.currentUserId);
if (!currentUserId) return <Navigate to="/" />;
```

### Date Formatting
Use `date-fns` for consistency:
```tsx
import { format, parseISO } from 'date-fns';
const formatted = format(parseISO(dateString), 'yyyy-MM-dd');
```

### Store Selectors
Use selective subscriptions to avoid unnecessary re-renders:
```tsx
const chapters = useStore((state) => state.userData[currentUserId]?.chapters || []);
```

### Chapter Status Updates
When updating chapter progress, recalculate status:
```tsx
updateChapter(chapterId, {
  completedStudyHours: hours,
  studyStatus: hours >= chapter.studyHours ? 'done' : 'in-progress'
});
```

## Known Limitations

1. No backend - all data is localStorage only
2. Collaboration features are UI mockups (no real-time sync)
3. Video calls and whiteboards are placeholders
4. Theme switcher defined but not fully implemented
5. PWA service worker may need manual refresh for updates

## Debugging Tips

### State Issues
1. Check localStorage in DevTools: Application → Local Storage
2. Call `validateDataIntegrity()` from store to check data consistency
3. Use `cleanupOrphanedData()` to fix broken references
4. Export data, inspect JSON, then import clean version

### Timer Issues
1. Check `resetActiveSessionsAndTimers()` on app initialization
2. Verify ActivitySession state in store
3. Use `cleanupSessions()` to remove stale sessions

### Import Issues
1. Check browser console for parser errors
2. Test with `src/utils/syllabusParser.ts` functions directly
3. Verify URL patterns match supported sites
4. Use E2E tests: `npm run test:url-import:debug`

### Test Failures
1. Clear localStorage before test runs
2. Check `tests/setup.ts` for global mocks
3. Verify test data in `tests/utils/test-data.ts`
4. Use Playwright UI mode: `npm run test:e2e:ui`

## File Naming Conventions

- Components: PascalCase (`UserSelection.tsx`)
- Utilities: camelCase (`prioritization.ts`)
- Types: camelCase file, PascalCase exports (`types/index.ts` → `export type Chapter`)
- Tests: `*.test.tsx` or `*.spec.ts`
- Styles: `index.css` (global only, prefer Tailwind)

## Important: Pre-configured User Data

The app ships with 4 demo users with realistic study data. When implementing features:
- Preserve existing user data structure
- Test with all 4 users to ensure data isolation
- Use `getCurrentUser()` helper to get active user
- Never share state between users accidentally

---

## 🚨 GOVERNANCE PROCESS (MANDATORY FOR ALL AGENTS)

> **CRITICAL:** This governance process is **NON-NEGOTIABLE** and must be followed by Claude Code and ALL sub-agents without exception. Failure to follow these rules will result in incomplete tracking and project failure.

### Governance Principles

1. **Complete Traceability:** Every piece of work must be traceable through GitHub Issues
2. **Dual Tracking:** Real-time updates in PROGRESS.md + Official record in GitHub Issues
3. **State Change Documentation:** All status changes must be recorded immediately
4. **Sub-Agent Accountability:** Sub-agents must receive and follow the same tracking rules
5. **No Untracked Work:** If it's not in a GitHub issue, it doesn't exist

---

### 📋 Mandatory Workflow (DO NOT DEVIATE)

#### STEP 1: Before Starting ANY Work (MANDATORY)

**YOU MUST:**

1. ✅ **Read PROGRESS.md** to understand current state
   - Check "In Progress" section
   - Check "Up Next" section
   - Identify blockers

2. ✅ **Read docs/V2_ROADMAP.md** (if context needed)
   - Understand the phase you're working on
   - Review acceptance criteria
   - Check dependencies

3. ✅ **Verify GitHub Issue Exists**
   - Search existing issues: `gh issue list --search "keyword"`
   - If no issue exists, **YOU MUST CREATE ONE**:
     ```bash
     gh issue create \
       --title "[Phase X] Clear, descriptive title" \
       --body "## Description\n...\n\n## Acceptance Criteria\n- [ ] Item 1\n...\n\n## Related Issues\nPart of Epic #X" \
       --label "feature,backend,status:todo,phase:1-foundation" \
       --milestone "V2 Phase 1"
     ```
   - **RECORD THE ISSUE NUMBER** (e.g., #42)

4. ✅ **Update GitHub Issue to In-Progress**
   ```bash
   gh issue edit 42 --remove-label "status:todo" --add-label "status:in-progress"
   ```

5. ✅ **Update PROGRESS.md**
   - Move task from "Up Next" to "In Progress"
   - Set initial status: `Status: 0% - Starting now`
   - Add issue number reference: `- [ ] #42 - Task name`
   - Note any dependencies or blockers

**🛑 STOP:** Do not proceed to implementation until ALL 5 steps above are complete.

---

#### STEP 2: During Work (MANDATORY - UPDATE FREQUENTLY)

**YOU MUST:**

1. ✅ **Update PROGRESS.md Every Significant Step**
   - Frequency: Every 10-15 minutes of work OR after each logical completion
   - Update progress percentage: `Status: 25% - Docker compose created`
   - Add notes about decisions made
   - **Document blockers immediately** when encountered

2. ✅ **Make Meaningful Git Commits**
   - Format: `type: description (#issue-number)`
   - Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
   - Examples:
     - `feat(timer): add multi-task switching support (#45)`
     - `fix(store): resolve assignment orphaning (#46)`
     - `docs: update API documentation (#47)`
   - **ALWAYS include issue number in commit message**

3. ✅ **Document Key Decisions**
   - Add to PROGRESS.md "Recent Decisions" section
   - If architectural decision, document in commit message
   - Example: "Decided to use computed getters instead of derived state (performance)"

**KEEP IN MIND:**
- PROGRESS.md is your short-term memory - update it constantly
- Other developers should be able to understand what you did by reading PROGRESS.md
- If you're stuck for >30 minutes, document it in PROGRESS.md and GitHub issue

---

#### STEP 3: After Completing a Chunk/Milestone (MANDATORY)

**YOU MUST:**

1. ✅ **Update GitHub Issue with Progress**
   ```bash
   gh issue comment 42 --body "## Progress Update

   ✅ Completed:
   - Removed dual state tracking
   - Added computed getters

   ⏳ In Progress:
   - Updating components to use getters

   📁 Files Modified:
   - src/store/useStore.ts:260-500

   🔗 Commit: abc123"
   ```

2. ✅ **If Task Fully Complete, Close GitHub Issue**
   ```bash
   gh issue close 42 --comment "## ✅ Task Completed

   All acceptance criteria met:
   - [x] Single source of truth implemented
   - [x] Computed getters added
   - [x] Tests passing
   - [x] No regressions

   Files: src/store/useStore.ts
   Commit: abc123
   Next: Issue #43 (Consolidate timer state)"
   ```

3. ✅ **Update PROGRESS.md**
   - Move task to "Today's Completed" section
   - Update status to 100%
   - Add completion timestamp
   - Set next task in "Up Next"

4. ✅ **Commit Changes with Issue Reference**
   ```bash
   git add .
   git commit -m "refactor(store): remove dual state tracking (#42)

   - Consolidate to userData[userId] as single source
   - Add computed getters for chapters, assignments
   - Update all components to use getters
   - Tests passing, no performance regression

   Closes #42"
   git push origin refactor/remove-dual-state-tracking
   ```

**🛑 STOP:** Do not start next task until current task is properly closed and documented.

---

#### STEP 4: Sub-Agent Coordination (MANDATORY FOR PARENT AGENTS)

When using the Task tool to launch sub-agents, **YOU MUST**:

1. ✅ **Pass Governance Rules to Sub-Agent**
   ```python
   Task(
       prompt="""
       🚨 GOVERNANCE REQUIREMENT 🚨

       GITHUB ISSUE: #42
       Read CLAUDE.md governance process before starting.

       Task: Remove dual state tracking

       Requirements:
       - Consolidate userData[userId] as single source
       - Add computed getters
       - Update components to use getters
       - Ensure tests pass

       MANDATORY REPORTING:
       - Reference issue #42 in all your work
       - Include file paths with line numbers in final report
       - Document all decisions made
       - Report any blockers immediately
       - Provide progress percentage in final report

       See CLAUDE.md for complete governance process.
       """,
       subagent_type="general-purpose"
   )
   ```

2. ✅ **Monitor Sub-Agent Execution**
   - Check that sub-agent references issue number
   - Verify sub-agent follows governance rules

3. ✅ **Update GitHub Issue with Sub-Agent Report**
   - Extract key information from sub-agent's final report
   - Update GitHub issue #42 with sub-agent's progress
   - Update PROGRESS.md with sub-agent's completion status

**KEEP IN MIND:**
- Sub-agents are extensions of you - their work is your responsibility
- If sub-agent doesn't follow governance, YOU must update tracking manually
- Always verify sub-agent's work is properly documented

---

#### STEP 5: End of Work Session (MANDATORY)

**YOU MUST:**

1. ✅ **Sync PROGRESS.md → GitHub**
   - Review all "In Progress" tasks
   - Update each related GitHub issue with latest status
   - Document any blockers discovered

2. ✅ **Clean Up PROGRESS.md**
   - Archive "Today's Completed" to "Archived Completed" section at bottom
   - Update "Last Updated" timestamp
   - Set clear "Up Next" task(s) for next session
   - Review "Blockers" section and ensure all are documented in GitHub issues

3. ✅ **Final Commit (if any uncommitted work)**
   ```bash
   git add .
   git commit -m "chore: end of session updates for [date] (#issue-number)"
   git push
   ```

**🛑 SESSION COMPLETE:** All work is now tracked and recoverable.

---

### 🎯 GitHub Issue Requirements

#### Issue Hierarchy

```
Epic Issue (#1, #2, ...)
  └── Feature Issue (#8-#37)
      └── Task Issue (created as needed)
          └── Sub-task (tracked in comments or checkboxes)
```

**Example:**
- **Epic #1:** V2 Foundation - State Management Refactor
  - **Feature #8:** Remove Dual State Tracking
    - **Task:** Update useStore.ts
    - **Task:** Update components to use getters
    - **Sub-task:** Add tests for getters

#### Issue Title Format (MANDATORY)

- **Epic:** `EPIC: V2 [Category] - Description`
- **Feature:** `[Phase X] Feature name`
- **Task:** `[Phase X] Task name`
- **Bug:** `[Component] Bug description`

Examples:
- ✅ `EPIC: V2 Foundation - State Management Refactor`
- ✅ `[Phase 1] Remove dual state tracking`
- ✅ `[Phase 2] Integrate smart prioritization display`
- ✅ `[TodayPlan] Fix timer state synchronization`

#### Issue Body Requirements (MANDATORY)

Every issue **MUST** include:

1. **Description:** Clear explanation of what needs to be done
2. **Acceptance Criteria:** Checkboxes `- [ ]` for each deliverable
3. **Related Issues:** Links to parent Epic/Feature
4. **File Paths:** Where changes will be made (if known)
5. **Reference:** Link to docs/V2_ROADMAP.md phase

**Template:**
```markdown
## Description
Clear description of the task.

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Related Issues
Part of Epic #1
Depends on #42

## Files
- src/store/useStore.ts
- src/pages/TodayPlan.tsx

## Reference
See docs/V2_ROADMAP.md Phase 1.1 for details.
```

#### Issue Labels (MANDATORY)

**Type Labels (choose one):**
- `epic` - Top-level milestone
- `feature` - Major functionality
- `task` - Specific implementation task
- `bug` - Defect or error
- `refactor` - Code improvement
- `docs` - Documentation
- `test` - Testing work

**Area Labels (choose all that apply):**
- `frontend` - React components
- `backend` - Store/state management
- `testing` - Test infrastructure
- `deployment` - CI/CD, Vercel
- `migration` - Backend migration work

**Status Labels (choose one - MANDATORY):**
- `status:todo` - Not started
- `status:in-progress` - Currently being worked on
- `status:blocked` - Blocked by dependency or issue
- `status:review` - In PR review
- `status:done` - Completed (or use GitHub's "closed" state)

**Priority Labels (optional but recommended):**
- `priority:critical` - Blocks progress
- `priority:high` - Important for milestone
- `priority:medium` - Should have
- `priority:low` - Nice to have

**Phase Labels:**
- `phase:1-foundation` - Weeks 1-2
- `phase:2-daily-ux` - Weeks 3-4
- `phase:3-planning` - Weeks 5-6
- `phase:4-backend` - Weeks 7-8

---

### 📊 State Change Documentation (MANDATORY)

**Every state change MUST be documented in GitHub issue:**

| State Transition | Action Required |
|------------------|-----------------|
| Created → Todo | Set `status:todo` label when creating issue |
| Todo → In Progress | Update label to `status:in-progress`, comment with start time |
| In Progress → Blocked | Update label to `status:blocked`, comment with blocker details |
| Blocked → In Progress | Update label back to `status:in-progress`, comment with resolution |
| In Progress → Done | Close issue with completion comment, remove status label |
| Done → Reopened | Reopen issue, add `status:todo`, comment with reason |

**State Change Comment Template:**
```markdown
## State Change: [Old State] → [New State]

**Reason:** Brief explanation

**Impact:** How this affects timeline/dependencies

**Next Steps:** What needs to happen next
```

---

### 🔍 Recovery Process (For Future Claude Instances)

If you (Claude) lose context or a new instance takes over, **FOLLOW THIS RECOVERY SEQUENCE:**

#### Recovery Step 1: Read Core Documents (MANDATORY ORDER)

1. **Read CLAUDE.md** (this file) - Get governance rules and tracking process
2. **Read PROGRESS.md** - Understand current sprint and in-progress tasks
3. **Read docs/V2_ROADMAP.md** - Get big picture and phase context
4. **Read docs/AUDIT_REPORT.md** - Understand identified issues
5. **Check GitHub Issues** - Get official historical record
   ```bash
   gh issue list --state all --limit 50
   gh issue list --label "status:in-progress"
   gh issue list --label "status:blocked"
   ```
6. **Read Recent Commits** - Understand latest changes
   ```bash
   git log --oneline -20
   git log --oneline --grep="#[0-9]" -20  # Commits with issue refs
   ```

#### Recovery Step 2: Verify State (MANDATORY)

1. **Check In-Progress Tasks**
   - Compare PROGRESS.md with GitHub issues
   - Resolve any discrepancies (GitHub is source of truth)

2. **Identify Next Task**
   - Check PROGRESS.md "Up Next" section
   - Verify task has GitHub issue
   - If unclear, ask user before proceeding

3. **Resume Work**
   - Follow normal governance process from STEP 1
   - Update PROGRESS.md with recovery note
   - Continue as if there was no interruption

---

### ⚠️ Common Violations (DO NOT DO THESE)

❌ **NEVER work without a GitHub issue**
- Even "small" changes need tracking
- Create issue first, work second

❌ **NEVER commit without issue reference**
- Format: `type: description (#issue-number)`
- If you forgot, amend commit message

❌ **NEVER skip PROGRESS.md updates**
- Update every 10-15 minutes minimum
- It's your short-term memory - use it

❌ **NEVER forget to update GitHub on state changes**
- Todo → In Progress: Comment + label change
- In Progress → Done: Close with completion comment

❌ **NEVER start next task without closing current**
- Complete current task fully
- Update all tracking
- Then move to next

❌ **NEVER launch sub-agent without governance context**
- Always pass issue number
- Always include governance rules in prompt
- Always update issue with sub-agent results

---

### 📚 Quick Reference Commands

```bash
# Issue Management
gh issue create --title "Title" --body "Body" --label "feature,backend,phase:1-foundation" --milestone "V2 Phase 1"
gh issue list --label "status:todo"
gh issue list --label "status:in-progress"
gh issue list --milestone "V2 Phase 1"
gh issue view 42
gh issue edit 42 --add-label "status:in-progress"
gh issue edit 42 --remove-label "status:todo"
gh issue comment 42 --body "Progress update..."
gh issue close 42 --comment "Completion note"

# Commit with Issue Reference
git commit -m "feat(timer): add multi-task switching (#42)"

# View Recent Work
git log --oneline --grep="#[0-9]" -20
gh issue list --state closed --limit 20

# Branch Management
git checkout develop
git pull origin develop
git checkout -b feature/feature-name
git push origin feature/feature-name

# Create PR
gh pr create --base develop --title "Title" --body "Description"
```

---

### ✅ Governance Checklist (Review Before Every Task)

Before starting work, verify:
- [ ] I have read PROGRESS.md to understand current state
- [ ] GitHub issue exists for this work (if not, I will create one)
- [ ] Issue is updated to "status:in-progress"
- [ ] PROGRESS.md shows this task as "In Progress"
- [ ] I understand acceptance criteria
- [ ] I have noted issue number for commit messages

During work, verify:
- [ ] I am updating PROGRESS.md every 10-15 minutes
- [ ] I am making meaningful commits with issue references
- [ ] I am documenting decisions in PROGRESS.md
- [ ] I have noted any blockers immediately

After completion, verify:
- [ ] GitHub issue updated with completion comment
- [ ] Issue closed (if fully done) or updated (if partial)
- [ ] PROGRESS.md updated with completion
- [ ] Changes committed with issue reference
- [ ] Next task identified in "Up Next"

---

## Important Notes

- **ALWAYS** create/update GitHub issues for non-trivial work
- **ALWAYS** update PROGRESS.md during active work
- **ALWAYS** reference issue numbers in commits
- **NEVER** work without tracking - this is critical for project success
- When in doubt, over-communicate in issues and PROGRESS.md

---

## Project Metadata

- **GitHub Repo:** https://github.com/nsareen/study-planner-app
- **Primary Deployment:** Vercel (main branch → production)
- **Staging Deployment:** Vercel (develop branch → staging)
- **Timeline:** 8 weeks (V2 implementation)
- **Current Phase:** Phase 1 - Foundation & State Refactor
