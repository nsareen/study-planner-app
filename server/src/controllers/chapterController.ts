import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { ChapterCreateSchema, ChapterUpdateSchema } from '../../../src/schemas/chapter.schema.js';

export const chapterController = {
  // GET /api/chapters?userId=xxx
  async getAll(req: Request, res: Response) {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const chapters = await prisma.chapter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(chapters);
  },

  // GET /api/chapters/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        assignments: true,
        sessions: true,
      },
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(chapter);
  },

  // POST /api/chapters
  async create(req: Request, res: Response) {
    const validatedData = ChapterCreateSchema.parse(req.body);

    const chapter = await prisma.chapter.create({
      data: {
        ...validatedData,
        userId: req.body.userId, // userId comes from auth middleware in production
      },
    });

    res.status(201).json(chapter);
  },

  // PATCH /api/chapters/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const validatedData = ChapterUpdateSchema.parse({ ...req.body, id });

    const chapter = await prisma.chapter.update({
      where: { id },
      data: validatedData,
    });

    res.json(chapter);
  },

  // DELETE /api/chapters/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    // Delete related records first (cascade delete)
    await prisma.activitySession.deleteMany({
      where: { chapterId: id },
    });

    await prisma.chapterAssignment.deleteMany({
      where: { chapterId: id },
    });

    await prisma.chapter.delete({
      where: { id },
    });

    res.status(204).send();
  },

  // GET /api/chapters/stats/:userId
  async getStats(req: Request, res: Response) {
    const { userId } = req.params;

    const stats = await prisma.chapter.groupBy({
      by: ['studyStatus'],
      where: { userId },
      _count: true,
    });

    const totalHours = await prisma.chapter.aggregate({
      where: { userId },
      _sum: {
        studyHours: true,
        completedStudyHours: true,
        actualStudyHours: true,
      },
    });

    res.json({ stats, totalHours });
  },
};
