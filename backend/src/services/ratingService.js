import { findMicrotiendaById } from '../models/microtiendaModel.js';
import { findProductById } from '../models/productModel.js';
import {
  createRating,
  deleteRating,
  findRatings,
  findRatingsByOwnerUserId,
  findRatingById,
  findRatingSummaryByMicrotienda,
  updateRatingReviewStatus,
} from '../models/ratingModel.js';
import { findMicrotiendaByUserId } from '../models/microtiendaModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizeRating = (item, { includePrivate = false } = {}) => ({
  id: item.id_calificacion,
  puntuacion: Number(item.puntuacion),
  comentario: item.comentario || '',
  nombreVisitante: item.nombre_visitante || 'Visitante',
  fecha: item.fecha,
  productoId: item.id_producto,
  producto: item.producto || '',
  microtiendaId: item.id_microtienda,
  microtienda: item.microtienda || '',
  estadoRevision: item.estado_revision || 'PENDIENTE',
  ...(includePrivate
    ? {
        tipoDocumento: item.tipo_documento || '',
        numeroDocumento: item.numero_documento || '',
        direccion: item.direccion || '',
        telefono: item.telefono || '',
      }
    : {}),
});

const sanitizeSummary = (item) => ({
  microtiendaId: item.id_microtienda,
  microtienda: item.microtienda,
  promedio: Number(item.promedio || 0),
  totalCalificaciones: Number(item.total_calificaciones || 0),
  comentarioDestacado: item.comentario_destacado || 'Sin comentarios todavia.',
});

const paginateCollection = (items, page, limit) => {
  const safePage = Math.max(Number(page || 1), 1);
  const safeLimit = Math.max(Number(limit || 10), 1);
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

const sortRatings = (items, sort) => {
  const sortableItems = [...items];

  switch (sort) {
    case 'score_desc':
      return sortableItems.sort(
        (a, b) =>
          Number(b.puntuacion || 0) - Number(a.puntuacion || 0) ||
          new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
      );
    case 'score_asc':
      return sortableItems.sort(
        (a, b) =>
          Number(a.puntuacion || 0) - Number(b.puntuacion || 0) ||
          new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
      );
    case 'oldest':
      return sortableItems.sort(
        (a, b) => new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime(),
      );
    case 'newest':
    default:
      return sortableItems.sort(
        (a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
      );
  }
};

export const getRatingSummaryService = async () => {
  const rows = await findRatingSummaryByMicrotienda();
  return rows.map(sanitizeSummary);
};

export const getRatingsService = async ({
  microtiendaId,
  productId,
  includePending = false,
  includePrivate = false,
  page,
  limit,
  sort = 'newest',
} = {}) => {
  const rows = await findRatings({ microtiendaId, productId, includePending });
  const sanitizedRows = sortRatings(
    rows.map((item) => sanitizeRating(item, { includePrivate })),
    sort,
  );

  if (page || limit) {
    return paginateCollection(sanitizedRows, page, limit);
  }

  return sanitizedRows;
};

export const getEntrepreneurRatingsService = async (
  authUser,
  { page = 1, limit = 10, includePrivate = true, sort = 'newest' } = {},
) => {
  const microtienda = await findMicrotiendaByUserId(authUser.id, { includeInactive: true });

  if (!microtienda) {
    return {
      items: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const rows = await findRatingsByOwnerUserId(authUser.id, { includePending: true });
  const sanitizedRows = sortRatings(
    rows.map((item) => sanitizeRating(item, { includePrivate })),
    sort,
  );
  return paginateCollection(sanitizedRows, page, limit);
};

export const createRatingService = async ({
  nombreVisitante,
  tipoDocumento,
  numeroDocumento,
  direccion,
  telefono,
  puntuacion,
  comentario,
  idProducto,
  idMicrotienda,
}) => {
  const numericScore = Number(puntuacion);

  if (!nombreVisitante?.trim() || !comentario?.trim()) {
    throw buildHttpError('Nombre y comentario son obligatorios', 400);
  }

  if (!tipoDocumento?.trim() || !numeroDocumento?.trim() || !telefono?.trim()) {
    throw buildHttpError('Tipo de documento, número de documento y teléfono son obligatorios', 400);
  }

  if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
    throw buildHttpError('La puntuacion debe estar entre 1 y 5', 400);
  }

  let resolvedMicrotiendaId = Number(idMicrotienda);
  const resolvedProductId = idProducto ? Number(idProducto) : null;

  if (!resolvedMicrotiendaId && !resolvedProductId) {
    throw buildHttpError('Debes seleccionar una microtienda o producto', 400);
  }

  if (resolvedProductId) {
    const product = await findProductById(resolvedProductId);

    if (!product || !product.estado || product.estado_revision !== 'APROBADO') {
      throw buildHttpError('El producto seleccionado no existe', 404);
    }

    resolvedMicrotiendaId = product.id_microtienda;
  }

  const microtienda = await findMicrotiendaById(resolvedMicrotiendaId);

  if (!microtienda || microtienda.estado_revision !== 'APROBADO') {
    throw buildHttpError('La microtienda seleccionada no existe', 404);
  }

  const createdRating = await createRating({
    puntuacion: numericScore,
    comentario: comentario.trim(),
    nombreVisitante: nombreVisitante.trim(),
    tipoDocumento: tipoDocumento.trim(),
    numeroDocumento: numeroDocumento.trim(),
    direccion: direccion?.trim() || '',
    telefono: telefono.trim(),
    estadoRevision: 'PENDIENTE',
    idProducto: resolvedProductId || null,
    idMicrotienda: resolvedMicrotiendaId,
  });

  return sanitizeRating(createdRating, { includePrivate: true });
};

export const reviewRatingService = async (id, { estadoRevision }) => {
  if (!['APROBADO', 'RECHAZADO', 'PENDIENTE'].includes(estadoRevision)) {
    throw buildHttpError('El estado de revision no es valido', 400);
  }

  const rating = await updateRatingReviewStatus(Number(id), estadoRevision);

  if (!rating) {
    throw buildHttpError('Calificacion no encontrada', 404);
  }

  return sanitizeRating(rating, { includePrivate: true });
};

export const deleteRatingService = async (id) => {
  const numericId = Number(id);
  const rating = await findRatingById(numericId);

  if (!rating) {
    throw buildHttpError('Calificación no encontrada', 404);
  }

  await deleteRating(numericId);
  return { deleted: true };
};
