import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export class BadgeController {
  async listBadges(_req: Request, res: Response): Promise<void> {
    const badges = await prisma.badge.findMany({
      orderBy: { thresholdPoints: 'asc' },
      select: {
        id: true,
        name: true,
        title: true,
        description: true,
        icon: true,
        thresholdPoints: true,
        _count: {
          select: { userBadges: true },
        },
      },
    });

    res.json(badges);
  }

  async getLeaderboard(req: Request, res: Response): Promise<void> {
    const { limit = '10' } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));

    const leaders = await prisma.user.findMany({
      take: limitNum,
      orderBy: { reputationScore: 'desc' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        academicCourse: true,
        reputationScore: true,
        role: true,
        badges: {
          include: { badge: true },
        },
        _count: {
          select: {
            items: { where: { status: 'RETURNED' } },
            hints: { where: { isHelpful: true } },
          },
        },
      },
    });

    const formattedLeaders = leaders.map((user, index) => ({
      rank: index + 1,
      ...user,
      returnedItemsCount: user._count.items,
      helpfulHintsCount: user._count.hints,
    }));

    res.json(formattedLeaders);
  }
}
