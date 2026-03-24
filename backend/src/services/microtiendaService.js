import {
  findAllMicrotiendas,
  findMicrotiendaById,
} from '../models/microtiendaModel.js';

const buildHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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
