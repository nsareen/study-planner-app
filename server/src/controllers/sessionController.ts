import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { ActivitySessionCreateSchema } from '../../../src/schemas/session.schema.js';

export const sessionController = {
  // GET /api/sessions?userId=xxx&date=2025-11-24
  async getAll(req: Request, res: Response) {
    const { userId, date, assignmentId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const where: any = { userId };
    if (date && typeof date === 'string') {
      where.date = date;
    }
    if (assignmentId && typeof assignmentId === 'string') {
      where.assignmentId = assignmentId;
    }

    const sessions = await prisma.activitySession.findMany({
      where,
      include: {
        assignment: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    res.json(sessions);
  },

  // GET /api/sessions/active?userId=xxx
  async getActive(req: Request, res: Response) {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const activeSession = await prisma.activitySession.findFirst({
      where: {
        userId: userId as string,
        isActive: true,
      },
      include: {
        assignment: {
          include: {
            chapter: true,
          },
        },
      },
    });

    res.json(activeSession || null);
  },

  // POST /api/sessions
  async create(req: Request, res: Response) {
    const validatedData = ActivitySessionCreateSchema.parse(req.body);

    // Auto-pause any existing active session for this user
    await prisma.activitySession.updateMany({
      where: {
        userId: req.body.userId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const session = await prisma.activitySession.create({
      data: {
        ...validatedData,
        userId: req.body.userId,
        startTime: new Date(),
      },
      include: {
        assignment: {
          include: {
            chapter: true,
          },
        },
      },
    });

    res.status(201).json(session);
  },

  // PATCH /api/sessions/:id/pause
  async pause(req: Request, res: Response) {
    const { id } = req.params;

    const session = await prisma.activitySession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const pausedIntervals = session.pausedIntervals as Array<{
      pausedAt: string;
      resumedAt?: string;
      duration?: number;
    }>;

    pausedIntervals.push({
      pausedAt: new Date().toISOString(),
    });

    const updatedSession = await prisma.activitySession.update({
      where: { id },
      data: {
        isActive: false,
        pausedIntervals,
      },
    });

    res.json(updatedSession);
  },

  // PATCH /api/sessions/:id/resume
  async resume(req: Request, res: Response) {
    const { id } = req.params;

    const session = await prisma.activitySession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const pausedIntervals = session.pausedIntervals as Array<{
      pausedAt: string;
      resumedAt?: string;
      duration?: number;
    }>;

    const lastInterval = pausedIntervals[pausedIntervals.length - 1];
    if (lastInterval && !lastInterval.resumedAt) {
      const resumedAt = new Date().toISOString();
      const pausedAt = new Date(lastInterval.pausedAt);
      const duration = new Date(resumedAt).getTime() - pausedAt.getTime();

      lastInterval.resumedAt = resumedAt;
      lastInterval.duration = duration;
    }

    const updatedSession = await prisma.activitySession.update({
      where: { id },
      data: {
        isActive: true,
        pausedIntervals,
      },
    });

    res.json(updatedSession);
  },

  // PATCH /api/sessions/:id/complete
  async complete(req: Request, res: Response) {
    const { id } = req.params;

    const session = await prisma.activitySession.findUnique({
      where: { id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    let duration = endTime.getTime() - startTime.getTime();

    // Subtract paused intervals
    const pausedIntervals = session.pausedIntervals as Array<{
      pausedAt: string;
      resumedAt?: string;
      duration?: number;
    }>;

    for (const interval of pausedIntervals) {
      if (interval.duration) {
        duration -= interval.duration;
      }
    }

    const updatedSession = await prisma.activitySession.update({
      where: { id },
      data: {
        endTime,
        duration: Math.round(duration / 60000), // Convert to minutes
        isActive: false,
      },
    });

    // Update assignment actual minutes
    await prisma.chapterAssignment.update({
      where: { id: session.assignmentId },
      data: {
        actualMinutes: {
          increment: updatedSession.duration,
        },
        status: 'completed',
      },
    });

    res.json(updatedSession);
  },
};
