import { Router } from 'express';
import {
  getPlasnovo,
  getPlasnovoByRpid,
  getPlasnovoStats,
} from '../controllers/plasnovo.controller.js';

const router = Router();

// Stats route must come before :rpid to avoid matching "stats" as an rpid
router.get('/stats', getPlasnovoStats);
router.get('/', getPlasnovo);
router.get('/:rpid', getPlasnovoByRpid);

export default router;
