import { Router } from 'express';

import authRoutes from './authRoutes.js';
import microtiendaRoutes from './microtiendaRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/microtiendas', microtiendaRoutes);
router.use('/usuarios', userRoutes);

export default router;
