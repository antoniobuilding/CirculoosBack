import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMetrics,
  updateMetric,
} from '../controllers/metrics.controller.js';

const router = Router();

router.get('/', getMetrics);

router.put('/:id', authenticate, authorize('ADMIN'), updateMetric);

export default router;
