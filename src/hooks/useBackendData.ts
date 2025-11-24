/**
 * Custom hooks for fetching data from backend with loading/error states
 *
 * These hooks provide a React-friendly interface for backend data operations,
 * with automatic loading states, error handling, and fallback to localStorage.
 */

import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { apiClient } from '../services/apiClient';
import { Chapter, ChapterAssignment, ActivitySession, StudyPlan } from '../types';

interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch chapters with backend sync
 */
export function useChapters(): DataState<Chapter[]> {
  const currentUserId = useStore(state => state.currentUserId);
  const localChapters = useStore(state => state.getChapters());
  const settings = useStore(state => state.getSettings());

  const [state, setState] = useState<Omit<DataState<Chapter[]>, 'refetch'>>({
    data: localChapters,
    isLoading: false,
    error: null,
  });

  const fetchChapters = async () => {
    if (!currentUserId || !settings.cloudSyncEnabled) {
      setState({ data: localChapters, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getChapters(currentUserId);

      if (response.error || !response.data) {
        // Fallback to localStorage
        setState({
          data: localChapters,
          isLoading: false,
          error: `Backend error: ${response.error}. Using local data.`,
        });
        return;
      }

      // Success - use backend data
      setState({
        data: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Network error - fallback to localStorage
      setState({
        data: localChapters,
        isLoading: false,
        error: 'Network error. Using local data.',
      });
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [currentUserId, settings.cloudSyncEnabled]);

  // Also update when localStorage changes
  useEffect(() => {
    setState(prev => ({ ...prev, data: localChapters }));
  }, [localChapters]);

  return {
    ...state,
    refetch: fetchChapters,
  };
}

/**
 * Fetch assignments with optional filters
 */
export function useAssignments(filters?: {
  date?: string;
  planId?: string;
}): DataState<ChapterAssignment[]> {
  const currentUserId = useStore(state => state.currentUserId);
  const localAssignments = useStore(state => state.getChapterAssignments());
  const settings = useStore(state => state.getSettings());

  const [state, setState] = useState<Omit<DataState<ChapterAssignment[]>, 'refetch'>>({
    data: localAssignments,
    isLoading: false,
    error: null,
  });

  const fetchAssignments = async () => {
    if (!currentUserId || !settings.cloudSyncEnabled) {
      setState({ data: localAssignments, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getAssignments(currentUserId, filters);

      if (response.error || !response.data) {
        setState({
          data: localAssignments,
          isLoading: false,
          error: `Backend error: ${response.error}. Using local data.`,
        });
        return;
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: localAssignments,
        isLoading: false,
        error: 'Network error. Using local data.',
      });
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [currentUserId, settings.cloudSyncEnabled, filters?.date, filters?.planId]);

  useEffect(() => {
    setState(prev => ({ ...prev, data: localAssignments }));
  }, [localAssignments]);

  return {
    ...state,
    refetch: fetchAssignments,
  };
}

/**
 * Fetch active session
 */
export function useActiveSession(): DataState<ActivitySession | null> {
  const currentUserId = useStore(state => state.currentUserId);
  const localActiveTimer = useStore(state => state.getActiveTimer());
  const settings = useStore(state => state.getSettings());

  const [state, setState] = useState<Omit<DataState<ActivitySession | null>, 'refetch'>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchActiveSession = async () => {
    if (!currentUserId || !settings.cloudSyncEnabled) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getActiveSession(currentUserId);

      if (response.error) {
        setState({
          data: null,
          isLoading: false,
          error: `Backend error: ${response.error}.`,
        });
        return;
      }

      setState({
        data: response.data || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: 'Network error.',
      });
    }
  };

  useEffect(() => {
    fetchActiveSession();
  }, [currentUserId, settings.cloudSyncEnabled]);

  return {
    ...state,
    refetch: fetchActiveSession,
  };
}

/**
 * Fetch study plans
 */
export function useStudyPlans(): DataState<StudyPlan[]> {
  const currentUserId = useStore(state => state.currentUserId);
  const localPlans = useStore(state => state.getStudyPlans());
  const settings = useStore(state => state.getSettings());

  const [state, setState] = useState<Omit<DataState<StudyPlan[]>, 'refetch'>>({
    data: localPlans,
    isLoading: false,
    error: null,
  });

  const fetchPlans = async () => {
    if (!currentUserId || !settings.cloudSyncEnabled) {
      setState({ data: localPlans, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.getStudyPlans(currentUserId);

      if (response.error || !response.data) {
        setState({
          data: localPlans,
          isLoading: false,
          error: `Backend error: ${response.error}. Using local data.`,
        });
        return;
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: localPlans,
        isLoading: false,
        error: 'Network error. Using local data.',
      });
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [currentUserId, settings.cloudSyncEnabled]);

  useEffect(() => {
    setState(prev => ({ ...prev, data: localPlans }));
  }, [localPlans]);

  return {
    ...state,
    refetch: fetchPlans,
  };
}
