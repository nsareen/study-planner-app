import { z } from 'zod';

/**
 * Zod validation schema for Chapter entity
 * Ensures data integrity for chapter creation and updates
 */

export const ChapterSchema = z.object({
  id: z.string().min(1, 'Chapter ID is required'),
  subject: z.string().min(1, 'Subject name is required').max(100, 'Subject name too long'),
  name: z.string().min(1, 'Chapter name is required').max(200, 'Chapter name too long'),

  // Study phase hours
  studyHours: z.number()
    .positive('Study hours must be positive')
    .max(500, 'Study hours seems unrealistic')
    .default(0),

  completedStudyHours: z.number()
    .nonnegative('Completed hours cannot be negative')
    .default(0),

  actualStudyHours: z.number()
    .nonnegative('Actual hours cannot be negative')
    .default(0),

  // Revision phase hours
  revisionHours: z.number()
    .nonnegative('Revision hours cannot be negative')
    .max(500, 'Revision hours seems unrealistic')
    .default(0),

  completedRevisionHours: z.number()
    .nonnegative('Completed revision hours cannot be negative')
    .default(0),

  actualRevisionHours: z.number()
    .nonnegative('Actual revision hours cannot be negative')
    .default(0),

  // Status tracking
  studyStatus: z.enum(['not-done', 'in-progress', 'done']).default('not-done'),
  revisionStatus: z.enum(['not-done', 'in-progress', 'done']).default('not-done'),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastStudiedAt: z.string().datetime().optional(),
  lastRevisedAt: z.string().datetime().optional(),

  // Optional fields
  description: z.string().max(1000).optional(),
  priority: z.number().min(0).max(1).optional(),
}).refine(
  (data) => data.completedStudyHours <= data.studyHours * 1.5,
  {
    message: 'Completed study hours cannot exceed 150% of planned hours',
    path: ['completedStudyHours'],
  }
).refine(
  (data) => data.completedRevisionHours <= data.revisionHours * 1.5,
  {
    message: 'Completed revision hours cannot exceed 150% of planned hours',
    path: ['completedRevisionHours'],
  }
);

/**
 * Partial schema for chapter updates (all fields optional except id)
 */
export const ChapterUpdateSchema = ChapterSchema.partial().required({ id: true });

/**
 * Schema for creating new chapters (without id and timestamps)
 */
export const ChapterCreateSchema = ChapterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedStudyHours: true,
  actualStudyHours: true,
  completedRevisionHours: true,
  actualRevisionHours: true,
});

export type ChapterInput = z.infer<typeof ChapterCreateSchema>;
export type ChapterUpdate = z.infer<typeof ChapterUpdateSchema>;
