import { Router } from 'express';
import { authenticate, authorizeActor } from '../middleware/auth.js';
import {
  generateMoltoOutputCsv,
  generatePlasnovoReceptionCsv,
  generatePlasnovoOutputCsv,
  getCsvTemplates,
  getProductReferences,
} from '../controllers/csv.controller.js';

const router = Router();

router.get('/templates', authenticate, getCsvTemplates);
router.get('/product-references', authenticate, getProductReferences);
router.post('/molto/output', authenticate, authorizeActor('Molto'), generateMoltoOutputCsv);
router.post('/plasnovo/reception', authenticate, authorizeActor('Plasnovo'), generatePlasnovoReceptionCsv);
router.post('/plasnovo/output', authenticate, authorizeActor('Plasnovo'), generatePlasnovoOutputCsv);

export default router;
