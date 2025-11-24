import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const syncController = {
  // POST /api/sync/push
  // Pushes local data to cloud (full sync)
  async push(req: Request, res: Response) {
    const { userId, data } = req.body;

    if (!userId || !data) {
      return res.status(400).json({ error: 'userId and data are required' });
    }

    try {
      // Use transaction for atomic sync
      const result = await prisma.$transaction(async (tx) => {
        // Sync chapters
        if (data.chapters && Array.isArray(data.chapters)) {
          for (const chapter of data.chapters) {
            await tx.chapter.upsert({
              where: { id: chapter.id },
              update: { ...chapter, userId },
              create: { ...chapter, userId },
            });
          }
        }

        // Sync assignments
        if (data.assignments && Array.isArray(data.assignments)) {
          for (const assignment of data.assignments) {
            await tx.chapterAssignment.upsert({
              where: { id: assignment.id },
              update: { ...assignment, userId },
              create: { ...assignment, userId },
            });
          }
        }

        // Sync sessions
        if (data.sessions && Array.isArray(data.sessions)) {
          for (const session of data.sessions) {
            await tx.activitySession.upsert({
              where: { id: session.sessionId },
              update: {
                ...session,
                userId,
                startTime: new Date(session.startTime),
                endTime: session.endTime ? new Date(session.endTime) : null,
              },
              create: {
                id: session.sessionId,
                ...session,
                userId,
                startTime: new Date(session.startTime),
                endTime: session.endTime ? new Date(session.endTime) : null,
              },
            });
          }
        }

        // Sync study plans
        if (data.studyPlans && Array.isArray(data.studyPlans)) {
          for (const plan of data.studyPlans) {
            await tx.studyPlan.upsert({
              where: { id: plan.id },
              update: { ...plan, userId },
              create: { ...plan, userId },
            });
          }
        }

        // Update sync metadata
        return await tx.syncMetadata.upsert({
          where: { userId },
          update: {
            lastSyncAt: new Date(),
            localVersion: data.version || 1,
            cloudVersion: data.version || 1,
          },
          create: {
            userId,
            lastSyncAt: new Date(),
            localVersion: data.version || 1,
            cloudVersion: data.version || 1,
          },
        });
      });

      res.json({
        success: true,
        syncedAt: result.lastSyncAt,
        version: result.cloudVersion,
      });
    } catch (error) {
      console.error('Sync push error:', error);
      res.status(500).json({
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // GET /api/sync/pull?userId=xxx
  // Pulls cloud data to local (full sync)
  async pull(req: Request, res: Response) {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    try {
      const [chapters, assignments, sessions, studyPlans, syncMeta] = await Promise.all([
        prisma.chapter.findMany({ where: { userId } }),
        prisma.chapterAssignment.findMany({ where: { userId } }),
        prisma.activitySession.findMany({ where: { userId } }),
        prisma.studyPlan.findMany({ where: { userId } }),
        prisma.syncMetadata.findUnique({ where: { userId } }),
      ]);

      res.json({
        chapters,
        assignments,
        sessions,
        studyPlans,
        syncedAt: syncMeta?.lastSyncAt || null,
        version: syncMeta?.cloudVersion || 1,
      });
    } catch (error) {
      console.error('Sync pull error:', error);
      res.status(500).json({
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // GET /api/sync/status?userId=xxx
  async getStatus(req: Request, res: Response) {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const syncMeta = await prisma.syncMetadata.findUnique({
      where: { userId },
    });

    if (!syncMeta) {
      return res.json({
        synced: false,
        lastSyncAt: null,
        version: 0,
      });
    }

    res.json({
      synced: true,
      lastSyncAt: syncMeta.lastSyncAt,
      localVersion: syncMeta.localVersion,
      cloudVersion: syncMeta.cloudVersion,
      needsSync: syncMeta.localVersion !== syncMeta.cloudVersion,
    });
  },
};
