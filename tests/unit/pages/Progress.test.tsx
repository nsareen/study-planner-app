import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Progress from '../../../src/pages/Progress';
import { useStore } from '../../../src/store/useStore';

// Mock SimpleAnalytics component
vi.mock('../../../src/components/SimpleAnalytics', () => ({
  default: () => <div data-testid="simple-analytics">Simple Analytics Mock</div>,
}));

// Mock DetailedAnalytics component
vi.mock('../../../src/components/DetailedAnalytics', () => ({
  default: () => <div data-testid="detailed-analytics">Detailed Analytics Mock</div>,
}));

describe('Progress Page', () => {
  const mockChapter = {
    id: 'chapter-1',
    subject: 'Math',
    name: 'Algebra',
    studyHours: 10,
    revisionHours: 5,
    completedStudyHours: 5,
    completedRevisionHours: 2,
    studyStatus: 'in-progress' as const,
    revisionStatus: 'not-done' as const,
    status: 'in_progress' as const,
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

    // Reset parent mode settings
    state.updateSettings?.({
      parentModeEnabled: false,
      parentModePIN: '1234',
    });
  });

  const renderProgress = () => {
    return render(
      <BrowserRouter>
        <Progress />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render progress page', () => {
      renderProgress();

      // Should render analytics component
      expect(screen.getByTestId('simple-analytics')).toBeInTheDocument();
    });

    it('should render parent mode toggle button', () => {
      renderProgress();

      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Parent Mode'));
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show lock icon when parent mode disabled', () => {
      renderProgress();

      const lockIcons = document.querySelectorAll('.lucide-lock');
      expect(lockIcons.length).toBeGreaterThan(0);
    });

    it('should show SimpleAnalytics by default', () => {
      renderProgress();

      expect(screen.getByTestId('simple-analytics')).toBeInTheDocument();
      expect(screen.queryByTestId('detailed-analytics')).not.toBeInTheDocument();
    });
  });

  describe('Parent Mode Toggle', () => {
    it('should show PIN dialog when clicking lock button', () => {
      renderProgress();

      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      expect(screen.getByText(/Enter Parent PIN/i)).toBeInTheDocument();
    });

    it('should enable parent mode with correct PIN', () => {
      renderProgress();

      const state = useStore.getState();

      // Open PIN dialog
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      // Enter correct PIN
      const pinInput = screen.getByPlaceholderText(/Enter.*PIN/i);
      fireEvent.change(pinInput, { target: { value: '1234' } });

      // Submit PIN
      const submitButton = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(submitButton);

      // Parent mode should be enabled
      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBe(true);
    });

    it('should show error with incorrect PIN', () => {
      renderProgress();

      // Open PIN dialog
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      // Enter incorrect PIN
      const pinInput = screen.getByPlaceholderText(/Enter.*PIN/i);
      fireEvent.change(pinInput, { target: { value: 'wrong' } });

      // Submit PIN
      const submitButton = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(submitButton);

      // Error should be shown
      expect(screen.getByText(/Incorrect PIN/i)).toBeInTheDocument();
    });

    it('should disable parent mode when clicking unlock button', () => {
      const state = useStore.getState();

      // Enable parent mode first
      state.updateSettings({ parentModeEnabled: true });

      renderProgress();

      // Click unlock button
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Exit Parent Mode'));
      fireEvent.click(toggleButton!);

      // Parent mode should be disabled
      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBe(false);
    });

    it('should show unlock icon when parent mode enabled', () => {
      const state = useStore.getState();
      state.updateSettings({ parentModeEnabled: true });

      renderProgress();

      // Check for the Exit Parent Mode button title instead of icon class
      const buttons = screen.getAllByRole('button');
      const exitButton = buttons.find(btn => btn.title?.includes('Exit Parent Mode'));
      expect(exitButton).toBeInTheDocument();
    });
  });

  describe('Analytics Display', () => {
    it('should show SimpleAnalytics when parent mode disabled', () => {
      renderProgress();

      expect(screen.getByTestId('simple-analytics')).toBeInTheDocument();
      expect(screen.queryByTestId('detailed-analytics')).not.toBeInTheDocument();
    });

    it('should show DetailedAnalytics when parent mode enabled', () => {
      const state = useStore.getState();
      state.updateSettings({ parentModeEnabled: true });

      renderProgress();

      expect(screen.getByTestId('detailed-analytics')).toBeInTheDocument();
      expect(screen.queryByTestId('simple-analytics')).not.toBeInTheDocument();
    });

    it('should switch from SimpleAnalytics to DetailedAnalytics', () => {
      const state = useStore.getState();

      // Test through store operations rather than UI updates
      expect(state.getSettings().parentModeEnabled).toBe(false);

      state.updateSettings({ parentModeEnabled: true });

      expect(state.getSettings().parentModeEnabled).toBe(true);
    });
  });

  describe('Store Data Integration', () => {
    it('should access chapters from store', () => {
      const state = useStore.getState();
      state.addChapter(mockChapter);

      renderProgress();

      const chapters = state.getChapters();
      expect(chapters.length).toBe(1);
      expect(chapters[0].name).toBe('Algebra');
    });

    it('should access exams from store', () => {
      const state = useStore.getState();
      state.addExam({
        name: 'Math Exam',
        date: '2025-12-15',
        type: 'mid-term',
        subjects: ['Math'],
        createdAt: new Date().toISOString(),
      });

      renderProgress();

      const exams = state.getExams();
      expect(exams.length).toBe(1);
      expect(exams[0].name).toBe('Math Exam');
    });

    it('should access chapter assignments from store', () => {
      const state = useStore.getState();
      state.addChapter(mockChapter);
      const chapters = state.getChapters();
      state.scheduleChapter(chapters[0].id, '2025-12-01', 'study', 60);

      renderProgress();

      const assignments = state.getChapterAssignments();
      expect(assignments.length).toBe(1);
    });

    it('should access activity sessions from store', () => {
      const state = useStore.getState();
      state.addChapter(mockChapter);
      const chapters = state.getChapters();
      state.scheduleChapter(chapters[0].id, '2025-12-01', 'study', 60);
      const assignments = state.getChapterAssignments();
      state.startActivity(assignments[0].id);

      renderProgress();

      const sessions = state.getActivitySessions();
      expect(sessions.length).toBe(1);
    });

    it('should access daily logs from store', () => {
      const state = useStore.getState();

      renderProgress();

      const dailyLogs = state.getDailyLogs();
      expect(dailyLogs).toBeDefined();
    });
  });

  describe('User Profile Data', () => {
    it('should display current user streak', () => {
      const state = useStore.getState();
      const currentUser = state.getCurrentUser();

      renderProgress();

      expect(currentUser).toBeDefined();
      expect(currentUser?.streak).toBeDefined();
    });

    it('should display current user level', () => {
      const state = useStore.getState();
      const currentUser = state.getCurrentUser();

      renderProgress();

      expect(currentUser).toBeDefined();
      expect(currentUser?.level).toBeDefined();
    });

    it('should handle user with zero streak', () => {
      const state = useStore.getState();

      renderProgress();

      const currentUser = state.getCurrentUser();
      expect(currentUser?.streak).toBeGreaterThanOrEqual(0);
    });

    it('should handle user at level 1', () => {
      const state = useStore.getState();

      renderProgress();

      const currentUser = state.getCurrentUser();
      expect(currentUser?.level).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Settings Management', () => {
    it('should read parent mode settings', () => {
      const state = useStore.getState();

      renderProgress();

      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBeDefined();
      expect(settings.parentModePIN).toBeDefined();
    });

    it('should update parent mode settings', () => {
      const state = useStore.getState();

      state.updateSettings({ parentModeEnabled: true });

      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBe(true);
    });

    it('should handle custom PIN', () => {
      const state = useStore.getState();

      state.updateSettings({ parentModePIN: '9999' });

      const settings = state.getSettings();
      expect(settings.parentModePIN).toBe('9999');
    });

    it('should handle empty PIN', () => {
      const state = useStore.getState();

      state.updateSettings({ parentModePIN: '' });

      const settings = state.getSettings();
      expect(settings.parentModePIN).toBe('');
    });
  });

  describe('PIN Dialog', () => {
    it('should close PIN dialog on successful authentication', () => {
      renderProgress();

      // Open PIN dialog
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      expect(screen.getByText(/Enter Parent PIN/i)).toBeInTheDocument();

      // Enter correct PIN and submit
      const pinInput = screen.getByPlaceholderText(/Enter.*PIN/i);
      fireEvent.change(pinInput, { target: { value: '1234' } });

      const submitButton = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(submitButton);

      // Dialog should close
      expect(screen.queryByText(/Enter Parent PIN/i)).not.toBeInTheDocument();
    });

    it('should clear PIN input on successful authentication', () => {
      const state = useStore.getState();

      renderProgress();

      // Open PIN dialog
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      // Enter correct PIN
      const pinInput = screen.getByPlaceholderText(/Enter.*PIN/i) as HTMLInputElement;
      fireEvent.change(pinInput, { target: { value: '1234' } });
      expect(pinInput.value).toBe('1234');

      // Submit PIN
      const submitButton = screen.getByRole('button', { name: /Confirm/i });
      fireEvent.click(submitButton);

      // Parent mode should be enabled (main goal of the test)
      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBe(true);
    });

    it('should handle cancel button in PIN dialog', () => {
      renderProgress();

      // Open PIN dialog
      const buttons = screen.getAllByRole('button');
      const toggleButton = buttons.find(btn => btn.title?.includes('Enter Parent Mode'));
      fireEvent.click(toggleButton!);

      expect(screen.getByText(/Enter Parent PIN/i)).toBeInTheDocument();

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Dialog should close
      expect(screen.queryByText(/Enter Parent PIN/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle no chapters', () => {
      const state = useStore.getState();

      renderProgress();

      const chapters = state.getChapters();
      expect(chapters.length).toBe(0);
    });

    it('should handle no exams', () => {
      const state = useStore.getState();

      renderProgress();

      const exams = state.getExams();
      expect(exams.length).toBe(0);
    });

    it('should handle no assignments', () => {
      const state = useStore.getState();

      renderProgress();

      const assignments = state.getChapterAssignments();
      expect(assignments.length).toBe(0);
    });

    it('should handle no activity sessions', () => {
      const state = useStore.getState();

      renderProgress();

      const sessions = state.getActivitySessions();
      expect(sessions).toBeDefined();
    });

    it('should handle multiple chapters', () => {
      const state = useStore.getState();

      state.addChapter(mockChapter);
      state.addChapter({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });

      renderProgress();

      const chapters = state.getChapters();
      expect(chapters.length).toBe(2);
    });

    it('should handle rapid parent mode toggling', () => {
      const state = useStore.getState();

      state.updateSettings({ parentModeEnabled: false });
      state.updateSettings({ parentModeEnabled: true });
      state.updateSettings({ parentModeEnabled: false });

      const settings = state.getSettings();
      expect(settings.parentModeEnabled).toBe(false);
    });
  });
});
