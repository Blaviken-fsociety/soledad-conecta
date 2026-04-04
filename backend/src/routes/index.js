import { Router } from 'express';

import authRoutes from './authRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import metricRoutes from './metricRoutes.js';
import microtiendaRoutes from './microtiendaRoutes.js';
import pqrsRoutes from './pqrsRoutes.js';
import productRoutes from './productRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categorias', categoryRoutes);
router.use('/metricas', metricRoutes);
router.use('/microtiendas', microtiendaRoutes);
router.use('/pqrs', pqrsRoutes);
router.use('/productos', productRoutes);
router.use('/calificaciones', ratingRoutes);
router.use('/usuarios', userRoutes);

export default router;
