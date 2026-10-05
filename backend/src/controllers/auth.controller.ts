import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { generateToken, getTokenExpirationDate } from '../utils/jwt';
import { AppError } from '../middlewares/error.middleware';

const registerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
  email: z
    .string()
    .email('E-mail em formato inválido.')
    .refine((val) => val.toLowerCase().endsWith('@unochapeco.edu.br'), {
      message: 'O e-mail deve ser institucional (@unochapeco.edu.br).',
    }),
  password: z.string().min(6, 'A senha deve conter no mínimo 6 caracteres.'),
  academicCourse: z.string().optional(),
  academicPeriod: z.number().int().min(1).max(12).optional(),
  frequentedBlockIds: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: z.string().email('E-mail em formato inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
});

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body);

    const emailNormalized = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existingUser) {
      throw new AppError('Este e-mail institucional já está cadastrado.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const connectBlocks = data.frequentedBlockIds && data.frequentedBlockIds.length > 0
      ? { connect: data.frequentedBlockIds.map((id) => ({ id })) }
      : undefined;

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: emailNormalized,
        passwordHash,
        academicCourse: data.academicCourse?.trim() || null,
        academicPeriod: data.academicPeriod || null,
        isVerified: true, // Auto-verified since institutional email
        frequentedBlocks: connectBlocks,
      },
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
          select: { id: true, name: true },
        },
      },
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const userAgent = (req.headers['user-agent'] as string) || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;

    // Registra sessão ativa no banco de dados
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        userAgent,
        ipAddress,
        isActive: true,
        expiresAt: getTokenExpirationDate(),
      },
    });

    res.status(201).json({
      message: 'Cadastro realizado com sucesso!',
      user,
      token,
    });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = loginSchema.parse(req.body);

    const emailNormalized = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: emailNormalized },
      include: {
        frequentedBlocks: {
          select: { id: true, name: true },
        },
        badges: {
          include: { badge: true },
        },
      },
    });

    if (!user) {
      throw new AppError('Credenciais inválidas. Verifique seu e-mail e senha.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas. Verifique seu e-mail e senha.', 401);
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const userAgent = (req.headers['user-agent'] as string) || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;

    // Registra sessão ativa no banco de dados
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        userAgent,
        ipAddress,
        isActive: true,
        expiresAt: getTokenExpirationDate(),
      },
    });

    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login efetuado com sucesso!',
      user: safeUser,
      token,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [, token] = authHeader.split(' ');
      if (token) {
        await prisma.userSession.updateMany({
          where: { token },
          data: { isActive: false },
        });
      }
    }

    res.json({ message: 'Sessão encerrada com sucesso!' });
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;

    await prisma.userSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    res.json({ message: 'Todas as sessões ativas foram encerradas com sucesso!' });
  }

  async listSessions(req: Request, res: Response): Promise<void> {
    const userId = req.user!.id;
    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.split(' ')[1];

    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        token: true,
      },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      isCurrent: s.token === currentToken,
    }));

    res.json(formatted);
  }
}
