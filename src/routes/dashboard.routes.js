import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getStats } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', authenticate, getStats);

export default router;
