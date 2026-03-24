export const notFoundHandler = (request, _response, next) => {
  const error = new Error(`Ruta no encontrada: ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
