import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const claimRoutes = Router();
const claimController = new ClaimController();

claimRoutes.get('/:id', authMiddleware, (req, res, next) => {
  claimController.getById(req, res).catch(next);
});

claimRoutes.patch('/:id/review', authMiddleware, (req, res, next) => {
  claimController.reviewClaim(req, res).catch(next);
});

claimRoutes.post('/:id/confirm', authMiddleware, (req, res, next) => {
  claimController.confirmDelivery(req, res).catch(next);
});

export { claimRoutes };
