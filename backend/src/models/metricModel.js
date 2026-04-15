import { readData } from '../utils/jsonDb.js';

export const getAdminMetrics = async () => {
  const data = await readData();
  const entrepreneurRole = data.roles.find((item) => item.nombre === 'EMPRENDEDOR');
  const approvedRatings = data.calificaciones.filter((item) => item.estado_revision === 'APROBADO');
  const positiveRatings = approvedRatings.filter((item) => Number(item.puntuacion) >= 4);
  const satisfactionRate =
    approvedRatings.length > 0
      ? Math.round((positiveRatings.length / approvedRatings.length) * 100)
      : 0;

  return {
    total_usuarios: data.usuarios.length,
    total_emprendedores: data.usuarios.filter((item) => item.id_rol === entrepreneurRole?.id_rol).length,
    usuarios_activos: data.usuarios.filter((item) => item.estado).length,
    categorias_activas: data.categorias.filter((item) => item.estado).length,
    microtiendas_activas: data.microtiendas.filter((item) => item.estado && item.estado_revision === 'APROBADO').length,
    productos_activos: data.productos.filter((item) => item.estado && item.estado_revision === 'APROBADO').length,
    total_pqrs: data.pqrs.length,
    total_calificaciones: approvedRatings.length,
    tasa_satisfaccion: satisfactionRate,
    microtiendas_pendientes: data.microtiendas.filter((item) => item.estado_revision === 'PENDIENTE').length,
    productos_pendientes: data.productos.filter((item) => item.estado_revision === 'PENDIENTE').length,
    calificaciones_pendientes: data.calificaciones.filter((item) => item.estado_revision === 'PENDIENTE').length,
  };
};

export const getCategoryMetrics = async () => {
  const data = await readData();

  return data.categorias
    .filter((item) => item.estado)
    .map((category) => ({
      id_categoria: category.id_categoria,
      nombre: category.nombre,
      total_microtiendas: data.microtiendas.filter(
        (item) => item.id_categoria === category.id_categoria && item.estado,
      ).length,
      total_productos: data.productos.filter(
        (item) => item.id_categoria === category.id_categoria && item.estado,
      ).length,
    }))
    .sort((a, b) => b.total_microtiendas - a.total_microtiendas || b.total_productos - a.total_productos);
};

export const getEntrepreneurMetrics = async (userId) => {
  const data = await readData();
  const microtienda = data.microtiendas.find((item) => item.id_usuario === userId) || null;

  if (!microtienda) {
    return null;
  }

  const productos = data.productos.filter(
    (item) => item.id_microtienda === microtienda.id_microtienda && item.estado,
  );
  const ratings = data.calificaciones.filter(
    (item) => item.id_microtienda === microtienda.id_microtienda,
  );
  const promedio =
    ratings.length > 0
      ? ratings.reduce((acc, item) => acc + Number(item.puntuacion), 0) / ratings.length
      : 0;

  return {
    id_microtienda: microtienda.id_microtienda,
    microtienda: microtienda.nombre,
    total_productos: productos.length,
    inventario_total: productos.reduce((acc, item) => acc + Number(item.stock || 0), 0),
    promedio_calificacion: Number(promedio.toFixed(1)),
    total_calificaciones: ratings.length,
  };
};
