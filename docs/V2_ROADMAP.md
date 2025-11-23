# Study Planner V2 - Implementation Roadmap

**Version:** 2.0.0
**Approach:** Hybrid Migration (Client-First → Progressive Backend)
**Timeline:** 8 weeks (4 phases × 2 weeks)
**Priority:** Daily Usage Experience

---

## 🎯 V2 VISION

Transform the Study Planner from a functional but clunky tool into a delightful, reliable daily companion that students actually want to use every day.

**Core Goals:**
1. **Reliability:** Fix all timer and state synchronization bugs
2. **Engagement:** Make daily study workflow intuitive and motivating
3. **Flexibility:** Enable multi-task switching and dynamic scheduling
4. **Insights:** Provide real-time feedback and progress visibility
5. **Foundation:** Prepare for cloud sync and parent features

---

## 📊 PHASED APPROACH OVERVIEW

| Phase | Focus | Duration | Priority | Risk |
|-------|-------|----------|----------|------|
| **Phase 1** | State Refactor & Bug Fixes | Weeks 1-2 | CRITICAL | Medium |
| **Phase 2** | Daily UX Enhancements | Weeks 3-4 | HIGH | Low |
| **Phase 3** | Planning Workflow Improvements | Weeks 5-6 | MEDIUM | Low |
| **Phase 4** | Backend Foundation | Weeks 7-8 | LONG-TERM | High |

**Deployment Strategy:**
- Phase 1-2: Deploy to production (high impact, low risk)
- Phase 3: Optional (can be delayed if needed)
- Phase 4: Deploy as beta feature (opt-in cloud sync)

---

## 🔧 PHASE 1: Foundation - State Management Refactor

**Duration:** Weeks 1-2
**Priority:** CRITICAL
**Goal:** Fix architectural bugs, make daily workflow reliable

### Epic #1: State Management Cleanup

#### Feature 1.1: Remove Dual State Tracking
**Problem:** `userData[userId]` + top-level `chapters[]` must stay in sync, causes bugs
**Solution:** Single source of truth with computed getters

**Implementation:**
```typescript
// Before (Dual Tracking - REMOVE):
interface Store {
  userData: { [userId]: { chapters: Chapter[] } };
  chapters: Chapter[]; // ❌ Mirror, can diverge
}

// After (Single Source):
interface Store {
  userData: { [userId]: { chapters: Chapter[] } };

  // Computed getters only:
  getCurrentUserChapters: () => Chapter[];
  getCurrentUserAssignments: () => ChapterAssignment[];
}
```

**Files:**
- `src/store/useStore.ts` (refactor state structure)
- `src/pages/TodayPlan.tsx` (update to use getters)
- `src/pages/SmartPlanner.tsx` (update to use getters)
- `src/components/*` (update all component subscriptions)

**Acceptance Criteria:**
- [ ] No top-level state mirrors exist
- [ ] All components use computed getters
- [ ] Tests pass with new architecture
- [ ] No performance regression (<5ms impact)

#### Feature 1.2: Consolidate Timer State
**Problem:** Timer tracked in 3 places: local React state, Zustand activeTimer, ActivitySession
**Solution:** Single Zustand source with computed elapsed time

**Implementation:**
```typescript
// Unified timer in Zustand:
interface TimerState {
  sessionId: string;
  assignmentId: string;
  startTime: number; // epoch ms
  totalPausedMs: number; // accumulated pause duration
  currentPauseStart?: number; // if paused, when pause started
  isActive: boolean;
}

// Computed in store:
getElapsedTime: (assignmentId: string) => {
  const now = Date.now();
  const timer = state.activeTimers[assignmentId];

  let elapsed = now - timer.startTime - timer.totalPausedMs;
  if (timer.currentPauseStart) {
    elapsed -= (now - timer.currentPauseStart);
  }

  return elapsed;
}
```

**Files:**
- `src/store/useStore.ts` (add unified timer logic)
- `src/pages/TodayPlan.tsx` (remove local timer state)
- `src/components/Timer/SmartTimer.tsx` (update to use store timer)

**Acceptance Criteria:**
- [ ] No local timer state in components
- [ ] Pause/resume calculation simplified
- [ ] Timer accuracy 99%+
- [ ] Timer survives page refresh

#### Feature 1.3: Add Zod Validation Schemas
**Problem:** No runtime validation, invalid data can enter store
**Solution:** Zod schemas for all data types, validate on mutations

**Implementation:**
```typescript
import { z } from 'zod';

const ChapterSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().min(1).max(100),
  studyHours: z.number().positive().max(100),
  completedStudyHours: z.number()
    .nonnegative()
    .refine((val, ctx) => {
      const studyHours = ctx.parent.studyHours;
      return val <= studyHours * 1.5; // Max 150% of planned
    }, "Completed hours exceed reasonable limit"),
  // ... more fields
});

// In store mutations:
addChapter: (chapter) => {
  const validated = ChapterSchema.parse(chapter); // Throws if invalid
  set(state => ({...}));
}
```

**Files:**
- `src/schemas/` (new directory)
- `src/schemas/chapter.schema.ts`
- `src/schemas/assignment.schema.ts`
- `src/schemas/session.schema.ts`
- `src/store/useStore.ts` (add validation to mutations)

**Acceptance Criteria:**
- [ ] All core types have Zod schemas
- [ ] Mutations validate before updating state
- [ ] Invalid data throws clear errors
- [ ] Tests cover validation edge cases

#### Feature 1.4: Fix Bidirectional Links
**Problem:** `StudyPlan.assignmentIds` not cleaned when assignment deleted
**Solution:** Cascade updates in both directions

**Implementation:**
```typescript
deleteAssignment: (id) => set((state) => {
  // Remove assignment
  const filtered = state.chapterAssignments.filter(a => a.id !== id);

  // Clean up plan references
  const updatedPlans = state.studyPlans.map(plan => ({
    ...plan,
    assignmentIds: plan.assignmentIds.filter(aid => aid !== id)
  }));

  // Cascade to sessions
  const filteredSessions = state.activitySessions.filter(
    s => s.assignmentId !== id
  );

  return {
    chapterAssignments: filtered,
    studyPlans: updatedPlans,
    activitySessions: filteredSessions
  };
});
```

**Files:**
- `src/store/useStore.ts` (`deleteAssignment`, `deleteStudyPlan`, `deleteChapter`)

**Acceptance Criteria:**
- [ ] `deleteAssignment` cleans plan.assignmentIds
- [ ] `deleteStudyPlan` cleans or reassigns assignments
- [ ] `deleteChapter` cascades to assignments + sessions
- [ ] No orphaned references possible

#### Feature 1.5: Multi-Task Switching
**Problem:** Single session lock prevents natural task switching
**Solution:** Allow multiple timers, auto-pause when switching

**Implementation:**
```typescript
// Support multiple timers:
interface Store {
  activeTimers: { [assignmentId: string]: TimerState };
}

startActivity: (assignmentId) => set((state) => {
  const currentActive = Object.values(state.activeTimers)
    .find(t => t.isActive);

  // Auto-pause current if exists
  const updatedTimers = {...state.activeTimers};
  if (currentActive) {
    updatedTimers[currentActive.assignmentId] = {
      ...currentActive,
      isActive: false,
      currentPauseStart: Date.now()
    };
  }

  // Start new timer
  updatedTimers[assignmentId] = {
    sessionId: generateId(),
    assignmentId,
    startTime: Date.now(),
    totalPausedMs: 0,
    isActive: true
  };

  return { activeTimers: updatedTimers };
});
```

**Files:**
- `src/store/useStore.ts` (multi-timer support)
- `src/pages/TodayPlan.tsx` (show paused tasks list)

**Acceptance Criteria:**
- [ ] Can start new task while another paused
- [ ] Previous task auto-pauses
- [ ] Can resume any paused task
- [ ] UI shows active + paused tasks

### Phase 1 Deliverables
- [ ] All 10 daily workflow bugs fixed
- [ ] Timer reliability 99%+
- [ ] No state synchronization issues
- [ ] Tests pass (unit + e2e)
- [ ] Performance maintained
- [ ] Deployed to staging for testing

---

## 🎨 PHASE 2: Daily UX Enhancements

**Duration:** Weeks 3-4
**Priority:** HIGH
**Goal:** Make daily usage engaging and motivating

### Epic #2: Engagement Features

#### Feature 2.1: Smart Prioritization Display
**Problem:** Priority hardcoded as "Medium", algorithm exists but not used
**Solution:** Connect to prioritization algorithm, show real scores

**Implementation:**
```typescript
// In TodayPlan:
const assignmentsWithPriority = todayAssignments.map(assignment => {
  const chapter = getChapter(assignment.chapterId);
  const { priority, urgency, scarcity, daysUntilExam } =
    calculateChapterPriority(chapter, exams, offDays, today);

  return {
    ...assignment,
    priority,
    urgency,
    scarcity,
    daysUntilExam,
    priorityLevel: getPriorityLevel(priority) // 'critical' | 'high' | 'medium' | 'low'
  };
}).sort((a, b) => b.priority - a.priority);
```

**UI Design:**
```
┌─────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY                         │
│ Math - Algebra                           │
│ ⏰ Exam in 3 days | 📊 2 study days left │
│ Priority Score: 8.5                      │
│ [Start] [Schedule Later]                 │
└─────────────────────────────────────────┘
```

**Files:**
- `src/pages/TodayPlan.tsx` (integrate prioritization)
- `src/components/PriorityBadge.tsx` (new component)
- `src/utils/prioritization.ts` (already exists, just connect)

**Acceptance Criteria:**
- [ ] Tasks sorted by real priority scores
- [ ] Visual indicators (🔴 High, 🟡 Medium, 🟢 Low)
- [ ] Tooltip explains priority calculation
- [ ] Updates dynamically as exams approach

#### Feature 2.2: Real-Time Velocity Feedback
**Problem:** VelocityIndicator component exists but not integrated
**Solution:** Show "ahead/behind schedule" during active sessions

**Implementation:**
```typescript
// Velocity calculation:
const getVelocity = (assignment, elapsedMs) => {
  const expectedProgress = (elapsedMs / 1000 / 60) / assignment.plannedMinutes;
  const actualProgress = elapsedMs / (assignment.plannedMinutes * 60 * 1000);
  const velocity = actualProgress / expectedProgress;

  // velocity > 1 = ahead, < 1 = behind
  const deltaMinutes = (velocity - 1) * assignment.plannedMinutes;

  return {
    velocity,
    deltaMinutes,
    status: velocity >= 0.9 ? 'on-track' : velocity >= 0.7 ? 'behind' : 'critical'
  };
};
```

**UI Display:**
```
┌─────────────────────────────────────────┐
│ 📚 ACTIVE: Math - Algebra               │
│ ⏱️  45:30 / 60:00 planned               │
│ 📊 You're 5 min ahead of schedule! 🎉  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 76%   │
│ [Pause] [Complete]                       │
└─────────────────────────────────────────┘
```

**Files:**
- `src/pages/TodayPlan.tsx` (integrate VelocityIndicator)
- `src/components/Timer/VelocityIndicator.tsx` (already exists, enhance)

**Acceptance Criteria:**
- [ ] Velocity shown during active sessions
- [ ] Updates every 10 seconds
- [ ] Motivational messages based on velocity
- [ ] Visual speedometer or progress ring

#### Feature 2.3: Custom Completion Modals
**Problem:** Browser confirm() dialogs feel jarring
**Solution:** Custom modal with timer summary and visual appeal

**Implementation:**
```tsx
<CompletionModal
  assignment={assignment}
  elapsedTime={elapsedMs}
  plannedTime={assignment.plannedMinutes * 60 * 1000}
  velocity={velocity}
  onConfirm={() => completeActivity(sessionId, elapsedMinutes)}
  onCancel={() => setShowModal(false)}
>
  <TimerSummary elapsed={elapsedMs} planned={plannedMinutes} />
  <VelocityChart velocity={velocity} />
  <MotivationalMessage based={velocity} />
</CompletionModal>
```

**Files:**
- `src/components/Modals/CompletionModal.tsx` (new)
- `src/pages/TodayPlan.tsx` (replace confirm() with modal)

**Acceptance Criteria:**
- [ ] Modal shows timer, planned time, velocity
- [ ] Visual summary with charts
- [ ] Smooth animations
- [ ] Keyboard shortcuts (Enter = confirm, Esc = cancel)

#### Feature 2.4: Progress Visibility
**Problem:** Progress only updates after completion, not during sessions
**Solution:** Include active timer in real-time progress calculation

**Files:**
- `src/pages/TodayPlan.tsx` (update progress calculation)

**Acceptance Criteria:**
- [ ] Progress updates every minute during sessions
- [ ] Shows "X hours studied today (Y in progress)"
- [ ] Visual progress bar animates smoothly

### Phase 2 Deliverables
- [ ] Daily engagement 80%+
- [ ] Smart prioritization visible
- [ ] Real-time velocity feedback
- [ ] Custom modals replace browser dialogs
- [ ] User satisfaction 4.5+ stars

---

## 🔀 PHASE 3: Planning Workflow Improvements

**Duration:** Weeks 5-6
**Priority:** MEDIUM
**Goal:** Simplify planning → execution flow

### Epic #3: Planning UX

#### Feature 3.1: Quick Schedule from Today View
**Problem:** Must navigate to Planner to schedule new tasks
**Solution:** Embedded mini-scheduler in Today view

**Implementation:**
```tsx
{todayAssignments.length === 0 && (
  <EmptyState>
    <QuickScheduler
      chapters={unscheduledChapters}
      onSchedule={(chapterId) => {
        scheduleChapter(chapterId, today, 'study', defaultMinutes);
        toast.success('Added to today!');
      }}
    />
  </EmptyState>
)}
```

**Files:**
- `src/pages/TodayPlan.tsx` (add QuickScheduler)
- `src/components/QuickScheduler.tsx` (new)

#### Feature 3.2: Bulk Chapter Operations
**Problem:** Must schedule chapters one-by-one
**Solution:** Multi-select with batch actions

**Files:**
- `src/pages/SmartPlanner.tsx` (add selection mode)
- `src/components/BulkScheduler.tsx` (new)

#### Feature 3.3: Visual Plan-Chapter Relationships
**Problem:** Unclear which chapters belong to which plan
**Solution:** Show plan badges, assignment counts

**Files:**
- `src/components/ChapterCard.tsx` (add plan badge)
- `src/components/PlanCard.tsx` (add assignment count)

### Phase 3 Deliverables
- [ ] Time to schedule week: <15 minutes
- [ ] Bulk operations working
- [ ] Visual clarity improved
- [ ] User onboarding smoother

---

## 🗄️ PHASE 4: Backend Foundation

**Duration:** Weeks 7-8
**Priority:** LONG-TERM
**Goal:** Enable cloud sync and parent features

### Epic #4: Backend Infrastructure

#### Feature 4.1: Prisma Schema Design
See `docs/BACKEND_MIGRATION_GUIDE.md` for full schema

#### Feature 4.2: Supabase Setup
- PostgreSQL database
- Authentication (email/password + social)
- Real-time subscriptions
- Storage for attachments

#### Feature 4.3: Next.js API Routes
```
app/api/
├── auth/
├── chapters/
├── assignments/
├── sessions/
└── sync/
```

#### Feature 4.4: Optional Cloud Sync
**Implementation:**
```typescript
interface AppConfig {
  syncMode: 'local-only' | 'cloud-sync';
}

// Settings toggle:
<Toggle
  label="Enable Cloud Sync"
  description="Sync across devices, enable parent monitoring"
  enabled={syncMode === 'cloud-sync'}
  onChange={handleSyncModeChange}
/>
```

### Phase 4 Deliverables
- [ ] Backend API functional
- [ ] Data migration wizard
- [ ] Optional cloud sync toggle
- [ ] Foundation for parent features

---

## 📊 SUCCESS METRICS

| Metric | Current | V2 Target |
|--------|---------|-----------|
| **Daily Engagement** | ~60% | 80%+ |
| **Timer Reliability** | ~85% | 99%+ |
| **Task Completion Rate** | ~70% | 90%+ |
| **Bug Reports/Week** | ~5-10 | <2 |
| **User Satisfaction** | 3.5 ⭐ | 4.5+ ⭐ |
| **Time to Create Plan** | ~20 min | <10 min |
| **Time to Schedule Week** | ~30 min | <15 min |

---

## 🚀 DEPLOYMENT STRATEGY

### Phase 1-2: Production Deployment
```bash
# After staging testing:
git checkout main
git merge develop
git tag v2.0.0
git push origin main --tags
# Auto-deploys to Vercel production
```

### Phase 3: Optional Deployment
Can be delayed if Phase 1-2 shows good traction

### Phase 4: Beta Feature
Deploy as opt-in feature flag, gradual rollout

---

## 🔄 ROLLBACK PLAN

Each phase has rollback capability:
- **Phase 1:** Git revert to v1.2.0 tag
- **Phase 2:** Feature flags to disable new UX
- **Phase 3:** Optional phase, can skip
- **Phase 4:** Cloud sync is opt-in, can disable

---

## 📋 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Phase 1 breaks existing functionality** | Medium | High | Comprehensive tests, staging testing |
| **Performance regression** | Low | Medium | Lighthouse benchmarks, load testing |
| **User confusion with changes** | Medium | Low | Gradual rollout, in-app tutorial |
| **Backend migration complexity** | High | High | Phase 4 is optional, can delay |

---

## ✅ V2 DEFINITION OF DONE

- [ ] All 29 identified bugs fixed or tracked
- [ ] Timer reliability 99%+
- [ ] Daily engagement 80%+
- [ ] User satisfaction 4.5+ stars
- [ ] All tests passing (unit + e2e + visual + accessibility + performance)
- [ ] Documentation complete
- [ ] Backend foundation ready for V2.5

---

**Roadmap Version:** 1.0
**Last Updated:** January 2025
**Next Review:** After Phase 1 completion
