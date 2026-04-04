import { createPqrs, findAllPqrs } from '../models/pqrsModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizePqrs = (item) => ({
  id: item.id_pqrs,
  tipo: item.tipo,
  nombre: item.nombre,
  correo: item.correo,
  mensaje: item.mensaje,
  fecha: item.fecha,
  estado: item.estado,
});

const validTypes = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];

export const getPqrsService = async () => {
  const items = await findAllPqrs();
  return items.map(sanitizePqrs);
};

export const createPqrsService = async ({ tipo, nombre, correo, mensaje }) => {
  const normalizedType = tipo?.trim().toUpperCase();

  if (!nombre?.trim() || !correo?.trim() || !mensaje?.trim() || !normalizedType) {
    throw buildHttpError('Tipo, nombre, correo y mensaje son obligatorios', 400);
  }

  if (!validTypes.includes(normalizedType)) {
    throw buildHttpError('El tipo de PQRS no es valido', 400);
  }

  const createdItem = await createPqrs({
    tipo: normalizedType,
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    mensaje: mensaje.trim(),
    estado: 'PENDIENTE',
  });

  return sanitizePqrs(createdItem);
};
