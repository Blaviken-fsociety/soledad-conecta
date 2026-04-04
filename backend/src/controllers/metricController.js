import {
  getAdminDashboardMetricsService,
  getEntrepreneurDashboardMetricsService,
} from '../services/metricService.js';

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
    const metrics = await getEntrepreneurDashboardMetricsService(request.auth.id);

    response.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};
