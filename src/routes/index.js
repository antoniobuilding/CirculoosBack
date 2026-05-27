import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import eventsRoutes from './events.routes.js';
import actorsRoutes from './actors.routes.js';
import metricsRoutes from './metrics.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import csvRoutes from './csv.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/products/:productId/events', eventsRoutes);
router.use('/actors', actorsRoutes);
router.use('/environmental-metrics', metricsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/csv', csvRoutes);
router.use('/users', usersRoutes);

export default router;
