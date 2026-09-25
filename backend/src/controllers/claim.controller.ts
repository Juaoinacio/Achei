import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { ClaimStatus, NotificationType, ItemStatus } from '@prisma/client';

const createClaimSchema = z.object({
  secretDetails: z.string().min(5, 'Informe detalhes confidenciais para comprovar posse (ex: marcas, papel de parede, chaveiro).'),
});

const reviewClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'] as const),
});

const confirmDeliverySchema = z.object({
  code: z.string().length(6, 'O código PIN de confirmação deve ter exatamente 6 dígitos.'),
});

export class ClaimController {
  async createClaim(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId as string;
    const userId = req.user!.id;
    const { secretDetails } = createClaimSchema.parse(req.body);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.authorId === userId) {
      throw new AppError('Você não pode solicitar a retirada do seu próprio item cadastrado.', 400);
    }

    if (item.status === 'RETURNED' || item.status === 'CANCELLED') {
      throw new AppError('Este item já foi finalizado ou devolvido.', 400);
    }

    const existingPendingClaim = await prisma.claim.findFirst({
      where: {
        itemId,
        claimantId: userId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existingPendingClaim) {
      throw new AppError('Você já possui uma solicitação em andamento para este item.', 409);
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: userId,
        secretDetails: secretDetails.trim(),
        status: ClaimStatus.PENDING,
      },
      include: {
        item: {
          select: { title: true, authorId: true },
        },
      },
    });

    // Notify item author
    await prisma.notification.create({
      data: {
        userId: item.authorId,
        type: NotificationType.CLAIM_REQUEST,
        title: 'Nova solicitação de recuperação!',
        message: `Um usuário solicitou a posse do item "${item.title}". Revise os detalhes comprovatórios.`,
        referenceId: claim.id,
      },
    });

    res.status(201).json({
      message: 'Solicitação de retirada enviada com sucesso! Aguarde a análise dos detalhes.',
      claim,
    });
  }

  async listByItem(req: Request, res: Response): Promise<void> {
    const itemId = req.params.itemId as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const item = await prisma.item.findUnique({ where: { id: itemId } });

    if (!item) {
      throw new AppError('Item não encontrado.', 404);
    }

    if (item.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF_PORTARIA') {
      throw new AppError('Apenas o autor do post ou a portaria pode ver todas as reivindicações.', 403);
    }

    const claims = await prisma.claim.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
      include: {
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
            academicCourse: true,
            avatarUrl: true,
          },
        },
        handoffPin: {
          select: {
            id: true,
            code: true,
            expiresAt: true,
            isUsed: true,
            attempts: true,
          },
        },
      },
    });

    res.json(claims);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            category: true,
            block: true,
            author: { select: { id: true, name: true } },
          },
        },
        claimant: {
          select: {
            id: true,
            name: true,
            email: true,
            academicCourse: true,
            avatarUrl: true,
          },
        },
        handoffPin: true,
      },
    });

    if (!claim) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    const isClaimant = claim.claimantId === userId;
    const isItemAuthor = claim.item.authorId === userId;
    const isPrivileged = userRole === 'ADMIN' || userRole === 'STAFF_PORTARIA';

    if (!isClaimant && !isItemAuthor && !isPrivileged) {
      throw new AppError('Acesso negado para visualizar esta solicitação.', 403);
    }

    res.json(claim);
  }

  async reviewClaim(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { status } = reviewClaimSchema.parse(req.body);

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: { item: true, handoffPin: true },
    });

    if (!claim) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (claim.item.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF_PORTARIA') {
      throw new AppError('Apenas o autor do item ou a portaria pode aprovar ou rejeitar reivindicações.', 403);
    }

    if (claim.status === 'CONFIRMED') {
      throw new AppError('Esta solicitação já foi concluída e confirmada.', 400);
    }

    let generatedPinCode: string | null = null;

    if (status === 'APPROVED') {
      // Generate a secure 6-digit numeric PIN
      generatedPinCode = Math.floor(100000 + Math.random() * 900000).toString();

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // Valid for 48h

      if (claim.handoffPin) {
        await prisma.handoffPin.update({
          where: { claimId: claim.id },
          data: {
            code: generatedPinCode,
            expiresAt,
            attempts: 0,
            isUsed: false,
          },
        });
      } else {
        await prisma.handoffPin.create({
          data: {
            claimId: claim.id,
            code: generatedPinCode,
            expiresAt,
            attempts: 0,
            maxAttempts: 3,
            isUsed: false,
          },
        });
      }

      // Update claim
      await prisma.claim.update({
        where: { id },
        data: {
          status: ClaimStatus.APPROVED,
          securityCode: generatedPinCode,
        },
      });

      // Notify claimant with PIN instructions
      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: NotificationType.CLAIM_REQUEST,
          title: 'Sua solicitação de retirada foi aprovada! 🔐',
          message: `Sua posse do item "${claim.item.title}" foi aprovada! Use o código PIN ${generatedPinCode} para retirar seu pertence.`,
          referenceId: claim.itemId,
        },
      });
    } else {
      // REJECTED
      await prisma.claim.update({
        where: { id },
        data: {
          status: ClaimStatus.REJECTED,
        },
      });

      await prisma.notification.create({
        data: {
          userId: claim.claimantId,
          type: NotificationType.CLAIM_REQUEST,
          title: 'Solicitação de retirada recusada',
          message: `Os detalhes informados para o item "${claim.item.title}" não foram validados pelo responsável.`,
          referenceId: claim.itemId,
        },
      });
    }

    const updatedClaim = await prisma.claim.findUnique({
      where: { id },
      include: { handoffPin: true },
    });

    res.json({
      message: status === 'APPROVED' ? 'Solicitação aprovada e PIN de 6 dígitos gerado com sucesso!' : 'Solicitação rejeitada.',
      claim: updatedClaim,
    });
  }

  async confirmDelivery(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { code } = confirmDeliverySchema.parse(req.body);

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        item: true,
        handoffPin: true,
      },
    });

    if (!claim) {
      throw new AppError('Solicitação não encontrada.', 404);
    }

    if (claim.item.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'STAFF_PORTARIA') {
      throw new AppError('Apenas o autor do item ou a portaria pode validar a entrega física por PIN.', 403);
    }

    if (claim.status === 'CONFIRMED') {
      throw new AppError('Esta entrega já foi confirmada anteriormente.', 400);
    }

    if (!claim.handoffPin) {
      throw new AppError('Nenhum código PIN foi gerado para esta solicitação.', 400);
    }

    if (claim.handoffPin.isUsed) {
      throw new AppError('Este código PIN de entrega já foi utilizado.', 400);
    }

    if (claim.handoffPin.expiresAt < new Date()) {
      throw new AppError('O código PIN de entrega expirou. Solicite a geração de um novo código.', 400);
    }

    if (claim.handoffPin.attempts >= claim.handoffPin.maxAttempts) {
      throw new AppError('Número máximo de tentativas incorretas excedido para este PIN.', 400);
    }

    // Validate PIN code
    if (claim.handoffPin.code !== code.trim()) {
      await prisma.handoffPin.update({
        where: { id: claim.handoffPin.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = claim.handoffPin.maxAttempts - (claim.handoffPin.attempts + 1);
      throw new AppError(`Código PIN incorreto. Tentativas restantes: ${Math.max(0, remainingAttempts)}.`, 400);
    }

    // PIN MATCHED! Execute final handoff transaction
    await prisma.$transaction([
      prisma.handoffPin.update({
        where: { id: claim.handoffPin.id },
        data: { isUsed: true },
      }),
      prisma.claim.update({
        where: { id: claim.id },
        data: {
          status: ClaimStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      }),
      prisma.item.update({
        where: { id: claim.itemId },
        data: {
          status: ItemStatus.RETURNED,
          resolvedAt: new Date(),
          resolvedById: userId,
        },
      }),
      // Award 20 reputation points to author/staff resolving return
      prisma.user.update({
        where: { id: userId },
        data: { reputationScore: { increment: 20 } },
      }),
      // Award 5 reputation points to claimant for successful retrieval
      prisma.user.update({
        where: { id: claim.claimantId },
        data: { reputationScore: { increment: 5 } },
      }),
    ]);

    // Send confirmation notification to claimant
    await prisma.notification.create({
      data: {
        userId: claim.claimantId,
        type: NotificationType.ITEM_FOUND,
        title: 'Devolução Concluída! 🎉',
        message: `A entrega do item "${claim.item.title}" foi confirmada com sucesso no Achei Unochapecó.`,
        referenceId: claim.itemId,
      },
    });

    res.json({
      message: 'PIN de 6 dígitos verificado com sucesso! Entrega concluída e item marcado como DEVOLVIDO.',
      confirmedAt: new Date(),
    });
  }
}
