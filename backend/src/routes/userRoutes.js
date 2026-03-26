import { Router } from 'express';

import { createUser, getUsers } from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));
router.get('/', getUsers);
router.post('/', createUser);

export default router;
