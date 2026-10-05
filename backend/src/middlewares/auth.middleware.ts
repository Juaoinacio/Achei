import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/prisma';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    return;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ message: 'Formato do cabeçalho de autorização inválido. Esperado: Bearer <token>' });
    return;
  }

  try {
    const decoded = verifyToken(token);

    // Validação de Sessão Ativa no Banco de Dados
    const session = await prisma.userSession.findUnique({
      where: { token },
      select: { id: true, isActive: true, expiresAt: true },
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      res.status(401).json({ message: 'Sessão encerrada, inválida ou expirada. Faça login novamente.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}


export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme === 'Bearer' && token) {
    try {
      const decoded = verifyToken(token);

      const session = await prisma.userSession.findUnique({
        where: { token },
        select: { id: true, isActive: true, expiresAt: true },
      });

      if (session && session.isActive && session.expiresAt >= new Date()) {
        req.user = decoded;
      }
    } catch {
      // Ignore token failure on optional auth
    }
  }

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso negado: permissão insuficiente para este recurso.' });
      return;
    }

    next();
  };
}
