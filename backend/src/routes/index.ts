import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { blockRoutes } from './block.routes';
import { categoryRoutes } from './category.routes';
import { itemRoutes } from './item.routes';
import { hintRoutes } from './hint.routes';
import { claimRoutes } from './claim.routes';
import { badgeRoutes } from './badge.routes';

const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/blocks', blockRoutes);
apiRoutes.use('/categories', categoryRoutes);
apiRoutes.use('/items', itemRoutes);
apiRoutes.use('/hints', hintRoutes);
apiRoutes.use('/claims', claimRoutes);
apiRoutes.use('/', badgeRoutes);

export { apiRoutes };
