import { Router } from 'express';

import {
  changeMyPassword,
  createEntrepreneurRequest,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/solicitudes-emprendedor', createEntrepreneurRequest);
router.patch('/me/password', requireAuth, changeMyPassword);
router.get('/', requireAuth, requireRole('admin'), getUsers);
router.post('/', requireAuth, requireRole('admin'), createUser);
router.put('/:id', requireAuth, requireRole('admin'), updateUser);
router.delete('/:id', requireAuth, requireRole('admin'), deleteUser);

export default router;
