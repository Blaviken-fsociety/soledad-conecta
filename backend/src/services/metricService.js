import {
  getAdminMetrics,
  getCategoryMetrics,
  getEntrepreneurMetrics,
} from '../models/metricModel.js';

export const getAdminDashboardMetricsService = async () => {
  const summary = await getAdminMetrics();
  const categoryBreakdown = await getCategoryMetrics();

  return {
    resumen: {
      totalUsuarios: Number(summary?.total_usuarios || 0),
      totalEmprendedores: Number(summary?.total_emprendedores || 0),
      usuariosActivos: Number(summary?.usuarios_activos || 0),
      categoriasActivas: Number(summary?.categorias_activas || 0),
      microtiendasActivas: Number(summary?.microtiendas_activas || 0),
      productosActivos: Number(summary?.productos_activos || 0),
      totalPqrs: Number(summary?.total_pqrs || 0),
      totalCalificaciones: Number(summary?.total_calificaciones || 0),
      microtiendasPendientes: Number(summary?.microtiendas_pendientes || 0),
      productosPendientes: Number(summary?.productos_pendientes || 0),
      calificacionesPendientes: Number(summary?.calificaciones_pendientes || 0),
    },
    categorias: categoryBreakdown.map((item) => ({
      id: item.id_categoria,
      nombre: item.nombre,
      totalMicrotiendas: Number(item.total_microtiendas || 0),
      totalProductos: Number(item.total_productos || 0),
    })),
  };
};

export const getEntrepreneurDashboardMetricsService = async (userId) => {
  const metrics = await getEntrepreneurMetrics(userId);

  return {
    microtiendaId: metrics?.id_microtienda || null,
    microtienda: metrics?.microtienda || '',
    totalProductos: Number(metrics?.total_productos || 0),
    inventarioTotal: Number(metrics?.inventario_total || 0),
    promedioCalificacion: Number(metrics?.promedio_calificacion || 0),
    totalCalificaciones: Number(metrics?.total_calificaciones || 0),
  };
};

export const getPublicMetricsService = async () => {
  const summary = await getAdminMetrics();

  return {
    totalEmprendedores: Number(summary?.total_emprendedores || 0),
    microtiendasActivas: Number(summary?.microtiendas_activas || 0),
    tasaSatisfaccion: Number(summary?.tasa_satisfaccion || 0),
  };
};
