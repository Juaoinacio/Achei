import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/register', (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRoutes.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

authRoutes.post('/logout', authMiddleware, (req, res, next) => {
  authController.logout(req, res).catch(next);
});

authRoutes.post('/logout-all', authMiddleware, (req, res, next) => {
  authController.logoutAll(req, res).catch(next);
});

authRoutes.get('/sessions', authMiddleware, (req, res, next) => {
  authController.listSessions(req, res).catch(next);
});

export { authRoutes };

