import {
  findAllMicrotiendas,
  findMicrotiendaById,
} from '../models/microtiendaModel.js';
import { buildHttpError } from '../utils/httpError.js';

export const getMicrotiendasService = async () => {
  return findAllMicrotiendas();
};

export const getMicrotiendaByIdService = async (id) => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw buildHttpError('El id de la microtienda no es válido', 400);
  }

  const microtienda = await findMicrotiendaById(numericId);

  if (!microtienda) {
    throw buildHttpError('Microtienda no encontrada', 404);
  }

  return microtienda;
};
