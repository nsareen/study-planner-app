import { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const userController = {
  // GET /api/users
  async getAll(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        grade: true,
        streak: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });

    res.json(users);
  },

  // GET /api/users/:id
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        grade: true,
        streak: true,
        level: true,
        xp: true,
        totalStudyHours: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  },

  // POST /api/users
  async create(req: Request, res: Response) {
    const { name, email, avatar, grade } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        avatar: avatar || '👤',
        grade: grade || '9',
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        grade: true,
        streak: true,
        level: true,
        xp: true,
      },
    });

    res.status(201).json(user);
  },

  // PATCH /api/users/:id
  async update(req: Request, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        grade: true,
        streak: true,
        level: true,
        xp: true,
        totalStudyHours: true,
        settings: true,
      },
    });

    res.json(user);
  },

  // GET /api/users/:id/stats
  async getStats(req: Request, res: Response) {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        totalStudyHours: true,
        streak: true,
        level: true,
        xp: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get chapter stats
    const chapterStats = await prisma.chapter.groupBy({
      by: ['studyStatus'],
      where: { userId: id },
      _count: true,
    });

    // Get session stats for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sessionStats = await prisma.activitySession.aggregate({
      where: {
        userId: id,
        startTime: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        duration: true,
      },
      _count: true,
    });

    res.json({
      user,
      chapters: chapterStats,
      currentMonth: {
        sessions: sessionStats._count,
        minutesStudied: sessionStats._sum.duration || 0,
      },
    });
  },
};
