import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const buildRating = (rating, data) => {
  if (!rating) {
    return null;
  }

  const producto = data.productos.find((item) => item.id_producto === rating.id_producto);
  const microtienda = data.microtiendas.find((item) => item.id_microtienda === rating.id_microtienda);

  return {
    ...rating,
    producto: producto?.nombre || null,
    microtienda: microtienda?.nombre || null,
  };
};

export const findRatings = async ({ microtiendaId, productId, includePending = false } = {}) => {
  const data = await readData();

  return data.calificaciones
    .filter(
      (item) =>
        (includePending || item.estado_revision === 'APROBADO') &&
        (!microtiendaId || item.id_microtienda === microtiendaId) &&
        (!productId || item.id_producto === productId),
    )
    .map((item) => buildRating(item, data))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const findRatingSummaryByMicrotienda = async () => {
  const data = await readData();

  return data.microtiendas
    .filter((item) => item.estado && item.estado_revision === 'APROBADO')
    .map((microtienda) => {
      const ratings = data.calificaciones.filter(
        (item) =>
          item.id_microtienda === microtienda.id_microtienda && item.estado_revision === 'APROBADO',
      );
      const promedio =
        ratings.length > 0
          ? ratings.reduce((acc, item) => acc + Number(item.puntuacion), 0) / ratings.length
          : 0;

      return {
        id_microtienda: microtienda.id_microtienda,
        microtienda: microtienda.nombre,
        promedio: Number(promedio.toFixed(1)),
        total_calificaciones: ratings.length,
        comentario_destacado: ratings.at(-1)?.comentario || null,
      };
    })
    .sort((a, b) => b.promedio - a.promedio || b.total_calificaciones - a.total_calificaciones);
};

export const createRating = async ({
  puntuacion,
  comentario,
  nombreVisitante,
  tipoDocumento,
  numeroDocumento,
  direccion,
  telefono,
  estadoRevision,
  idProducto,
  idMicrotienda,
}) => {
  let created = null;

  await updateData(async (data) => {
    created = {
      id_calificacion: getNextId(data.calificaciones, 'id_calificacion'),
      puntuacion,
      comentario,
      nombre_visitante: nombreVisitante,
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      direccion,
      telefono,
      fecha: new Date().toISOString(),
      estado_revision: estadoRevision,
      id_producto: idProducto,
      id_microtienda: idMicrotienda,
    };

    data.calificaciones.push(created);
    return data;
  });

  return findRatingById(created.id_calificacion);
};

export const findRatingById = async (id) => {
  const data = await readData();
  const rating = data.calificaciones.find((item) => item.id_calificacion === id) || null;
  return buildRating(rating, data);
};

export const updateRatingReviewStatus = async (id, estadoRevision) => {
  await updateData(async (data) => {
    data.calificaciones = data.calificaciones.map((item) =>
      item.id_calificacion === id ? { ...item, estado_revision: estadoRevision } : item,
    );
    return data;
  });

  return findRatingById(id);
};
