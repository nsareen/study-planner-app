import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../../../src/services/apiClient';

describe('ApiClient', () => {
  let mockFetch: any;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core HTTP Methods', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get('/test');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle GET with query parameters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await apiClient.get('/test', { userId: 'user-1', date: '2024-01-15' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test?userId=user-1&date=2024-01-15'),
        expect.any(Object)
      );
    });

    it('should make successful POST request', async () => {
      const mockData = { id: '1', created: true };
      const payload = { name: 'Test', value: 42 };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.post('/test', payload);

      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('should make successful PATCH request', async () => {
      const mockData = { id: '1', updated: true };
      const updates = { name: 'Updated' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.patch('/test/1', updates);

      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
    });

    it('should make successful DELETE request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      const result = await apiClient.delete('/test/1');

      expect(result.data).toEqual({ deleted: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should handle 204 No Content response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await apiClient.delete('/test/1');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should include default Content-Type header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'Not found',
          message: 'Resource not found',
        }),
      });

      const result = await apiClient.get('/test');

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Not found');
      expect(result.message).toBe('Resource not found');
    });

    it('should handle HTTP error without error message in response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const result = await apiClient.get('/test');

      expect(result.error).toBe('Request failed');
      expect(result.message).toBe('HTTP 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const result = await apiClient.get('/test');

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Network error');
      expect(result.message).toBe('Network failure');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValue('Unknown error');

      const result = await apiClient.get('/test');

      expect(result.error).toBe('Network error');
      expect(result.message).toBe('Failed to connect to server');
    });
  });

  describe('User Endpoints', () => {
    it('should get all users', async () => {
      const mockUsers = [{ id: 'u1' }, { id: 'u2' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUsers,
      });

      const result = await apiClient.getUsers();

      expect(result.data).toEqual(mockUsers);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should get single user', async () => {
      const mockUser = { id: 'u1', name: 'User 1' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await apiClient.getUser('u1');

      expect(result.data).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/u1'),
        expect.any(Object)
      );
    });

    it('should create user', async () => {
      const newUser = { name: 'New User', email: 'test@example.com' };
      const createdUser = { id: 'u1', ...newUser };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdUser,
      });

      const result = await apiClient.createUser(newUser);

      expect(result.data).toEqual(createdUser);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newUser),
        })
      );
    });

    it('should update user', async () => {
      const updates = { name: 'Updated Name' };
      const updatedUser = { id: 'u1', name: 'Updated Name' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => updatedUser,
      });

      const result = await apiClient.updateUser('u1', updates);

      expect(result.data).toEqual(updatedUser);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/u1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
      );
    });

    it('should get user stats', async () => {
      const mockStats = { totalHours: 100, streak: 7 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      const result = await apiClient.getUserStats('u1');

      expect(result.data).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/u1/stats'),
        expect.any(Object)
      );
    });
  });

  describe('Chapter Endpoints', () => {
    it('should get chapters for user', async () => {
      const mockChapters = [{ id: 'ch1' }, { id: 'ch2' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockChapters,
      });

      const result = await apiClient.getChapters('user-1');

      expect(result.data).toEqual(mockChapters);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chapters?userId=user-1'),
        expect.any(Object)
      );
    });

    it('should get single chapter', async () => {
      const mockChapter = { id: 'ch1', name: 'Chapter 1' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockChapter,
      });

      const result = await apiClient.getChapter('ch1');

      expect(result.data).toEqual(mockChapter);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chapters/ch1'),
        expect.any(Object)
      );
    });

    it('should create chapter', async () => {
      const newChapter = { name: 'New Chapter', subject: 'Math' };
      const createdChapter = { id: 'ch1', userId: 'user-1', ...newChapter };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdChapter,
      });

      const result = await apiClient.createChapter('user-1', newChapter);

      expect(result.data).toEqual(createdChapter);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chapters'),
        expect.objectContaining({
          body: JSON.stringify({ ...newChapter, userId: 'user-1' }),
        })
      );
    });

    it('should update chapter', async () => {
      const updates = { name: 'Updated Chapter' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'ch1', ...updates }),
      });

      const result = await apiClient.updateChapter('ch1', updates);

      expect(result.data).toEqual({ id: 'ch1', ...updates });
    });

    it('should delete chapter', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await apiClient.deleteChapter('ch1');

      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chapters/ch1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should get chapter stats', async () => {
      const mockStats = { total: 10, completed: 5 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      });

      const result = await apiClient.getChapterStats('user-1');

      expect(result.data).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/chapters/stats/user-1'),
        expect.any(Object)
      );
    });
  });

  describe('Assignment Endpoints', () => {
    it('should get assignments with filters', async () => {
      const mockAssignments = [{ id: 'a1' }, { id: 'a2' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAssignments,
      });

      const result = await apiClient.getAssignments('user-1', {
        date: '2024-01-15',
        planId: 'plan-1',
      });

      expect(result.data).toEqual(mockAssignments);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('userId=user-1'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('date=2024-01-15'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('planId=plan-1'),
        expect.any(Object)
      );
    });

    it('should get assignments without filters', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await apiClient.getAssignments('user-1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('userId=user-1'),
        expect.any(Object)
      );
    });

    it('should get single assignment', async () => {
      const mockAssignment = { id: 'a1', chapterId: 'ch1' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAssignment,
      });

      const result = await apiClient.getAssignment('a1');

      expect(result.data).toEqual(mockAssignment);
    });

    it('should create assignment', async () => {
      const newAssignment = { chapterId: 'ch1', date: '2024-01-15' };
      const createdAssignment = { id: 'a1', userId: 'user-1', ...newAssignment };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdAssignment,
      });

      const result = await apiClient.createAssignment('user-1', newAssignment);

      expect(result.data).toEqual(createdAssignment);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/assignments'),
        expect.objectContaining({
          body: JSON.stringify({ ...newAssignment, userId: 'user-1' }),
        })
      );
    });

    it('should get assignments by date range', async () => {
      const mockAssignments = [{ id: 'a1' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAssignments,
      });

      const result = await apiClient.getAssignmentsByDateRange(
        'user-1',
        '2024-01-01',
        '2024-01-31'
      );

      expect(result.data).toEqual(mockAssignments);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-01-31'),
        expect.any(Object)
      );
    });
  });

  describe('Session Endpoints', () => {
    it('should get sessions with filters', async () => {
      const mockSessions = [{ sessionId: 's1' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSessions,
      });

      const result = await apiClient.getSessions('user-1', {
        date: '2024-01-15',
        assignmentId: 'a1',
      });

      expect(result.data).toEqual(mockSessions);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('userId=user-1'),
        expect.any(Object)
      );
    });

    it('should get active session', async () => {
      const mockSession = { sessionId: 's1', isActive: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockSession,
      });

      const result = await apiClient.getActiveSession('user-1');

      expect(result.data).toEqual(mockSession);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/active'),
        expect.any(Object)
      );
    });

    it('should create session', async () => {
      const newSession = { assignmentId: 'a1', startTime: '2024-01-15T10:00:00Z' };
      const createdSession = { sessionId: 's1', userId: 'user-1', ...newSession };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdSession,
      });

      const result = await apiClient.createSession('user-1', newSession);

      expect(result.data).toEqual(createdSession);
    });

    it('should pause session', async () => {
      const pausedSession = { sessionId: 's1', isActive: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => pausedSession,
      });

      const result = await apiClient.pauseSession('s1');

      expect(result.data).toEqual(pausedSession);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/s1/pause'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should resume session', async () => {
      const resumedSession = { sessionId: 's1', isActive: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => resumedSession,
      });

      const result = await apiClient.resumeSession('s1');

      expect(result.data).toEqual(resumedSession);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/s1/resume'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('should complete session', async () => {
      const completedSession = { sessionId: 's1', endTime: '2024-01-15T11:00:00Z' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => completedSession,
      });

      const result = await apiClient.completeSession('s1');

      expect(result.data).toEqual(completedSession);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions/s1/complete'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('Study Plan Endpoints', () => {
    it('should get study plans', async () => {
      const mockPlans = [{ id: 'p1' }, { id: 'p2' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockPlans,
      });

      const result = await apiClient.getStudyPlans('user-1');

      expect(result.data).toEqual(mockPlans);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/study-plans?userId=user-1'),
        expect.any(Object)
      );
    });

    it('should create study plan', async () => {
      const newPlan = { name: 'Plan 1', status: 'draft' };
      const createdPlan = { id: 'p1', userId: 'user-1', ...newPlan };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => createdPlan,
      });

      const result = await apiClient.createStudyPlan('user-1', newPlan);

      expect(result.data).toEqual(createdPlan);
    });

    it('should activate study plan', async () => {
      const activatedPlan = { id: 'p1', status: 'active' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => activatedPlan,
      });

      const result = await apiClient.activateStudyPlan('p1', 'user-1');

      expect(result.data).toEqual(activatedPlan);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/study-plans/p1/activate'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId: 'user-1' }),
        })
      );
    });
  });

  describe('Sync Endpoints', () => {
    it('should push data to cloud', async () => {
      const data = { chapters: [], assignments: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiClient.pushToCloud('user-1', data);

      expect(result.data).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/push'),
        expect.objectContaining({
          body: JSON.stringify({ userId: 'user-1', data }),
        })
      );
    });

    it('should pull data from cloud', async () => {
      const cloudData = { chapters: [{ id: 'ch1' }], assignments: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => cloudData,
      });

      const result = await apiClient.pullFromCloud('user-1');

      expect(result.data).toEqual(cloudData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/pull?userId=user-1'),
        expect.any(Object)
      );
    });

    it('should get sync status', async () => {
      const mockStatus = { lastSync: '2024-01-15T12:00:00Z', pending: 0 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockStatus,
      });

      const result = await apiClient.getSyncStatus('user-1');

      expect(result.data).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sync/status?userId=user-1'),
        expect.any(Object)
      );
    });
  });
});
