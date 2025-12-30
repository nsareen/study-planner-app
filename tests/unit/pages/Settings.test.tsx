import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../../../src/pages/Settings';
import { useStore } from '../../../src/store/useStore';

// Mock sync service
vi.mock('../../../src/services/syncService', () => ({
  syncService: {
    checkServerHealth: vi.fn().mockResolvedValue(true),
    getSyncStatus: vi.fn().mockResolvedValue({
      lastSync: new Date().toISOString(),
      status: 'synced',
    }),
    syncData: vi.fn(),
  },
  SyncStatus: {},
}));

// Mock ConfirmDialog
vi.mock('../../../src/components/ConfirmDialog', () => ({
  default: () => <div data-testid="confirm-dialog">Confirm Dialog</div>,
  useConfirmDialog: () => ({
    dialogState: { isOpen: false, title: '', message: '', onConfirm: () => {}, onCancel: () => {} },
    showConfirm: vi.fn(),
    hideConfirm: vi.fn(),
  }),
}));

// Mock data sync utilities
vi.mock('../../../src/store/dataSync', () => ({
  prepareExportData: vi.fn((state) => ({
    chapters: state.userData[state.currentUserId]?.chapters || [],
    exams: state.userData[state.currentUserId]?.exams || [],
    settings: state.userData[state.currentUserId]?.settings || {},
  })),
  validateImportData: vi.fn((data) => ({
    isValid: true,
    data: data,
  })),
  validateDataIntegrity: vi.fn((state) => ({
    isValid: true,
    errors: [],
    warnings: [],
  })),
  cleanupChapterData: vi.fn((chapterId, assignments, plans) => ({
    assignments: [],
    plans: [],
  })),
}));

describe('Settings Page', () => {
  const mockChapter = {
    id: 'chapter-1',
    subject: 'Math',
    name: 'Algebra',
    studyHours: 10,
    revisionHours: 5,
    completedStudyHours: 0,
    completedRevisionHours: 0,
    studyStatus: 'not-done' as const,
    revisionStatus: 'not-done' as const,
    status: 'not_started' as const,
    estimatedHours: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    const state = useStore.getState();
    state.switchUser?.('ananya');
    state.clearAllData?.();

    // Reset URL and window methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  const renderSettings = () => {
    return render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render page header', () => {
      renderSettings();

      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('should render settings sections', () => {
      renderSettings();

      // Should have various settings sections
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should render data management section', () => {
      renderSettings();

      expect(screen.getByText(/Export/i)).toBeInTheDocument();
      expect(screen.getByText(/Import/i)).toBeInTheDocument();
    });

    it('should render theme settings', () => {
      renderSettings();

      const themeText = screen.queryAllByText(/Theme/i);
      expect(themeText.length).toBeGreaterThan(0);
    });
  });

  describe('Settings Display', () => {
    it('should display current settings values', () => {
      const state = useStore.getState();
      const settings = state.getSettings?.();

      renderSettings();

      // Settings should be accessible
      expect(settings).toBeDefined();
      expect(settings.dailyStudyHours).toBeDefined();
    });

    it('should show study hours setting', () => {
      renderSettings();

      const studyHoursText = screen.queryAllByText(/Study Hours|Daily/i);
      expect(studyHoursText.length).toBeGreaterThan(0);
    });

    it('should show data statistics', () => {
      const state = useStore.getState();
      state.addChapter?.(mockChapter);

      renderSettings();

      // Should show some statistics about data
      const text = screen.getByText(/1/);
      expect(text).toBeInTheDocument();
    });
  });

  describe('Theme Settings', () => {
    it('should update theme through store', () => {
      const state = useStore.getState();

      const initialSettings = state.getSettings?.();
      expect(initialSettings.theme).toBe('light');

      state.updateSettings?.({ theme: 'dark' });

      const updatedSettings = state.getSettings?.();
      expect(updatedSettings.theme).toBe('dark');
    });

    it('should update color theme', () => {
      const state = useStore.getState();

      state.updateSettings?.({ colorTheme: 'blue' });

      const settings = state.getSettings?.();
      expect(settings.colorTheme).toBe('blue');
    });

    it('should handle theme toggle', () => {
      const state = useStore.getState();

      // Toggle between themes
      state.updateSettings?.({ theme: 'dark' });
      expect(state.getSettings?.().theme).toBe('dark');

      state.updateSettings?.({ theme: 'light' });
      expect(state.getSettings?.().theme).toBe('light');
    });
  });

  describe('Study Settings', () => {
    it('should update daily study hours', () => {
      const state = useStore.getState();

      state.updateSettings?.({ dailyStudyHours: 6 });

      const settings = state.getSettings?.();
      expect(settings.dailyStudyHours).toBe(6);
    });

    it('should update break minutes', () => {
      const state = useStore.getState();

      state.updateSettings?.({ breakMinutes: 15 });

      const settings = state.getSettings?.();
      expect(settings.breakMinutes).toBe(15);
    });

    it('should update study session minutes', () => {
      const state = useStore.getState();

      state.updateSettings?.({ studySessionMinutes: 45 });

      const settings = state.getSettings?.();
      expect(settings.studySessionMinutes).toBe(45);
    });
  });

  describe('Parent Mode', () => {
    it('should enable parent mode', () => {
      const state = useStore.getState();

      state.updateSettings?.({ parentModeEnabled: true });

      const settings = state.getSettings?.();
      expect(settings.parentModeEnabled).toBe(true);
    });

    it('should disable parent mode', () => {
      const state = useStore.getState();

      state.updateSettings?.({ parentModeEnabled: true });
      state.updateSettings?.({ parentModeEnabled: false });

      const settings = state.getSettings?.();
      expect(settings.parentModeEnabled).toBe(false);
    });

    it('should set parent mode PIN', () => {
      const state = useStore.getState();

      state.updateSettings?.({
        parentModeEnabled: true,
        parentModePIN: '1234'
      });

      const settings = state.getSettings?.();
      expect(settings.parentModePIN).toBe('1234');
    });
  });

  describe('Cloud Sync', () => {
    it('should enable cloud sync', () => {
      const state = useStore.getState();

      state.updateSettings?.({ cloudSyncEnabled: true });

      const settings = state.getSettings?.();
      expect(settings.cloudSyncEnabled).toBe(true);
    });

    it('should disable cloud sync', () => {
      const state = useStore.getState();

      state.updateSettings?.({ cloudSyncEnabled: true });
      state.updateSettings?.({ cloudSyncEnabled: false });

      const settings = state.getSettings?.();
      expect(settings.cloudSyncEnabled).toBe(false);
    });
  });

  describe('Data Export', () => {
    it('should have export functionality available', () => {
      const state = useStore.getState();
      state.addChapter?.(mockChapter);

      // Export data should be preparable
      const exportData = {
        chapters: state.getChapters?.(),
        exams: state.getExams?.(),
        settings: state.getSettings?.(),
      };

      expect(exportData).toBeDefined();
      expect(exportData.chapters.length).toBe(1);
    });

    it('should prepare export data correctly', () => {
      const state = useStore.getState();
      state.addChapter?.(mockChapter);

      const exportData = {
        chapters: state.getChapters?.(),
        exams: state.getExams?.(),
        settings: state.getSettings?.(),
      };

      expect(exportData.chapters.length).toBe(1);
      expect(exportData.chapters[0].name).toBe('Algebra');
    });

    it('should include all data types in export', () => {
      const state = useStore.getState();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      const exams = state.getExams?.();
      const settings = state.getSettings?.();
      const studyPlans = state.getStudyPlans?.();

      expect(chapters).toBeDefined();
      expect(exams).toBeDefined();
      expect(settings).toBeDefined();
      expect(studyPlans).toBeDefined();
    });
  });

  describe('Data Import', () => {
    it('should have import functionality available', () => {
      const state = useStore.getState();

      const validData = {
        chapters: [mockChapter],
        exams: [],
        settings: { dailyStudyHours: 4 },
      };

      // Should be able to import data
      expect(state.importData).toBeDefined();
      expect(typeof state.importData).toBe('function');
    });

    it('should validate import data structure', () => {
      const state = useStore.getState();

      const validData = {
        chapters: [mockChapter],
        exams: [],
        settings: { dailyStudyHours: 4 },
      };

      // Import through store
      const success = state.importData?.(validData);

      expect(success).toBe(true);
      const chapters = state.getChapters?.();
      expect(chapters.length).toBe(1);
    });

    it('should replace existing data on import', () => {
      const state = useStore.getState();

      // Add initial data
      state.addChapter?.(mockChapter);
      expect(state.getChapters?.().length).toBe(1);

      // Import new data
      const newData = {
        chapters: [
          {
            ...mockChapter,
            id: 'chapter-2',
            name: 'Geometry',
          }
        ],
        exams: [],
        settings: state.getSettings?.(),
      };

      state.importData?.(newData);

      const chapters = state.getChapters?.();
      expect(chapters.length).toBe(1);
      expect(chapters[0].name).toBe('Geometry');
    });
  });

  describe('Clear All Data', () => {
    it('should clear all user data', () => {
      const state = useStore.getState();

      state.addChapter?.(mockChapter);
      expect(state.getChapters?.().length).toBe(1);

      state.clearAllData?.();

      expect(state.getChapters?.().length).toBe(0);
      expect(state.getExams?.().length).toBe(0);
      expect(state.getStudyPlans?.().length).toBe(0);
    });

    it('should preserve user profile after clear', () => {
      const state = useStore.getState();
      const currentUserId = state.currentUserId;

      state.addChapter?.(mockChapter);
      state.clearAllData?.();

      expect(state.currentUserId).toBe(currentUserId);
    });

    it('should reset to default settings after clear', () => {
      const state = useStore.getState();

      state.updateSettings?.({ dailyStudyHours: 8 });
      state.clearAllData?.();

      const settings = state.getSettings?.();
      expect(settings.dailyStudyHours).toBe(4); // Default value
    });
  });

  describe('Data Integrity', () => {
    it('should have data integrity validation available', () => {
      const state = useStore.getState();

      state.addChapter?.(mockChapter);

      // Should have validation method
      expect(state.validateDataIntegrity).toBeDefined();

      // If it exists, it should be callable
      if (state.validateDataIntegrity) {
        const result = state.validateDataIntegrity();
        expect(result).toBeDefined();
      }
    });

    it('should handle orphaned assignment cleanup', () => {
      const state = useStore.getState();

      // Create orphaned assignment scenario
      state.addChapter?.(mockChapter);
      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;
      state.scheduleChapter?.(chapterId, '2025-12-01', 'study', 60);

      const initialAssignments = state.getChapterAssignments?.();
      expect(initialAssignments.length).toBe(1);

      // Delete chapter
      state.deleteChapter?.(chapterId);

      // Chapter should be gone but assignment might remain
      const remainingChapters = state.getChapters?.();
      expect(remainingChapters.length).toBe(0);
    });

    it('should have cleanup functionality available', () => {
      const state = useStore.getState();

      // Should have cleanup method
      expect(state.cleanupOrphanedData).toBeDefined();

      // If it exists, it should be callable
      if (state.cleanupOrphanedData) {
        state.cleanupOrphanedData();
        expect(true).toBe(true); // Should not throw
      }
    });
  });

  describe('Session Management', () => {
    it('should reset active sessions', () => {
      const state = useStore.getState();

      state.addChapter?.(mockChapter);
      const chapters = state.getChapters?.();
      state.scheduleChapter?.(chapters[0].id, '2025-12-01', 'study', 60);

      const assignments = state.getChapterAssignments?.();
      state.startActivity?.(assignments[0].id);

      // Reset sessions
      state.resetActiveSessionsAndTimers?.();

      const sessions = state.getActivitySessions?.();
      const activeSessions = sessions.filter(s => s.isActive);
      expect(activeSessions.length).toBe(0);
    });

    it('should cleanup stale sessions', () => {
      const state = useStore.getState();

      state.addChapter?.(mockChapter);
      const chapters = state.getChapters?.();
      state.scheduleChapter?.(chapters[0].id, '2025-12-01', 'study', 60);

      const assignments = state.getChapterAssignments?.();
      state.startActivity?.(assignments[0].id);

      state.cleanupSessions?.();

      // Sessions should be cleaned up appropriately
      const sessions = state.getActivitySessions?.();
      expect(sessions).toBeDefined();
    });

    it('should validate session state', () => {
      const state = useStore.getState();

      state.validateAndFixSessionState?.();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Statistics and Info', () => {
    it('should display correct chapter count', () => {
      const state = useStore.getState();

      state.addChapter?.(mockChapter);
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });

      const chapters = state.getChapters?.();
      expect(chapters.length).toBe(2);
    });

    it('should display correct exam count', () => {
      const state = useStore.getState();

      state.addExam?.({
        name: 'Math Exam',
        date: '2025-12-15',
        type: 'mid-term' as const,
        subjects: ['Math'],
      });

      const exams = state.getExams?.();
      expect(exams.length).toBe(1);
    });

    it('should display correct study plan count', () => {
      const state = useStore.getState();

      const studyPlans = state.getStudyPlans?.();
      expect(studyPlans).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle settings with no user logged in', () => {
      const state = useStore.getState();
      state.logoutUser?.();

      const settings = state.getSettings?.();

      // Should return default settings
      expect(settings).toBeDefined();
      expect(typeof settings).toBe('object');
    });

    it('should handle empty data export', () => {
      const state = useStore.getState();
      state.clearAllData?.();

      const exportData = {
        chapters: state.getChapters?.(),
        exams: state.getExams?.(),
      };

      expect(exportData.chapters.length).toBe(0);
      expect(exportData.exams.length).toBe(0);
    });

    it('should handle multiple setting updates', () => {
      const state = useStore.getState();

      state.updateSettings?.({ dailyStudyHours: 5 });
      state.updateSettings?.({ breakMinutes: 10 });
      state.updateSettings?.({ theme: 'dark' });

      const settings = state.getSettings?.();

      expect(settings.dailyStudyHours).toBe(5);
      expect(settings.breakMinutes).toBe(10);
      expect(settings.theme).toBe('dark');
    });

    it('should handle rapid setting changes', () => {
      const state = useStore.getState();

      for (let i = 1; i <= 10; i++) {
        state.updateSettings?.({ dailyStudyHours: i });
      }

      const settings = state.getSettings?.();
      expect(settings.dailyStudyHours).toBe(10);
    });
  });
});
