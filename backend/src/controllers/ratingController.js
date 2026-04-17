import {
  createRatingService,
  deleteRatingService,
  getEntrepreneurRatingsService,
  getRatingsService,
  getRatingSummaryService,
  reviewRatingService,
} from '../services/ratingService.js';

export const getRatingSummary = async (_request, response, next) => {
  try {
    const summary = await getRatingSummaryService();

    response.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const getRatings = async (request, response, next) => {
  try {
    const ratings = await getRatingsService({
      microtiendaId: request.query.microtiendaId ? Number(request.query.microtiendaId) : undefined,
      productId: request.query.productId ? Number(request.query.productId) : undefined,
    });

    response.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

export const getRatingsForReview = async (request, response, next) => {
  try {
    const ratings = await getRatingsService({
      microtiendaId: request.query.microtiendaId ? Number(request.query.microtiendaId) : undefined,
      productId: request.query.productId ? Number(request.query.productId) : undefined,
      includePending: true,
      includePrivate: true,
    });

    response.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntrepreneurRatings = async (request, response, next) => {
  try {
    const ratings = await getEntrepreneurRatingsService(request.auth, {
      page: Number(request.query.page || 1),
      limit: Number(request.query.limit || 10),
      includePrivate: true,
    });

    response.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

export const createRating = async (request, response, next) => {
  try {
    const rating = await createRatingService(request.body);

    response.status(201).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewRating = async (request, response, next) => {
  try {
    const rating = await reviewRatingService(request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRating = async (request, response, next) => {
  try {
    const result = await deleteRatingService(request.params.id);

    response.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
