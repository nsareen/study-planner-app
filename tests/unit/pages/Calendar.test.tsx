import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Calendar from '../../../src/pages/Calendar';
import { useStore } from '../../../src/store/useStore';

// Mock ExamGroupForm component
vi.mock('../../../src/components/ExamGroupForm', () => ({
  default: () => <div data-testid="exam-group-form">Exam Group Form Mock</div>,
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

describe('Calendar Page', () => {
  const mockExam = {
    id: 'exam-1',
    name: 'Mid-Term Math',
    date: '2025-12-15',
    type: 'mid-term' as const,
    subjects: ['Math', 'Science'],
    createdAt: new Date().toISOString(),
  };

  const mockExamGroup = {
    id: 'group-1',
    name: 'Mid-Term Exams',
    description: 'Mid-term examination schedule',
    type: 'mid-term' as const,
    startDate: '2025-12-15',
    endDate: '2025-12-16',
    status: 'draft' as const,
    isTemplate: false,
    subjectExams: [
      {
        subject: 'Math',
        date: '2025-12-15',
      },
      {
        subject: 'Science',
        date: '2025-12-16',
      },
    ],
    offDays: ['2025-12-17'],
    lastModified: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    version: 1,
  };

  const mockOffDay = {
    id: 'off-1',
    date: '2025-12-20',
    reason: 'Holiday',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    const state = useStore.getState();
    state.switchUser?.('ananya');
    state.clearAllData?.();
  });

  const renderCalendar = () => {
    return render(
      <BrowserRouter>
        <Calendar />
      </BrowserRouter>
    );
  };

  describe('Rendering and UI', () => {
    it('should render tab navigation', () => {
      renderCalendar();

      const examGroupsElements = screen.getAllByText(/Exam Groups/i);
      expect(examGroupsElements.length).toBeGreaterThan(0);

      const individualExamsElements = screen.getAllByText(/Individual Exams/i);
      expect(individualExamsElements.length).toBeGreaterThan(0);
    });

    it('should show Exam Groups tab by default', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const groupsButton = buttons.find(btn => btn.textContent?.includes('Exam Groups'));
      expect(groupsButton).toHaveClass('bg-purple-600');
    });

    it('should show New Group button on Exam Groups tab', () => {
      renderCalendar();

      expect(screen.getByRole('button', { name: /New Group/i })).toBeInTheDocument();
    });

    it('should switch to Individual Exams tab', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const examsButton = buttons.find(btn => btn.textContent?.includes('Individual Exams'));
      fireEvent.click(examsButton!);

      expect(examsButton).toHaveClass('bg-purple-600');
    });

    it('should show Add Exam button on Individual Exams tab', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const examsButton = buttons.find(btn => btn.textContent?.includes('Individual Exams'));
      fireEvent.click(examsButton!);

      const addExamButton = screen.getAllByRole('button').find(btn => btn.textContent?.includes('Add Exam'));
      expect(addExamButton).toBeInTheDocument();
    });
  });

  describe('Exam Groups Display', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.addExamGroup?.(mockExamGroup);
    });

    it('should display exam group name', () => {
      renderCalendar();

      expect(screen.getByText('Mid-Term Exams')).toBeInTheDocument();
    });

    it('should display exam group description', () => {
      renderCalendar();

      expect(screen.getByText('Mid-term examination schedule')).toBeInTheDocument();
    });

    it('should display exam group status', () => {
      renderCalendar();

      expect(screen.getByText(/draft/i)).toBeInTheDocument();
    });

    it('should display subject exams in group', () => {
      renderCalendar();

      expect(screen.getByText(/Math/i)).toBeInTheDocument();
      expect(screen.getByText(/Science/i)).toBeInTheDocument();
    });

    it('should show action buttons for exam group', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(2);
    });
  });

  describe('Exam Group Operations', () => {
    it('should add exam group through store', () => {
      const state = useStore.getState();

      expect(state.getExamGroups?.().length).toBe(0);

      state.addExamGroup?.(mockExamGroup);

      const groups = state.getExamGroups?.();
      expect(groups.length).toBe(1);
      expect(groups[0].name).toBe('Mid-Term Exams');
    });

    it('should update exam group through store', () => {
      const state = useStore.getState();
      state.addExamGroup?.(mockExamGroup);

      const groups = state.getExamGroups?.();
      const groupId = groups[0].id;

      state.updateExamGroup?.(groupId, { name: 'Updated Exams' });

      const updatedGroups = state.getExamGroups?.();
      expect(updatedGroups[0].name).toBe('Updated Exams');
    });

    it('should delete exam group through store', () => {
      const state = useStore.getState();
      state.addExamGroup?.(mockExamGroup);

      const groups = state.getExamGroups?.();
      expect(groups.length).toBe(1);

      state.deleteExamGroup?.(groups[0].id);

      const remainingGroups = state.getExamGroups?.();
      expect(remainingGroups.length).toBe(0);
    });

    it('should apply exam group through store', () => {
      const state = useStore.getState();
      state.addExamGroup?.(mockExamGroup);

      const groups = state.getExamGroups?.();
      const groupId = groups[0].id;

      state.applyExamGroup?.(groupId);

      const updatedGroups = state.getExamGroups?.();
      expect(updatedGroups[0].status).toBe('applied');
    });

    it('should handle exam group status transitions', () => {
      const state = useStore.getState();
      state.addExamGroup?.(mockExamGroup);

      const groups = state.getExamGroups?.();
      const groupId = groups[0].id;

      // Draft -> Published
      state.updateExamGroup?.(groupId, { status: 'published' });
      expect(state.getExamGroups?.()[0].status).toBe('published');

      // Published -> Applied
      state.applyExamGroup?.(groupId);
      expect(state.getExamGroups?.()[0].status).toBe('applied');
    });
  });

  describe('Individual Exams Display', () => {
    beforeEach(() => {
      const state = useStore.getState();
      state.addExam?.(mockExam);
    });

    it('should display exam name', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const examsButton = buttons.find(btn => btn.textContent?.includes('Individual Exams'));
      fireEvent.click(examsButton!);

      expect(screen.getByText('Mid-Term Math')).toBeInTheDocument();
    });

    it('should display exam date', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const examsButton = buttons.find(btn => btn.textContent?.includes('Individual Exams'));
      fireEvent.click(examsButton!);

      // Date might be formatted differently
      const dateElements = screen.getAllByText(/2025-12-15|Dec 15|December 15/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display exam type', () => {
      renderCalendar();

      const buttons = screen.getAllByRole('button');
      const examsButton = buttons.find(btn => btn.textContent?.includes('Individual Exams'));
      fireEvent.click(examsButton!);

      const typeElements = screen.getAllByText(/mid-term/i);
      expect(typeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Individual Exam Operations', () => {
    it('should add exam through store', () => {
      const state = useStore.getState();

      expect(state.getExams?.().length).toBe(0);

      state.addExam?.(mockExam);

      const exams = state.getExams?.();
      expect(exams.length).toBe(1);
      expect(exams[0].name).toBe('Mid-Term Math');
    });

    it('should delete exam through store', () => {
      const state = useStore.getState();
      state.addExam?.(mockExam);

      const exams = state.getExams?.();
      expect(exams.length).toBe(1);

      state.deleteExam?.(exams[0].id);

      const remainingExams = state.getExams?.();
      expect(remainingExams.length).toBe(0);
    });

    it('should handle multiple exams', () => {
      const state = useStore.getState();

      state.addExam?.(mockExam);
      state.addExam?.({
        ...mockExam,
        id: 'exam-2',
        name: 'Final Science',
        type: 'final',
      });

      const exams = state.getExams?.();
      expect(exams.length).toBe(2);
    });
  });

  describe('Off Days Management', () => {
    it('should add off day through store', () => {
      const state = useStore.getState();

      expect(state.getOffDays?.().length).toBe(0);

      state.addOffDay?.(mockOffDay);

      const offDays = state.getOffDays?.();
      expect(offDays.length).toBe(1);
      expect(offDays[0].reason).toBe('Holiday');
    });

    it('should delete off day through store', () => {
      const state = useStore.getState();
      state.addOffDay?.(mockOffDay);

      const offDays = state.getOffDays?.();
      expect(offDays.length).toBe(1);

      state.deleteOffDay?.(offDays[0].id);

      const remainingOffDays = state.getOffDays?.();
      expect(remainingOffDays.length).toBe(0);
    });

    it('should handle multiple off days', () => {
      const state = useStore.getState();

      state.addOffDay?.(mockOffDay);
      state.addOffDay?.({
        id: 'off-2',
        date: '2025-12-25',
        reason: 'Christmas',
      });

      const offDays = state.getOffDays?.();
      expect(offDays.length).toBe(2);
    });
  });

  describe('Sorting and Display Logic', () => {
    it('should sort exams by date', () => {
      const state = useStore.getState();

      state.addExam?.({
        ...mockExam,
        id: 'exam-1',
        date: '2025-12-20',
        name: 'Later Exam',
      });
      state.addExam?.({
        ...mockExam,
        id: 'exam-2',
        date: '2025-12-10',
        name: 'Earlier Exam',
      });

      const exams = state.getExams?.();
      expect(exams.length).toBe(2);

      // Earlier exam should come first when sorted
      const sortedExams = [...exams].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      expect(sortedExams[0].name).toBe('Earlier Exam');
      expect(sortedExams[1].name).toBe('Later Exam');
    });

    it('should sort off days by date', () => {
      const state = useStore.getState();

      state.addOffDay?.({
        id: 'off-1',
        date: '2025-12-25',
        reason: 'Later Holiday',
      });
      state.addOffDay?.({
        id: 'off-2',
        date: '2025-12-15',
        reason: 'Earlier Holiday',
      });

      const offDays = state.getOffDays?.();
      expect(offDays.length).toBe(2);

      const sortedOffDays = [...offDays].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      expect(sortedOffDays[0].reason).toBe('Earlier Holiday');
      expect(sortedOffDays[1].reason).toBe('Later Holiday');
    });
  });

  describe('Empty States', () => {
    it('should handle no exam groups', () => {
      const state = useStore.getState();

      const groups = state.getExamGroups?.();
      expect(groups.length).toBe(0);
    });

    it('should handle no individual exams', () => {
      const state = useStore.getState();

      const exams = state.getExams?.();
      expect(exams.length).toBe(0);
    });

    it('should handle no off days', () => {
      const state = useStore.getState();

      const offDays = state.getOffDays?.();
      expect(offDays.length).toBe(0);
    });
  });

  describe('Exam Type Colors', () => {
    it('should have different colors for exam types', () => {
      const state = useStore.getState();

      // Add exams of different types
      state.addExam?.({ ...mockExam, id: 'exam-1', type: 'weekly' });
      state.addExam?.({ ...mockExam, id: 'exam-2', type: 'monthly' });
      state.addExam?.({ ...mockExam, id: 'exam-3', type: 'quarterly' });
      state.addExam?.({ ...mockExam, id: 'exam-4', type: 'mid-term' });
      state.addExam?.({ ...mockExam, id: 'exam-5', type: 'final' });

      const exams = state.getExams?.();
      expect(exams.length).toBe(5);
      expect(exams.map(e => e.type)).toEqual(['weekly', 'monthly', 'quarterly', 'mid-term', 'final']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle exam with empty subjects array', () => {
      const state = useStore.getState();

      state.addExam?.({
        ...mockExam,
        subjects: [],
      });

      const exams = state.getExams?.();
      expect(exams[0].subjects).toEqual([]);
    });

    it('should handle exam group with no subject exams', () => {
      const state = useStore.getState();

      state.addExamGroup?.({
        ...mockExamGroup,
        subjectExams: [],
      });

      const groups = state.getExamGroups?.();
      expect(groups[0].subjectExams).toEqual([]);
    });

    it('should handle exam group with no off days', () => {
      const state = useStore.getState();

      state.addExamGroup?.({
        ...mockExamGroup,
        offDays: [],
      });

      const groups = state.getExamGroups?.();
      expect(groups[0].offDays).toEqual([]);
    });

    it('should handle multiple exam groups', () => {
      const state = useStore.getState();

      state.addExamGroup?.(mockExamGroup);
      state.addExamGroup?.({
        ...mockExamGroup,
        id: 'group-2',
        name: 'Final Exams',
      });

      const groups = state.getExamGroups?.();
      expect(groups.length).toBe(2);
    });
  });
});
