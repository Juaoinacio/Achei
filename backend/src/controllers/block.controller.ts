import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class BlockController {
  async listAll(_req: Request, res: Response): Promise<void> {
    const blocks = await prisma.campusBlock.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        campus: true,
        _count: {
          select: {
            items: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    res.json(blocks);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    const block = await prisma.campusBlock.findUnique({
      where: { id },
      include: {
        items: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!block) {
      throw new AppError('Bloco não encontrado.', 404);
    }

    res.json(block);
  }
}
