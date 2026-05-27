import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/', authenticate, getProducts);

router.get('/:id', authenticate, getProductById);

router.post(
  '/',
  authenticate,
  authorize('SUPERADMIN', 'ADMIN'),
  [
    body('id').notEmpty().withMessage('Product ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('material').notEmpty().withMessage('Material is required'),
    body('recycledPercentage')
      .isFloat({ min: 0, max: 100 })
      .withMessage('Recycled percentage must be between 0 and 100'),
    body('weight').isFloat({ min: 0 }).withMessage('Weight must be positive'),
    body('color').notEmpty().withMessage('Color is required'),
    body('origin').notEmpty().withMessage('Origin is required'),
    body('status')
      .isIn([
        'IN_USE',
        'MANUFACTURING',
        'REPAIR',
        'RECYCLING',
        'DISTRIBUTION',
        'SECOND_LIFE',
      ])
      .withMessage('Invalid status'),
    body('currentOwner').notEmpty().withMessage('Current owner is required'),
    body('batch').notEmpty().withMessage('Batch is required'),
  ],
  validate,
  createProduct
);

router.put('/:id', authenticate, authorize('SUPERADMIN', 'ADMIN'), updateProduct);

router.delete('/:id', authenticate, authorize('SUPERADMIN', 'ADMIN'), deleteProduct);

export default router;
