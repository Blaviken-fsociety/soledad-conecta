import { Router } from 'express';

import {
  createMicrotiendaView,
  createProductView,
  downloadAdminAnalyticsReport,
  getAdminAnalytics,
  getAdminMetrics,
  getEntrepreneurMetrics,
  getPublicMetrics,
  updateMicrotiendaViewDuration,
  updateProductViewDuration,
} from '../controllers/metricasController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/publicas', getPublicMetrics);
router.get('/admin', requireAuth, requireRole('admin'), getAdminMetrics);
router.get('/admin/analitica', requireAuth, requireRole('admin'), getAdminAnalytics);
router.get('/admin/reportes', requireAuth, requireRole('admin'), downloadAdminAnalyticsReport);
router.get('/emprendedor', requireAuth, requireRole('entrepreneur'), getEntrepreneurMetrics);

router.post('/visitas/microtienda', optionalAuth, createMicrotiendaView);
router.post('/visitas/producto', optionalAuth, createProductView);
router.patch('/visitas/microtienda/:viewId/permanencia', updateMicrotiendaViewDuration);
router.patch('/visitas/producto/:viewId/permanencia', updateProductViewDuration);

export default router;
