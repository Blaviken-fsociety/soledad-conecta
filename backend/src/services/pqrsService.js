import { createPqrs, deletePqrs, findAllPqrs, findPqrsById, updatePqrsStatus } from '../models/pqrsModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizePqrs = (item) => ({
  id: item.id_pqrs,
  tipo: item.tipo,
  nombre: item.nombre,
  correo: item.correo,
  telefono: item.telefono || '',
  asunto: item.asunto || '',
  mensaje: item.mensaje,
  fecha: item.fecha,
  estado: item.estado,
});

const validTypes = ['PETICION', 'QUEJA', 'RECLAMO', 'SUGERENCIA'];

export const getPqrsService = async () => {
  const items = await findAllPqrs();
  return items.map(sanitizePqrs);
};

export const createPqrsService = async ({ tipo, nombre, correo, telefono, asunto, mensaje }) => {
  const normalizedType = tipo?.trim().toUpperCase();

  if (!nombre?.trim() || !correo?.trim() || !asunto?.trim() || !mensaje?.trim() || !normalizedType) {
    throw buildHttpError('Tipo, nombre, correo, asunto y mensaje son obligatorios', 400);
  }

  if (!validTypes.includes(normalizedType)) {
    throw buildHttpError('El tipo de PQRS no es valido', 400);
  }

  const createdItem = await createPqrs({
    tipo: normalizedType,
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    telefono: telefono?.trim() || '',
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
    estado: 'PENDIENTE',
  });

  return sanitizePqrs(createdItem);
};

export const updatePqrsStatusService = async (id, estado) => {
  const normalizedStatus = estado?.trim().toUpperCase();

  if (!['PENDIENTE', 'EN_PROCESO', 'COMPLETADO'].includes(normalizedStatus)) {
    throw buildHttpError('El estado de la PQR no es válido', 400);
  }

  const existingItem = await findPqrsById(Number(id));

  if (!existingItem) {
    throw buildHttpError('PQR no encontrada', 404);
  }

  const updatedItem = await updatePqrsStatus(Number(id), normalizedStatus);
  return sanitizePqrs(updatedItem);
};

export const deletePqrsService = async (id) => {
  const existingItem = await findPqrsById(Number(id));

  if (!existingItem) {
    throw buildHttpError('PQR no encontrada', 404);
  }

  await deletePqrs(Number(id));
};
