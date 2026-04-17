import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const ensureAnalyticsCollections = (data) => {
  data.microtienda_views = Array.isArray(data.microtienda_views) ? data.microtienda_views : [];
  data.product_views = Array.isArray(data.product_views) ? data.product_views : [];
  return data;
};

export const getAnalyticsSnapshot = async () => {
  const data = await readData();
  return ensureAnalyticsCollections(data);
};

export const createMicrotiendaView = async ({ microtiendaId, userId = null, timestamp = new Date().toISOString() }) => {
  let createdView = null;

  await updateData(async (data) => {
    ensureAnalyticsCollections(data);

    createdView = {
      id: getNextId(data.microtienda_views, 'id'),
      microtienda_id: microtiendaId,
      id_usuario: userId,
      timestamp,
      duracion_segundos: 0,
    };

    data.microtienda_views.push(createdView);
    return data;
  });

  return createdView;
};

export const createProductView = async ({
  productId,
  microtiendaId,
  userId = null,
  timestamp = new Date().toISOString(),
}) => {
  let createdView = null;

  await updateData(async (data) => {
    ensureAnalyticsCollections(data);

    createdView = {
      id: getNextId(data.product_views, 'id'),
      producto_id: productId,
      microtienda_id: microtiendaId,
      id_usuario: userId,
      timestamp,
      duracion_segundos: 0,
    };

    data.product_views.push(createdView);
    return data;
  });

  return createdView;
};

export const updateMicrotiendaViewDuration = async (viewId, durationSeconds) => {
  let updatedView = null;

  await updateData(async (data) => {
    ensureAnalyticsCollections(data);

    data.microtienda_views = data.microtienda_views.map((view) => {
      if (Number(view.id) !== Number(viewId)) {
        return view;
      }

      updatedView = {
        ...view,
        duracion_segundos: Math.max(Number(durationSeconds || 0), Number(view.duracion_segundos || 0)),
      };

      return updatedView;
    });

    return data;
  });

  return updatedView;
};

export const updateProductViewDuration = async (viewId, durationSeconds) => {
  let updatedView = null;

  await updateData(async (data) => {
    ensureAnalyticsCollections(data);

    data.product_views = data.product_views.map((view) => {
      if (Number(view.id) !== Number(viewId)) {
        return view;
      }

      updatedView = {
        ...view,
        duracion_segundos: Math.max(Number(durationSeconds || 0), Number(view.duracion_segundos || 0)),
      };

      return updatedView;
    });

    return data;
  });

  return updatedView;
};
