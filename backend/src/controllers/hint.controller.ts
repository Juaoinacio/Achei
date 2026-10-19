import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { NotificationType } from '@prisma/client';

const createHintSchema = z.object({
  content: z.string().min(5, 'O comentário deve conter no mínimo 5 caracteres.'),
});

export class HintController {
  async create(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId as string;
    const userId = req.user!.id;
    const { content } = createHintSchema.parse(req.body);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, title: true, authorId: true, status: true },
    });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.status === 'RETURNED' || item.status === 'CANCELLED') {
      throw new AppError('Não é possível adicionar comentários a um item já finalizado.', 400);
    }

    const hint = await prisma.hint.create({
      data: {
        content: content.trim(),
        itemId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Notify item author if hint submitted by someone else
    if (item.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: item.authorId,
          type: NotificationType.HINT_RECEIVED,
          title: 'Novo comentário recebido!',
          message: `Alguém comentou no seu pertence: "${item.title}".`,
          referenceId: item.id,
        },
      });

      // +1 reputation point for community collaboration
      await prisma.user.update({
        where: { id: userId },
        data: { reputationScore: { increment: 1 } },
      });
    }

    res.status(201).json({
      message: 'Comentário enviado com sucesso!',
      hint,
    });
  }

  async listByItem(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId as string;

    const hints = await prisma.hint.findMany({
      where: { itemId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, role: true },
        },
      },
    });

    res.json(hints);
  }

  async markHelpful(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const hint = await prisma.hint.findUnique({
      where: { id },
      include: { item: true },
    });

    if (!hint) {
      throw new AppError('Comentário não encontrado.', 404);
    }

    if (hint.item.authorId !== userId) {
      throw new AppError('Apenas o autor da publicação pode marcar um comentário como útil.', 403);
    }

    if (hint.isHelpful) {
      res.json({ message: 'Este comentário já está marcado como útil.', hint });
      return;
    }

    const updatedHint = await prisma.hint.update({
      where: { id },
      data: { isHelpful: true },
    });

    // Award +3 reputation points to the contributor of the helpful hint
    await prisma.user.update({
      where: { id: hint.authorId },
      data: { reputationScore: { increment: 3 } },
    });

    // Notify contributor
    await prisma.notification.create({
      data: {
        userId: hint.authorId,
        type: NotificationType.HINT_RECEIVED,
        title: 'Seu comentário foi útil! ⭐',
        message: `O autor de "${hint.item.title}" marcou seu comentário como útil. Você ganhou +3 pontos de reputação!`,
        referenceId: hint.itemId,
      },
    });

    res.json({
      message: 'Comentário marcado como útil com sucesso!',
      hint: updatedHint,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const hint = await prisma.hint.findUnique({ where: { id } });

    if (!hint) {
      throw new AppError('Comentário não encontrado.', 404);
    }

    if (hint.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Você não tem permissão para excluir este comentário.', 403);
    }

    await prisma.hint.delete({ where: { id } });

    res.json({ message: 'Comentário excluído com sucesso.' });
  }
}
