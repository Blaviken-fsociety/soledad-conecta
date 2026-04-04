import {
  createMicrotiendaService,
  deleteMicrotiendaService,
  getMicrotiendaByIdService,
  getMicrotiendasService,
  getMyMicrotiendaService,
  reviewMicrotiendaService,
  updateMicrotiendaService,
} from '../services/microtiendaService.js';

export const getMicrotiendas = async (request, response, next) => {
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

export const getMicrotiendasForReview = async (_request, response, next) => {
  try {
    const microtiendas = await getMicrotiendasService({
      includePending: true,
    });

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

export const getMyMicrotienda = async (request, response, next) => {
  try {
    const microtienda = await getMyMicrotiendaService(request.auth);

    response.status(200).json({
      success: true,
      data: microtienda,
    });
  } catch (error) {
    next(error);
  }
};

export const createMicrotienda = async (request, response, next) => {
  try {
    const microtienda = await createMicrotiendaService(request.auth, request.body);

    response.status(201).json({
      success: true,
      data: microtienda,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMicrotienda = async (request, response, next) => {
  try {
    const microtienda = await updateMicrotiendaService(request.auth, request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: microtienda,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewMicrotienda = async (request, response, next) => {
  try {
    const microtienda = await reviewMicrotiendaService(request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: microtienda,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMicrotienda = async (request, response, next) => {
  try {
    await deleteMicrotiendaService(request.auth, request.params.id);

    response.status(200).json({
      success: true,
      data: {
        deleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
};
