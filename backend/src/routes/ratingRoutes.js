import { Router } from 'express';

import {
  createRating,
  getRatings,
  getRatingsForReview,
  getRatingSummary,
  reviewRating,
} from '../controllers/ratingController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/resumen', getRatingSummary);
router.get('/revision/lista', requireAuth, requireRole('admin'), getRatingsForReview);
router.get('/', getRatings);
router.post('/', createRating);
router.patch('/:id/revision', requireAuth, requireRole('admin'), reviewRating);

export default router;
