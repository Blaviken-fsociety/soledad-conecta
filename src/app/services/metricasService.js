import {
  createMicrotiendaViewRequest,
  createProductViewRequest,
  downloadCurrentAnalyticsReportRequest,
  downloadAdminAnalyticsReportRequest,
  getAdminAnalyticsRequest,
  updateMicrotiendaViewDurationRequest,
  updateProductViewDurationRequest,
} from '../utils/api';

const getDownloadExtension = (format) => {
  if (format === 'excel' || format === 'xls' || format === 'xlsx') {
    return 'xls';
  }

  return 'csv';
};

const triggerBrowserDownload = (blob, filename) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

export const getAdminAnalytics = async (range = 'weekly') => {
  return getAdminAnalyticsRequest(range);
};

export const trackMicrotiendaVisit = async (microtiendaId) => {
  return createMicrotiendaViewRequest({ microtiendaId });
};

export const trackProductVisit = async ({ productId, microtiendaId }) => {
  return createProductViewRequest({ productId, microtiendaId });
};

export const registerMicrotiendaStay = async (viewId, durationSeconds) => {
  if (!viewId) {
    return null;
  }

  return updateMicrotiendaViewDurationRequest(viewId, { durationSeconds });
};

export const registerProductStay = async (viewId, durationSeconds) => {
  if (!viewId) {
    return null;
  }

  return updateProductViewDurationRequest(viewId, { durationSeconds });
};

export const downloadAnalyticsReport = async ({
  format = 'csv',
  range = 'weekly',
  scope = 'admin',
} = {}) => {
  const response =
    scope === 'entrepreneur'
      ? await downloadCurrentAnalyticsReportRequest({ format, range })
      : await downloadAdminAnalyticsReportRequest({ format, range });
  const extension = getDownloadExtension(format);
  const filename = `${scope === 'entrepreneur' ? 'reporte-mi-negocio' : 'reporte-metricas'}-${new Date().toISOString().slice(0, 10)}.${extension}`;

  triggerBrowserDownload(response.data, filename);
};
