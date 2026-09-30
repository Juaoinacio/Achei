import { Router, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

const courseRoutes = Router();

// GET /courses - Lista pública de cursos oficiais da Unochapecó
courseRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ message: 'Erro ao buscar cursos da universidade.', error: err.message });
  }
});

// POST /courses - Criação de novo curso (apenas administradores)
courseRoutes.post('/', authMiddleware, requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const { name, department } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'O nome do curso é obrigatório.' });
      return;
    }

    const existing = await prisma.course.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      res.status(409).json({ message: 'Já existe um curso cadastrado com este nome.' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        department: department?.trim() || null,
      },
    });

    res.status(201).json(course);
  } catch (err: any) {
    res.status(500).json({ message: 'Erro ao cadastrar curso.', error: err.message });
  }
});

// DELETE /courses/:id - Exclusão de curso (apenas administradores)
courseRoutes.delete('/:id', authMiddleware, requireRole(UserRole.ADMIN), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ message: 'ID do curso não fornecido.' });
      return;
    }
    await prisma.course.delete({
      where: { id },
    });
    res.json({ message: 'Curso removido com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Erro ao remover curso.', error: err.message });
  }
});

export { courseRoutes };
