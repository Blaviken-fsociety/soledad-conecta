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
export const createRatingRequest = (payload) => unwrap(api.post('/calificaciones', payload));
export const reviewRatingRequest = (id, payload) =>
  unwrap(api.patch(`/calificaciones/${id}/revision`, payload));

export const createPqrsRequest = (payload) => unwrap(api.post('/pqrs', payload));
export const getPqrsRequest = () => unwrap(api.get('/pqrs'));
export const updatePqrsStatusRequest = (id, payload) => unwrap(api.patch(`/pqrs/${id}/estado`, payload));
export const deletePqrsRequest = (id) => unwrap(api.delete(`/pqrs/${id}`));
export const deleteRatingRequest = (id) => unwrap(api.delete(`/calificaciones/${id}`));

export const getAdminMetricsRequest = () => unwrap(api.get('/metricas/admin'));
export const getEntrepreneurMetricsRequest = () => unwrap(api.get('/metricas/emprendedor'));
export const getPublicMetricsRequest = () => unwrap(api.get('/metricas/publicas'));

export default api;
