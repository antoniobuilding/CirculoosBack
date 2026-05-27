import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller.js';

const router = Router();

router.get('/', authenticate, authorize('SUPERADMIN'), getUsers);

router.get('/:id', authenticate, authorize('SUPERADMIN'), getUserById);

router.post(
  '/',
  authenticate,
  authorize('SUPERADMIN'),
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .isIn(['SUPERADMIN', 'ADMIN', 'VIEWER'])
      .withMessage('Role must be SUPERADMIN, ADMIN, or VIEWER'),
  ],
  validate,
  createUser
);

router.put('/:id', authenticate, authorize('SUPERADMIN'), updateUser);

router.delete('/:id', authenticate, authorize('SUPERADMIN'), deleteUser);

export default router;
