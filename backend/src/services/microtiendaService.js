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

const paginateCollection = (items, page, limit) => {
  const safePage = Math.max(Number(page || 1), 1);
  const safeLimit = Math.max(Number(limit || 9), 1);
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
};

export const getMicrotiendasService = async ({
  includePending = false,
  page,
  limit,
  search,
  categoria,
} = {}) => {
  const rows = await findAllMicrotiendas({ includePending });
  const normalizedSearch = String(search || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const normalizedCategoria = String(categoria || '').trim().toLowerCase();

  const sanitizedRows = rows
    .map(sanitizeMicrotienda)
    .filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [item.nombre, item.descripcion, item.propietario, item.categoria, item.sectorEconomico]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .includes(normalizedSearch),
          );

      const matchesCategory =
        !normalizedCategoria || String(item.categoria || '').trim().toLowerCase() === normalizedCategoria;

      return matchesSearch && matchesCategory;
    });

  if (page || limit) {
    return paginateCollection(sanitizedRows, page, limit);
  }

  return sanitizedRows;
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
