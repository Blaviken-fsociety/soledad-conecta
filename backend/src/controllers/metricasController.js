import {
  generateAnalyticsReportService,
  getAdminAnalyticsService,
  getAdminDashboardMetricsService,
  getEntrepreneurDashboardMetricsService,
  getPublicMetricsService,
  registerMicrotiendaDurationService,
  registerMicrotiendaViewService,
  registerProductDurationService,
  registerProductViewService,
} from '../services/metricasService.js';

export const getAdminMetrics = async (_request, response, next) => {
  try {
    const metrics = await getAdminDashboardMetricsService();

    response.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntrepreneurMetrics = async (request, response, next) => {
  try {
    const metrics = await getEntrepreneurDashboardMetricsService(request.auth.id, {
      range: request.query?.range,
    });

    response.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicMetrics = async (_request, response, next) => {
  try {
    const metrics = await getPublicMetricsService();

    response.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const createMicrotiendaView = async (request, response, next) => {
  try {
    const view = await registerMicrotiendaViewService({
      microtiendaId: request.body?.microtiendaId,
      userId: request.auth?.id || null,
    });

    response.status(201).json({
      success: true,
      data: {
        id: view.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProductView = async (request, response, next) => {
  try {
    const view = await registerProductViewService({
      productId: request.body?.productId,
      microtiendaId: request.body?.microtiendaId,
      userId: request.auth?.id || null,
    });

    response.status(201).json({
      success: true,
      data: {
        id: view.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMicrotiendaViewDuration = async (request, response, next) => {
  try {
    const view = await registerMicrotiendaDurationService(
      request.params.viewId,
      request.body?.durationSeconds,
    );

    response.status(200).json({
      success: true,
      data: view,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductViewDuration = async (request, response, next) => {
  try {
    const view = await registerProductDurationService(
      request.params.viewId,
      request.body?.durationSeconds,
    );

    response.status(200).json({
      success: true,
      data: view,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (request, response, next) => {
  try {
    const analytics = await getAdminAnalyticsService({
      range: request.query?.range,
    });

    response.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadAdminAnalyticsReport = async (request, response, next) => {
  try {
    const report = await generateAnalyticsReportService({
      range: request.query?.range,
      format: request.query?.format,
      role: 'admin',
    });

    response.setHeader('Content-Type', report.contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    response.status(200).send(report.content);
  } catch (error) {
    next(error);
  }
};

export const downloadCurrentAnalyticsReport = async (request, response, next) => {
  try {
    const report = await generateAnalyticsReportService({
      range: request.query?.range,
      format: request.query?.format,
      role: request.auth?.rol,
      userId: request.auth?.id,
    });

    response.setHeader('Content-Type', report.contentType);
    response.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    response.status(200).send(report.content);
  } catch (error) {
    next(error);
  }
};
