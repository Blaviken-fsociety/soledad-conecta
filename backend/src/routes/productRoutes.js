import { Router } from 'express';

import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
  getProductsForReview,
  reviewProduct,
  updateProduct,
} from '../controllers/productController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/revision/lista', requireAuth, requireRole('admin'), getProductsForReview);
router.get('/mine', requireAuth, requireRole('entrepreneur'), getMyProducts);
router.get('/', getProducts);
router.post('/', requireAuth, requireRole('entrepreneur'), createProduct);
router.patch('/:id/revision', requireAuth, requireRole('admin'), reviewProduct);
router.put('/:id', requireAuth, requireRole('entrepreneur'), updateProduct);
router.delete('/:id', requireAuth, requireRole('entrepreneur'), deleteProduct);

export default router;
