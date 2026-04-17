import { findMicrotiendaById } from '../models/microtiendaModel.js';
import { getAdminMetrics, getCategoryMetrics, getEntrepreneurMetrics } from '../models/metricModel.js';
import { findProductById } from '../models/productModel.js';
import {
  createMicrotiendaView,
  createProductView,
  getAnalyticsSnapshot,
  updateMicrotiendaViewDuration,
  updateProductViewDuration,
} from '../models/metricasModel.js';
import { buildHttpError } from '../utils/httpError.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_RANGE = 'weekly';

const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

const formatDateLabel = (value) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));

const normalizeRange = (range) => (range === 'monthly' ? 'monthly' : DEFAULT_RANGE);

const getRangeDays = (range) => (normalizeRange(range) === 'monthly' ? 30 : 7);

const startOfDayTimestamp = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const getCollection = (collection) => (Array.isArray(collection) ? collection : []);

const escapeCsvValue = (value) => {
  const normalized = value == null ? '' : String(value);
  return `"${normalized.replace(/"/g, '""')}"`;
};

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildGrowth = (currentValue, previousValue) => {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);
  const delta = current - previous;

  if (previous === 0) {
    return {
      current,
      previous,
      delta,
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'steady',
    };
  }

  const percentage = Number(((delta / previous) * 100).toFixed(1));

  return {
    current,
    previous,
    delta,
    percentage,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'steady',
  };
};

const buildPeriodBuckets = (range) => {
  const days = getRangeDays(range);
  const today = startOfDayTimestamp(Date.now());

  return Array.from({ length: days }, (_, index) => {
    const timestamp = today - (days - index - 1) * DAY_IN_MS;

    return {
      key: new Date(timestamp).toISOString(),
      label: formatDateLabel(timestamp),
      microtiendaViews: 0,
      productViews: 0,
      totalViews: 0,
      uniqueUsers: 0,
      users: new Set(),
    };
  });
};

const mapRoleName = (roleId, roles) => {
  const role = roles.find((item) => Number(item.id_rol) === Number(roleId));
  return role?.nombre || '';
};

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
  const snapshot = await getAnalyticsSnapshot();
  const microtiendaId = Number(metrics?.id_microtienda || 0);
  const approvedProducts = getCollection(snapshot.productos).filter(
    (item) => Number(item.id_microtienda) === microtiendaId && item.estado && item.estado_revision === 'APROBADO',
  );
  const productMap = new Map(approvedProducts.map((item) => [Number(item.id_producto), item]));
  const productViews = getCollection(snapshot.product_views).filter(
    (item) => Number(item.microtienda_id) === microtiendaId,
  );
  const directViews = getCollection(snapshot.microtienda_views).filter(
    (item) => Number(item.microtienda_id) === microtiendaId,
  );
  const allRatings = getCollection(snapshot.calificaciones).filter(
    (item) => Number(item.id_microtienda) === microtiendaId,
  );
  const approvedRatings = allRatings.filter((item) => item.estado_revision === 'APROBADO');
  const productRanking = approvedProducts
    .map((product) => {
      const productViewsCount = productViews.filter(
        (view) => Number(view.producto_id) === Number(product.id_producto),
      ).length;

      return {
        id: Number(product.id_producto),
        nombre: product.nombre,
        vistas: productViewsCount,
        stock: Number(product.stock || 0),
      };
    })
    .sort((a, b) => b.vistas - a.vistas || a.nombre.localeCompare(b.nombre))
    .slice(0, 5);

  const chartBuckets = buildPeriodBuckets('weekly');
  const bucketByKey = new Map(chartBuckets.map((item) => [item.key.slice(0, 10), item]));

  [...directViews, ...productViews].forEach((view) => {
    const bucket = bucketByKey.get(new Date(view.timestamp).toISOString().slice(0, 10));

    if (!bucket) {
      return;
    }

    if ('producto_id' in view) {
      bucket.productViews += 1;
    } else {
      bucket.microtiendaViews += 1;
    }

    bucket.totalViews += 1;
  });

  return {
    microtiendaId: metrics?.id_microtienda || null,
    microtienda: metrics?.microtienda || '',
    totalProductos: Number(metrics?.total_productos || 0),
    inventarioTotal: Number(metrics?.inventario_total || 0),
    promedioCalificacion: Number(metrics?.promedio_calificacion || 0),
    totalCalificaciones: Number(metrics?.total_calificaciones || 0),
    totalVisitasMicrotienda: directViews.length + productViews.length,
    visitasDirectasMicrotienda: directViews.length,
    visualizacionesProductos: productViews.length,
    totalResenasRecibidas: allRatings.length,
    totalResenasAprobadas: approvedRatings.length,
    productosMasVistos: productRanking,
    actividadSemanal: chartBuckets.map((bucket) => ({
      label: bucket.label,
      microtiendaViews: bucket.microtiendaViews,
      productViews: bucket.productViews,
      totalViews: bucket.totalViews,
    })),
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

export const registerMicrotiendaViewService = async ({ microtiendaId, userId }) => {
  const numericMicrotiendaId = Number(microtiendaId);

  if (!Number.isInteger(numericMicrotiendaId) || numericMicrotiendaId <= 0) {
    throw buildHttpError('La microtienda indicada no es válida', 400);
  }

  const microtienda = await findMicrotiendaById(numericMicrotiendaId, { includeInactive: true });

  if (!microtienda || microtienda.estado_revision !== 'APROBADO') {
    throw buildHttpError('La microtienda no está disponible para analítica', 404);
  }

  return createMicrotiendaView({
    microtiendaId: numericMicrotiendaId,
    userId: userId || null,
  });
};

export const registerProductViewService = async ({ productId, microtiendaId, userId }) => {
  const numericProductId = Number(productId);
  const numericMicrotiendaId = Number(microtiendaId);

  if (!Number.isInteger(numericProductId) || numericProductId <= 0) {
    throw buildHttpError('El producto indicado no es válido', 400);
  }

  if (!Number.isInteger(numericMicrotiendaId) || numericMicrotiendaId <= 0) {
    throw buildHttpError('La microtienda indicada no es válida', 400);
  }

  const product = await findProductById(numericProductId);

  if (!product || Number(product.id_microtienda) !== numericMicrotiendaId) {
    throw buildHttpError('El producto no pertenece a la microtienda indicada', 400);
  }

  if (product.estado_revision !== 'APROBADO') {
    throw buildHttpError('El producto no está disponible para analítica', 404);
  }

  return createProductView({
    productId: numericProductId,
    microtiendaId: numericMicrotiendaId,
    userId: userId || null,
  });
};

export const registerMicrotiendaDurationService = async (viewId, durationSeconds) => {
  const updatedView = await updateMicrotiendaViewDuration(viewId, Math.max(Number(durationSeconds || 0), 0));

  if (!updatedView) {
    throw buildHttpError('No se encontró la visita de microtienda indicada', 404);
  }

  return updatedView;
};

export const registerProductDurationService = async (viewId, durationSeconds) => {
  const updatedView = await updateProductViewDuration(viewId, Math.max(Number(durationSeconds || 0), 0));

  if (!updatedView) {
    throw buildHttpError('No se encontró la visita de producto indicada', 404);
  }

  return updatedView;
};

const buildAdminAnalytics = (snapshot, range) => {
  const selectedRange = normalizeRange(range);
  const days = getRangeDays(selectedRange);
  const now = Date.now();
  const currentStart = startOfDayTimestamp(now - (days - 1) * DAY_IN_MS);
  const previousStart = currentStart - days * DAY_IN_MS;
  const currentEnd = now;

  const roles = getCollection(snapshot.roles);
  const usuarios = getCollection(snapshot.usuarios);
  const categorias = getCollection(snapshot.categorias).filter((item) => item.estado);
  const microtiendas = getCollection(snapshot.microtiendas).filter(
    (item) => item.estado && item.estado_revision === 'APROBADO',
  );
  const productos = getCollection(snapshot.productos).filter(
    (item) => item.estado && item.estado_revision === 'APROBADO',
  );
  const microtiendaViews = getCollection(snapshot.microtienda_views);
  const productViews = getCollection(snapshot.product_views);

  const categoryMap = new Map(categorias.map((item) => [Number(item.id_categoria), item]));
  const microtiendaMap = new Map(microtiendas.map((item) => [Number(item.id_microtienda), item]));
  const productMap = new Map(productos.map((item) => [Number(item.id_producto), item]));
  const entrepreneurRole = roles.find((item) => item.nombre === 'EMPRENDEDOR');

  const allViewEvents = [
    ...microtiendaViews.map((item) => ({
      scope: 'microtienda',
      timestamp: item.timestamp,
      userId: item.id_usuario,
      durationSeconds: Number(item.duracion_segundos || 0),
    })),
    ...productViews.map((item) => ({
      scope: 'producto',
      timestamp: item.timestamp,
      userId: item.id_usuario,
      durationSeconds: Number(item.duracion_segundos || 0),
    })),
  ];

  const currentMicrotiendaViews = microtiendaViews.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime();
    return timestamp >= currentStart && timestamp <= currentEnd;
  });
  const currentProductViews = productViews.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime();
    return timestamp >= currentStart && timestamp <= currentEnd;
  });
  const previousMicrotiendaViews = microtiendaViews.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime();
    return timestamp >= previousStart && timestamp < currentStart;
  });
  const previousProductViews = productViews.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime();
    return timestamp >= previousStart && timestamp < currentStart;
  });

  const periodBuckets = buildPeriodBuckets(selectedRange);
  const bucketByKey = new Map(periodBuckets.map((item) => [item.key.slice(0, 10), item]));

  [...currentMicrotiendaViews, ...currentProductViews].forEach((view) => {
    const bucketKey = new Date(view.timestamp).toISOString().slice(0, 10);
    const bucket = bucketByKey.get(bucketKey);

    if (!bucket) {
      return;
    }

    if ('producto_id' in view) {
      bucket.productViews += 1;
    } else {
      bucket.microtiendaViews += 1;
    }

    bucket.totalViews += 1;

    if (view.id_usuario) {
      bucket.users.add(Number(view.id_usuario));
    }
  });

  const activity = periodBuckets.map((bucket) => ({
    label: bucket.label,
    microtiendaViews: bucket.microtiendaViews,
    productViews: bucket.productViews,
    totalViews: bucket.totalViews,
    uniqueUsers: bucket.users.size,
  }));

  const categoryDistribution = categorias
    .map((category) => {
      const views = productViews.filter((view) => {
        const product = productMap.get(Number(view.producto_id));
        return Number(product?.id_categoria) === Number(category.id_categoria);
      }).length;

      const fallbackTotal = productos.filter(
        (product) => Number(product.id_categoria) === Number(category.id_categoria),
      ).length;

      return {
        id: Number(category.id_categoria),
        name: category.nombre,
        value: views || fallbackTotal,
      };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const topProducts = productos
    .map((product) => {
      const views = productViews.filter((view) => Number(view.producto_id) === Number(product.id_producto));
      const microtienda = microtiendaMap.get(Number(product.id_microtienda));

      return {
        id: Number(product.id_producto),
        nombre: product.nombre,
        microtienda: microtienda?.nombre || 'Microtienda sin nombre',
        categoria: categoryMap.get(Number(product.id_categoria))?.nombre || 'Sin categoría',
        views: views.length,
        lastViewedAt: views.length
          ? views
              .map((item) => item.timestamp)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : null,
      };
    })
    .sort((a, b) => b.views - a.views || a.nombre.localeCompare(b.nombre))
    .slice(0, 10);

  const topMicrotiendas = microtiendas
    .map((microtienda) => {
      const productViewsForMicrotienda = productViews.filter(
        (view) => Number(view.microtienda_id) === Number(microtienda.id_microtienda),
      );
      const directViews = microtiendaViews.filter(
        (view) => Number(view.microtienda_id) === Number(microtienda.id_microtienda),
      );

      return {
        id: Number(microtienda.id_microtienda),
        nombre: microtienda.nombre,
        categoria: categoryMap.get(Number(microtienda.id_categoria))?.nombre || 'Sin categoría',
        views: directViews.length + productViewsForMicrotienda.length,
        directViews: directViews.length,
        productViews: productViewsForMicrotienda.length,
      };
    })
    .sort((a, b) => b.views - a.views || a.nombre.localeCompare(b.nombre))
    .slice(0, 8);

  const durations = allViewEvents
    .map((item) => Number(item.durationSeconds || 0))
    .filter((item) => item > 0);

  const activeUsersByAnalytics = new Set(
    allViewEvents
      .filter((item) => {
        const timestamp = new Date(item.timestamp).getTime();
        return timestamp >= currentStart && timestamp <= currentEnd && item.userId;
      })
      .map((item) => Number(item.userId)),
  );

  const createdUsersInRange = usuarios.filter((item) => {
    const timestamp = new Date(item.fecha_creacion).getTime();
    return timestamp >= currentStart && timestamp <= currentEnd;
  }).length;

  const kpis = {
    totalMicrotiendasActivas: microtiendas.length,
    totalProductosRegistrados: productos.length,
    usuariosActivos:
      activeUsersByAnalytics.size ||
      usuarios.filter((item) => item.estado && mapRoleName(item.id_rol, roles) === 'EMPRENDEDOR').length,
    tiempoPromedioPermanenciaSegundos: durations.length
      ? Number((durations.reduce((acc, item) => acc + item, 0) / durations.length).toFixed(1))
      : 0,
    totalVistasPeriodo: currentMicrotiendaViews.length + currentProductViews.length,
    totalEmprendedores:
      entrepreneurRole
        ? usuarios.filter((item) => Number(item.id_rol) === Number(entrepreneurRole.id_rol)).length
        : 0,
  };

  const growth = {
    general: buildGrowth(
      currentMicrotiendaViews.length + currentProductViews.length,
      previousMicrotiendaViews.length + previousProductViews.length,
    ),
    microtiendas: buildGrowth(currentMicrotiendaViews.length, previousMicrotiendaViews.length),
    productos: buildGrowth(currentProductViews.length, previousProductViews.length),
    usuarios: buildGrowth(activeUsersByAnalytics.size + createdUsersInRange, 0),
  };

  const recentActivity = [...currentMicrotiendaViews, ...currentProductViews]
    .map((item) => ({
      type: 'producto_id' in item ? 'producto' : 'microtienda',
      timestamp: item.timestamp,
      id: Number(item.producto_id || item.microtienda_id),
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12);

  return {
    range: selectedRange,
    generatedAt: new Date().toISOString(),
    kpis,
    growth,
    charts: {
      categoryDistribution,
      activity,
    },
    rankings: {
      topProducts,
      topMicrotiendas,
    },
    recentActivity,
  };
};

export const getAdminAnalyticsService = async ({ range = DEFAULT_RANGE } = {}) => {
  const snapshot = await getAnalyticsSnapshot();
  return buildAdminAnalytics(snapshot, range);
};

const buildReportRows = (analytics) => {
  const summaryRows = [
    ['Métrica', 'Valor'],
    ['Microtiendas activas', analytics.kpis.totalMicrotiendasActivas],
    ['Productos registrados', analytics.kpis.totalProductosRegistrados],
    ['Usuarios activos', analytics.kpis.usuariosActivos],
    ['Tiempo promedio de permanencia (seg)', analytics.kpis.tiempoPromedioPermanenciaSegundos],
    ['Vistas del periodo', analytics.kpis.totalVistasPeriodo],
    ['Crecimiento general (%)', analytics.growth.general.percentage],
  ];

  const microtiendaRows = [
    ['Microtienda', 'Categoría', 'Visitas totales', 'Visitas directas', 'Vistas de productos'],
    ...analytics.rankings.topMicrotiendas.map((item) => [
      item.nombre,
      item.categoria,
      item.views,
      item.directViews,
      item.productViews,
    ]),
  ];

  const productRows = [
    ['Producto', 'Microtienda', 'Categoría', 'Visualizaciones', 'Última actividad'],
    ...analytics.rankings.topProducts.map((item) => [
      item.nombre,
      item.microtienda,
      item.categoria,
      item.views,
      item.lastViewedAt ? new Date(item.lastViewedAt).toLocaleString('es-CO') : 'Sin registros',
    ]),
  ];

  const activityRows = [
    ['Fecha', 'Visitas microtiendas', 'Visitas productos', 'Visitas totales', 'Usuarios únicos'],
    ...analytics.charts.activity.map((item) => [
      item.label,
      item.microtiendaViews,
      item.productViews,
      item.totalViews,
      item.uniqueUsers,
    ]),
  ];

  return {
    summaryRows,
    microtiendaRows,
    productRows,
    activityRows,
  };
};

const buildCsvReport = (analytics) => {
  const { summaryRows, microtiendaRows, productRows, activityRows } = buildReportRows(analytics);

  const sections = [
    ['Reporte administrativo de métricas'],
    [`Rango seleccionado: ${analytics.range}`],
    [`Generado: ${new Date(analytics.generatedAt).toLocaleString('es-CO')}`],
    [],
    ...summaryRows,
    [],
    ['Visitas por microtienda'],
    ...microtiendaRows,
    [],
    ['Productos más consultados'],
    ...productRows,
    [],
    ['Actividad por fecha'],
    ...activityRows,
  ];

  return sections.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
};

const buildExcelSheetXml = (name, rows) => {
  const rowXml = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
          .join('')}</Row>`,
    )
    .join('');

  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${rowXml}</Table></Worksheet>`;
};

const buildExcelReport = (analytics) => {
  const { summaryRows, microtiendaRows, productRows, activityRows } = buildReportRows(analytics);

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
${buildExcelSheetXml('Resumen', summaryRows)}
${buildExcelSheetXml('Microtiendas', microtiendaRows)}
${buildExcelSheetXml('Productos', productRows)}
${buildExcelSheetXml('Actividad', activityRows)}
</Workbook>`;
};

export const generateAnalyticsReportService = async ({ range = DEFAULT_RANGE, format = 'csv' } = {}) => {
  const analytics = await getAdminAnalyticsService({ range });
  const safeFormat = String(format || 'csv').toLowerCase();
  const dateLabel = new Date().toISOString().slice(0, 10);

  if (safeFormat === 'xlsx' || safeFormat === 'excel' || safeFormat === 'xls') {
    return {
      filename: `reporte-metricas-${dateLabel}.xls`,
      contentType: 'application/vnd.ms-excel; charset=utf-8',
      content: buildExcelReport(analytics),
    };
  }

  return {
    filename: `reporte-metricas-${dateLabel}.csv`,
    contentType: 'text/csv; charset=utf-8',
    content: buildCsvReport(analytics),
  };
};
