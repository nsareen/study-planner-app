import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../src/services/apiClient';
import { syncService } from '../../src/services/syncService';

describe('Backend API Flow Integration', () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  describe('Complete Sync Workflow', () => {
    it('should complete health check -> push -> pull -> status flow', async () => {
      // 1. Health check
      mockFetch.mockResolvedValueOnce({ ok: true });
      const health = await syncService.checkServerHealth();
      expect(health).toBe(true);

      // 2. Push data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ syncedAt: '2024-01-15T12:00:00Z', version: 5 }),
      });
      const pushResult = await syncService.pushToCloud('user-1', {
        chapters: [{ id: 'ch1' }],
      });
      expect(pushResult.success).toBe(true);

      // 3. Pull data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chapters: [{ id: 'ch1' }, { id: 'ch2' }] }),
      });
      const pullResult = await syncService.pullFromCloud('user-1');
      expect(pullResult.success).toBe(true);

      // 4. Check status
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          synced: true,
          lastSyncAt: '2024-01-15T12:00:00Z',
          localVersion: 5,
          cloudVersion: 5,
          needsSync: false,
        }),
      });
      const status = await syncService.getSyncStatus('user-1');
      expect(status?.synced).toBe(true);
    });
  });

  describe('Session Lifecycle', () => {
    it('should handle create -> pause -> resume -> complete flow', async () => {
      // Create
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 's1', isActive: true }),
      });
      const created = await apiClient.createSession('user-1', {
        assignmentId: 'a1',
      });
      expect(created.data?.isActive).toBe(true);

      // Pause
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 's1', isActive: false }),
      });
      const paused = await apiClient.pauseSession('s1');
      expect(paused.data?.isActive).toBe(false);

      // Resume
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 's1', isActive: true }),
      });
      const resumed = await apiClient.resumeSession('s1');
      expect(resumed.data?.isActive).toBe(true);

      // Complete
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessionId: 's1', endTime: '2024-01-15T11:00:00Z' }),
      });
      const completed = await apiClient.completeSession('s1');
      expect(completed.data?.endTime).toBeDefined();
    });
  });

  describe('Error Recovery', () => {
    it('should handle partial failures in multi-step flow', async () => {
      // Health check succeeds
      mockFetch.mockResolvedValueOnce({ ok: true });
      const health = await syncService.checkServerHealth();
      expect(health).toBe(true);

      // Push fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Push failed' }),
      });
      const pushResult = await syncService.pushToCloud('user-1', {});
      expect(pushResult.success).toBe(false);

      // Pull succeeds (can still retrieve data)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ chapters: [] }),
      });
      const pullResult = await syncService.pullFromCloud('user-1');
      expect(pullResult.success).toBe(true);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle parallel API calls', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'ch1' }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'a1' }],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ id: 'p1' }],
        });

      const [chapters, assignments, plans] = await Promise.all([
        apiClient.getChapters('user-1'),
        apiClient.getAssignments('user-1'),
        apiClient.getStudyPlans('user-1'),
      ]);

      expect(chapters.data).toHaveLength(1);
      expect(assignments.data).toHaveLength(1);
      expect(plans.data).toHaveLength(1);
    });
  });
});
