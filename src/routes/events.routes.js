import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProductEvents,
  createProductEvent,
} from '../controllers/events.controller.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, getProductEvents);

router.post(
  '/',
  authenticate,
  authorize('SUPERADMIN', 'ADMIN'),
  [
    body('type').notEmpty().withMessage('Event type is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('actor').notEmpty().withMessage('Actor is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  validate,
  createProductEvent
);

export default router;
