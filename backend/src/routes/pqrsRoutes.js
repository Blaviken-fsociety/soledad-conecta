import { Router } from 'express';

import { createPqrs, deletePqrs, getPqrs, updatePqrsStatus } from '../controllers/pqrsController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', createPqrs);
router.get('/', requireAuth, requireRole('admin'), getPqrs);
router.patch('/:id/estado', requireAuth, requireRole('admin'), updatePqrsStatus);
router.delete('/:id', requireAuth, requireRole('admin'), deletePqrs);

export default router;
