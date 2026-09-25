import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const userRoutes = Router();
const userController = new UserController();

// Current user authenticated routes
userRoutes.get('/me', authMiddleware, (req, res, next) => {
  userController.getMyProfile(req, res).catch(next);
});

userRoutes.put('/me', authMiddleware, (req, res, next) => {
  userController.updateProfile(req, res).catch(next);
});

userRoutes.get('/me/items', authMiddleware, (req, res, next) => {
  userController.getMyItems(req, res).catch(next);
});

userRoutes.get('/me/saved', authMiddleware, (req, res, next) => {
  userController.getMySavedItems(req, res).catch(next);
});

// Public profile route
userRoutes.get('/:id', (req, res, next) => {
  userController.getPublicProfile(req, res).catch(next);
});

export { userRoutes };
