import { Router } from 'express';
import { BadgeController } from '../controllers/badge.controller';

const badgeRoutes = Router();
const badgeController = new BadgeController();

badgeRoutes.get('/badges', (req, res, next) => {
  badgeController.listBadges(req, res).catch(next);
});

badgeRoutes.get('/rankings', (req, res, next) => {
  badgeController.getLeaderboard(req, res).catch(next);
});

export { badgeRoutes };
