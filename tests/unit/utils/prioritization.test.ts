import { describe, it, expect } from 'vitest';
import {
  calculateChapterPriority,
  calculateAvailableDays,
  generateDailyPlan,
  getSubjectStats,
  type ChapterWithPriority,
} from '../../../src/utils/prioritization';
import type { Chapter, Exam, OffDay } from '../../../src/types';

describe('Prioritization Utils', () => {
  describe('calculateAvailableDays', () => {
    it('should calculate days correctly when no off days', () => {
      const result = calculateAvailableDays('2025-11-24', '2025-11-30', []);
      expect(result).toBe(7); // 24, 25, 26, 27, 28, 29, 30
    });

    it('should exclude off days from count', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-25', reason: 'Weekend', userId: 'test' },
        { date: '2025-11-26', reason: 'Weekend', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-30', offDays);
      expect(result).toBe(5); // 7 days - 2 off days
    });

    it('should handle same start and end date', () => {
      const result = calculateAvailableDays('2025-11-24', '2025-11-24', []);
      expect(result).toBe(1);
    });

    it('should handle same date with off day', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-24', reason: 'Holiday', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-24', offDays);
      expect(result).toBe(0);
    });

    it('should handle all days being off days', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-24', reason: 'Day 1', userId: 'test' },
        { date: '2025-11-25', reason: 'Day 2', userId: 'test' },
        { date: '2025-11-26', reason: 'Day 3', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-26', offDays);
      expect(result).toBe(0);
    });

    it('should handle consecutive off days in middle of range', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-26', reason: 'Holiday 1', userId: 'test' },
        { date: '2025-11-27', reason: 'Holiday 2', userId: 'test' },
        { date: '2025-11-28', reason: 'Holiday 3', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-30', offDays);
      expect(result).toBe(4); // 7 days - 3 off days
    });

    it('should handle off day at start of range', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-24', reason: 'Start off', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-27', offDays);
      expect(result).toBe(3);
    });

    it('should handle off day at end of range', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-27', reason: 'End off', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-27', offDays);
      expect(result).toBe(3);
    });

    it('should handle multiple scattered off days', () => {
      const offDays: OffDay[] = [
        { date: '2025-11-25', reason: 'Scattered 1', userId: 'test' },
        { date: '2025-11-28', reason: 'Scattered 2', userId: 'test' },
      ];
      const result = calculateAvailableDays('2025-11-24', '2025-11-30', offDays);
      expect(result).toBe(5); // 7 days - 2 off days
    });

    it('should handle week-long range', () => {
      const result = calculateAvailableDays('2025-11-24', '2025-12-01', []);
      expect(result).toBe(8); // Nov 24-30, Dec 1
    });
  });

  describe('calculateChapterPriority', () => {
    const baseChapter: Chapter = {
      id: 'ch1',
      name: 'Test Chapter',
      subject: 'Math',
      estimatedHours: 10,
      studyProgress: 0,
      status: 'not_started',
      createdAt: '2025-11-24T00:00:00Z',
      updatedAt: '2025-11-24T00:00:00Z',
      userId: 'test',
      studyHours: 10,
      revisionHours: 5,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      studyStatus: 'not-done',
      revisionStatus: 'not-done',
      actualStudyHours: 0,
      actualRevisionHours: 0,
    };

    it('should return 0 priority when no relevant exam', () => {
      const chapter: Chapter = { ...baseChapter, subject: 'Math' };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Science'],
          type: 'final',
          name: 'Science Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBe(0);
      expect(result.urgency).toBe(0);
      expect(result.scarcity).toBe(0);
      expect(result.examDate).toBeUndefined();
      expect(result.daysUntilExam).toBeUndefined();
    });

    it('should calculate priority for final exam', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 10 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBeGreaterThan(0);
      expect(result.examDate).toBe('2025-12-15');
      expect(result.daysUntilExam).toBe(21);
    });

    it('should give higher priority to final exams than weekly', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 10 };

      const finalExam: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const weeklyExam: Exam[] = [
        {
          id: 'e2',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'weekly',
          name: 'Math Weekly',
          userId: 'test',
        },
      ];

      const finalResult = calculateChapterPriority(chapter, finalExam, [], '2025-11-24');
      const weeklyResult = calculateChapterPriority(chapter, weeklyExam, [], '2025-11-24');

      expect(finalResult.priority).toBeGreaterThan(weeklyResult.priority);
    });

    it('should calculate urgency correctly for near exam', () => {
      const chapter: Chapter = { ...baseChapter };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-11-27', // 3 days away
          subjects: ['Math'],
          type: 'mid-term',
          name: 'Math Mid-term',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.urgency).toBeGreaterThanOrEqual(0.9); // Very urgent
      expect(result.daysUntilExam).toBe(3);
    });

    it('should calculate urgency correctly for far exam', () => {
      const chapter: Chapter = { ...baseChapter };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2026-02-24', // ~90 days away
          subjects: ['Math'],
          type: 'mid-term',
          name: 'Math Mid-term',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.urgency).toBeLessThan(0.1); // Not urgent
      expect(result.daysUntilExam).toBeGreaterThan(80);
    });

    it('should handle chapter with partial progress', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 10, studyProgress: 5 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      // Priority should be lower than chapter with no progress (less remaining hours)
      expect(result.priority).toBeGreaterThan(0);
    });

    it('should handle chapter with complete progress', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 10, studyProgress: 10 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBe(0); // No remaining hours
    });

    it('should select nearest exam when multiple exams exist', () => {
      const chapter: Chapter = { ...baseChapter };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
        {
          id: 'e2',
          date: '2025-11-28', // Nearer exam
          subjects: ['Math'],
          type: 'mid-term',
          name: 'Math Mid-term',
          userId: 'test',
        },
        {
          id: 'e3',
          date: '2026-01-15',
          subjects: ['Math'],
          type: 'quarterly',
          name: 'Math Quarterly',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.examDate).toBe('2025-11-28'); // Should pick nearest exam
      expect(result.daysUntilExam).toBe(4);
    });

    it('should account for off days in scarcity calculation', () => {
      const chapter: Chapter = { ...baseChapter };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];
      const offDays: OffDay[] = [
        { date: '2025-11-25', reason: 'Holiday 1', userId: 'test' },
        { date: '2025-11-26', reason: 'Holiday 2', userId: 'test' },
        { date: '2025-11-27', reason: 'Holiday 3', userId: 'test' },
        { date: '2025-11-28', reason: 'Holiday 4', userId: 'test' },
        { date: '2025-11-29', reason: 'Holiday 5', userId: 'test' },
      ];

      const withOffDays = calculateChapterPriority(chapter, exams, offDays, '2025-11-24');
      const withoutOffDays = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      // More off days = higher scarcity = higher priority
      expect(withOffDays.scarcity).toBeGreaterThan(withoutOffDays.scarcity);
      expect(withOffDays.priority).toBeGreaterThan(withoutOffDays.priority);
    });

    it('should calculate priority with mid-term exam type', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 8 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-10',
          subjects: ['Math'],
          type: 'mid-term',
          name: 'Math Mid-term',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBeGreaterThan(0);
      expect(result.examDate).toBe('2025-12-10');
    });

    it('should calculate priority with quarterly exam type', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 6 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-08',
          subjects: ['Math'],
          type: 'quarterly',
          name: 'Math Quarterly',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBeGreaterThan(0);
      expect(result.examDate).toBe('2025-12-08');
    });

    it('should calculate priority with monthly exam type', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 4 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-05',
          subjects: ['Math'],
          type: 'monthly',
          name: 'Math Monthly',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.priority).toBeGreaterThan(0);
      expect(result.examDate).toBe('2025-12-05');
    });

    it('should handle chapters with high estimated hours', () => {
      const chapter: Chapter = { ...baseChapter, estimatedHours: 50 };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      // High estimated hours should result in high priority
      expect(result.priority).toBeGreaterThan(0);
    });

    it('should include all original chapter fields in result', () => {
      const chapter: Chapter = { ...baseChapter, name: 'Algebra Basics' };
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = calculateChapterPriority(chapter, exams, [], '2025-11-24');

      expect(result.id).toBe(chapter.id);
      expect(result.name).toBe('Algebra Basics');
      expect(result.subject).toBe(chapter.subject);
      expect(result.estimatedHours).toBe(chapter.estimatedHours);
    });
  });

  describe('generateDailyPlan', () => {
    const baseChapter: Chapter = {
      id: 'ch1',
      name: 'Test Chapter',
      subject: 'Math',
      estimatedHours: 10,
      studyProgress: 0,
      status: 'not_started',
      createdAt: '2025-11-24T00:00:00Z',
      updatedAt: '2025-11-24T00:00:00Z',
      userId: 'test',
      studyHours: 10,
      revisionHours: 5,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      studyStatus: 'not-done',
      revisionStatus: 'not-done',
      actualStudyHours: 0,
      actualRevisionHours: 0,
    };

    it('should return empty array on off day', () => {
      const chapters: Chapter[] = [baseChapter];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];
      const offDays: OffDay[] = [
        { date: '2025-11-24', reason: 'Weekend', userId: 'test' },
      ];

      const result = generateDailyPlan(chapters, exams, offDays, '2025-11-24', 3, 45);

      expect(result).toEqual([]);
    });

    it('should generate tasks for normal day', () => {
      const chapters: Chapter[] = [baseChapter];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].subject).toBe('Math');
      expect(result[0].status).toBe('pending');
      expect(result[0].date).toBe('2025-11-24');
    });

    it('should respect daily hours limit', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', estimatedHours: 20 },
        { ...baseChapter, id: 'ch2', subject: 'Science', estimatedHours: 20 },
        { ...baseChapter, id: 'ch3', subject: 'English', estimatedHours: 20 },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math', 'Science', 'English'],
          type: 'final',
          name: 'Final Exams',
          userId: 'test',
        },
      ];

      const dailyHours = 3;
      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', dailyHours, 45);

      const totalMinutes = result.reduce((sum, task) => sum + task.allocatedMinutes, 0);
      expect(totalMinutes).toBeLessThanOrEqual(dailyHours * 60);
    });

    it('should allocate maximum 2 sessions per subject per day', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', estimatedHours: 50 }, // Lots of remaining hours
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const sessionMinutes = 45;
      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 8, sessionMinutes);

      const mathTasks = result.filter(t => t.subject === 'Math');
      if (mathTasks.length > 0) {
        const maxAllocated = Math.max(...mathTasks.map(t => t.allocatedMinutes));
        expect(maxAllocated).toBeLessThanOrEqual(sessionMinutes * 2);
      }
    });

    it('should skip completed chapters', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', status: 'complete' },
        { ...baseChapter, id: 'ch2', subject: 'Science', status: 'not_started' },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math', 'Science'],
          type: 'final',
          name: 'Final Exams',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      const mathTasks = result.filter(t => t.subject === 'Math');
      expect(mathTasks.length).toBe(0);
    });

    it('should only allocate tasks with minimum half session', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', estimatedHours: 0.2 }, // Only 12 minutes remaining
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const sessionMinutes = 45;
      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, sessionMinutes);

      // 12 minutes is less than half session (22.5 minutes), should not be allocated
      expect(result.length).toBe(0);
    });

    it('should prioritize chapters by calculated priority', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10 },
        { ...baseChapter, id: 'ch2', subject: 'Science', estimatedHours: 10 },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-11-27', // Near exam for Math
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
        {
          id: 'e2',
          date: '2026-01-15', // Far exam for Science
          subjects: ['Science'],
          type: 'weekly',
          name: 'Science Weekly',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 2, 45);

      if (result.length > 0) {
        // Math should come first due to nearer exam and higher weight
        expect(result[0].subject).toBe('Math');
      }
    });

    it('should handle empty chapters array', () => {
      const result = generateDailyPlan([], [], [], '2025-11-24', 3, 45);

      expect(result).toEqual([]);
    });

    it('should handle chapters with no matching exams', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math' },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Science'], // No Math exam
          type: 'final',
          name: 'Science Final',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      // Math chapter has no exam, so priority = 0, but can still be allocated
      // (implementation allows studying even without upcoming exams)
      if (result.length > 0) {
        expect(result[0].priority).toBe(0);
      }
    });

    it('should allocate remaining chapter minutes correctly', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', estimatedHours: 1, studyProgress: 0.5 }, // 30 minutes remaining
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      if (result.length > 0) {
        expect(result[0].allocatedMinutes).toBeLessThanOrEqual(30); // Can't exceed remaining
      }
    });

    it('should set unique task IDs', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10 },
        { ...baseChapter, id: 'ch2', subject: 'Science', estimatedHours: 10 },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math', 'Science'],
          type: 'final',
          name: 'Final Exams',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      const taskIds = result.map(t => t.id);
      const uniqueIds = new Set(taskIds);
      expect(uniqueIds.size).toBe(taskIds.length); // All IDs should be unique
    });

    it('should include chapter name in tasks', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', name: 'Algebra Basics', estimatedHours: 10 },
      ];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      if (result.length > 0) {
        expect(result[0].chapterName).toBe('Algebra Basics');
        expect(result[0].chapterId).toBe('ch1');
      }
    });

    it('should include priority in tasks', () => {
      const chapters: Chapter[] = [baseChapter];
      const exams: Exam[] = [
        {
          id: 'e1',
          date: '2025-12-15',
          subjects: ['Math'],
          type: 'final',
          name: 'Math Final',
          userId: 'test',
        },
      ];

      const result = generateDailyPlan(chapters, exams, [], '2025-11-24', 3, 45);

      if (result.length > 0) {
        expect(result[0].priority).toBeDefined();
        expect(typeof result[0].priority).toBe('number');
      }
    });
  });

  describe('getSubjectStats', () => {
    const baseChapter: Chapter = {
      id: 'ch1',
      name: 'Test Chapter',
      subject: 'Math',
      estimatedHours: 10,
      studyProgress: 0,
      status: 'not_started',
      createdAt: '2025-11-24T00:00:00Z',
      updatedAt: '2025-11-24T00:00:00Z',
      userId: 'test',
      studyHours: 10,
      revisionHours: 5,
      completedStudyHours: 0,
      completedRevisionHours: 0,
      studyStatus: 'not-done',
      revisionStatus: 'not-done',
      actualStudyHours: 0,
      actualRevisionHours: 0,
    };

    it('should return empty map for empty chapters array', () => {
      const result = getSubjectStats([]);

      expect(result.size).toBe(0);
    });

    it('should calculate stats for single subject', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1' },
      ];

      const result = getSubjectStats(chapters);

      expect(result.size).toBe(1);
      expect(result.has('Math')).toBe(true);

      const mathStats = result.get('Math')!;
      expect(mathStats.total).toBe(1);
      expect(mathStats.totalHours).toBe(10);
      expect(mathStats.completedHours).toBe(0);
    });

    it('should calculate stats for multiple subjects', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math' },
        { ...baseChapter, id: 'ch2', subject: 'Science' },
        { ...baseChapter, id: 'ch3', subject: 'English' },
      ];

      const result = getSubjectStats(chapters);

      expect(result.size).toBe(3);
      expect(result.has('Math')).toBe(true);
      expect(result.has('Science')).toBe(true);
      expect(result.has('English')).toBe(true);
    });

    it('should aggregate multiple chapters for same subject', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10 },
        { ...baseChapter, id: 'ch2', subject: 'Math', estimatedHours: 8 },
        { ...baseChapter, id: 'ch3', subject: 'Math', estimatedHours: 12 },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.total).toBe(3);
      expect(mathStats.totalHours).toBe(30); // 10 + 8 + 12
    });

    it('should count completed chapters', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', status: 'complete' },
        { ...baseChapter, id: 'ch2', subject: 'Math', status: 'complete' },
        { ...baseChapter, id: 'ch3', subject: 'Math', status: 'not_started' },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.total).toBe(3);
      expect(mathStats.completed).toBe(2);
    });

    it('should count in-progress chapters', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', status: 'in_progress' },
        { ...baseChapter, id: 'ch2', subject: 'Math', status: 'in_progress' },
        { ...baseChapter, id: 'ch3', subject: 'Math', status: 'complete' },
        { ...baseChapter, id: 'ch4', subject: 'Math', status: 'not_started' },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.total).toBe(4);
      expect(mathStats.inProgress).toBe(2);
      expect(mathStats.completed).toBe(1);
    });

    it('should calculate total hours correctly', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 5 },
        { ...baseChapter, id: 'ch2', subject: 'Math', estimatedHours: 7 },
        { ...baseChapter, id: 'ch3', subject: 'Math', estimatedHours: 3 },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.totalHours).toBe(15);
    });

    it('should calculate completed hours correctly', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10, studyProgress: 5 },
        { ...baseChapter, id: 'ch2', subject: 'Math', estimatedHours: 8, studyProgress: 3 },
        { ...baseChapter, id: 'ch3', subject: 'Math', estimatedHours: 6, studyProgress: 6 },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.completedHours).toBe(14); // 5 + 3 + 6
    });

    it('should handle chapters with undefined studyProgress', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10, studyProgress: undefined },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.completedHours).toBe(0);
    });

    it('should handle mixed subject stats', () => {
      const chapters: Chapter[] = [
        { ...baseChapter, id: 'ch1', subject: 'Math', estimatedHours: 10, studyProgress: 5, status: 'in_progress' },
        { ...baseChapter, id: 'ch2', subject: 'Math', estimatedHours: 8, studyProgress: 8, status: 'complete' },
        { ...baseChapter, id: 'ch3', subject: 'Science', estimatedHours: 12, studyProgress: 0, status: 'not_started' },
        { ...baseChapter, id: 'ch4', subject: 'Science', estimatedHours: 6, studyProgress: 3, status: 'in_progress' },
      ];

      const result = getSubjectStats(chapters);

      const mathStats = result.get('Math')!;
      expect(mathStats.total).toBe(2);
      expect(mathStats.totalHours).toBe(18);
      expect(mathStats.completedHours).toBe(13);
      expect(mathStats.completed).toBe(1);
      expect(mathStats.inProgress).toBe(1);

      const scienceStats = result.get('Science')!;
      expect(scienceStats.total).toBe(2);
      expect(scienceStats.totalHours).toBe(18);
      expect(scienceStats.completedHours).toBe(3);
      expect(scienceStats.completed).toBe(0);
      expect(scienceStats.inProgress).toBe(1);
    });
  });
});
