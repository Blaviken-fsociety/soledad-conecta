import { findCategoryById } from '../models/categoryModel.js';
import {
  createProduct,
  deleteProduct,
  findProductById,
  findProducts,
  updateProduct,
} from '../models/productModel.js';
import { findMicrotiendaById, findMicrotiendaByUserId } from '../models/microtiendaModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizeProduct = (product) => ({
  id: product.id_producto,
  nombre: product.nombre,
  descripcion: product.descripcion || '',
  precio: Number(product.precio || 0),
  stock: Number(product.stock || 0),
  imagenUrl: product.imagen_url || '',
  estado: Boolean(product.estado),
  estadoRevision: product.estado_revision || 'PENDIENTE',
  observacionRevision: product.observacion_revision || '',
  fechaCreacion: product.fecha_creacion,
  microtiendaId: product.id_microtienda,
  microtienda: product.microtienda || '',
  categoriaId: product.id_categoria,
  categoria: product.categoria || '',
  promedioCalificacion: Number(product.promedio_calificacion || 0),
  totalCalificaciones: Number(product.total_calificaciones || 0),
});

const parseId = (value, label) => {
  const numericId = Number(value);

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

const ensureOwnerMicrotienda = async (userId) => {
  const microtienda = await findMicrotiendaByUserId(userId, { includeInactive: true });

  if (!microtienda) {
    throw buildHttpError('Primero debes registrar tu microtienda', 409);
  }

  return microtienda;
};

export const getProductsService = async ({ microtiendaId, includePending = false } = {}) => {
  const products = await findProducts({ microtiendaId, includePending });
  return products.map(sanitizeProduct);
};

export const getMyProductsService = async (authUser) => {
  const ownerMicrotienda = await ensureOwnerMicrotienda(authUser.id);
  const products = await findProducts({
    microtiendaId: ownerMicrotienda.id_microtienda,
    includeInactive: true,
    includePending: true,
  });

  return products.map(sanitizeProduct);
};

export const createProductService = async (authUser, payload) => {
  const ownerMicrotienda = await ensureOwnerMicrotienda(authUser.id);
  const categoryId = parseId(payload.idCategoria, 'categoria');

  if (!payload.nombre?.trim()) {
    throw buildHttpError('El nombre del producto es obligatorio', 400);
  }

  await validateCategory(categoryId);

  const createdProduct = await createProduct({
    nombre: payload.nombre.trim(),
    descripcion: payload.descripcion?.trim() || null,
    precio: Number(payload.precio || 0),
    stock: Number(payload.stock || 0),
    imagenUrl: payload.imagenUrl || '',
    estado: payload.estado ?? true,
    estadoRevision: 'PENDIENTE',
    observacionRevision: '',
    idMicrotienda: ownerMicrotienda.id_microtienda,
    idCategoria: categoryId,
  });

  return sanitizeProduct(createdProduct);
};

export const updateProductService = async (authUser, productId, payload) => {
  const numericProductId = parseId(productId, 'producto');
  const product = await findProductById(numericProductId);

  if (!product) {
    throw buildHttpError('Producto no encontrado', 404);
  }

  const microtienda = await findMicrotiendaById(product.id_microtienda, { includeInactive: true });

  if (!microtienda || microtienda.id_usuario !== authUser.id) {
    throw buildHttpError('No tienes permisos para editar este producto', 403);
  }

  const categoryId = parseId(payload.idCategoria, 'categoria');
  await validateCategory(categoryId);

  const updatedProduct = await updateProduct(numericProductId, {
    nombre: payload.nombre?.trim() || product.nombre,
    descripcion: payload.descripcion?.trim() || null,
    precio: Number(payload.precio ?? product.precio ?? 0),
    stock: Number(payload.stock ?? product.stock ?? 0),
    imagenUrl: payload.imagenUrl || product.imagen_url || '',
    estado: payload.estado ?? product.estado ?? true,
    estadoRevision: product.estado_revision || 'PENDIENTE',
    observacionRevision: product.observacion_revision || '',
    idCategoria: categoryId,
  });

  return sanitizeProduct(updatedProduct);
};

export const reviewProductService = async (id, { estadoRevision, observacionRevision }) => {
  const numericProductId = parseId(id, 'producto');
  const product = await findProductById(numericProductId);

  if (!product) {
    throw buildHttpError('Producto no encontrado', 404);
  }

  if (!['APROBADO', 'RECHAZADO', 'PENDIENTE'].includes(estadoRevision)) {
    throw buildHttpError('El estado de revision no es valido', 400);
  }

  const updatedProduct = await updateProduct(numericProductId, {
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    stock: product.stock,
    imagenUrl: product.imagen_url || '',
    estado: product.estado,
    estadoRevision,
    observacionRevision: observacionRevision || '',
    idCategoria: product.id_categoria,
  });

  return sanitizeProduct(updatedProduct);
};

export const deleteProductService = async (authUser, productId) => {
  const numericProductId = parseId(productId, 'producto');
  const product = await findProductById(numericProductId);

  if (!product) {
    throw buildHttpError('Producto no encontrado', 404);
  }

  const microtienda = await findMicrotiendaById(product.id_microtienda, { includeInactive: true });

  if (!microtienda || microtienda.id_usuario !== authUser.id) {
    throw buildHttpError('No tienes permisos para eliminar este producto', 403);
  }

  await deleteProduct(numericProductId);
};
