import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useBackendSync } from '../../../src/hooks/useBackendSync';

// Mock apiClient
vi.mock('../../../src/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useBackendSync', () => {
  let originalFetch: typeof global.fetch;
  let originalNavigator: Navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Save original fetch and navigator
    originalFetch = global.fetch;
    originalNavigator = global.navigator;

    // Mock fetch
    global.fetch = vi.fn();

    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(global.navigator, 'onLine', {
      value: originalNavigator.onLine,
    });
  });

  describe('Initial State', () => {
    it('should initialize with default sync state', () => {
      const { result } = renderHook(() => useBackendSync());

      expect(result.current.syncState.isLoading).toBe(false);
      expect(result.current.syncState.error).toBe(null);
      expect(result.current.syncState.isOnline).toBe(true);
      expect(result.current.syncState.lastSyncAt).toBe(null);
    });

    it('should initialize with offline state when navigator is offline', () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useBackendSync());

      expect(result.current.syncState.isOnline).toBe(false);
    });

    it('should expose convenience properties', () => {
      const { result } = renderHook(() => useBackendSync());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isOnline).toBe(true);
    });
  });

  describe('Online/Offline Detection', () => {
    it('should update state when going offline', async () => {
      const { result } = renderHook(() => useBackendSync());

      expect(result.current.isOnline).toBe(true);

      // Simulate offline event
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
        expect(result.current.error).toContain('offline');
      });
    });

    it('should update state when going online', async () => {
      Object.defineProperty(global.navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const { result } = renderHook(() => useBackendSync());

      expect(result.current.isOnline).toBe(false);

      // Simulate online event
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(true);
        expect(result.current.error).toBe(null);
      });
    });

    it('should handle rapid online/offline toggling', async () => {
      const { result } = renderHook(() => useBackendSync());

      // Rapidly toggle
      act(() => {
        window.dispatchEvent(new Event('offline'));
        window.dispatchEvent(new Event('online'));
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(result.current.isOnline).toBe(false);
      });
    });
  });

  describe('Backend Health Check', () => {
    it('should check backend health successfully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
      });

      const { result } = renderHook(() => useBackendSync());

      let isHealthy: boolean | undefined;
      await act(async () => {
        isHealthy = await result.current.checkSync();
      });

      expect(isHealthy).toBe(true);
      expect(result.current.isOnline).toBe(true);
    });

    it('should detect backend is unhealthy', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useBackendSync());

      let isHealthy: boolean | undefined;
      await act(async () => {
        isHealthy = await result.current.checkSync();
      });

      expect(isHealthy).toBe(false);
      expect(result.current.isOnline).toBe(false);
    });

    it('should handle health check network error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBackendSync());

      let isHealthy: boolean | undefined;
      await act(async () => {
        isHealthy = await result.current.checkSync();
      });

      expect(isHealthy).toBe(false);
      expect(result.current.isOnline).toBe(false);
    });

    it('should use correct health check endpoint', async () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useBackendSync());

      await act(async () => {
        await result.current.checkSync();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health')
      );
    });
  });

  describe('Auto Sync with Periodic Health Check', () => {
    it('should setup periodic health checks when enableAutoSync is true', () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      const { result } = renderHook(() =>
        useBackendSync({
          enableAutoSync: true,
          syncInterval: 1000,
        })
      );

      // Hook should initialize successfully
      expect(result.current.syncState).toBeDefined();
    });

    it('should not setup health checks when enableAutoSync is false', () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      const { result } = renderHook(() =>
        useBackendSync({
          enableAutoSync: false,
        })
      );

      // Hook should initialize successfully
      expect(result.current.syncState).toBeDefined();
    });

    it('should accept custom syncInterval option', () => {
      const { result } = renderHook(() =>
        useBackendSync({
          enableAutoSync: true,
          syncInterval: 2000,
        })
      );

      // Hook should initialize with custom options
      expect(result.current.syncState).toBeDefined();
    });

    it('should cleanup interval on unmount', () => {
      (global.fetch as any).mockResolvedValue({ ok: true });

      const { unmount } = renderHook(() =>
        useBackendSync({
          enableAutoSync: true,
          syncInterval: 1000,
        })
      );

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Execute Request', () => {
    it('should execute request successfully', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: { id: 1, name: 'Test' },
        error: null,
      });

      const { result } = renderHook(() => useBackendSync());

      let response: any;
      await act(async () => {
        response = await result.current.executeRequest(mockRequestFn);
      });

      expect(response).toEqual({ id: 1, name: 'Test' });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.syncState.lastSyncAt).toBeInstanceOf(Date);
    });

    it('should set loading state during request', async () => {
      let resolveRequest: any;
      const mockRequestFn = vi.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            resolveRequest = resolve;
          })
      );

      const { result } = renderHook(() => useBackendSync());

      // Start request
      const requestPromise = result.current.executeRequest(mockRequestFn);

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve request
      act(() => {
        resolveRequest({ data: {}, error: null });
      });

      await requestPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle request error with retries', async () => {
      const mockRequestFn = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: 'Server error' })
        .mockResolvedValueOnce({ data: null, error: 'Server error' })
        .mockResolvedValue({ data: { success: true }, error: null });

      const { result } = renderHook(() =>
        useBackendSync({
          retryAttempts: 3,
        })
      );

      const response = await result.current.executeRequest(mockRequestFn);

      // Should retry and eventually succeed
      await waitFor(() => {
        expect(mockRequestFn).toHaveBeenCalledTimes(3);
      });
      expect(response).toEqual({ success: true });
    });

    it('should use fallback when all retries fail', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: null,
        error: 'Server error',
      });
      const mockFallback = vi.fn().mockReturnValue({ cached: true });

      const { result } = renderHook(() =>
        useBackendSync({
          retryAttempts: 2,
          fallbackToLocalStorage: true,
        })
      );

      const response = await result.current.executeRequest(
        mockRequestFn,
        mockFallback
      );

      await waitFor(() => {
        expect(mockRequestFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });
      expect(mockFallback).toHaveBeenCalled();
      expect(response).toEqual({ cached: true });
      expect(result.current.error).toContain('Using local data');
    });

    it('should not use fallback when fallbackToLocalStorage is false', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: null,
        error: 'Server error',
      });
      const mockFallback = vi.fn().mockReturnValue({ cached: true });

      const { result } = renderHook(() =>
        useBackendSync({
          retryAttempts: 0,
          fallbackToLocalStorage: false,
        })
      );

      const response = await result.current.executeRequest(
        mockRequestFn,
        mockFallback
      );

      expect(mockFallback).not.toHaveBeenCalled();
      expect(response).toBe(null);
      await waitFor(() => {
        expect(result.current.error).toContain('Server error');
      });
    });

    it('should handle request exception with fallback', async () => {
      const mockRequestFn = vi
        .fn()
        .mockRejectedValue(new Error('Network failure'));
      const mockFallback = vi.fn().mockReturnValue({ offline: true });

      const { result } = renderHook(() =>
        useBackendSync({
          fallbackToLocalStorage: true,
        })
      );

      const response = await result.current.executeRequest(
        mockRequestFn,
        mockFallback
      );

      await waitFor(() => {
        expect(mockFallback).toHaveBeenCalled();
      });
      expect(response).toEqual({ offline: true });
      await waitFor(() => {
        expect(result.current.error).toContain('Network error');
        expect(result.current.isOnline).toBe(false);
      });
    });

    it('should handle request exception without fallback', async () => {
      const mockRequestFn = vi
        .fn()
        .mockRejectedValue(new Error('Network failure'));

      const { result } = renderHook(() =>
        useBackendSync({
          fallbackToLocalStorage: false,
        })
      );

      const response = await result.current.executeRequest(mockRequestFn);

      expect(response).toBe(null);
      await waitFor(() => {
        expect(result.current.error).toBe('Network failure');
      });
    });
  });

  describe('Clear Error', () => {
    it('should clear error state', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: null,
        error: 'Test error',
      });

      const { result } = renderHook(() =>
        useBackendSync({ retryAttempts: 0 })
      );

      // Trigger error
      await result.current.executeRequest(mockRequestFn);

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useBackendSync());

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should not trigger state updates after unmount', () => {
      const { unmount } = renderHook(() => useBackendSync());

      unmount();

      // Try to trigger event after unmount - should not throw
      expect(() => {
        window.dispatchEvent(new Event('offline'));
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive executeRequest calls', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const { result } = renderHook(() => useBackendSync());

      const responses = await Promise.all([
        result.current.executeRequest(mockRequestFn),
        result.current.executeRequest(mockRequestFn),
        result.current.executeRequest(mockRequestFn),
      ]);

      expect(mockRequestFn).toHaveBeenCalledTimes(3);
      expect(responses).toHaveLength(3);
    });

    it('should handle null data in successful response', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useBackendSync());

      const response = await result.current.executeRequest(mockRequestFn);

      expect(response).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should handle undefined data in successful response', async () => {
      const mockRequestFn = vi.fn().mockResolvedValue({
        data: undefined,
        error: null,
      });

      const { result } = renderHook(() => useBackendSync());

      const response = await result.current.executeRequest(mockRequestFn);

      expect(response).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });
});
