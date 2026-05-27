import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMetrics,
  updateMetric,
} from '../controllers/metrics.controller.js';

const router = Router();

router.get('/', authenticate, getMetrics);

router.put('/:id', authenticate, authorize('SUPERADMIN', 'ADMIN'), updateMetric);

export default router;
