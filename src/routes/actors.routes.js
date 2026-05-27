import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getActors,
  getActorById,
  createActor,
  updateActor,
} from '../controllers/actors.controller.js';

const router = Router();

router.get('/', authenticate, getActors);

router.get('/:id', authenticate, getActorById);

router.post(
  '/',
  authenticate,
  authorize('SUPERADMIN', 'ADMIN'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('metrics').isObject().withMessage('Metrics must be an object'),
    body('color').notEmpty().withMessage('Color is required'),
  ],
  validate,
  createActor
);

router.put('/:id', authenticate, authorize('SUPERADMIN', 'ADMIN'), updateActor);

export default router;
