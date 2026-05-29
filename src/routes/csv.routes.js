import { Router } from 'express';
import { authenticate, authorizeActor } from '../middleware/auth.js';
import {
  sendMoltoOutput,
  sendMoltoReception,
  sendPlasnovoReception,
  sendPlasnovoOutput,
  getCsvTemplates,
  getProductReferences,
} from '../controllers/csv.controller.js';

const router = Router();

router.get('/templates', authenticate, getCsvTemplates);
router.get('/product-references', authenticate, getProductReferences);
router.post('/molto/output', authenticate, authorizeActor('Molto'), sendMoltoOutput);
router.post('/molto/reception', authenticate, authorizeActor('Molto'), sendMoltoReception);
router.post('/plasnovo/reception', authenticate, authorizeActor('Plasnovo'), sendPlasnovoReception);
router.post('/plasnovo/output', authenticate, authorizeActor('Plasnovo'), sendPlasnovoOutput);

export default router;
