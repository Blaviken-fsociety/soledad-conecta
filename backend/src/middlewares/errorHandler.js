export const errorHandler = (error, _request, response, _next) => {
  const status = error.statusCode || 500;

  response.status(status).json({
    success: false,
    message: error.message || 'Error interno del servidor',
  });
};
