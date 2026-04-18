import axios from 'axios';

import { getSessionToken } from './session.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = getSessionToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const unwrap = async (request) => {
  try {
    const response = await request;
    return response.data?.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'No se pudo completar la solicitud');
  }
};

export const loginRequest = (credentials) => unwrap(api.post('/auth/login', credentials));

export const getUsersRequest = () => unwrap(api.get('/usuarios'));
export const createUserRequest = (userData) => unwrap(api.post('/usuarios', userData));
export const createEntrepreneurRequest = (userData) =>
  unwrap(api.post('/usuarios/solicitudes-emprendedor', userData));
export const createPasswordResetRequest = (userData) =>
  unwrap(api.post('/usuarios/solicitudes-cambio-password', userData));
export const updateUserRequest = (id, userData) => unwrap(api.put(`/usuarios/${id}`, userData));
export const deleteUserRequest = (id) => unwrap(api.delete(`/usuarios/${id}`));
export const changeMyPasswordRequest = (payload) => unwrap(api.patch('/usuarios/me/password', payload));

export const getCategoriesRequest = (onlyActive = false) =>
  unwrap(api.get('/categorias', { params: { onlyActive } }));
export const createCategoryRequest = (payload) => unwrap(api.post('/categorias', payload));
export const updateCategoryRequest = (id, payload) => unwrap(api.put(`/categorias/${id}`, payload));
export const deleteCategoryRequest = (id) => unwrap(api.delete(`/categorias/${id}`));

export const getMicrotiendasRequest = (includePending = false) =>
  includePending
    ? unwrap(api.get('/microtiendas/revision/lista'))
    : unwrap(api.get('/microtiendas'));
export const getMarketplaceMicrotiendasRequest = ({ page = 1, limit = 9, search = '', categoria = '' } = {}) =>
  unwrap(
    api.get('/microtiendas', {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(categoria && categoria !== 'Todos' ? { categoria } : {}),
      },
    }),
  );
export const getMicrotiendaByIdRequest = (id) => unwrap(api.get(`/microtiendas/${id}`));
export const getMyMicrotiendaRequest = () => unwrap(api.get('/microtiendas/mine'));
export const createMicrotiendaRequest = (payload) => unwrap(api.post('/microtiendas', payload));
export const updateMicrotiendaRequest = (id, payload) => unwrap(api.put(`/microtiendas/${id}`, payload));
export const reviewMicrotiendaRequest = (id, payload) =>
  unwrap(api.patch(`/microtiendas/${id}/revision`, payload));
export const deleteMicrotiendaRequest = (id) => unwrap(api.delete(`/microtiendas/${id}`));

export const getProductsRequest = (microtiendaId, includePending = false) =>
  includePending
    ? unwrap(api.get('/productos/revision/lista', { params: microtiendaId ? { microtiendaId } : undefined }))
    : unwrap(api.get('/productos', { params: microtiendaId ? { microtiendaId } : undefined }));
export const getMyProductsRequest = () => unwrap(api.get('/productos/mine'));
export const createProductRequest = (payload) => unwrap(api.post('/productos', payload));
export const updateProductRequest = (id, payload) => unwrap(api.put(`/productos/${id}`, payload));
export const reviewProductRequest = (id, payload) =>
  unwrap(api.patch(`/productos/${id}/revision`, payload));
export const deleteProductRequest = (id) => unwrap(api.delete(`/productos/${id}`));

export const getRatingsSummaryRequest = () => unwrap(api.get('/calificaciones/resumen'));
export const getRatingsRequest = (params) =>
  params?.includePending || params?.includePrivate
    ? unwrap(api.get('/calificaciones/revision/lista', { params }))
    : unwrap(api.get('/calificaciones', { params }));
export const getMyRatingsRequest = ({ page = 1, limit = 10 } = {}) =>
  unwrap(api.get('/calificaciones/mis-resenas', { params: { page, limit } }));
export const createRatingRequest = (payload) => unwrap(api.post('/calificaciones', payload));
export const reviewRatingRequest = (id, payload) =>
  unwrap(api.patch(`/calificaciones/${id}/revision`, payload));

export const createPqrsRequest = (payload) => unwrap(api.post('/pqrs', payload));
export const getPqrsRequest = () => unwrap(api.get('/pqrs'));
export const updatePqrsStatusRequest = (id, payload) => unwrap(api.patch(`/pqrs/${id}/estado`, payload));
export const deletePqrsRequest = (id) => unwrap(api.delete(`/pqrs/${id}`));
export const deleteRatingRequest = (id) => unwrap(api.delete(`/calificaciones/${id}`));

export const getAdminMetricsRequest = () => unwrap(api.get('/metricas/admin'));
export const getAdminAnalyticsRequest = (range = 'weekly') =>
  unwrap(api.get('/metricas/admin/analitica', { params: { range } }));
export const getEntrepreneurMetricsRequest = (range = 'weekly') =>
  unwrap(api.get('/metricas/emprendedor', { params: { range } }));
export const getPublicMetricsRequest = () => unwrap(api.get('/metricas/publicas'));
export const createMicrotiendaViewRequest = (payload) =>
  unwrap(api.post('/metricas/visitas/microtienda', payload));
export const createProductViewRequest = (payload) =>
  unwrap(api.post('/metricas/visitas/producto', payload));
export const updateMicrotiendaViewDurationRequest = (viewId, payload) =>
  unwrap(api.patch(`/metricas/visitas/microtienda/${viewId}/permanencia`, payload));
export const updateProductViewDurationRequest = (viewId, payload) =>
  unwrap(api.patch(`/metricas/visitas/producto/${viewId}/permanencia`, payload));
export const downloadAdminAnalyticsReportRequest = ({ format = 'csv', range = 'weekly' } = {}) =>
  api.get('/metricas/admin/reportes', {
    params: { format, range },
    responseType: 'blob',
  });
export const downloadCurrentAnalyticsReportRequest = ({ format = 'csv', range = 'weekly' } = {}) =>
  api.get('/metricas/reportes', {
    params: { format, range },
    responseType: 'blob',
  });

export default api;
