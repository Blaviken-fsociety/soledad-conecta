import { Router } from 'express';

import { createPqrs, getPqrs } from '../controllers/pqrsController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', createPqrs);
router.get('/', requireAuth, requireRole('admin'), getPqrs);

export default router;
