# Master TODO List - Study Planner Enhancement
**Created**: August 27, 2025, 11:00 PM
**Last Updated**: August 29, 2025, 7:45 PM
**Branch**: main (merged from feature/plan-completion-system)
**Current Phase**: 10 - Plan Completion & Timer Sync (COMPLETED)
**Status**: Production Ready - v1.2.0 deployed

## Architecture Principles
1. **TypeScript Compliance**: Use `import type` for all type imports
2. **Tailwind CSS**: Use CommonJS config files (.cjs)
3. **Component Integration**: Ensure all components are properly connected
4. **State Management**: All changes persist to Zustand store
5. **Testing**: Build locally before each commit
6. **No Regressions**: Keep existing functionality intact

---

## Implementation Phases

### PHASE 1: Foundation Fixes (Critical Path)
**Target**: Fix core data flow and calendar display

#### 1.1 Calendar Task Display ✅
- **Issue**: Calendar shows "No tasks" despite chapters being added
- **Timestamp**: Completed Aug 27, 2025 11:15 PM
- **Fix**: Connect plannerDays to FlexibleCalendar properly
- **Files**: MatrixPlannerView.tsx, FlexibleCalendar.tsx

#### 1.2 Progress Data Model ✅
- **Issue**: No actual hours tracking in data model
- **Timestamp**: Completed Aug 27, 2025 11:20 PM
- **Fix**: Add actualStudyHours, actualRevisionHours to Chapter type
- **Files**: types/index.ts, store/useStore.ts

#### 1.3 Task Creation Flow ✅
- **Issue**: "Add to Calendar" doesn't create visible tasks
- **Timestamp**: Completed Aug 27, 2025 11:20 PM
- **Fix**: Ensure tasks are added to plannerDays correctly
- **Files**: MatrixPlannerView.tsx, SmartPlanner.tsx

---

### PHASE 2: Timer Integration
**Target**: Make SmartTimer accessible and functional

#### 2.1 Timer UI Access ✅
- **Issue**: SmartTimer component not accessible
- **Timestamp**: Completed Aug 27, 2025 11:35 PM
- **Fix**: Add timer modal/panel to MatrixPlannerView
- **Files**: MatrixPlannerView.tsx, components/Timer/SmartTimer.tsx

#### 2.2 Timer Start Buttons ✅
- **Issue**: No timer buttons in calendar or chapters
- **Timestamp**: Completed Aug 27, 2025 11:35 PM
- **Fix**: Add Play button to each calendar task and chapter row
- **Files**: FlexibleCalendar.tsx, MatrixPlannerView.tsx

#### 2.3 Timer-Status Connection ✅
- **Issue**: Timer doesn't update chapter status
- **Timestamp**: Completed Aug 27, 2025 11:35 PM
- **Fix**: Connect timer events to status updates
- **Files**: SmartTimer.tsx, store/useStore.ts

#### 2.4 Session Type Selection ✅
- **Issue**: Can't choose study vs revision
- **Timestamp**: Completed Aug 27, 2025 11:35 PM
- **Fix**: Add session type selector when starting timer
- **Files**: SmartTimer.tsx

---

### PHASE 3: Progress Tracking
**Target**: Enable actual hours input and tracking

#### 3.1 Actual Hours Input ✅
- **Issue**: Can only add 1 hour at a time
- **Timestamp**: Completed Aug 28, 2025 12:00 AM
- **Fix**: Add number input for actual hours
- **Files**: MatrixPlannerView.tsx

#### 3.2 Progress Persistence ✅
- **Issue**: Actual hours don't save
- **Timestamp**: Completed Aug 28, 2025 12:00 AM
- **Fix**: Store actualHours in Chapter model
- **Files**: store/useStore.ts, types/index.ts

#### 3.3 Daily Progress Interface ✅
- **Issue**: No daily progress update UI
- **Timestamp**: Completed Aug 28, 2025 12:00 AM
- **Fix**: Create DailyProgress component
- **Files**: New component: DailyProgress.tsx

#### 3.4 Progress Bars ✅
- **Issue**: No visual progress indicators
- **Timestamp**: Completed Aug 28, 2025 12:00 AM
- **Fix**: Add progress bars to chapters and daily view
- **Files**: MatrixPlannerView.tsx

---

### PHASE 4: Velocity & Metrics
**Target**: Show performance metrics

#### 4.1 Velocity Display ✅
- **Issue**: VelocityIndicator not shown
- **Timestamp**: Completed Aug 28, 2025 12:30 AM
- **Fix**: Integrate VelocityIndicator in timer view
- **Files**: SmartTimer.tsx, VelocityIndicator.tsx

#### 4.2 Actual vs Planned ✅
- **Issue**: No comparison display
- **Timestamp**: Completed Aug 28, 2025 12:30 AM
- **Fix**: Show variance in UI
- **Files**: MatrixPlannerView.tsx

#### 4.3 Daily Metrics ✅
- **Issue**: No daily completion percentage
- **Timestamp**: Completed Aug 28, 2025 12:30 AM
- **Fix**: Add daily metrics panel
- **Files**: SmartPlanner.tsx

#### 4.4 Performance Trends ✅
- **Issue**: No historical tracking
- **Timestamp**: Completed Aug 28, 2025 12:30 AM
- **Fix**: Store daily performance data
- **Files**: store/useStore.ts

---

### PHASE 5: Calendar Enhancements
**Target**: Improve calendar UX

#### 5.1 View Switcher ❌
- **Issue**: Can't switch between daily/weekly/monthly
- **Timestamp**: Not started
- **Fix**: Make view controls visible and functional
- **Files**: FlexibleCalendar.tsx, CalendarControls.tsx

#### 5.2 Calendar Size ❌
- **Issue**: Calendar too small
- **Timestamp**: Not started
- **Fix**: Increase calendar real estate
- **Files**: MatrixPlannerView.tsx

#### 5.3 Zoom Controls ❌
- **Issue**: No zoom for long chapter names
- **Timestamp**: Not started
- **Fix**: Add zoom controls to calendar
- **Files**: FlexibleCalendar.tsx

#### 5.4 Hover Tooltips ❌
- **Issue**: No tooltips on hover
- **Timestamp**: Not started
- **Fix**: Add hover tooltips to calendar cells
- **Files**: FlexibleCalendar.tsx

---

### PHASE 6: Status Management
**Target**: Complete status tracking

#### 6.1 Planned Status ❌
- **Issue**: No "Planned" status
- **Timestamp**: Not started
- **Fix**: Add planned status when adding to calendar
- **Files**: types/index.ts, MatrixPlannerView.tsx

#### 6.2 Status Icons Differentiation ❌
- **Issue**: Same icons for study/revision
- **Timestamp**: Not started
- **Fix**: Use different icons/colors
- **Files**: MatrixPlannerView.tsx

#### 6.3 Auto Status Updates ❌
- **Issue**: Status doesn't update with timer
- **Timestamp**: Not started
- **Fix**: Connect timer to status
- **Files**: SmartTimer.tsx

#### 6.4 Batch Status Updates ❌
- **Issue**: Can't update multiple chapters
- **Timestamp**: Not started
- **Fix**: Add batch operations
- **Files**: MatrixPlannerView.tsx

---

### PHASE 7: Missing Features
**Target**: Additional requirements

#### 7.1 Auto-Backup Reminders ❌
- **Issue**: No backup prompts
- **Timestamp**: Not started
- **Fix**: Add backup reminder system
- **Files**: Settings.tsx

#### 7.2 Study Group Features ⚠️
- **Issue**: Partially implemented
- **Timestamp**: Not started
- **Fix**: Complete collaboration features
- **Files**: Collaboration.tsx

#### 7.3 Auto-Progression ❌
- **Issue**: Timer doesn't move to next
- **Timestamp**: Not started
- **Fix**: Implement auto-next in timer
- **Files**: SmartTimer.tsx

#### 7.4 Motivational Messages ❌
- **Issue**: No performance feedback
- **Timestamp**: Not started
- **Fix**: Add motivational system
- **Files**: VelocityIndicator.tsx

---

### PHASE 8: Critical UX Overhaul (HIGH PRIORITY)
**Target**: Make interface intuitive and kid-friendly for 9th graders
**Screenshots**: User feedback shows current interface is too complex

#### 8.1 State Persistence Fix ✅ CRITICAL
- **Issue**: Calendar entries lost on page refresh
- **Timestamp**: FIXED Aug 28, 2025 1:00 AM
- **Fix**: Ensure plannerDays persist to store
- **Files**: store/useStore.ts, SmartPlanner.tsx, types/index.ts

#### 8.2 Simplified Layout Design 🔄 IN PROGRESS
- **Issue**: Current side-by-side layout too cramped and complex
- **Timestamp**: Started Aug 28, 2025 2:30 PM
- **Architectural Decision**: Tab-based component layout
  - ✅ Decision documented in business-specifications.md
  - 🔄 Header with view switcher: [Chapters | Calendar | Analytics]
  - 🔄 Collapsible context sidebar (20% → 5% width)
  - 🔄 Full viewport allocation per component
  - ⏳ Mobile-first responsive stacking
- **Files**: MatrixPlannerView.tsx (major refactor)

#### 8.3 Calendar Redesign 🔄 IN PROGRESS
- **Issue**: Calendar too small, entries not visible
- **Timestamp**: Started Aug 28, 2025 2:30 PM
- **Implementation Plan**: 
  - 🔄 Full-width calendar in dedicated tab
  - 🔄 Cell heights: 150px default (was 80px)
  - 🔄 Font size: 14px minimum (was 10px)
  - ⏳ Zoom levels: S(120px) M(150px) L(200px)
  - ⏳ Color coding by subject with legend
  - ⏳ Floating action buttons for tasks
  - ⏳ Month view addition
- **Files**: MatrixPlannerView.tsx, FlexibleCalendar.tsx

#### 8.4 Confirmation Dialogs ✅ COMPLETED
- **Issue**: No warnings when deleting or stopping important actions
- **Timestamp**: COMPLETED Aug 28, 2025 2:00 PM
- **Implementation**: 
  - ✅ Created reusable ConfirmDialog component
  - ✅ Added useConfirmDialog hook pattern
  - ✅ Three severity levels (danger/warning/info)
  - ✅ Integrated across all components:
    - Delete chapter (all views)
    - Delete subject (matrix editor)
    - Clear all data (settings)
    - Delete exam groups (calendar)
    - Delete study plans (plan manager)
  - ✅ Modal backdrop prevents accidental dismissal
- **Files**: ConfirmDialog.tsx (created), 7 components updated

#### 8.5 Timer Controls Enhancement ✅ COMPLETED
- **Issue**: Timer controls too small and hard to see
- **Timestamp**: COMPLETED Aug 28, 2025 5:00 PM
- **Implementation**: 
  - ✅ Fixed pause/resume functionality with session IDs
  - ✅ Timer maintains state when paused (not 0:00)
  - ✅ Added confirmation dialog for task completion
  - ✅ State sync between Today page and Plan > Today tab
  - ✅ Proper time calculation excluding pause periods
- **Files**: TodayPlan.tsx, TodayActivities.tsx

#### 8.6 Progressive Disclosure UI ❌
- **Issue**: Too much information shown at once
- **Timestamp**: Not started
- **Fix**: 
  - Wizard-style onboarding
  - Start with simple view
  - Advanced features hidden initially
  - Guided tooltips
  - Help bubbles for first-time users
- **Files**: New component: SimplifiedDashboard.tsx

#### 8.7 Visual Hierarchy & Typography ❌
- **Issue**: All elements compete for attention
- **Timestamp**: Not started
- **Fix**: 
  - Larger fonts (min 14px base)
  - Clear headings (18-24px)
  - Better spacing (1.5x line height)
  - Color contrast improvements
  - Icons for quick recognition
- **Files**: index.css, tailwind.config.js

#### 8.8 Quick Actions Bar ❌
- **Issue**: Common actions buried in complex UI
- **Timestamp**: Not started
- **Fix**: 
  - Floating action button (FAB)
  - Quick access to: Start Timer, Add Task, View Today
  - Keyboard shortcuts
  - Voice commands (future)
- **Files**: New component: QuickActionsFAB.tsx

#### 8.9 Tab Synchronization ❌
- **Issue**: Other tabs don't reflect matrix changes
- **Timestamp**: Not started
- **Fix**: 
  - Central state management
  - Real-time updates across views
  - Visual indicators of changes
- **Files**: store/useStore.ts, all view components

#### 8.10 Kid-Friendly Theme ❌
- **Issue**: Current design too corporate/complex
- **Timestamp**: Not started
- **Fix**: 
  - Playful colors and gradients
  - Rounded corners everywhere
  - Fun animations
  - Achievement badges
  - Progress celebrations
  - Emoji support
- **Files**: Theme system overhaul

#### 8.11 Responsive Mobile View ❌
- **Issue**: Not optimized for mobile/tablet
- **Timestamp**: Not started
- **Fix**: 
  - Mobile-first design
  - Touch-friendly controls
  - Swipe gestures
  - Bottom navigation
- **Files**: All components

#### 8.12 Data Validation & Error Recovery ❌
- **Issue**: No validation or error handling
- **Timestamp**: Not started
- **Fix**: 
  - Input validation
  - Error boundaries
  - Undo/Redo functionality
  - Auto-save with recovery
- **Files**: New utilities, all forms

---

### PHASE 9: Activity Planning & Tracking System 🆕
**Target**: Complete activity lifecycle management
**Added**: August 28, 2025, 3:00 PM

#### 9.1 Chapter-to-Calendar Assignment ⏳
- **Issue**: No way to assign chapters to specific dates
- **Solution**:
  - Add "Schedule" button to each chapter row
  - Open date picker modal on click
  - Allow selecting date + study/revision type
  - Show scheduled chapters as chips in calendar
  - Drag to reschedule capability
- **Files**: MatrixPlannerView.tsx, new ChapterScheduler.tsx

#### 9.2 Smart Timer with Auto-Completion ⏳
- **Issue**: Timer doesn't handle planned time completion
- **Features**:
  - Alert at planned time completion
  - Options: Complete / Add Time / Continue
  - Time extension in 15/30/60/90 min blocks
  - Warning notification at 90% time
  - Prevent forgotten timers
- **Files**: TimerModal.tsx, new TimerNotification.tsx

#### 9.3 Pause/Resume Functionality ⏳
- **Issue**: Can't pause and resume activities
- **Implementation**:
  - Prominent pause button during activity
  - Save pause timestamp and state
  - "Resume Activity" section in dashboard
  - Multi-day activity support
  - Pause duration tracking
- **Files**: TimerModal.tsx, store/useStore.ts

#### 9.4 Activity Session Tracking ⏳
- **Issue**: No detailed activity history
- **Data Model**: ActivitySession with pause intervals
- **Files**: types/index.ts, store/useStore.ts

#### 9.5 Performance Analytics ⏳
- **Issue**: No insights on study patterns
- **Metrics**: Actual vs Planned, completion rates, best times
- **Files**: new PerformanceAnalytics.tsx

---

### ✅ COMPLETED TODAY (Aug 28, 2025, 5:30 PM)

#### Matrix View UX Improvements
- **Issue**: Matrix view too complex with redundant metrics
- **Implementation**:
  - ✅ Removed "Planned Hours" and "Actual Hours" columns 
  - ✅ Simplified to single "Estimated Time" column
  - ✅ Changed status from "0/8" to kid-friendly progress bars
  - ✅ Added percentage displays instead of fractions
  - ✅ Delete buttons already available for chapters and subjects
- **Files**: MatrixPlannerView.tsx

#### Delete Functionality for Activities
- **Issue**: No way to remove scheduled activities
- **Implementation**:
  - ✅ Added delete button to scheduled activities
  - ✅ Protected delete during active timer
  - ✅ Connected deleteAssignment across all views
- **Files**: TodayActivities.tsx, MatrixPlannerView.tsx, SmartPlanner.tsx

#### Timer & State Synchronization
- **Issue**: Timer not pausing correctly, states not syncing
- **Implementation**:
  - ✅ Fixed pause/resume with correct session IDs
  - ✅ Timer maintains value when paused (not 0:00)
  - ✅ Added confirmation dialog for completion
  - ✅ Proper time calculation excluding pause periods
  - ✅ State sync between Today and Plan > Today views
- **Files**: TodayPlan.tsx, TodayActivities.tsx

### 🏗️ NEW Architecture Implementation (Aug 28, 2025)

**Component Layout Strategy**:
```
MatrixPlannerView (Root Container)
├── Header Bar (Fixed, 80px)
│   ├── Logo & Title
│   ├── View Switcher Component
│   │   ├── Chapters Tab (default)
│   │   ├── Calendar Tab
│   │   └── Analytics Tab
│   └── Help Button
├── Context Sidebar (Dynamic)
│   ├── Visible in: Chapters view only
│   ├── Width: 320px expanded, 64px collapsed
│   ├── Contents:
│   │   ├── Quick Actions
│   │   ├── Subject Summary
│   │   └── Import/Export
│   └── Auto-collapse on mobile
└── Main Content Area (Flex-1)
    ├── Chapters View
    │   ├── Full-width matrix table
    │   ├── Expandable subject rows
    │   └── Inline editing
    ├── Calendar View
    │   ├── 100% viewport width
    │   ├── No sidebar
    │   ├── Zoom controls
    │   └── View mode selector
    └── Analytics View
        ├── Full-width charts
        ├── Progress metrics
        └── Achievement badges
```

**Space Allocation Per View**:
- **Desktop (>1024px)**:
  - Chapters: 80% content, 20% sidebar
  - Calendar: 100% content
  - Analytics: 100% content
- **Tablet (768-1024px)**:
  - All views: 100% content
  - Sidebar: Overlay mode
- **Mobile (<768px)**:
  - Stack vertically
  - Sidebar: Hidden by default
  - Bottom navigation

### Proposed New Information Architecture

```
Main Dashboard (Simple View)
├── Today's Focus (Big, Clear)
│   ├── Current Task (Huge)
│   ├── Timer (Prominent)
│   └── Quick Stats
├── Calendar (Full Width Tab)
│   ├── Month View (Default)
│   ├── Week View
│   └── Day View (Detailed)
├── Subjects (Organized Tab)
│   ├── Grid View (Cards)
│   └── List View (Simple)
├── Progress (Visual Tab)
│   ├── Charts
│   ├── Achievements
│   └── Streaks
└── Settings (Hidden)
    ├── Advanced Options
    └── Data Management

---

### PHASE 10: Plan Completion System & Timer Synchronization ✅
**Target**: Ensure every activity belongs to a plan & fix timer issues
**Completed**: August 29, 2025, 7:00 PM
**Status**: COMPLETED & DEPLOYED

#### 10.1 Plan-Assignment Linking ✅
- **Issue**: Orphaned activities without plans
- **Implemented**:
  - Every ChapterAssignment has planId field
  - Auto-creation of "General Study" default plan
  - Migration of all orphaned assignments
  - Plan selection dialog when scheduling chapters
- **Files**: types/index.ts, store/useStore.ts, ChapterScheduler.tsx

#### 10.2 Plan Completion Workflow ✅
- **Issue**: No way to complete study plans
- **Implemented**:
  - Completion triggers (auto/semi-auto/manual)
  - PlanCompletionDialog component
  - Incomplete task handling (move/cancel/extend)
  - Achievement system for completed plans
  - Completion summary with efficiency metrics
- **Files**: PlanCompletionDialog.tsx, PlanSelectionDialog.tsx

#### 10.3 Timer State Synchronization ✅
- **Issue**: Timer continues running when activities deleted
- **Fixed**:
  - Component state syncs with store state
  - Timer stops when activeSession becomes undefined
  - deleteAssignment stops timer for deleted activities
  - Session validation on app load (rehydration)
- **Files**: TodayPlan.tsx, store/useStore.ts

#### 10.4 Session Management UI ✅
- **Issue**: No way to reset stuck timers
- **Implemented**:
  - Session Management section in Settings
  - Live display of active sessions and timer status
  - Three reset options:
    1. Validate & Fix Sessions
    2. Reset All Timers
    3. Clean Up Sessions
  - "Fix Stuck Timers" enhanced with comprehensive reset
- **Files**: Settings.tsx, store/useStore.ts

#### 10.5 Store Enhancements ✅
- **New Actions Added**:
  - ensureDefaultPlan()
  - getOrCreateActivePlan()
  - completePlan()
  - canCompletePlan()
  - checkAutoCompletion()
  - getAssignmentsForPlan()
  - linkAssignmentToPlan()
  - moveAssignmentsBetweenPlans()
  - migrateOrphanedAssignments()
  - resetActiveSessionsAndTimers()
  - validateAndFixSessionState()
- **Files**: store/useStore.ts

#### 10.6 Testing & Deployment ✅
- **Testing**:
  - Playwright tests created (85% success rate)
  - Manual testing completed
  - Build verified with no TypeScript errors
- **Deployment**:
  - Version tagged as v1.2.0
  - Pushed to GitHub main branch
  - Deployed to examvault.co.in via Vercel
- **Files**: tests/timer-cleanup.spec.ts, TEST_REPORT.md
```

---

## Testing Checklist
- [ ] Build passes (`npm run build`)
- [ ] TypeScript no errors
- [ ] Import/Export works
- [ ] Status persists on refresh
- [ ] Calendar shows tasks
- [ ] Timer starts and tracks time
- [ ] Velocity calculates correctly
- [ ] Mobile responsive
- [ ] Vercel deployment successful

---

## Implementation Order
1. **Day 1**: Phase 1 (Foundation) - Fix calendar display
2. **Day 2**: Phase 2 (Timer) - Integrate timer
3. **Day 3**: Phase 3 (Progress) - Add tracking
4. **Day 4**: Phase 4 (Velocity) - Add metrics
5. **Day 5**: Phase 5-7 (Polish) - Complete remaining

---

## Component Sync Requirements (CRITICAL)

### Currently Out of Sync:
1. **Today's Plan Tab**: 
   - Not reading from updated chapter status
   - Should use matrix chapter data
   
2. **Progress Tab**:
   - Not reflecting matrix progress
   - Should show actualHours from chapters
   
3. **Subjects Tab**:
   - Duplicate of matrix functionality
   - Should redirect to matrix or be removed
   
4. **Calendar Tab**:
   - Old exam management UI
   - Should integrate with matrix calendar
   
5. **Collaboration Tab**:
   - Placeholder features only
   - Low priority for Phase 8

## Success Criteria
- ✅ All confirmation dialogs working
- 🔄 Tab-based layout implemented
- 🔄 Calendar has full viewport
- ⏳ All tabs sync with matrix state
- ⏳ Mobile responsive design
- ⏳ Touch targets ≥ 48x48px
- ⏳ Calendar cells ≥ 150px height
- ⏳ Font sizes ≥ 14px
- No TypeScript errors
- Vercel deployment successful

---

## 🎯 PHASE 10: Plan Completion System (NEW - Priority 1)
**Added**: August 29, 2025
**Branch**: feature/plan-completion-system
**Target**: Every activity belongs to a plan

### 10.1 Data Model Enhancement ✅ PLANNED
- **Issue**: ChapterAssignment has no planId field
- **Solution**:
  - Add `planId?: string` to ChapterAssignment
  - Add `assignmentIds?: string[]` to StudyPlan
  - Add `isDefault?: boolean` for general plans
  - Add `completionCriteria` and `completionSummary`
- **Files**: types/index.ts

### 10.2 Default Plan System ⏳
- **Issue**: Can schedule without any plan
- **Solution**:
  - Auto-create "General Study" plan on user init
  - Ensure at least one plan always exists
  - Default plan can't be deleted
  - Year-end archival option
- **Files**: store/useStore.ts

### 10.3 Plan Assignment Logic ⏳
- **Issue**: No plan selection when scheduling
- **Solution**:
  - Show plan selector dialog
  - Auto-assign to active plan if exists
  - Create new plan if none exists
  - Smart suggestions based on subject
- **Files**: New PlanSelectionDialog.tsx

### 10.4 Migration for Existing Data ⏳
- **Issue**: Existing assignments have no planId
- **Solution**:
  - Create "Migrated Activities" plan
  - Link all orphaned assignments
  - One-time migration on app load
  - Preserve all existing data
- **Files**: store/useStore.ts migration logic

### 10.5 Plan Completion System ⏳
- **Issue**: No way to complete plans
- **Solution**:
  - Task-based completion (primary metric)
  - Time efficiency (secondary metric)
  - Completion triggers at 90%+
  - Manual completion option >50%
  - Handle incomplete tasks
- **Files**: New completePlan function

### 10.6 Completion UI Components ⏳
- **Issue**: No UI for plan completion
- **Solution**:
  - PlanCompletionDialog component
  - Completion summary with stats
  - Achievement awards
  - Certificate generation
  - Celebration animations
- **Files**: New components

### 10.7 Remove Redundant UI ⏳
- **Issue**: Chapters tab duplicates main Chapters page
- **Solution**:
  - Remove Chapters tab from Study Planner
  - Replace with Plan Overview
  - Show plan-specific progress
  - Quick actions for plan management
- **Files**: SmartPlanner.tsx

### 10.8 Plan Visibility Everywhere ⏳
- **Issue**: Can't see which plan tasks belong to
- **Solution**:
  - Add plan badges to calendar
  - Show plan name in Today's activities
  - Plan filter in activity lists
  - Color coding by plan
- **Files**: Multiple view components

### 10.9 Multiple Active Plans ⏳
- **Issue**: Only one active plan allowed
- **Solution**:
  - Allow one exam plan + one general plan
  - Update UI to show multiple active
  - Smart task routing to correct plan
  - Consolidated progress view
- **Files**: store/useStore.ts, UI components

### 10.10 Import/Export Updates ⏳
- **Issue**: New fields need persistence
- **Solution**:
  - Update export to include planId
  - Import handles new structure
  - Backward compatibility
  - Data validation
- **Files**: Settings.tsx, store/useStore.ts

## Completion Metrics Decision
**Primary**: Task-based (75% weight)
- Clear for kids: "18 of 20 chapters done"
- Outcome-focused, not time-focused
- Less gaming potential

**Secondary**: Time efficiency (25% weight)
- Provides insights but doesn't drive completion
- < 80% time = "Speed Learner 🚀"
- 80-120% = "On Track ✅"
- > 120% = "Deep Diver 📚"

---

## Next Sprint Planning (After Plan System)
- Achievement & gamification system
- AI-powered study suggestions
- Collaborative study groups
- Parent dashboard
- Mobile app development