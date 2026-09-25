import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class CategoryController {
  async listAll(_req: Request, res: Response): Promise<void> {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        iconName: true,
        _count: {
          select: {
            items: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    res.json(categories);
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        items: {
          where: { status: 'ACTIVE' },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            block: true,
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

    if (!category) {
      throw new AppError('Categoria não encontrada.', 404);
    }

    res.json(category);
  }
}
