import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SyncIndicator from '../../../src/components/SyncIndicator';
import '@testing-library/jest-dom';

// Mock the hooks
const mockValidateDataIntegrity = vi.fn();
const mockCleanupOrphanedData = vi.fn();
const mockGetSettings = vi.fn();
const mockSyncState = { isOnline: true };

vi.mock('../../../src/store/useStore', () => ({
  useStore: vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector({
        validateDataIntegrity: mockValidateDataIntegrity,
        cleanupOrphanedData: mockCleanupOrphanedData,
        getSettings: mockGetSettings,
      });
    }
    return {
      validateDataIntegrity: mockValidateDataIntegrity,
      cleanupOrphanedData: mockCleanupOrphanedData,
      getSettings: mockGetSettings,
    };
  }),
}));

vi.mock('../../../src/hooks/useBackendSync', () => ({
  useBackendSync: () => ({
    syncState: mockSyncState,
  }),
}));

describe('SyncIndicator Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    mockGetSettings.mockReturnValue({
      cloudSyncEnabled: false,
    });
    mockValidateDataIntegrity.mockReturnValue({
      isValid: true,
      issues: [],
    });
    mockSyncState.isOnline = true;
  });

  describe('Initial Rendering', () => {
    it('should render sync indicator', () => {
      render(<SyncIndicator />);

      // Initial state should be "syncing" then quickly transition to "synced"
      expect(screen.getByText(/syncing|synced|local storage only/i)).toBeInTheDocument();
    });

    it('should check data integrity on mount', () => {
      render(<SyncIndicator />);

      expect(mockValidateDataIntegrity).toHaveBeenCalled();
    });

    it('should show "Syncing" or "Synced" during/after initial integrity check', async () => {
      render(<SyncIndicator />);

      // Should show either syncing or synced state
      await waitFor(() => {
        const text = screen.getByText(/syncing|synced/i);
        expect(text).toBeInTheDocument();
      });
    });
  });

  describe('Data Integrity Checks', () => {
    it('should auto-cleanup orphaned data when integrity check fails', async () => {
      mockValidateDataIntegrity.mockReturnValue({
        isValid: false,
        issues: ['orphaned chapters', 'invalid assignments'],
      });

      render(<SyncIndicator />);

      await waitFor(() => {
        expect(mockCleanupOrphanedData).toHaveBeenCalled();
      });
    });

    it('should not cleanup when integrity check passes', () => {
      mockValidateDataIntegrity.mockReturnValue({
        isValid: true,
        issues: [],
      });

      render(<SyncIndicator />);

      // Should validate but not cleanup
      expect(mockValidateDataIntegrity).toHaveBeenCalled();
      expect(mockCleanupOrphanedData).not.toHaveBeenCalled();
    });
  });

  describe('Backend Sync Status', () => {
    it('should show "Online - Syncing to cloud" when backend is enabled and online', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = true;

      render(<SyncIndicator />);

      await waitFor(() => {
        expect(screen.getByText('Online - Syncing to cloud')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show "Offline - Data saved locally" when backend is enabled but offline', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = false;

      render(<SyncIndicator />);

      await waitFor(() => {
        expect(screen.getByText('Offline - Data saved locally')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show syncing or local storage status when backend is disabled', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: false,
      });

      render(<SyncIndicator />);

      await waitFor(() => {
        // Could be syncing, synced, or local storage only depending on timing
        const text = screen.getByText(/syncing|synced|local storage only/i);
        expect(text).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Status Colors', () => {
    it('should show green background when online with backend', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = true;

      const { container } = render(<SyncIndicator />);

      await waitFor(() => {
        const indicator = container.querySelector('.bg-green-100');
        expect(indicator).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show orange background when offline with backend', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = false;

      const { container } = render(<SyncIndicator />);

      await waitFor(() => {
        const indicator = container.querySelector('.bg-orange-100');
        expect(indicator).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show background color indicator', async () => {
      const { container } = render(<SyncIndicator />);

      // Should have one of the status background colors
      await waitFor(() => {
        const hasBackground =
          container.querySelector('.bg-blue-100') ||
          container.querySelector('.bg-green-100') ||
          container.querySelector('.bg-gray-100');
        expect(hasBackground).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Status Icons', () => {
    it('should show icon when backend is enabled and online', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = true;

      const { container } = render(<SyncIndicator />);

      // Check for icon (lucide-react renders SVG)
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show icon when backend is enabled but offline', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: true,
      });
      mockSyncState.isOnline = false;

      const { container } = render(<SyncIndicator />);

      // Check for icon
      await waitFor(() => {
        expect(container.querySelector('svg')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Storage Event Handling', () => {
    it('should run integrity check when storage event is fired', async () => {
      render(<SyncIndicator />);

      // Clear the initial call
      mockValidateDataIntegrity.mockClear();

      // Simulate storage event
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'study-planner-storage',
          newValue: '{}',
        })
      );

      // Wait for the event to be processed
      await waitFor(() => {
        expect(mockValidateDataIntegrity).toHaveBeenCalled();
      }, { timeout: 1000 });
    });

    it('should ignore storage events for other keys', () => {
      render(<SyncIndicator />);

      // Clear the initial call
      mockValidateDataIntegrity.mockClear();

      // Simulate storage event with different key
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'other-key',
          newValue: '{}',
        })
      );

      // Should not have been called immediately
      expect(mockValidateDataIntegrity).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should remove storage listener on unmount', () => {
      const { unmount } = render(<SyncIndicator />);

      // Clear initial calls
      mockValidateDataIntegrity.mockClear();

      unmount();

      // Simulate storage event after unmount
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'study-planner-storage',
          newValue: '{}',
        })
      );

      // Should not have been called
      expect(mockValidateDataIntegrity).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive title attribute', async () => {
      mockGetSettings.mockReturnValue({
        cloudSyncEnabled: false,
      });

      const { container } = render(<SyncIndicator />);

      await waitFor(() => {
        const indicator = container.querySelector('[title]');
        expect(indicator).toHaveAttribute('title');
        expect(indicator?.getAttribute('title')).toContain('Data sync status');
      }, { timeout: 3000 });
    });
  });

  describe('Edge Cases', () => {
    it('should render with valid data integrity', () => {
      mockValidateDataIntegrity.mockReturnValue({
        isValid: true,
        issues: [],
      });

      const { container } = render(<SyncIndicator />);

      // Should render successfully
      expect(container.querySelector('.fixed.bottom-4')).toBeInTheDocument();
    });

    it('should render with invalid data integrity and cleanup', async () => {
      mockValidateDataIntegrity.mockReturnValue({
        isValid: false,
        issues: ['orphaned data'],
      });

      const { container } = render(<SyncIndicator />);

      // Should render and trigger cleanup
      expect(container.querySelector('.fixed.bottom-4')).toBeInTheDocument();
      await waitFor(() => {
        expect(mockCleanupOrphanedData).toHaveBeenCalled();
      });
    });
  });
});
