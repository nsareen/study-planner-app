const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface SyncStatus {
  synced: boolean;
  lastSyncAt: string | null;
  localVersion: number;
  cloudVersion: number;
  needsSync: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedAt?: string;
  version?: number;
  error?: string;
}

export const syncService = {
  /**
   * Push local data to cloud
   */
  async pushToCloud(userId: string, data: any): Promise<SyncResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync push failed');
      }

      const result = await response.json();
      return {
        success: true,
        syncedAt: result.syncedAt,
        version: result.version,
      };
    } catch (error) {
      console.error('Push sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Pull cloud data to local
   */
  async pullFromCloud(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/pull?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sync pull failed');
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Pull sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  /**
   * Get sync status
   */
  async getSyncStatus(userId: string): Promise<SyncStatus | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/status?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }

      const status = await response.json();
      return status;
    } catch (error) {
      console.error('Get sync status error:', error);
      return null;
    }
  },

  /**
   * Check if API server is reachable
   */
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};
