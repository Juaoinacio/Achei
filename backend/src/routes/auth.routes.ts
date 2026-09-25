import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/register', (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRoutes.post('/login', (req, res, next) => {
  authController.login(req, res).catch(next);
});

export { authRoutes };
