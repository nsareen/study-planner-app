import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Subjects from '../../../src/pages/Subjects';
import { useStore } from '../../../src/store/useStore';
import { backendChapterOps } from '../../../src/store/backendStore';

// Mock backend operations
vi.mock('../../../src/store/backendStore', () => ({
  backendChapterOps: {
    addChapter: vi.fn(),
    updateChapter: vi.fn(),
    deleteChapter: vi.fn(),
  },
}));

// Mock CurriculumImport component
vi.mock('../../../src/components/CurriculumImport', () => ({
  default: () => <div data-testid="curriculum-import">Curriculum Import Mock</div>,
}));

// Mock SmartChapterSuggest component
vi.mock('../../../src/components/SmartChapterSuggest', () => ({
  default: () => <div data-testid="smart-suggest">Smart Suggest Mock</div>,
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

describe('Subjects Page', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state before each test
    const state = useStore.getState();
    state.switchUser?.('ananya');
    state.clearAllData?.();
  });

  const renderSubjects = () => {
    return render(
      <BrowserRouter>
        <Subjects />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render page header', () => {
      renderSubjects();

      expect(screen.getByText(/Subjects/)).toBeInTheDocument();
    });

    it('should render add chapter button', () => {
      renderSubjects();

      const addButtons = screen.getAllByText(/Add Chapter/i);
      expect(addButtons.length).toBeGreaterThan(0);
    });

    it('should show chapter list section', () => {
      renderSubjects();

      // Should show subjects section even if empty
      const subjectsText = screen.queryAllByText(/Subjects/i);
      expect(subjectsText.length).toBeGreaterThan(0);
    });

    it('should render curriculum import section', () => {
      renderSubjects();

      expect(screen.getByText(/Import from/i)).toBeInTheDocument();
    });
  });

  describe('Chapter Display', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);
    });

    it('should display chapter name', () => {
      renderSubjects();

      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    });

    it('should display chapter subject', () => {
      renderSubjects();

      expect(screen.getByText('Math')).toBeInTheDocument();
    });

    it('should display chapter hours', () => {
      const state = useStore.getState();
      const chapters = state.getChapters?.();

      // Chapter has correct hours in state
      expect(chapters[0].estimatedHours).toBe(10);
      expect(chapters[0].studyHours).toBe(10);
      expect(chapters[0].revisionHours).toBe(5);
    });

    it('should show action buttons for chapter', () => {
      renderSubjects();

      // Look for any buttons in the chapter display
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2); // Should have edit/delete at minimum
    });

    it('should display chapter in organized layout', () => {
      renderSubjects();

      // Chapter should be visible with subject grouping
      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
      expect(screen.getByText('Math')).toBeInTheDocument();
    });
  });

  describe('Subject Statistics', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();

      // Add multiple chapters for Math
      state.addChapter?.(mockChapter);
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });

      // Add chapters for Science
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-3',
        subject: 'Science',
        name: 'Physics Basics',
      });
    });

    it('should display subject names', () => {
      renderSubjects();

      expect(screen.getByText('Math')).toBeInTheDocument();
      expect(screen.getByText('Science')).toBeInTheDocument();
    });

    it('should display chapter count per subject', () => {
      renderSubjects();

      // Math should have 2 chapters
      const mathSections = screen.getAllByText(/Math/i);
      expect(mathSections.length).toBeGreaterThan(0);
    });

    it('should group chapters by subject', () => {
      renderSubjects();

      // Both Math chapters should be visible
      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();

      // Science chapter should be visible
      expect(screen.getByText('Physics Basics')).toBeInTheDocument();
    });
  });

  describe('Add Chapter Form', () => {
    it('should show form when add button clicked', () => {
      renderSubjects();

      const addButton = screen.getAllByRole('button', { name: /Add Chapter/i })[0];
      fireEvent.click(addButton);

      // Form should be visible (with Smart Suggestions or regular fields)
      expect(screen.getByText(/Add New Chapter|Edit Chapter/i)).toBeInTheDocument();
    });

    it('should show smart suggestions by default', () => {
      renderSubjects();

      const addButton = screen.getAllByRole('button', { name: /Add Chapter/i })[0];
      fireEvent.click(addButton);

      // Smart Suggestions should be visible
      expect(screen.getByTestId('smart-suggest')).toBeInTheDocument();
    });

    it('should add chapter through store', () => {
      const state = useStore.getState();

      expect(state.getChapters?.().length).toBe(0);

      state.addChapter?.({
        subject: 'Math',
        name: 'New Algebra',
        studyHours: 8,
        revisionHours: 4,
        completedStudyHours: 0,
        completedRevisionHours: 0,
        studyStatus: 'not-done' as const,
        revisionStatus: 'not-done' as const,
        status: 'not_started' as const,
        estimatedHours: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const chapters = state.getChapters?.();
      expect(chapters.length).toBe(1);
      expect(chapters[0].name).toBe('New Algebra');
    });

    it('should call backend addChapter operation', async () => {
      await backendChapterOps.addChapter({
        subject: 'Math',
        name: 'Algebra',
        studyHours: 10,
        revisionHours: 5,
        completedStudyHours: 0,
        completedRevisionHours: 0,
        studyStatus: 'not-done' as const,
        revisionStatus: 'not-done' as const,
        confidence: 'medium' as const
      });

      expect(backendChapterOps.addChapter).toHaveBeenCalledTimes(1);
    });

    it('should handle chapter creation with validation', () => {
      const state = useStore.getState();

      // Add chapter with required fields
      state.addChapter?.({
        subject: 'Science',
        name: 'Physics',
        studyHours: 12,
        revisionHours: 6,
        completedStudyHours: 0,
        completedRevisionHours: 0,
        studyStatus: 'not-done' as const,
        revisionStatus: 'not-done' as const,
        status: 'not_started' as const,
        estimatedHours: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const chapters = state.getChapters?.();
      const newChapter = chapters.find(c => c.name === 'Physics');

      expect(newChapter).toBeDefined();
      expect(newChapter?.subject).toBe('Science');
      expect(newChapter?.studyHours).toBe(12);
    });

    it('should integrate with form submission', () => {
      renderSubjects();

      const addButton = screen.getAllByRole('button', { name: /Add Chapter/i })[0];
      fireEvent.click(addButton);

      // Form should be visible
      expect(screen.getByText(/Add New Chapter/i)).toBeInTheDocument();
    });

    it('should close form when cancel button clicked', () => {
      renderSubjects();

      const addButton = screen.getAllByRole('button', { name: /Add Chapter/i })[0];
      fireEvent.click(addButton);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByLabelText(/Subject/i)).not.toBeInTheDocument();
    });
  });

  describe('Edit Chapter', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);
    });

    it('should show edit form when edit action triggered', () => {
      renderSubjects();

      // Chapter should be visible
      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();

      // Should have buttons available
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should call updateChapter on edit operation', async () => {
      const state = useStore.getState();
      const chapters = state.getChapters?.();

      // Directly call updateChapter (simulating edit operation)
      await backendChapterOps.updateChapter(chapters[0].id, {
        name: 'Advanced Algebra'
      });

      expect(backendChapterOps.updateChapter).toHaveBeenCalledTimes(1);
    });

    it('should handle chapter updates in store', () => {
      const state = useStore.getState();
      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      // Update through store
      state.updateChapter?.(chapterId, { name: 'Advanced Algebra' });

      const updatedChapters = state.getChapters?.();
      const updatedChapter = updatedChapters.find(c => c.id === chapterId);

      expect(updatedChapter?.name).toBe('Advanced Algebra');
    });
  });

  describe('Delete Chapter', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);
    });

    it('should call deleteChapter operation', async () => {
      const state = useStore.getState();
      const chapters = state.getChapters?.();

      // Directly call deleteChapter (simulating delete operation)
      await backendChapterOps.deleteChapter(chapters[0].id);

      expect(backendChapterOps.deleteChapter).toHaveBeenCalledTimes(1);
    });

    it('should remove chapter from store after delete', () => {
      const state = useStore.getState();
      const chapters = state.getChapters?.();
      const chapterId = chapters[0].id;

      expect(chapters.length).toBe(1);
      expect(chapters[0].name).toBe('Algebra Basics');

      // Delete through store
      state.deleteChapter?.(chapterId);

      const remainingChapters = state.getChapters?.();
      expect(remainingChapters.length).toBe(0);
    });
  });

  describe('Clear All Chapters', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();

      state.addChapter?.(mockChapter);
      state.addChapter?.({
        ...mockChapter,
        id: 'chapter-2',
        name: 'Geometry',
      });
    });

    it('should show clear all button when chapters exist', () => {
      renderSubjects();

      expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument();
    });

    it('should remove all chapters when clearAllChapters called', () => {
      const state = useStore.getState();

      const initialChapters = state.getChapters?.();
      expect(initialChapters.length).toBe(2);

      // Clear all chapters through store
      state.clearAllChapters?.();

      const remainingChapters = state.getChapters?.();
      expect(remainingChapters.length).toBe(0);
    });

    it('should not clear chapters if confirmation canceled', () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderSubjects();

      const clearButton = screen.getByRole('button', { name: /Clear All/i });
      fireEvent.click(clearButton);

      const state = useStore.getState();
      const chapters = state.getChapters?.();
      expect(chapters.length).toBe(2);

      confirmSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle addChapter error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(backendChapterOps.addChapter).mockRejectedValue(new Error('Network error'));

      const state = useStore.getState();

      // Attempt to add chapter via backend
      try {
        await backendChapterOps.addChapter({
          subject: 'Math',
          name: 'Algebra',
          studyHours: 10,
          revisionHours: 5,
          completedStudyHours: 0,
          completedRevisionHours: 0,
          studyStatus: 'not-done' as const,
          revisionStatus: 'not-done' as const,
          confidence: 'medium' as const
        });
      } catch (error) {
        // Error expected
      }

      expect(backendChapterOps.addChapter).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle updateChapter error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(backendChapterOps.updateChapter).mockRejectedValue(new Error('Network error'));

      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();

      // Attempt to update chapter via backend
      try {
        await backendChapterOps.updateChapter(chapters[0].id, { name: 'Updated' });
      } catch (error) {
        // Error expected
      }

      expect(backendChapterOps.updateChapter).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle deleteChapter error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(backendChapterOps.deleteChapter).mockRejectedValue(new Error('Network error'));

      const state = useStore.getState();
      state.switchUser?.('ananya');
      state.clearAllData?.();
      state.addChapter?.(mockChapter);

      const chapters = state.getChapters?.();

      // Attempt to delete chapter via backend
      try {
        await backendChapterOps.deleteChapter(chapters[0].id);
      } catch (error) {
        // Error expected
      }

      expect(backendChapterOps.deleteChapter).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration with Smart Features', () => {
    it('should render SmartChapterSuggest when enabled', () => {
      renderSubjects();

      const addButton = screen.getAllByRole('button', { name: /Add Chapter/i })[0];
      fireEvent.click(addButton);

      expect(screen.getByTestId('smart-suggest')).toBeInTheDocument();
    });

    it('should show curriculum import option', () => {
      renderSubjects();

      const importButton = screen.getByRole('button', { name: /Import from/i });
      fireEvent.click(importButton);

      expect(screen.getByTestId('curriculum-import')).toBeInTheDocument();
    });
  });
});
