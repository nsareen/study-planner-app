import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '../services/apiClient';

export interface SyncState {
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;
  lastSyncAt: Date | null;
}

export interface UseBackendSyncOptions {
  enableAutoSync?: boolean;
  syncInterval?: number; // milliseconds
  retryAttempts?: number;
  fallbackToLocalStorage?: boolean;
}

/**
 * Hook for managing backend synchronization state
 *
 * Provides:
 * - Loading states
 * - Error handling
 * - Online/offline detection
 * - Automatic retry logic
 * - Fallback to localStorage when offline
 */
export function useBackendSync(options: UseBackendSyncOptions = {}) {
  const {
    enableAutoSync = false,
    syncInterval = 5 * 60 * 1000, // 5 minutes default
    retryAttempts = 3,
    fallbackToLocalStorage = true,
  } = options;

  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    error: null,
    isOnline: navigator.onLine,
    lastSyncAt: null,
  });

  // Check if backend is reachable
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL?.replace('/api', '/health') || 'http://localhost:3001/health'
      );
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true, error: null }));
    };

    const handleOffline = () => {
      setSyncState(prev => ({
        ...prev,
        isOnline: false,
        error: 'You are offline. Data will be synced when connection is restored.',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health check
  useEffect(() => {
    if (!enableAutoSync) return;

    const interval = setInterval(async () => {
      const isHealthy = await checkBackendHealth();
      setSyncState(prev => ({ ...prev, isOnline: isHealthy }));
    }, syncInterval);

    return () => clearInterval(interval);
  }, [enableAutoSync, syncInterval, checkBackendHealth]);

  /**
   * Execute an API request with loading/error handling and retry logic
   */
  const executeRequest = useCallback(
    async <T,>(
      requestFn: () => Promise<ApiResponse<T>>,
      fallbackFn?: () => T,
      retries = retryAttempts
    ): Promise<T | null> => {
      setSyncState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await requestFn();

        if (response.error) {
          // If we have retries left, try again
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            return executeRequest(requestFn, fallbackFn, retries - 1);
          }

          // No more retries, check fallback
          if (fallbackToLocalStorage && fallbackFn) {
            setSyncState(prev => ({
              ...prev,
              isLoading: false,
              error: `Backend error: ${response.error}. Using local data.`,
              isOnline: false,
            }));
            return fallbackFn();
          }

          // No fallback available
          setSyncState(prev => ({
            ...prev,
            isLoading: false,
            error: response.error || 'Request failed',
          }));
          return null;
        }

        // Success!
        setSyncState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          lastSyncAt: new Date(),
        }));

        return response.data || null;
      } catch (error) {
        console.error('Request execution failed:', error);

        if (fallbackToLocalStorage && fallbackFn) {
          setSyncState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Network error. Using local data.',
            isOnline: false,
          }));
          return fallbackFn();
        }

        setSyncState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
        return null;
      }
    },
    [retryAttempts, fallbackToLocalStorage]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setSyncState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Manually trigger sync check
   */
  const checkSync = useCallback(async () => {
    const isHealthy = await checkBackendHealth();
    setSyncState(prev => ({ ...prev, isOnline: isHealthy }));
    return isHealthy;
  }, [checkBackendHealth]);

  return {
    syncState,
    executeRequest,
    clearError,
    checkSync,
    isLoading: syncState.isLoading,
    error: syncState.error,
    isOnline: syncState.isOnline,
  };
}
