import {
  createCategoryService,
  deleteCategoryService,
  getCategoriesService,
  updateCategoryService,
} from '../services/categoryService.js';

export const getCategories = async (request, response, next) => {
  try {
    const categories = await getCategoriesService({
      onlyActive: request.query.onlyActive === 'true',
    });

    response.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (request, response, next) => {
  try {
    const category = await createCategoryService(request.body);

    response.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (request, response, next) => {
  try {
    const category = await updateCategoryService(request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (request, response, next) => {
  try {
    await deleteCategoryService(request.params.id);

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
