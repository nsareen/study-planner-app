import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const studyPlanController = {
  // GET /api/study-plans?userId=xxx
  async getAll(req: Request, res: Response) {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      include: {
        assignments: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(plans);
  },

  // GET /api/study-plans/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const plan = await prisma.studyPlan.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            chapter: true,
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }

    res.json(plan);
  },

  // POST /api/study-plans
  async create(req: Request, res: Response) {
    const { name, userId, status } = req.body;

    const plan = await prisma.studyPlan.create({
      data: {
        name,
        userId,
        status: status || 'draft',
      },
    });

    res.status(201).json(plan);
  },

  // PATCH /api/study-plans/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;

    const plan = await prisma.studyPlan.update({
      where: { id },
      data: req.body,
    });

    res.json(plan);
  },

  // DELETE /api/study-plans/:id
  async delete(req: Request, res: Response) {
    const { id } = req.params;

    // Remove plan reference from assignments
    await prisma.chapterAssignment.updateMany({
      where: { planId: id },
      data: { planId: null },
    });

    await prisma.studyPlan.delete({
      where: { id },
    });

    res.status(204).send();
  },

  // POST /api/study-plans/:id/activate
  async activate(req: Request, res: Response) {
    const { id } = req.params;
    const { userId } = req.body;

    // Deactivate all other plans for this user
    await prisma.studyPlan.updateMany({
      where: {
        userId,
        status: 'active',
      },
      data: {
        status: 'draft',
      },
    });

    // Activate this plan
    const plan = await prisma.studyPlan.update({
      where: { id },
      data: {
        status: 'active',
      },
    });

    res.json(plan);
  },
};
