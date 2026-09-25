import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { NotificationType } from '@prisma/client';

const createHintSchema = z.object({
  content: z.string().min(5, 'A pista deve conter no mínimo 5 caracteres.'),
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
      throw new AppError('Não é possível adicionar pistas a um item já finalizado.', 400);
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
          title: 'Nova pista recebida!',
          message: `Alguém adicionou uma nova pista no seu item: "${item.title}".`,
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
      message: 'Pista enviada com sucesso!',
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
      throw new AppError('Pista não encontrada.', 404);
    }

    if (hint.item.authorId !== userId) {
      throw new AppError('Apenas o autor da publicação pode marcar uma pista como útil.', 403);
    }

    if (hint.isHelpful) {
      res.json({ message: 'Esta pista já está marcada como útil.', hint });
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
        title: 'Sua pista foi útil! ⭐',
        message: `O autor de "${hint.item.title}" marcou sua pista como útil. Você ganhou +3 pontos de reputação!`,
        referenceId: hint.itemId,
      },
    });

    res.json({
      message: 'Pista marcada como útil com sucesso!',
      hint: updatedHint,
    });
  }

  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const hint = await prisma.hint.findUnique({ where: { id } });

    if (!hint) {
      throw new AppError('Pista não encontrada.', 404);
    }

    if (hint.authorId !== userId && userRole !== 'ADMIN') {
      throw new AppError('Você não tem permissão para excluir esta pista.', 403);
    }

    await prisma.hint.delete({ where: { id } });

    res.json({ message: 'Pista excluída com sucesso.' });
  }
}
