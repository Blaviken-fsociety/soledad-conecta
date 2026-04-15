import { Router } from 'express';

import {
  getAdminMetrics,
  getEntrepreneurMetrics,
  getPublicMetrics,
} from '../controllers/metricController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/publicas', getPublicMetrics);
router.get('/admin', requireAuth, requireRole('admin'), getAdminMetrics);
router.get('/emprendedor', requireAuth, requireRole('entrepreneur'), getEntrepreneurMetrics);

export default router;
