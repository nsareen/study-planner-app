import { z } from 'zod';

/**
 * Zod validation schema for ActivitySession entity
 * Ensures data integrity for study session tracking
 */

const PausedIntervalSchema = z.object({
  pausedAt: z.string().datetime(),
  resumedAt: z.string().datetime().optional(),
  duration: z.number().nonnegative().optional(),
});

export const ActivitySessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  chapterId: z.string().min(1, 'Chapter ID is required'),

  // Time tracking
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  duration: z.number()
    .nonnegative('Duration cannot be negative')
    .max(1440, 'Duration cannot exceed 24 hours')
    .default(0),

  // Pause tracking
  pausedIntervals: z.array(PausedIntervalSchema).default([]),

  // Status
  isActive: z.boolean().default(false),

  // Scheduling
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
}).refine(
  (data) => {
    // If endTime exists, session should not be active
    if (data.endTime && data.isActive) {
      return false;
    }
    return true;
  },
  {
    message: 'Completed sessions cannot be active',
    path: ['isActive'],
  }
).refine(
  (data) => {
    // If session is active, should not have endTime
    if (data.isActive && data.endTime) {
      return false;
    }
    return true;
  },
  {
    message: 'Active sessions cannot have an end time',
    path: ['endTime'],
  }
).refine(
  (data) => {
    // Check for unresumed pause intervals when active
    if (data.isActive && data.pausedIntervals.length > 0) {
      const lastInterval = data.pausedIntervals[data.pausedIntervals.length - 1];
      if (!lastInterval.resumedAt) {
        return false; // Has unresumed pause but marked as active
      }
    }
    return true;
  },
  {
    message: 'Active sessions cannot have unresumed pause intervals',
    path: ['pausedIntervals'],
  }
);

/**
 * Schema for creating new sessions
 */
export const ActivitySessionCreateSchema = ActivitySessionSchema.omit({
  sessionId: true,
  endTime: true,
  duration: true,
  pausedIntervals: true,
});

/**
 * Schema for updating sessions
 */
export const ActivitySessionUpdateSchema = ActivitySessionSchema.partial().required({ sessionId: true });

export type ActivitySessionInput = z.infer<typeof ActivitySessionCreateSchema>;
export type ActivitySessionUpdate = z.infer<typeof ActivitySessionUpdateSchema>;
