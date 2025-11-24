/**
 * Backend Store Wrapper
 *
 * Extends Zustand store with backend synchronization.
 * Implements hybrid approach:
 * 1. Optimistic updates to localStorage (instant UI)
 * 2. Background sync to backend API
 * 3. Fallback to localStorage if backend unavailable
 */

import { useStore } from './useStore';
import { apiClient } from '../services/apiClient';
import { Chapter, ChapterAssignment, ActivitySession, StudyPlan } from '../types';

const ENABLE_BACKEND_SYNC = import.meta.env.VITE_ENABLE_BACKEND_SYNC === 'true';

/**
 * Check if cloud sync is enabled in user settings
 */
const isCloudSyncEnabled = (): boolean => {
  const state = useStore.getState();
  const currentUserId = state.currentUserId;
  if (!currentUserId) return false;

  const settings = state.userData[currentUserId]?.settings;
  return settings?.cloudSyncEnabled === true && ENABLE_BACKEND_SYNC;
};

// ============================================================================
// CHAPTER OPERATIONS
// ============================================================================

export const backendChapterOps = {
  /**
   * Add chapter with backend sync
   */
  async addChapter(chapter: Parameters<typeof useStore.getState>['addChapter'][0]): Promise<void> {
    const state = useStore.getState();
    const currentUserId = state.currentUserId;

    if (!currentUserId) {
      throw new Error('No user logged in');
    }

    // 1. Optimistic update to localStorage (instant UI feedback)
    state.addChapter(chapter);

    // 2. Sync to backend in background (if enabled)
    if (isCloudSyncEnabled()) {
      try {
        // Get the newly created chapter from store
        const chapters = state.getChapters();
        const newChapter = chapters[chapters.length - 1]; // Last added

        await apiClient.createChapter(currentUserId, newChapter);
        console.log('✅ Chapter synced to backend:', newChapter.id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
        // Don't throw error - localStorage already updated, user can continue
      }
    }
  },

  /**
   * Update chapter with backend sync
   */
  async updateChapter(id: string, updates: Partial<Chapter>): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.updateChapter(id, updates);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.updateChapter(id, updates);
        console.log('✅ Chapter updated on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Delete chapter with backend sync
   */
  async deleteChapter(id: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.deleteChapter(id);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.deleteChapter(id);
        console.log('✅ Chapter deleted on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Pull chapters from backend
   */
  async pullChaptersFromBackend(userId: string): Promise<Chapter[] | null> {
    if (!isCloudSyncEnabled()) {
      return null;
    }

    try {
      const response = await apiClient.getChapters(userId);

      if (response.error || !response.data) {
        console.warn('Failed to pull chapters from backend:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error pulling chapters:', error);
      return null;
    }
  },
};

// ============================================================================
// ASSIGNMENT OPERATIONS
// ============================================================================

export const backendAssignmentOps = {
  /**
   * Schedule chapter (create assignment) with backend sync
   */
  async scheduleChapter(
    chapterId: string,
    date: string,
    activityType: 'study' | 'revision',
    plannedMinutes: number
  ): Promise<void> {
    const state = useStore.getState();
    const currentUserId = state.currentUserId;

    if (!currentUserId) {
      throw new Error('No user logged in');
    }

    // 1. Optimistic update to localStorage
    state.scheduleChapter(chapterId, date, activityType, plannedMinutes);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        const assignments = state.getChapterAssignments();
        const newAssignment = assignments[assignments.length - 1]; // Last added

        await apiClient.createAssignment(currentUserId, newAssignment);
        console.log('✅ Assignment synced to backend:', newAssignment.id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Update assignment with backend sync
   */
  async updateAssignment(id: string, updates: Partial<ChapterAssignment>): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.updateAssignment(id, updates);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.updateAssignment(id, updates);
        console.log('✅ Assignment updated on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Delete assignment with backend sync
   */
  async deleteAssignment(id: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.deleteAssignment(id);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.deleteAssignment(id);
        console.log('✅ Assignment deleted on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Pull assignments from backend
   */
  async pullAssignmentsFromBackend(
    userId: string,
    filters?: { date?: string; planId?: string }
  ): Promise<ChapterAssignment[] | null> {
    if (!isCloudSyncEnabled()) {
      return null;
    }

    try {
      const response = await apiClient.getAssignments(userId, filters);

      if (response.error || !response.data) {
        console.warn('Failed to pull assignments from backend:', response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error pulling assignments:', error);
      return null;
    }
  },
};

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export const backendSessionOps = {
  /**
   * Start activity session with backend sync
   */
  async startActivity(assignmentId: string): Promise<void> {
    const state = useStore.getState();
    const currentUserId = state.currentUserId;

    if (!currentUserId) {
      throw new Error('No user logged in');
    }

    // 1. Optimistic update to localStorage
    state.startActivity(assignmentId);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        const sessions = state.getActivitySessions();
        const newSession = sessions[sessions.length - 1]; // Last added

        await apiClient.createSession(currentUserId, newSession);
        console.log('✅ Session started on backend:', newSession.sessionId);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Pause activity session with backend sync
   */
  async pauseActivity(sessionId: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.pauseActivity(sessionId);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.pauseSession(sessionId);
        console.log('✅ Session paused on backend:', sessionId);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Resume activity session with backend sync
   */
  async resumeActivity(sessionId: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.resumeActivity(sessionId);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.resumeSession(sessionId);
        console.log('✅ Session resumed on backend:', sessionId);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Complete activity session with backend sync
   */
  async completeActivity(sessionId: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.completeActivity(sessionId);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.completeSession(sessionId);
        console.log('✅ Session completed on backend:', sessionId);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },
};

// ============================================================================
// STUDY PLAN OPERATIONS
// ============================================================================

export const backendPlanOps = {
  /**
   * Add study plan with backend sync
   */
  async addStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const state = useStore.getState();
    const currentUserId = state.currentUserId;

    if (!currentUserId) {
      throw new Error('No user logged in');
    }

    // 1. Optimistic update to localStorage
    state.addStudyPlan(plan);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        const plans = state.getStudyPlans();
        const newPlan = plans[plans.length - 1]; // Last added

        await apiClient.createStudyPlan(currentUserId, newPlan);
        console.log('✅ Study plan synced to backend:', newPlan.id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Update study plan with backend sync
   */
  async updateStudyPlan(id: string, updates: Partial<StudyPlan>): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.updateStudyPlan(id, updates);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.updateStudyPlan(id, updates);
        console.log('✅ Study plan updated on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },

  /**
   * Delete study plan with backend sync
   */
  async deleteStudyPlan(id: string): Promise<void> {
    const state = useStore.getState();

    // 1. Optimistic update to localStorage
    state.deleteStudyPlan(id);

    // 2. Sync to backend in background
    if (isCloudSyncEnabled()) {
      try {
        await apiClient.deleteStudyPlan(id);
        console.log('✅ Study plan deleted on backend:', id);
      } catch (error) {
        console.warn('⚠️ Backend sync failed (localStorage updated):', error);
      }
    }
  },
};

// ============================================================================
// FULL SYNC OPERATIONS
// ============================================================================

/**
 * Pull all data from backend and merge with localStorage
 */
export async function pullAllDataFromBackend(userId: string): Promise<boolean> {
  if (!isCloudSyncEnabled()) {
    console.log('Backend sync disabled, skipping pull');
    return false;
  }

  try {
    console.log('📥 Pulling all data from backend for user:', userId);

    const [chapters, assignments, sessions, plans] = await Promise.all([
      backendChapterOps.pullChaptersFromBackend(userId),
      backendAssignmentOps.pullAssignmentsFromBackend(userId),
      // Sessions pull would go here
      // Plans pull would go here
    ]);

    // TODO: Implement merge strategy (last-write-wins for now)
    // For MVP, we can just use backend as source of truth on fresh load

    console.log('✅ Pull complete:', {
      chapters: chapters?.length || 0,
      assignments: assignments?.length || 0,
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to pull data from backend:', error);
    return false;
  }
}

/**
 * Push all local data to backend
 */
export async function pushAllDataToBackend(userId: string): Promise<boolean> {
  if (!isCloudSyncEnabled()) {
    console.log('Backend sync disabled, skipping push');
    return false;
  }

  try {
    console.log('📤 Pushing all data to backend for user:', userId);

    const state = useStore.getState();
    const chapters = state.getChapters();
    const assignments = state.getChapterAssignments();
    const sessions = state.getActivitySessions();
    const plans = state.getStudyPlans();

    // Use sync endpoint for bulk push
    const response = await apiClient.pushToCloud(userId, {
      chapters,
      assignments,
      sessions,
      studyPlans: plans,
      version: 1,
    });

    if (response.error) {
      throw new Error(response.error);
    }

    console.log('✅ Push complete');
    return true;
  } catch (error) {
    console.error('❌ Failed to push data to backend:', error);
    return false;
  }
}
