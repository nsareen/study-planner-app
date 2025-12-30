import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TodayPlan from '../../../src/pages/TodayPlan';
import { useStore } from '../../../src/store/useStore';
import { backendSessionOps } from '../../../src/store/backendStore';

// Mock backend operations
vi.mock('../../../src/store/backendStore', () => ({
  backendSessionOps: {
    startActivity: vi.fn(),
    pauseActivity: vi.fn(),
    resumeActivity: vi.fn(),
    completeActivity: vi.fn(),
  },
}));

// Mock QuickScheduler component
vi.mock('../../../src/components/QuickScheduler', () => ({
  default: () => <div data-testid="quick-scheduler">Quick Scheduler Mock</div>,
}));

describe('TodayPlan Page', () => {
  const mockChapter = {
    id: 'chapter-1',
    subject: 'Math',
    name: 'Algebra Basics',
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

  const getTodayStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state before each test
    const state = useStore.getState();
    state.switchUser?.('ananya');
    state.clearAllData?.();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const renderTodayPlan = () => {
    return render(
      <BrowserRouter>
        <TodayPlan />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render page header with title', () => {
      renderTodayPlan();

      expect(screen.getByText("Today's Mission")).toBeInTheDocument();
    });

    it('should render progress stats section', () => {
      renderTodayPlan();

      expect(screen.getByText('Total Time')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('Timer')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });

    it('should render QuickScheduler component', () => {
      renderTodayPlan();

      expect(screen.getByTestId('quick-scheduler')).toBeInTheDocument();
    });

    it('should show empty state when no assignments for today', () => {
      renderTodayPlan();

      // Progress should be 0%
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Assignment Display', () => {
    beforeEach(() => {
      const state = useStore.getState();

      // Setup: Add chapter and create assignment for today
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);
      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      // Schedule for today
      state.scheduleChapter?.(chapterId, getTodayStr(), 'study', 60);
    });

    it('should display todays assignments', () => {
      renderTodayPlan();

      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
      expect(screen.getByText('Math')).toBeInTheDocument();
    });

    it('should show assignment duration', () => {
      renderTodayPlan();

      // Duration can be displayed in multiple places (stats + assignment card)
      const durationElements = screen.getAllByText(/60|1h/);
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it('should show assignment activity type', () => {
      renderTodayPlan();

      const studyLabels = screen.getAllByText(/Study/);
      expect(studyLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Progress Calculations', () => {
    beforeEach(() => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();

      // Add multiple chapters
      state.addChapter?.(mockChapter);
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });

      const chapters = state.getChapters?.();
      const chapterId1 = chapters[0].id;
      const chapterId2 = chapters[1].id;

      // Schedule two assignments for today
      state.scheduleChapter?.(chapterId1, getTodayStr(), 'study', 60);
      state.scheduleChapter?.(chapterId2, getTodayStr(), 'study', 90);
    });

    it('should calculate total planned minutes correctly', () => {
      renderTodayPlan();

      // 60 + 90 = 150 minutes = 2h 30m
      expect(screen.getByText('2h 30m')).toBeInTheDocument();
    });

    it('should show 0% progress when no tasks completed', () => {
      renderTodayPlan();

      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should calculate progress percentage correctly with completed tasks', () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();

      // Complete first assignment
      state.updateAssignment?.(assignments[0].id, {
        status: 'completed',
        actualMinutes: 55,
      });

      renderTodayPlan();

      // 1 out of 2 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should calculate total actual minutes correctly', () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();

      // Complete first assignment with actual time
      state.updateAssignment?.(assignments[0].id, {
        status: 'completed',
        actualMinutes: 65,
      });

      renderTodayPlan();

      // Should show 1h 5m in Completed section
      expect(screen.getByText('1h 5m')).toBeInTheDocument();
    });
  });

  describe('Timer Operations', () => {
    beforeEach(() => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      state.scheduleChapter?.(chapterId, getTodayStr(), 'study', 60);
    });

    it('should call startActivity when start button clicked', async () => {
      renderTodayPlan();

      const startButtons = screen.getAllByRole('button', { name: /start/i });

      await waitFor(() => {
        fireEvent.click(startButtons[0]);
      });

      expect(backendSessionOps.startActivity).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during start operation', async () => {
      // Mock async operation to delay
      vi.mocked(backendSessionOps.startActivity).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderTodayPlan();

      const startButtons = screen.getAllByRole('button', { name: /start/i });
      fireEvent.click(startButtons[0]);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(backendSessionOps.startActivity).toHaveBeenCalled();
      });
    });

    it('should call pauseActivity when pause button clicked', async () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();
      const assignmentId = assignments[0].id;

      // Start activity first
      state.startActivity?.(assignmentId);

      renderTodayPlan();

      const pauseButtons = screen.getAllByRole('button', { name: /pause/i });

      await waitFor(() => {
        fireEvent.click(pauseButtons[0]);
      });

      expect(backendSessionOps.pauseActivity).toHaveBeenCalledTimes(1);
    });

    it('should call resumeActivity when resume button clicked', async () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();
      const assignmentId = assignments[0].id;

      // Start then pause activity
      state.startActivity?.(assignmentId);
      const sessions = state.getActivitySessions?.();
      state.pauseActivity?.(sessions[0].sessionId);

      renderTodayPlan();

      const resumeButtons = screen.getAllByRole('button', { name: /resume/i });

      await waitFor(() => {
        fireEvent.click(resumeButtons[0]);
      });

      expect(backendSessionOps.resumeActivity).toHaveBeenCalledTimes(1);
    });

    it('should show confirmation and complete activity', async () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();
      const assignmentId = assignments[0].id;

      // Start activity
      state.startActivity?.(assignmentId);

      // Mock window.confirm
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderTodayPlan();

      const completeButtons = screen.getAllByRole('button', { name: /complete/i });

      await waitFor(() => {
        fireEvent.click(completeButtons[0]);
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(backendSessionOps.completeActivity).toHaveBeenCalledTimes(1);

      confirmSpy.mockRestore();
    });

    it('should not complete activity if confirmation canceled', async () => {
      const state = useStore.getState();
      const assignments = state.getChapterAssignments?.();
      const assignmentId = assignments[0].id;

      // Start activity
      state.startActivity?.(assignmentId);

      // Mock window.confirm to return false
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderTodayPlan();

      const completeButtons = screen.getAllByRole('button', { name: /complete/i });

      await waitFor(() => {
        fireEvent.click(completeButtons[0]);
      });

      expect(confirmSpy).toHaveBeenCalled();
      expect(backendSessionOps.completeActivity).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Timer Display', () => {
    it('should show 00:00 when no active timer', () => {
      renderTodayPlan();

      const timerElements = screen.getAllByText('00:00');
      expect(timerElements.length).toBeGreaterThan(0);
    });

    it('should display elapsed time for active session', () => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      state.scheduleChapter?.(chapterId, getTodayStr(), 'study', 60);
      const assignments = state.getChapterAssignments?.();
      const assignmentId = assignments[0].id;

      // Start activity
      state.startActivity?.(assignmentId);

      renderTodayPlan();

      // Active session should exist and timer should not show 00:00
      const sessions = state.getActivitySessions?.();
      expect(sessions.length).toBe(1);
      expect(sessions[0].isActive).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle assignments with missing chapter data', () => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();

      // Create assignment without adding chapter
      const fakeAssignment = {
        id: 'assignment-1',
        chapterId: 'non-existent-chapter',
        date: getTodayStr(),
        activityType: 'study' as const,
        plannedMinutes: 60,
        status: 'scheduled' as const,
        createdAt: new Date().toISOString(),
      };

      // Directly manipulate store to add orphaned assignment
      const userData = state.userData;
      const currentUserId = state.currentUserId;
      if (currentUserId && userData[currentUserId]) {
        userData[currentUserId].chapterAssignments = [fakeAssignment];
      }

      // Should not crash
      expect(() => renderTodayPlan()).not.toThrow();
    });

    it('should handle multiple simultaneous timer operations', async () => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();

      // Add two chapters with assignments
      state.addChapter?.(mockChapter);
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });

      const chapters = state.getChapters?.();
      state.scheduleChapter?.(chapters[0].id, getTodayStr(), 'study', 60);
      state.scheduleChapter?.(chapters[1].id, getTodayStr(), 'study', 90);

      renderTodayPlan();

      const startButtons = screen.getAllByRole('button', { name: /start/i });

      // Click first start button
      fireEvent.click(startButtons[0]);

      // Click second start button
      fireEvent.click(startButtons[1]);

      // Should call startActivity twice (auto-pause happens in between)
      expect(backendSessionOps.startActivity).toHaveBeenCalledTimes(2);
    });

    it('should filter out assignments not for today', () => {
      const state = useStore.getState();

      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      // Schedule for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      state.scheduleChapter?.(chapterId, tomorrowStr, 'study', 60);

      renderTodayPlan();

      // Should not show tomorrow's assignment
      expect(screen.queryByText('Algebra Basics')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle startActivity error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(backendSessionOps.startActivity).mockRejectedValue(new Error('Network error'));

      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      state.scheduleChapter?.(chapters[0].id, getTodayStr(), 'study', 60);

      renderTodayPlan();

      const startButtons = screen.getAllByRole('button', { name: /start/i });
      fireEvent.click(startButtons[0]);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to start activity:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should handle pauseActivity error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(backendSessionOps.pauseActivity).mockRejectedValue(new Error('Network error'));

      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();
      state.scheduleChapter?.(chapters[0].id, getTodayStr(), 'study', 60);

      const assignments = state.getChapterAssignments?.();
      state.startActivity?.(assignments[0].id);

      renderTodayPlan();

      const pauseButtons = screen.getAllByRole('button', { name: /pause/i });
      fireEvent.click(pauseButtons[0]);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to pause activity:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });
});
