import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useChapters,
  useAssignments,
  useActiveSession,
  useStudyPlans,
} from '../../../src/hooks/useBackendData';
import { apiClient } from '../../../src/services/apiClient';

// Mock dependencies
vi.mock('../../../src/services/apiClient', () => ({
  apiClient: {
    getChapters: vi.fn(),
    getAssignments: vi.fn(),
    getActiveSession: vi.fn(),
    getStudyPlans: vi.fn(),
  },
}));

// Mock store
const mockGetChapters = vi.fn();
const mockGetChapterAssignments = vi.fn();
const mockGetActiveTimer = vi.fn();
const mockGetStudyPlans = vi.fn();
const mockGetSettings = vi.fn();

vi.mock('../../../src/store/useStore', () => ({
  useStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({
        currentUserId: 'user-1',
        getChapters: mockGetChapters,
        getChapterAssignments: mockGetChapterAssignments,
        getActiveTimer: mockGetActiveTimer,
        getStudyPlans: mockGetStudyPlans,
        getSettings: mockGetSettings,
      });
    }
    return null;
  }),
}));

describe('useBackendData Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock returns
    mockGetChapters.mockReturnValue([
      { id: 'ch1', name: 'Chapter 1', subject: 'Math' },
      { id: 'ch2', name: 'Chapter 2', subject: 'Science' },
    ]);
    mockGetChapterAssignments.mockReturnValue([
      { id: 'a1', chapterId: 'ch1', date: '2024-01-15' },
    ]);
    mockGetActiveTimer.mockReturnValue(null);
    mockGetStudyPlans.mockReturnValue([
      { id: 'p1', name: 'Plan 1', status: 'active' },
    ]);
    mockGetSettings.mockReturnValue({
      cloudSyncEnabled: false,
    });
  });

  describe('useChapters', () => {
    it('should initialize with local chapters when cloud sync disabled', () => {
      const { result } = renderHook(() => useChapters());

      expect(result.current.data).toEqual([
        { id: 'ch1', name: 'Chapter 1', subject: 'Math' },
        { id: 'ch2', name: 'Chapter 2', subject: 'Science' },
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should not fetch from backend when cloud sync disabled', () => {
      renderHook(() => useChapters());

      expect(apiClient.getChapters).not.toHaveBeenCalled();
    });

    it('should fetch from backend when cloud sync enabled', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getChapters as any).mockResolvedValue({
        data: [
          { id: 'ch1', name: 'Backend Chapter 1', subject: 'Math' },
          { id: 'ch3', name: 'Backend Chapter 3', subject: 'Physics' },
        ],
        error: null,
      });

      const { result } = renderHook(() => useChapters());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'ch1', name: 'Backend Chapter 1', subject: 'Math' },
          { id: 'ch3', name: 'Backend Chapter 3', subject: 'Physics' },
        ]);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(apiClient.getChapters).toHaveBeenCalledWith('user-1');
    });

    it('should set loading state during fetch', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      let resolvePromise: any;
      (apiClient.getChapters as any).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() => useChapters());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      resolvePromise({ data: [], error: null });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should fallback to local data on backend error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getChapters as any).mockResolvedValue({
        data: null,
        error: 'Server error',
      });

      const { result } = renderHook(() => useChapters());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'ch1', name: 'Chapter 1', subject: 'Math' },
          { id: 'ch2', name: 'Chapter 2', subject: 'Science' },
        ]);
        expect(result.current.error).toContain('Backend error: Server error');
      });
    });

    it('should fallback to local data on network error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getChapters as any).mockRejectedValue(
        new Error('Network failure')
      );

      const { result } = renderHook(() => useChapters());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'ch1', name: 'Chapter 1', subject: 'Math' },
          { id: 'ch2', name: 'Chapter 2', subject: 'Science' },
        ]);
        expect(result.current.error).toBe('Network error. Using local data.');
      });
    });

    it('should support manual refetch', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getChapters as any).mockResolvedValue({
        data: [{ id: 'ch-new', name: 'New Chapter' }],
        error: null,
      });

      const { result } = renderHook(() => useChapters());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'ch-new', name: 'New Chapter' },
        ]);
      });

      // Clear and mock again for refetch
      vi.clearAllMocks();
      (apiClient.getChapters as any).mockResolvedValue({
        data: [{ id: 'ch-refetch', name: 'Refetched Chapter' }],
        error: null,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'ch-refetch', name: 'Refetched Chapter' },
        ]);
      });
      expect(apiClient.getChapters).toHaveBeenCalledTimes(1);
    });
  });

  describe('useAssignments', () => {
    it('should initialize with local assignments when cloud sync disabled', () => {
      const { result } = renderHook(() => useAssignments());

      expect(result.current.data).toEqual([
        { id: 'a1', chapterId: 'ch1', date: '2024-01-15' },
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not fetch from backend when cloud sync disabled', () => {
      renderHook(() => useAssignments());

      expect(apiClient.getAssignments).not.toHaveBeenCalled();
    });

    it('should fetch from backend when cloud sync enabled', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getAssignments as any).mockResolvedValue({
        data: [{ id: 'a-backend', chapterId: 'ch1', date: '2024-01-20' }],
        error: null,
      });

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'a-backend', chapterId: 'ch1', date: '2024-01-20' },
        ]);
      });

      expect(apiClient.getAssignments).toHaveBeenCalledWith('user-1', undefined);
    });

    it('should pass filters to backend', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getAssignments as any).mockResolvedValue({
        data: [],
        error: null,
      });

      const filters = { date: '2024-01-15', planId: 'plan-1' };
      renderHook(() => useAssignments(filters));

      await waitFor(() => {
        expect(apiClient.getAssignments).toHaveBeenCalledWith('user-1', filters);
      });
    });

    it('should fallback to local data on backend error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getAssignments as any).mockResolvedValue({
        data: null,
        error: 'Backend error',
      });

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'a1', chapterId: 'ch1', date: '2024-01-15' },
        ]);
        expect(result.current.error).toContain('Backend error');
      });
    });

    it('should fallback to local data on network error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getAssignments as any).mockRejectedValue(
        new Error('Network failure')
      );

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'a1', chapterId: 'ch1', date: '2024-01-15' },
        ]);
        expect(result.current.error).toBe('Network error. Using local data.');
      });
    });

    it('should support manual refetch', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getAssignments as any).mockResolvedValue({
        data: [{ id: 'a-new' }],
        error: null,
      });

      const { result } = renderHook(() => useAssignments());

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 'a-new' }]);
      });

      vi.clearAllMocks();
      (apiClient.getAssignments as any).mockResolvedValue({
        data: [{ id: 'a-refetch' }],
        error: null,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: 'a-refetch' }]);
      });
    });
  });

  describe('useActiveSession', () => {
    it('should initialize with null when cloud sync disabled', () => {
      const { result } = renderHook(() => useActiveSession());

      expect(result.current.data).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not fetch from backend when cloud sync disabled', () => {
      renderHook(() => useActiveSession());

      expect(apiClient.getActiveSession).not.toHaveBeenCalled();
    });

    it('should fetch from backend when cloud sync enabled', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      const mockSession = {
        id: 'session-1',
        userId: 'user-1',
        startTime: '2024-01-15T10:00:00Z',
      };
      (apiClient.getActiveSession as any).mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const { result } = renderHook(() => useActiveSession());

      await waitFor(() => {
        expect(result.current.data).toEqual(mockSession);
      });

      expect(apiClient.getActiveSession).toHaveBeenCalledWith('user-1');
    });

    it('should handle no active session', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getActiveSession as any).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useActiveSession());

      await waitFor(() => {
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe(null);
      });
    });

    it('should handle backend error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getActiveSession as any).mockResolvedValue({
        data: null,
        error: 'Session not found',
      });

      const { result } = renderHook(() => useActiveSession());

      await waitFor(() => {
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe('Backend error: Session not found.');
      });
    });

    it('should handle network error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getActiveSession as any).mockRejectedValue(
        new Error('Network failure')
      );

      const { result } = renderHook(() => useActiveSession());

      await waitFor(() => {
        expect(result.current.data).toBe(null);
        expect(result.current.error).toBe('Network error.');
      });
    });

    it('should support manual refetch', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getActiveSession as any).mockResolvedValue({
        data: { id: 'session-1' },
        error: null,
      });

      const { result } = renderHook(() => useActiveSession());

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: 'session-1' });
      });

      vi.clearAllMocks();
      (apiClient.getActiveSession as any).mockResolvedValue({
        data: { id: 'session-2' },
        error: null,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: 'session-2' });
      });
    });
  });

  describe('useStudyPlans', () => {
    it('should initialize with local plans when cloud sync disabled', () => {
      const { result } = renderHook(() => useStudyPlans());

      expect(result.current.data).toEqual([
        { id: 'p1', name: 'Plan 1', status: 'active' },
      ]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not fetch from backend when cloud sync disabled', () => {
      renderHook(() => useStudyPlans());

      expect(apiClient.getStudyPlans).not.toHaveBeenCalled();
    });

    it('should fetch from backend when cloud sync enabled', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getStudyPlans as any).mockResolvedValue({
        data: [
          { id: 'p-backend', name: 'Backend Plan', status: 'active' },
        ],
        error: null,
      });

      const { result } = renderHook(() => useStudyPlans());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'p-backend', name: 'Backend Plan', status: 'active' },
        ]);
      });

      expect(apiClient.getStudyPlans).toHaveBeenCalledWith('user-1');
    });

    it('should fallback to local data on backend error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getStudyPlans as any).mockResolvedValue({
        data: null,
        error: 'Server error',
      });

      const { result } = renderHook(() => useStudyPlans());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'p1', name: 'Plan 1', status: 'active' },
        ]);
        expect(result.current.error).toContain('Backend error: Server error');
      });
    });

    it('should fallback to local data on network error', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getStudyPlans as any).mockRejectedValue(
        new Error('Network failure')
      );

      const { result } = renderHook(() => useStudyPlans());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'p1', name: 'Plan 1', status: 'active' },
        ]);
        expect(result.current.error).toBe('Network error. Using local data.');
      });
    });

    it('should support manual refetch', async () => {
      mockGetSettings.mockReturnValue({ cloudSyncEnabled: true });
      (apiClient.getStudyPlans as any).mockResolvedValue({
        data: [{ id: 'p-new', name: 'New Plan' }],
        error: null,
      });

      const { result } = renderHook(() => useStudyPlans());

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'p-new', name: 'New Plan' },
        ]);
      });

      vi.clearAllMocks();
      (apiClient.getStudyPlans as any).mockResolvedValue({
        data: [{ id: 'p-refetch', name: 'Refetched Plan' }],
        error: null,
      });

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.data).toEqual([
          { id: 'p-refetch', name: 'Refetched Plan' },
        ]);
      });
    });
  });
});
