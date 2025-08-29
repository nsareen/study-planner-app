# Plan Completion System - Specifications

## 🎯 Functional Requirements

### 1. Plan-Assignment Linking
- **FR-1.1**: Every ChapterAssignment MUST be linked to a StudyPlan via `planId`
- **FR-1.2**: System SHALL auto-create "General Study" plan if no plan exists
- **FR-1.3**: When adding chapters to calendar without active plan:
  - IF active plan exists → Link to active plan
  - ELSE IF plans exist → Show plan selector dialog
  - ELSE → Auto-create "Quick Study Plan [Month Year]"
- **FR-1.4**: Migration SHALL link all orphaned assignments to a "Migrated Activities" plan

### 2. Default Plan Management
- **FR-2.1**: Every user SHALL have at least one plan (General Study)
- **FR-2.2**: Default plan CANNOT be deleted, only archived at year-end
- **FR-2.3**: Multiple active plans allowed: ONE exam-based + ONE general study
- **FR-2.4**: System SHALL suggest plan assignment based on chapter subject

### 3. Plan Completion Criteria
- **FR-3.1**: Primary completion metric: Task completion (assignments)
- **FR-3.2**: Completion triggers:
  - Automatic: 100% tasks completed
  - Semi-automatic: 90%+ completion (user confirmation required)
  - Manual: User can complete with >50% progress
  - Time-based: End date reached with >80% completion
- **FR-3.3**: Completion SHALL generate summary with:
  - Tasks completed/total
  - Actual vs planned hours
  - Efficiency score
  - Achievement badges

### 4. Incomplete Task Handling
- **FR-4.1**: On plan completion, incomplete tasks can be:
  - Moved to General Study plan
  - Moved to next active plan
  - Marked as cancelled
  - Extended (plan deadline extended)
- **FR-4.2**: User MUST choose action for incomplete tasks

### 5. Post-Completion Actions
- **FR-5.1**: Completed plans can be:
  - Archived (hidden from active view)
  - Used as template for new plan
  - Exported as report/certificate
- **FR-5.2**: Completion SHALL trigger achievement evaluation
- **FR-5.3**: Progress stats SHALL update immediately

## 🏗️ Architecture Requirements

### 1. Data Model Updates

```typescript
// ChapterAssignment Enhancement
interface ChapterAssignment {
  // ... existing fields
  planId?: string;          // Link to StudyPlan
  planName?: string;        // Cached for display
  originalPlanId?: string;  // Track if moved between plans
}

// StudyPlan Enhancement
interface StudyPlan {
  // ... existing fields
  isDefault?: boolean;      // Marks general study plan
  assignmentIds?: string[]; // Track linked assignments
  
  completionCriteria?: {
    type: 'all_tasks' | 'percentage' | 'manual' | 'date_based';
    targetPercentage?: number;
    autoComplete?: boolean;
    notifyBeforeCompletion?: boolean;
  };
  
  completionSummary?: {
    completedAt: string;
    totalAssignments: number;
    completedAssignments: number;
    cancelledAssignments: number;
    actualStudyHours: number;
    actualRevisionHours: number;
    efficiency: number;
    achievements: string[];
  };
}
```

### 2. State Management

```typescript
// New Store Actions
interface StoreActions {
  // Plan completion
  completePlan: (planId: string, options: CompletionOptions) => void;
  canCompletePlan: (planId: string) => boolean;
  checkAutoCompletion: (planId: string) => void;
  
  // Plan-Assignment linking
  linkAssignmentToPlan: (assignmentId: string, planId: string) => void;
  moveAssignmentsBetweenPlans: (assignmentIds: string[], targetPlanId: string) => void;
  getAssignmentsForPlan: (planId: string) => ChapterAssignment[];
  
  // Default plan management
  ensureDefaultPlan: () => void;
  getOrCreateActivePlan: () => StudyPlan;
}
```

### 3. Migration Strategy

```typescript
// One-time migration on app load
function migrateOrphanedAssignments() {
  const assignments = getAssignments();
  const orphaned = assignments.filter(a => !a.planId);
  
  if (orphaned.length > 0) {
    const migrationPlan = createPlan({
      name: "Migrated Activities",
      isDefault: true,
      startDate: getEarliestDate(orphaned),
      endDate: getLatestDate(orphaned)
    });
    
    orphaned.forEach(a => {
      linkAssignmentToPlan(a.id, migrationPlan.id);
    });
  }
}
```

### 4. Data Synchronization
- **AR-4.1**: All plan updates MUST sync to localStorage immediately
- **AR-4.2**: Import/Export MUST preserve plan-assignment relationships
- **AR-4.3**: State changes MUST propagate to all active views
- **AR-4.4**: Completion status MUST persist across sessions

## 🎨 UX Requirements

### 1. Plan Selection Dialog
```
┌─────────────────────────────────────┐
│ Add to Study Plan                    │
├─────────────────────────────────────┤
│ Select a plan for this chapter:      │
│                                       │
│ ○ [Active] Mid-Term Mathematics      │
│   Progress: 15/20 tasks              │
│                                       │
│ ○ [Default] General Study            │
│   Ongoing learning                   │
│                                       │
│ ○ Create New Plan                    │
│   Start fresh study plan             │
│                                       │
│ [Cancel]            [Add to Plan]    │
└─────────────────────────────────────┘
```

### 2. Plan Completion Dialog
```
┌─────────────────────────────────────┐
│ 🎉 Ready to Complete Plan?           │
├─────────────────────────────────────┤
│ Mid-Term Mathematics                 │
│                                       │
│ Progress: 18/20 tasks (90%)          │
│ Time: 45h studied (planned: 50h)     │
│ Efficiency: Excellent! 🌟            │
│                                       │
│ 2 tasks incomplete:                  │
│ • Algebra - Advanced Problems        │
│ • Geometry - Theorems                │
│                                       │
│ What to do with incomplete tasks?    │
│ ○ Move to General Study              │
│ ○ Cancel them                        │
│ ○ Keep plan open (add more time)     │
│                                       │
│ [Back]     [Complete Plan]           │
└─────────────────────────────────────┘
```

### 3. Visual Indicators
- **UX-3.1**: Plan badges on all assignments
- **UX-3.2**: Color coding: Active (blue), Completed (green), Default (gray)
- **UX-3.3**: Progress rings showing completion percentage
- **UX-3.4**: Celebration animation on 100% completion

### 4. Navigation Changes
- **UX-4.1**: Remove redundant "Chapters" tab from Study Planner
- **UX-4.2**: Add "Plan Overview" showing plan-specific progress
- **UX-4.3**: Show plan selector in calendar view
- **UX-4.4**: Add plan filter in Today's activities

## 📊 Completion Metrics

### Primary Metric: Task-Based (75% weight)
```
Completion % = (Completed Assignments / Total Assignments) × 100
```

### Secondary Metric: Time Efficiency (25% weight)
```
Efficiency Score = Actual Hours / Planned Hours
- < 0.8: "Speed Learner 🚀"
- 0.8-1.2: "On Track ✅"
- > 1.2: "Deep Diver 📚"
```

### Overall Progress
```
Plan Score = (Task Completion × 0.75) + (Time Efficiency × 0.25)
```

## 🔄 State Flow

```
1. User adds chapter to calendar
   ↓
2. System checks for active plan
   ↓
3. Shows plan selector or auto-creates
   ↓
4. Creates assignment linked to plan
   ↓
5. Updates plan progress metrics
   ↓
6. Checks completion triggers
   ↓
7. Shows completion dialog if triggered
   ↓
8. Handles incomplete tasks
   ↓
9. Updates plan status
   ↓
10. Awards achievements
```

## ✅ Success Criteria

1. **No Orphaned Activities**: Every assignment has a planId
2. **Seamless Migration**: Existing users don't lose data
3. **Low Friction**: Adding to calendar takes ≤2 clicks
4. **Clear Progress**: Users always know which plan they're working on
5. **Meaningful Completion**: Plans complete based on outcomes, not just time
6. **Data Integrity**: Import/export preserves all relationships

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- Data model updates
- Migration logic
- Plan-assignment linking

### Phase 2: Completion System (Week 2)
- Completion triggers
- Completion dialog
- Incomplete task handling

### Phase 3: UI Integration (Week 3)
- Plan selection dialog
- Visual indicators
- Navigation updates

### Phase 4: Polish & Testing (Week 4)
- Achievement system
- Analytics updates
- End-to-end testing

---

*Last Updated: August 29, 2025*
*Version: 1.0*