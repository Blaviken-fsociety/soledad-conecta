import { createPqrsService, getPqrsService } from '../services/pqrsService.js';

export const getPqrs = async (_request, response, next) => {
  try {
    const items = await getPqrsService();

    response.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const createPqrs = async (request, response, next) => {
  try {
    const item = await createPqrsService(request.body);

    response.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
