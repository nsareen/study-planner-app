import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncService } from '../../../src/services/syncService';

describe('syncService', () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('pushToCloud', () => {
    it('should successfully push data to cloud', async () => {
      const mockData = { chapters: [], assignments: [] };
      const mockResponse = {
        syncedAt: '2024-01-15T12:00:00Z',
        version: 5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await syncService.pushToCloud('user-1', mockData);

      expect(result.success).toBe(true);
      expect(result.syncedAt).toBe('2024-01-15T12:00:00Z');
      expect(result.version).toBe(5);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/push'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'user-1',
            data: mockData,
          }),
        })
      );
    });

    it('should handle HTTP error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Sync failed' }),
      });

      const result = await syncService.pushToCloud('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('should handle HTTP error without message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const result = await syncService.pushToCloud('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync push failed');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const result = await syncService.pushToCloud('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const result = await syncService.pushToCloud('user-1', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should send correct request headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ syncedAt: '2024-01-15T12:00:00Z' }),
      });

      await syncService.pushToCloud('user-1', {});

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('pullFromCloud', () => {
    it('should successfully pull data from cloud', async () => {
      const mockData = {
        chapters: [{ id: 'ch1', name: 'Chapter 1' }],
        assignments: [{ id: 'a1', chapterId: 'ch1' }],
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await syncService.pullFromCloud('user-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/pull?userId=user-1'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle HTTP error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Pull failed' }),
      });

      const result = await syncService.pullFromCloud('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pull failed');
    });

    it('should handle HTTP error without message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const result = await syncService.pullFromCloud('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync pull failed');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection timeout'));

      const result = await syncService.pullFromCloud('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection timeout');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const result = await syncService.pullFromCloud('user-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should send correct request headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await syncService.pullFromCloud('user-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  describe('getSyncStatus', () => {
    it('should successfully get sync status', async () => {
      const mockStatus = {
        synced: true,
        lastSyncAt: '2024-01-15T12:00:00Z',
        localVersion: 5,
        cloudVersion: 5,
        needsSync: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await syncService.getSyncStatus('user-1');

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/status?userId=user-1'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return null on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      const result = await syncService.getSyncStatus('user-1');

      expect(result).toBe(null);
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const result = await syncService.getSyncStatus('user-1');

      expect(result).toBe(null);
    });

    it('should send correct request headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          synced: true,
          lastSyncAt: null,
          localVersion: 0,
          cloudVersion: 0,
          needsSync: false,
        }),
      });

      await syncService.getSyncStatus('user-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should handle version mismatch status', async () => {
      const mockStatus = {
        synced: false,
        lastSyncAt: '2024-01-15T11:00:00Z',
        localVersion: 5,
        cloudVersion: 7,
        needsSync: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await syncService.getSyncStatus('user-1');

      expect(result).toEqual(mockStatus);
      expect(result?.needsSync).toBe(true);
      expect(result?.cloudVersion).toBeGreaterThan(result?.localVersion || 0);
    });
  });

  describe('checkServerHealth', () => {
    it('should return true when server is healthy', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const result = await syncService.checkServerHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return false when server returns error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await syncService.checkServerHealth();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const result = await syncService.checkServerHealth();

      expect(result).toBe(false);
    });

    it('should use correct health endpoint URL', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await syncService.checkServerHealth();

      // Should call /health without the /api prefix
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/health$/),
        expect.any(Object)
      );
      expect(mockFetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/health'),
        expect.any(Object)
      );
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValue(new Error('Timeout'));

      const result = await syncService.checkServerHealth();

      expect(result).toBe(false);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle push then pull workflow', async () => {
      const pushData = { chapters: [{ id: 'ch1' }] };
      const pullData = { chapters: [{ id: 'ch1' }, { id: 'ch2' }] };

      // Mock push
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ syncedAt: '2024-01-15T12:00:00Z', version: 5 }),
      });

      const pushResult = await syncService.pushToCloud('user-1', pushData);
      expect(pushResult.success).toBe(true);

      // Mock pull
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => pullData,
      });

      const pullResult = await syncService.pullFromCloud('user-1');
      expect(pullResult.success).toBe(true);
      expect(pullResult.data?.chapters).toHaveLength(2);
    });

    it('should check health before sync operations', async () => {
      // Health check fails
      mockFetch.mockResolvedValueOnce({ ok: false });

      const healthCheck = await syncService.checkServerHealth();
      expect(healthCheck).toBe(false);

      // If health fails, sync operations would also fail
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server unavailable' }),
      });

      const pushResult = await syncService.pushToCloud('user-1', {});
      expect(pushResult.success).toBe(false);
    });

    it('should handle status check showing outdated local data', async () => {
      const statusResponse = {
        synced: false,
        lastSyncAt: '2024-01-15T10:00:00Z',
        localVersion: 3,
        cloudVersion: 5,
        needsSync: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => statusResponse,
      });

      const status = await syncService.getSyncStatus('user-1');

      expect(status?.needsSync).toBe(true);
      expect(status?.cloudVersion).toBeGreaterThan(status?.localVersion || 0);

      // Would trigger pull to get latest data
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ chapters: [{ id: 'ch-new' }] }),
      });

      const pullResult = await syncService.pullFromCloud('user-1');
      expect(pullResult.success).toBe(true);
    });
  });
});
