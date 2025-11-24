import { z } from 'zod';

/**
 * Zod validation schema for ChapterAssignment entity
 * Ensures data integrity for assignment scheduling
 */

export const ChapterAssignmentSchema = z.object({
  id: z.string().min(1, 'Assignment ID is required'),
  chapterId: z.string().min(1, 'Chapter ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

  activityType: z.enum(['study', 'revision'], {
    errorMap: () => ({ message: 'Activity type must be either study or revision' }),
  }),

  // Time tracking
  plannedMinutes: z.number()
    .positive('Planned minutes must be positive')
    .max(1440, 'Planned minutes cannot exceed 24 hours'),

  actualMinutes: z.number()
    .nonnegative('Actual minutes cannot be negative')
    .max(2880, 'Actual minutes seems unrealistic (max 48 hours)')
    .optional(),

  // Status
  status: z.enum(['scheduled', 'in-progress', 'paused', 'completed', 'cancelled'])
    .default('scheduled'),

  // Plan association
  planId: z.string().min(1).optional(),
  planName: z.string().optional(),
  originalPlanId: z.string().optional(),

  // Metadata
  createdAt: z.string().datetime(),
  startTime: z.string().datetime().optional(),
  pausedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
}).refine(
  (data) => {
    // If actualMinutes exists, it shouldn't wildly exceed plannedMinutes
    if (data.actualMinutes && data.actualMinutes > data.plannedMinutes * 3) {
      return false;
    }
    return true;
  },
  {
    message: 'Actual time cannot exceed 3x planned time',
    path: ['actualMinutes'],
  }
).refine(
  (data) => {
    // If completed, must have actualMinutes
    if (data.status === 'completed' && !data.actualMinutes) {
      return false;
    }
    return true;
  },
  {
    message: 'Completed assignments must have actual minutes recorded',
    path: ['actualMinutes'],
  }
);

/**
 * Schema for creating new assignments
 */
export const ChapterAssignmentCreateSchema = ChapterAssignmentSchema.omit({
  id: true,
  createdAt: true,
  actualMinutes: true,
  status: true,
  startTime: true,
  pausedAt: true,
  completedAt: true,
  endTime: true,
});

/**
 * Schema for updating assignments
 */
export const ChapterAssignmentUpdateSchema = ChapterAssignmentSchema.partial().required({ id: true });

export type ChapterAssignmentInput = z.infer<typeof ChapterAssignmentCreateSchema>;
export type ChapterAssignmentUpdate = z.infer<typeof ChapterAssignmentUpdateSchema>;
