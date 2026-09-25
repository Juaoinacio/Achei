import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';

const categoryRoutes = Router();
const categoryController = new CategoryController();

categoryRoutes.get('/', (req, res, next) => {
  categoryController.listAll(req, res).catch(next);
});

categoryRoutes.get('/:slug', (req, res, next) => {
  categoryController.getBySlug(req, res).catch(next);
});

export { categoryRoutes };
