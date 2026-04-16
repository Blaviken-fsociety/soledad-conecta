export const errorHandler = (error, _request, response) => {
  if (error.type === 'entity.too.large') {
    response.status(413).json({
      success: false,
      message: 'La imagen supera el tamaño máximo permitido de 50 MB.',
    });
    return;
  }

  const status = error.statusCode || 500;

  response.status(status).json({
    success: false,
    message: error.message || 'Error interno del servidor',
  });
};
