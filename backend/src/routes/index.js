import { Router } from 'express';

import microtiendaRoutes from './microtiendaRoutes.js';

const router = Router();

router.use('/microtiendas', microtiendaRoutes);

export default router;
