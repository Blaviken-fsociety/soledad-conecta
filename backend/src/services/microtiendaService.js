import { findCategoryById } from '../models/categoryModel.js';
import {
  createMicrotienda,
  deleteMicrotienda,
  findAllMicrotiendas,
  findMicrotiendaById,
  findMicrotiendaByUserId,
  updateMicrotienda,
} from '../models/microtiendaModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizeMicrotienda = (microtienda) => ({
  id: microtienda.id_microtienda,
  nombre: microtienda.nombre,
  descripcion: microtienda.descripcion || '',
  sectorEconomico: microtienda.sector_economico || '',
  whatsapp: microtienda.whatsapp || '',
  redesSociales: microtienda.redes_sociales || '',
  logoImagen: microtienda.logo_imagen || '',
  estado: Boolean(microtienda.estado),
  estadoRevision: microtienda.estado_revision || 'PENDIENTE',
  observacionRevision: microtienda.observacion_revision || '',
  fechaCreacion: microtienda.fecha_creacion,
  categoriaId: microtienda.id_categoria,
  categoria: microtienda.categoria || '',
  propietarioId: microtienda.id_usuario,
  propietario: microtienda.propietario || '',
  totalProductos: Number(microtienda.total_productos || 0),
  totalCalificaciones: Number(microtienda.total_calificaciones || 0),
  promedioCalificacion: Number(microtienda.promedio_calificacion || 0),
});

const parseId = (id, label) => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw buildHttpError(`El id de ${label} no es valido`, 400);
  }

  return numericId;
};

const validateCategory = async (categoryId) => {
  const category = await findCategoryById(categoryId);

  if (!category || !category.estado) {
    throw buildHttpError('La categoria seleccionada no es valida', 400);
  }
};

export const getMicrotiendasService = async ({ includePending = false } = {}) => {
  const rows = await findAllMicrotiendas({ includePending });
  return rows.map(sanitizeMicrotienda);
};

export const getMicrotiendaByIdService = async (id) => {
  const numericId = parseId(id, 'microtienda');
  const microtienda = await findMicrotiendaById(numericId);

  if (!microtienda || microtienda.estado_revision !== 'APROBADO') {
    throw buildHttpError('Microtienda no encontrada', 404);
  }

  return sanitizeMicrotienda(microtienda);
};

export const getMyMicrotiendaService = async (authUser) => {
  const microtienda = await findMicrotiendaByUserId(authUser.id, { includeInactive: true });
  return microtienda ? sanitizeMicrotienda(microtienda) : null;
};

export const createMicrotiendaService = async (authUser, payload) => {
  if (!payload.nombre?.trim()) {
    throw buildHttpError('El nombre de la microtienda es obligatorio', 400);
  }

  const existingMicrotienda = await findMicrotiendaByUserId(authUser.id, { includeInactive: true });

  if (existingMicrotienda) {
    throw buildHttpError('El emprendedor ya tiene una microtienda registrada', 409);
  }

  const categoryId = parseId(payload.idCategoria, 'categoria');
  await validateCategory(categoryId);

  const createdMicrotienda = await createMicrotienda({
    nombre: payload.nombre.trim(),
    descripcion: payload.descripcion?.trim() || null,
    sectorEconomico: payload.sectorEconomico?.trim() || null,
    whatsapp: payload.whatsapp?.trim() || null,
    redesSociales: payload.redesSociales?.trim() || null,
    logoImagen: payload.logoImagen || '',
    estado: payload.estado ?? true,
    estadoRevision: 'PENDIENTE',
    observacionRevision: '',
    idUsuario: authUser.id,
    idCategoria: categoryId,
  });

  return sanitizeMicrotienda(createdMicrotienda);
};

export const updateMicrotiendaService = async (authUser, id, payload) => {
  const numericId = parseId(id, 'microtienda');
  const microtienda = await findMicrotiendaById(numericId, { includeInactive: true });

  if (!microtienda) {
    throw buildHttpError('Microtienda no encontrada', 404);
  }

  if (microtienda.id_usuario !== authUser.id) {
    throw buildHttpError('No tienes permisos para editar esta microtienda', 403);
  }

  const categoryId = parseId(payload.idCategoria, 'categoria');
  await validateCategory(categoryId);

  const updatedMicrotienda = await updateMicrotienda(numericId, {
    nombre: payload.nombre?.trim(),
    descripcion: payload.descripcion?.trim() || null,
    sectorEconomico: payload.sectorEconomico?.trim() || null,
    whatsapp: payload.whatsapp?.trim() || null,
    redesSociales: payload.redesSociales?.trim() || null,
    logoImagen: payload.logoImagen || '',
    estado: payload.estado ?? true,
    estadoRevision: 'PENDIENTE',
    observacionRevision: '',
    idCategoria: categoryId,
  });

  return sanitizeMicrotienda(updatedMicrotienda);
};

export const reviewMicrotiendaService = async (id, { estadoRevision, observacionRevision }) => {
  const numericId = parseId(id, 'microtienda');
  const microtienda = await findMicrotiendaById(numericId, { includeInactive: true });

  if (!microtienda) {
    throw buildHttpError('Microtienda no encontrada', 404);
  }

  if (!['APROBADO', 'RECHAZADO', 'PENDIENTE'].includes(estadoRevision)) {
    throw buildHttpError('El estado de revision no es valido', 400);
  }

  const updatedMicrotienda = await updateMicrotienda(numericId, {
    nombre: microtienda.nombre,
    descripcion: microtienda.descripcion,
    sectorEconomico: microtienda.sector_economico,
    whatsapp: microtienda.whatsapp,
    redesSociales: microtienda.redes_sociales,
    logoImagen: microtienda.logo_imagen || '',
    estado: microtienda.estado,
    estadoRevision,
    observacionRevision: observacionRevision || '',
    idCategoria: microtienda.id_categoria,
  });

  return sanitizeMicrotienda(updatedMicrotienda);
};

export const deleteMicrotiendaService = async (authUser, id) => {
  const numericId = parseId(id, 'microtienda');
  const microtienda = await findMicrotiendaById(numericId, { includeInactive: true });

  if (!microtienda) {
    throw buildHttpError('Microtienda no encontrada', 404);
  }

  if (microtienda.id_usuario !== authUser.id) {
    throw buildHttpError('No tienes permisos para eliminar esta microtienda', 403);
  }

  await deleteMicrotienda(numericId);
};
