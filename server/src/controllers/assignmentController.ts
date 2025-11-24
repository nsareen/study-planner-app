import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { ChapterAssignmentCreateSchema } from '../../../src/schemas/assignment.schema.js';

export const assignmentController = {
  // GET /api/assignments?userId=xxx&date=2025-11-24
  async getAll(req: Request, res: Response) {
    const { userId, date, planId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const where: any = { userId };
    if (date && typeof date === 'string') {
      where.date = date;
    }
    if (planId && typeof planId === 'string') {
      where.planId = planId;
    }

    const assignments = await prisma.chapterAssignment.findMany({
      where,
      include: {
        chapter: true,
        plan: true,
      },
      orderBy: { date: 'asc' },
    });

    res.json(assignments);
  },

  // GET /api/assignments/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const assignment = await prisma.chapterAssignment.findUnique({
      where: { id },
      include: {
        chapter: true,
        plan: true,
        sessions: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  },

  // POST /api/assignments
  async create(req: Request, res: Response) {
    const validatedData = ChapterAssignmentCreateSchema.parse(req.body);

    const assignment = await prisma.chapterAssignment.create({
      data: {
        ...validatedData,
        userId: req.body.userId,
      },
      include: {
        chapter: true,
      },
    });

    res.status(201).json(assignment);
  },

  // PATCH /api/assignments/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;

    const assignment = await prisma.chapterAssignment.update({
      where: { id },
      data: req.body,
      include: {
        chapter: true,
      },
    });

    res.json(assignment);
  },

  // DELETE /api/assignments/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    // Delete related sessions
    await prisma.activitySession.deleteMany({
      where: { assignmentId: id },
    });

    await prisma.chapterAssignment.delete({
      where: { id },
    });

    res.status(204).send();
  },

  // GET /api/assignments/date-range?userId=xxx&startDate=xxx&endDate=xxx
  async getByDateRange(req: Request, res: Response) {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'userId, startDate, and endDate are required'
      });
    }

    const assignments = await prisma.chapterAssignment.findMany({
      where: {
        userId: userId as string,
        date: {
          gte: startDate as string,
          lte: endDate as string,
        },
      },
      include: {
        chapter: true,
      },
      orderBy: { date: 'asc' },
    });

    res.json(assignments);
  },
};
