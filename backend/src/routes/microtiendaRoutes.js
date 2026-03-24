import { Router } from 'express';

import {
  getMicrotiendaById,
  getMicrotiendas,
} from '../controllers/microtiendaController.js';

const router = Router();

router.get('/', getMicrotiendas);
router.get('/:id', getMicrotiendaById);

export default router;
