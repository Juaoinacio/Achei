import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { ItemType, ItemStatus } from '@prisma/client';

const createItemSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.'),
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres.'),
  type: z.nativeEnum(ItemType, { message: 'Tipo inválido. Deve ser LOST ou FOUND.' }),
  categoryId: z.string().uuid('ID de categoria inválido.'),
  blockId: z.string().uuid('ID de bloco inválido.'),
  specificLocation: z.string().nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  photoUrl: z.string().url('URL da foto inválida.').nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  hasReward: z.boolean().optional(),
  isUnderStaffCustody: z.boolean().optional(),
  custodyLocation: z.string().nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
});

const updateItemSchema = z.object({
  title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres.').optional(),
  description: z.string().min(3, 'A descrição deve ter no mínimo 3 caracteres.').optional(),
  categoryId: z.string().uuid('ID de categoria inválido.').optional(),
  blockId: z.string().uuid('ID de bloco inválido.').optional(),
  specificLocation: z.string().nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  photoUrl: z.string().url('URL da foto inválida.').nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  hasReward: z.boolean().optional(),
  isUnderStaffCustody: z.boolean().optional(),
  custodyLocation: z.string().nullable().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
  status: z.nativeEnum(ItemStatus).optional(),
});

export class ItemController {
  async listFeed(req: Request, res: Response): Promise<void> {
    const {
      type,
      blockId,
      categoryId,
      categorySlug,
      q,
      isCustody,
      hasReward,
      status,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as ItemStatus;
    } else if (status === undefined) {
      where.status = ItemStatus.ACTIVE;
    }

    if (type && (type === ItemType.LOST || type === ItemType.FOUND)) {
      where.type = type;
    }

    if (blockId) {
      where.blockId = blockId as string;
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    } else if (categorySlug) {
      where.category = { slug: categorySlug as string };
    }

    if (isCustody !== undefined) {
      where.isUnderStaffCustody = isCustody === 'true';
    }

    if (hasReward !== undefined) {
      where.hasReward = hasReward === 'true';
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { specificLocation: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          block: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
            },
          },
          _count: {
            select: {
              hints: true,
              likes: true,
              claims: true,
            },
          },
        },
      }),
    ]);

    // Check if user has liked or saved items if token provided
    let userLikes = new Set<string>();
    let userSaves = new Set<string>();

    if (req.user) {
      const itemIds = items.map((i) => i.id);
      const [likes, saves] = await Promise.all([
        prisma.itemLike.findMany({
          where: { userId: req.user.id, itemId: { in: itemIds } },
          select: { itemId: true },
        }),
        prisma.savedItem.findMany({
          where: { userId: req.user.id, itemId: { in: itemIds } },
          select: { itemId: true },
        }),
      ]);

      userLikes = new Set(likes.map((l) => l.itemId));
      userSaves = new Set(saves.map((s) => s.itemId));
    }

    const formattedItems = items.map((item) => ({
      ...item,
      isLiked: userLikes.has(item.id),
      isSaved: userSaves.has(item.id),
    }));

    res.json({
      data: formattedItems,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        block: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            academicCourse: true,
            avatarUrl: true,
            role: true,
            reputationScore: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        hints: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            hints: true,
            claims: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    let isLiked = false;
    let isSaved = false;

    if (req.user) {
      const [like, save] = await Promise.all([
        prisma.itemLike.findUnique({
          where: { userId_itemId: { userId: req.user.id, itemId: id } },
        }),
        prisma.savedItem.findUnique({
          where: { userId_itemId: { userId: req.user.id, itemId: id } },
        }),
      ]);
      isLiked = !!like;
      isSaved = !!save;
    }

    res.json({
      ...item,
      isLiked,
      isSaved,
    });
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const data = createItemSchema.parse(req.body);

    const [categoryExists, blockExists] = await Promise.all([
      prisma.category.findUnique({ where: { id: data.categoryId } }),
      prisma.campusBlock.findUnique({ where: { id: data.blockId } }),
    ]);

    if (!categoryExists) {
      throw new AppError('A categoria informada não existe.', 400);
    }

    if (!blockExists) {
      throw new AppError('O bloco informado não existe.', 400);
    }

    const item = await prisma.item.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        type: data.type,
        categoryId: data.categoryId,
        blockId: data.blockId,
        specificLocation: data.specificLocation?.trim() || null,
        photoUrl: data.photoUrl || null,
        hasReward: data.hasReward ?? false,
        isUnderStaffCustody: data.isUnderStaffCustody ?? false,
        custodyLocation: data.custodyLocation?.trim() || null,
        authorId: userId,
      },
      include: {
        category: true,
        block: true,
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Award Unopoints: +5 points only for reporting a found item
    if (data.type === ItemType.FOUND) {
      await prisma.user.update({
        where: { id: userId },
        data: { reputationScore: { increment: 5 } },
      });
    }

    res.status(201).json({
      message: 'Item publicado com sucesso!',
      item,
    });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const data = updateItemSchema.parse(req.body);

    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Você não tem permissão para editar este item.', 403);
    }

    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!categoryExists) {
        throw new AppError('A categoria informada não existe.', 400);
      }
    }

    if (data.blockId) {
      const blockExists = await prisma.campusBlock.findUnique({ where: { id: data.blockId } });
      if (!blockExists) {
        throw new AppError('O bloco informado não existe.', 400);
      }
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        ...data,
      },
      include: {
        category: true,
        block: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            academicCourse: true,
            avatarUrl: true,
            role: true,
            reputationScore: true,
          },
        },
        _count: {
          select: {
            likes: true,
            hints: true,
            claims: true,
          },
        },
      },
    });

    res.json({
      message: 'Item atualizado com sucesso!',
      item: updated,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Você não tem permissão para excluir este item.', 403);
    }

    await prisma.item.delete({ where: { id } });

    res.json({ message: 'Item excluído com sucesso.' });
  }

  async markAsReturned(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF_PORTARIA') {
      throw new AppError('Apenas o autor do item ou a portaria pode concluir esta devolução.', 403);
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        status: ItemStatus.RETURNED,
        resolvedAt: new Date(),
        resolvedById: userId,
      },
      include: {
        category: true,
        block: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            academicCourse: true,
            avatarUrl: true,
            role: true,
            reputationScore: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            hints: true,
            claims: true,
          },
        },
      },
    });

    // Reward +15 Unopoints to author for successfully resolving the item
    await prisma.user.update({
      where: { id: item.authorId },
      data: { reputationScore: { increment: 15 } },
    });

    res.json({
      message: 'Item marcado como devolvido com sucesso!',
      item: updated,
    });
  }

  async toggleLike(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const itemExists = await prisma.item.findUnique({ where: { id } });
    if (!itemExists) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (itemExists.authorId === userId) {
      throw new AppError('Você não pode curtir sua própria publicação.', 400);
    }

    const existingLike = await prisma.itemLike.findUnique({
      where: { userId_itemId: { userId, itemId: id } },
    });

    let liked = false;
    if (existingLike) {
      await prisma.itemLike.delete({
        where: { userId_itemId: { userId, itemId: id } },
      });
      liked = false;
    } else {
      await prisma.itemLike.create({
        data: { userId, itemId: id },
      });
      liked = true;
    }

    const totalLikes = await prisma.itemLike.count({ where: { itemId: id } });

    res.json({ liked, totalLikes });
  }

  async toggleSave(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const itemExists = await prisma.item.findUnique({ where: { id } });
    if (!itemExists) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (itemExists.authorId === userId) {
      throw new AppError('Você não pode salvar sua própria publicação.', 400);
    }

    const existingSave = await prisma.savedItem.findUnique({
      where: { userId_itemId: { userId, itemId: id } },
    });

    let saved = false;
    if (existingSave) {
      await prisma.savedItem.delete({
        where: { userId_itemId: { userId, itemId: id } },
      });
      saved = false;
    } else {
      await prisma.savedItem.create({
        data: { userId, itemId: id },
      });
      saved = true;
    }

    res.json({ saved });
  }
}
