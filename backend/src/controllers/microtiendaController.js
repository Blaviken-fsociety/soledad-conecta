import {
  getMicrotiendaByIdService,
  getMicrotiendasService,
} from '../services/microtiendaService.js';

export const getMicrotiendas = async (_request, response, next) => {
  try {
    const microtiendas = await getMicrotiendasService();

    response.status(200).json({
      success: true,
      data: microtiendas,
    });
  } catch (error) {
    next(error);
  }
};

export const getMicrotiendaById = async (request, response, next) => {
  try {
    const microtienda = await getMicrotiendaByIdService(request.params.id);

    response.status(200).json({
      success: true,
      data: microtienda,
    });
  } catch (error) {
    next(error);
  }
};
