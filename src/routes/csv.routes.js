import { Router } from 'express';
import { authenticate, authorizeActor } from '../middleware/auth.js';
import {
  generatePlasnovoCsv,
  generateMoltoCsv,
  getCsvTemplates,
} from '../controllers/csv.controller.js';

const router = Router();

router.get('/templates', authenticate, getCsvTemplates);
router.post('/plasnovo', authenticate, authorizeActor('Plasnovo'), generatePlasnovoCsv);
router.post('/molto', authenticate, authorizeActor('Molto'), generateMoltoCsv);

export default router;
