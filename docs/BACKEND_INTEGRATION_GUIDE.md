# Backend Integration Guide

This guide shows how to update components to use the backend API with optimistic updates and automatic sync.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Updating Components](#updating-components)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The backend integration provides:

- ✅ **Optimistic Updates** - Instant UI feedback via localStorage
- ✅ **Background Sync** - Automatic sync to backend API
- ✅ **Fallback** - Graceful degradation when backend is unavailable
- ✅ **Loading States** - Built-in loading indicators
- ✅ **Error Handling** - Automatic retry and error recovery

### How It Works

```
User Action → localStorage Update (instant) → UI Updates → Background API Sync
                     ↓
              If sync fails, user doesn't notice (data already saved locally)
```

---

## Architecture

### Components

```
src/
├── services/
│   ├── apiClient.ts          # Type-safe API client
│   └── syncService.ts         # Cloud sync utilities
├── store/
│   ├── useStore.ts            # Zustand store (localStorage)
│   └── backendStore.ts        # Backend operations wrapper
└── hooks/
    ├── useBackendSync.ts      # Sync state management
    └── useBackendData.ts      # Data fetching hooks
```

### Data Flow

```
Component → backendStore → localStorage (instant)
                         ↘ apiClient (background)
```

---

## Quick Start

### 1. Enable Backend Sync

Create `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
VITE_ENABLE_BACKEND_SYNC=true
```

### 2. Start Backend Server

```bash
npm run dev:server
```

### 3. Enable in Settings

Go to Settings → Cloud Sync → Toggle "Enable Cloud Sync"

---

## Updating Components

### Pattern 1: Simple CRUD Operations

**Before (Direct Store Access):**

```tsx
import { useStore } from '../store/useStore';

const MyComponent = () => {
  const addChapter = useStore(state => state.addChapter);

  const handleAdd = () => {
    addChapter({ subject: 'Math', name: 'Chapter 1', ... });
  };

  return <button onClick={handleAdd}>Add Chapter</button>;
};
```

**After (Backend-Integrated):**

```tsx
import { useState } from 'react';
import { backendChapterOps } from '../store/backendStore';
import { Loader2 } from 'lucide-react';

const MyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      await backendChapterOps.addChapter({
        subject: 'Math',
        name: 'Chapter 1',
        ...
      });
    } catch (error) {
      console.error('Failed:', error);
      // Optimistic update already succeeded, so user can continue
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleAdd} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          Adding...
        </>
      ) : (
        'Add Chapter'
      )}
    </button>
  );
};
```

### Pattern 2: Fetching Data with Loading States

**Before:**

```tsx
const MyComponent = () => {
  const chapters = useStore(state => state.getChapters());

  return (
    <div>
      {chapters.map(chapter => <div key={chapter.id}>{chapter.name}</div>)}
    </div>
  );
};
```

**After:**

```tsx
import { useChapters } from '../hooks/useBackendData';

const MyComponent = () => {
  const { data: chapters, isLoading, error } = useChapters();

  if (isLoading) {
    return <div className="text-center">Loading chapters...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      {chapters?.map(chapter => <div key={chapter.id}>{chapter.name}</div>)}
    </div>
  );
};
```

### Pattern 3: Assignment Operations

**Before:**

```tsx
const scheduleChapter = useStore(state => state.scheduleChapter);

const handleSchedule = () => {
  scheduleChapter(chapterId, date, 'study', 60);
};
```

**After:**

```tsx
import { backendAssignmentOps } from '../store/backendStore';

const [isScheduling, setIsScheduling] = useState(false);

const handleSchedule = async () => {
  setIsScheduling(true);
  try {
    await backendAssignmentOps.scheduleChapter(chapterId, date, 'study', 60);
  } finally {
    setIsScheduling(false);
  }
};
```

### Pattern 4: Session Timer Operations

**Before:**

```tsx
const startActivity = useStore(state => state.startActivity);
const pauseActivity = useStore(state => state.pauseActivity);

const handleStart = () => startActivity(assignmentId);
const handlePause = () => pauseActivity(sessionId);
```

**After:**

```tsx
import { backendSessionOps } from '../store/backendStore';

const handleStart = () => backendSessionOps.startActivity(assignmentId);
const handlePause = () => backendSessionOps.pauseActivity(sessionId);
```

---

## API Reference

### Backend Operations

#### Chapter Operations

```ts
import { backendChapterOps } from '../store/backendStore';

// Add chapter
await backendChapterOps.addChapter(chapter);

// Update chapter
await backendChapterOps.updateChapter(id, updates);

// Delete chapter
await backendChapterOps.deleteChapter(id);

// Pull from backend
const chapters = await backendChapterOps.pullChaptersFromBackend(userId);
```

#### Assignment Operations

```ts
import { backendAssignmentOps } from '../store/backendStore';

// Schedule chapter
await backendAssignmentOps.scheduleChapter(chapterId, date, activityType, minutes);

// Update assignment
await backendAssignmentOps.updateAssignment(id, updates);

// Delete assignment
await backendAssignmentOps.deleteAssignment(id);
```

#### Session Operations

```ts
import { backendSessionOps } from '../store/backendStore';

// Start session
await backendSessionOps.startActivity(assignmentId);

// Pause session
await backendSessionOps.pauseActivity(sessionId);

// Resume session
await backendSessionOps.resumeActivity(sessionId);

// Complete session
await backendSessionOps.completeActivity(sessionId);
```

#### Study Plan Operations

```ts
import { backendPlanOps } from '../store/backendStore';

// Add plan
await backendPlanOps.addStudyPlan(plan);

// Update plan
await backendPlanOps.updateStudyPlan(id, updates);

// Delete plan
await backendPlanOps.deleteStudyPlan(id);
```

### Data Fetching Hooks

```ts
import {
  useChapters,
  useAssignments,
  useActiveSession,
  useStudyPlans,
} from '../hooks/useBackendData';

// Fetch chapters
const { data, isLoading, error, refetch } = useChapters();

// Fetch assignments with filters
const assignments = useAssignments({ date: '2025-11-24' });

// Fetch active session
const activeSession = useActiveSession();

// Fetch study plans
const plans = useStudyPlans();
```

---

## Best Practices

### 1. Always Handle Loading States

```tsx
const MyButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button disabled={isLoading}>
      {isLoading ? <LoadingSpinner /> : 'Save'}
    </button>
  );
};
```

### 2. Don't Block User on Errors

Backend operations use optimistic updates, so errors shouldn't prevent user from continuing:

```tsx
try {
  await backendChapterOps.addChapter(chapter);
} catch (error) {
  console.error('Sync failed (data saved locally):', error);
  // Don't show error to user - localStorage already updated
}
```

### 3. Use Bulk Operations for Initial Load

```tsx
import { pullAllDataFromBackend } from '../store/backendStore';

useEffect(() => {
  if (currentUserId && settings.cloudSyncEnabled) {
    pullAllDataFromBackend(currentUserId);
  }
}, [currentUserId]);
```

### 4. Show Offline Indicator

```tsx
import { useBackendSync } from '../hooks/useBackendSync';

const App = () => {
  const { isOnline } = useBackendSync();

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2">
          You are offline. Changes will sync when connection is restored.
        </div>
      )}
      {/* rest of app */}
    </>
  );
};
```

---

## Troubleshooting

### Backend Not Syncing

**Check:**
1. Backend server is running: `npm run dev:server`
2. `VITE_ENABLE_BACKEND_SYNC=true` in `.env`
3. Cloud sync enabled in Settings
4. Check browser console for errors

### Data Not Appearing

**Solutions:**
- Refresh the page to trigger data pull
- Check localStorage: DevTools → Application → Local Storage
- Call `pullAllDataFromBackend(userId)` manually
- Clear localStorage and re-sync: `localStorage.clear()`

### CORS Errors

**Fix in `server/src/index.ts`:**

```ts
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));
```

### TypeScript Errors

**Regenerate Prisma Client:**

```bash
npm run prisma:generate
```

---

## Migration Checklist

For each component using store operations:

- [ ] Import `backendXxxOps` instead of store actions
- [ ] Add loading state with `useState`
- [ ] Make handler functions `async`
- [ ] Wrap operations in try/finally
- [ ] Add loading indicator to button/UI
- [ ] Test with backend enabled and disabled
- [ ] Verify optimistic updates work (instant UI feedback)
- [ ] Check console for sync success/failure logs

---

## Example: Complete Component Migration

**Before:**

```tsx
// Old approach - direct store access
const Subjects = () => {
  const chapters = useStore(state => state.getChapters());
  const addChapter = useStore(state => state.addChapter);

  const handleAdd = () => {
    addChapter({ subject: 'Math', name: 'Algebra' });
  };

  return (
    <div>
      <button onClick={handleAdd}>Add Chapter</button>
      {chapters.map(c => <div key={c.id}>{c.name}</div>)}
    </div>
  );
};
```

**After:**

```tsx
// New approach - backend-integrated
import { useState } from 'react';
import { useChapters } from '../hooks/useBackendData';
import { backendChapterOps } from '../store/backendStore';
import { Loader2 } from 'lucide-react';

const Subjects = () => {
  const { data: chapters, isLoading, error } = useChapters();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      await backendChapterOps.addChapter({
        subject: 'Math',
        name: 'Algebra',
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading chapters...</div>;
  }

  if (error) {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-4 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={isAdding}
        className="flex items-center gap-2"
      >
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Chapter'
        )}
      </button>

      {chapters?.map(c => <div key={c.id}>{c.name}</div>)}
    </div>
  );
};
```

---

**Ready to migrate?** Start with small, low-risk components like QuickScheduler, then move to larger pages like TodayPlan and SmartPlanner.

**Need help?** Check the example implementation in `src/components/QuickScheduler.tsx` (already migrated).
