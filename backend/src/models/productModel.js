import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const buildProduct = (product, data) => {
  if (!product) {
    return null;
  }

  const categoria = data.categorias.find((item) => item.id_categoria === product.id_categoria);
  const microtienda = data.microtiendas.find((item) => item.id_microtienda === product.id_microtienda);
  const calificaciones = data.calificaciones.filter(
    (item) => item.id_producto === product.id_producto && item.estado_revision === 'APROBADO',
  );
  const promedio =
    calificaciones.length > 0
      ? calificaciones.reduce((acc, item) => acc + Number(item.puntuacion), 0) / calificaciones.length
      : 0;

  return {
    ...product,
    categoria: categoria?.nombre || null,
    microtienda: microtienda?.nombre || null,
    imagen_url: product.imagen_url || '',
    promedio_calificacion: Number(promedio.toFixed(1)),
    total_calificaciones: calificaciones.length,
  };
};

export const findProducts = async ({ microtiendaId, includeInactive = false, includePending = false } = {}) => {
  const data = await readData();

  return data.productos
    .filter(
      (item) =>
        (includeInactive || item.estado) &&
        (includePending || item.estado_revision === 'APROBADO') &&
        (!microtiendaId || item.id_microtienda === microtiendaId),
    )
    .map((item) => buildProduct(item, data))
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
};

export const findProductById = async (id) => {
  const data = await readData();
  const product = data.productos.find((item) => item.id_producto === id) || null;
  return buildProduct(product, data);
};

export const createProduct = async ({
  nombre,
  descripcion,
  precio,
  stock,
  imagenUrl,
  estado,
  estadoRevision,
  observacionRevision,
  idMicrotienda,
  idCategoria,
}) => {
  let created = null;

  await updateData(async (data) => {
    created = {
      id_producto: getNextId(data.productos, 'id_producto'),
      nombre,
      descripcion,
      precio,
      stock,
      imagen_url: imagenUrl,
      estado,
      estado_revision: estadoRevision,
      observacion_revision: observacionRevision,
      fecha_creacion: new Date().toISOString(),
      id_microtienda: idMicrotienda,
      id_categoria: idCategoria,
    };

    data.productos.push(created);
    return data;
  });

  return findProductById(created.id_producto);
};

export const updateProduct = async (
  id,
  { nombre, descripcion, precio, stock, imagenUrl, estado, estadoRevision, observacionRevision, idCategoria },
) => {
  await updateData(async (data) => {
    data.productos = data.productos.map((item) =>
      item.id_producto === id
        ? {
            ...item,
            nombre,
            descripcion,
            precio,
            stock,
            imagen_url: imagenUrl,
            estado,
            estado_revision: estadoRevision,
            observacion_revision: observacionRevision,
            id_categoria: idCategoria,
          }
        : item,
    );
    return data;
  });

  return findProductById(id);
};

export const deleteProduct = async (id) => {
  await updateData(async (data) => {
    data.productos = data.productos.filter((item) => item.id_producto !== id);
    data.calificaciones = data.calificaciones.filter((item) => item.id_producto !== id);
    return data;
  });
};
