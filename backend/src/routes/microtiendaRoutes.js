import { Router } from 'express';

import {
  createMicrotienda,
  deleteMicrotienda,
  getMicrotiendaById,
  getMicrotiendasForReview,
  getMyMicrotienda,
  getMicrotiendas,
  reviewMicrotienda,
  updateMicrotienda,
} from '../controllers/microtiendaController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/revision/lista', requireAuth, requireRole('admin'), getMicrotiendasForReview);
router.get('/', getMicrotiendas);
router.get('/mine', requireAuth, requireRole('entrepreneur'), getMyMicrotienda);
router.post('/', requireAuth, requireRole('entrepreneur'), createMicrotienda);
router.patch('/:id/revision', requireAuth, requireRole('admin'), reviewMicrotienda);
router.get('/:id', getMicrotiendaById);
router.put('/:id', requireAuth, requireRole('entrepreneur'), updateMicrotienda);
router.delete('/:id', requireAuth, requireRole('entrepreneur'), deleteMicrotienda);

export default router;
