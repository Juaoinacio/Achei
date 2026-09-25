import { Router } from 'express';
import { ItemController } from '../controllers/item.controller';
import { HintController } from '../controllers/hint.controller';
import { ClaimController } from '../controllers/claim.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';

const itemRoutes = Router();
const itemController = new ItemController();
const hintController = new HintController();
const claimController = new ClaimController();

// Feed & single item
itemRoutes.get('/', optionalAuthMiddleware, (req, res, next) => {
  itemController.listFeed(req, res).catch(next);
});

itemRoutes.get('/:id', optionalAuthMiddleware, (req, res, next) => {
  itemController.getById(req, res).catch(next);
});

// Item CRUD (authenticated)
itemRoutes.post('/', authMiddleware, (req, res, next) => {
  itemController.create(req, res).catch(next);
});

itemRoutes.put('/:id', authMiddleware, (req, res, next) => {
  itemController.update(req, res).catch(next);
});

itemRoutes.delete('/:id', authMiddleware, (req, res, next) => {
  itemController.delete(req, res).catch(next);
});

itemRoutes.patch('/:id/return', authMiddleware, (req, res, next) => {
  itemController.markAsReturned(req, res).catch(next);
});

// Social interactions (like & save)
itemRoutes.post('/:id/like', authMiddleware, (req, res, next) => {
  itemController.toggleLike(req, res).catch(next);
});

itemRoutes.post('/:id/save', authMiddleware, (req, res, next) => {
  itemController.toggleSave(req, res).catch(next);
});

// Nested hints on item
itemRoutes.get('/:itemId/hints', (req, res, next) => {
  hintController.listByItem(req, res).catch(next);
});

itemRoutes.post('/:itemId/hints', authMiddleware, (req, res, next) => {
  hintController.create(req, res).catch(next);
});

// Nested claims on item
itemRoutes.get('/:itemId/claims', authMiddleware, (req, res, next) => {
  claimController.listByItem(req, res).catch(next);
});

itemRoutes.post('/:itemId/claims', authMiddleware, (req, res, next) => {
  claimController.createClaim(req, res).catch(next);
});

export { itemRoutes };
