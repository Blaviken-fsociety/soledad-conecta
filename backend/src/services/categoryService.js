import {
  createCategory,
  deleteCategory,
  findActiveCategories,
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  updateCategory,
} from '../models/categoryModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizeCategory = (category) => ({
  id: category.id_categoria,
  nombre: category.nombre,
  descripcion: category.descripcion || '',
  estado: Boolean(category.estado),
  totalMicrotiendas: Number(category.total_microtiendas || 0),
  totalProductos: Number(category.total_productos || 0),
});

const parseId = (id, entityName = 'categoria') => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw buildHttpError(`El id de ${entityName} no es valido`, 400);
  }

  return numericId;
};

export const getCategoriesService = async ({ onlyActive = false } = {}) => {
  const categories = onlyActive ? await findActiveCategories() : await findAllCategories();
  return categories.map(sanitizeCategory);
};

export const createCategoryService = async ({ nombre, descripcion, estado }) => {
  if (!nombre?.trim()) {
    throw buildHttpError('El nombre de la categoria es obligatorio', 400);
  }

  const normalizedName = nombre.trim();
  const existingCategory = await findCategoryByName(normalizedName);

  if (existingCategory) {
    throw buildHttpError('Ya existe una categoria con ese nombre', 409);
  }

  const createdCategory = await createCategory({
    nombre: normalizedName,
    descripcion: descripcion?.trim() || null,
    estado: estado ?? true,
  });

  return sanitizeCategory(createdCategory);
};

export const updateCategoryService = async (id, { nombre, descripcion, estado }) => {
  const numericId = parseId(id);

  if (!nombre?.trim()) {
    throw buildHttpError('El nombre de la categoria es obligatorio', 400);
  }

  const existingCategory = await findCategoryById(numericId);

  if (!existingCategory) {
    throw buildHttpError('Categoria no encontrada', 404);
  }

  const categoryWithSameName = await findCategoryByName(nombre.trim());

  if (categoryWithSameName && categoryWithSameName.id_categoria !== numericId) {
    throw buildHttpError('Ya existe una categoria con ese nombre', 409);
  }

  const updatedCategory = await updateCategory(numericId, {
    nombre: nombre.trim(),
    descripcion: descripcion?.trim() || null,
    estado: estado ?? true,
  });

  return sanitizeCategory(updatedCategory);
};

export const deleteCategoryService = async (id) => {
  const numericId = parseId(id);
  const existingCategory = await findCategoryById(numericId);

  if (!existingCategory) {
    throw buildHttpError('Categoria no encontrada', 404);
  }

  if (
    Number(existingCategory.total_microtiendas || 0) > 0 ||
    Number(existingCategory.total_productos || 0) > 0
  ) {
    throw buildHttpError(
      'No se puede eliminar una categoria con microtiendas o productos asociados',
      409,
    );
  }

  await deleteCategory(numericId);
};
