import { Router } from 'express';
import { HintController } from '../controllers/hint.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const hintRoutes = Router();
const hintController = new HintController();

hintRoutes.patch('/:id/helpful', authMiddleware, (req, res, next) => {
  hintController.markHelpful(req, res).catch(next);
});

hintRoutes.delete('/:id', authMiddleware, (req, res, next) => {
  hintController.delete(req, res).catch(next);
});

export { hintRoutes };
