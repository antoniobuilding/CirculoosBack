import { Router } from 'express';
import {
  getMolto,
  getMoltoById,
  getMoltoStats,
} from '../controllers/molto.controller.js';

const router = Router();

// Stats route must come before :id to avoid matching "stats" as an id
router.get('/stats', getMoltoStats);
router.get('/', getMolto);
router.get('/:id', getMoltoById);

export default router;
