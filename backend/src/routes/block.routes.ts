import { Router } from 'express';
import { BlockController } from '../controllers/block.controller';

const blockRoutes = Router();
const blockController = new BlockController();

blockRoutes.get('/', (req, res, next) => {
  blockController.listAll(req, res).catch(next);
});

blockRoutes.get('/:id', (req, res, next) => {
  blockController.getById(req, res).catch(next);
});

export { blockRoutes };
