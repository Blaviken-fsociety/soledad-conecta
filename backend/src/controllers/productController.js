import {
  createProductService,
  deleteProductService,
  getMyProductsService,
  getProductsService,
  reviewProductService,
  updateProductService,
} from '../services/productService.js';

export const getProducts = async (request, response, next) => {
  try {
    const products = await getProductsService({
      microtiendaId: request.query.microtiendaId ? Number(request.query.microtiendaId) : undefined,
    });

    response.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsForReview = async (request, response, next) => {
  try {
    const products = await getProductsService({
      microtiendaId: request.query.microtiendaId ? Number(request.query.microtiendaId) : undefined,
      includePending: true,
    });

    response.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProducts = async (request, response, next) => {
  try {
    const products = await getMyProductsService(request.auth);

    response.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (request, response, next) => {
  try {
    const product = await createProductService(request.auth, request.body);

    response.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (request, response, next) => {
  try {
    const product = await updateProductService(request.auth, request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewProduct = async (request, response, next) => {
  try {
    const product = await reviewProductService(request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (request, response, next) => {
  try {
    await deleteProductService(request.auth, request.params.id);

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
