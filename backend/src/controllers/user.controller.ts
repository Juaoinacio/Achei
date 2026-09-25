import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  academicCourse: z.string().nullable().optional(),
  academicPeriod: z.number().int().min(1).max(12).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  banerUrl: z.string().url().nullable().optional(),
  frequentedBlockIds: z.array(z.string()).optional(),
});

export class UserController {
  async getMyProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        academicCourse: true,
        academicPeriod: true,
        avatarUrl: true,
        banerUrl: true,
        isVerified: true,
        reputationScore: true,
        createdAt: true,
        frequentedBlocks: {
          select: { id: true, name: true, campus: true },
        },
        badges: {
          include: { badge: true },
        },
        _count: {
          select: {
            items: true,
            hints: true,
            savedItems: true,
            notifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    res.json(user);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = updateProfileSchema.parse(req.body);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.academicCourse !== undefined) updateData.academicCourse = data.academicCourse;
    if (data.academicPeriod !== undefined) updateData.academicPeriod = data.academicPeriod;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.banerUrl !== undefined) updateData.banerUrl = data.banerUrl;

    if (data.frequentedBlockIds !== undefined) {
      updateData.frequentedBlocks = {
        set: data.frequentedBlockIds.map((id) => ({ id })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        academicCourse: true,
        academicPeriod: true,
        avatarUrl: true,
        banerUrl: true,
        isVerified: true,
        reputationScore: true,
        frequentedBlocks: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: updatedUser,
    });
  }

  async getPublicProfile(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        academicCourse: true,
        academicPeriod: true,
        avatarUrl: true,
        banerUrl: true,
        reputationScore: true,
        createdAt: true,
        badges: {
          include: { badge: true },
        },
        items: {
          where: { status: 'ACTIVE' },
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            block: true,
          },
        },
        _count: {
          select: {
            items: true,
            hints: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    res.json(user);
  }

  async getMyItems(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const { status } = req.query;

    const items = await prisma.item.findMany({
      where: {
        authorId: userId,
        status: status ? (status as any) : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        block: true,
        _count: {
          select: { hints: true, likes: true, claims: true },
        },
      },
    });

    res.json(items);
  }

  async getMySavedItems(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    const saved = await prisma.savedItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          include: {
            category: true,
            block: true,
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
            _count: {
              select: { hints: true, likes: true },
            },
          },
        },
      },
    });

    res.json(saved.map((s) => s.item));
  }
}
