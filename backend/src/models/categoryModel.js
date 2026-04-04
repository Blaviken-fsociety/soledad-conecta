import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const buildCategoryAggregate = (category, data) => {
  const microtiendas = data.microtiendas.filter(
    (item) => item.id_categoria === category.id_categoria && item.estado,
  );
  const productos = data.productos.filter(
    (item) => item.id_categoria === category.id_categoria && item.estado,
  );

  return {
    ...category,
    total_microtiendas: microtiendas.length,
    total_productos: productos.length,
  };
};

export const findAllCategories = async () => {
  const data = await readData();

  return data.categorias
    .map((category) => buildCategoryAggregate(category, data))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
};

export const findActiveCategories = async () => {
  const categories = await findAllCategories();
  return categories.filter((item) => item.estado);
};

export const findCategoryById = async (id) => {
  const data = await readData();
  const category = data.categorias.find((item) => item.id_categoria === id) || null;
  return category ? buildCategoryAggregate(category, data) : null;
};

export const findCategoryByName = async (name) => {
  const data = await readData();
  return (
    data.categorias.find((item) => item.nombre.toUpperCase() === name.toUpperCase()) || null
  );
};

export const createCategory = async ({ nombre, descripcion, estado }) => {
  let createdCategory = null;

  await updateData(async (data) => {
    createdCategory = {
      id_categoria: getNextId(data.categorias, 'id_categoria'),
      nombre,
      descripcion,
      estado,
    };

    data.categorias.push(createdCategory);
    return data;
  });

  return findCategoryById(createdCategory.id_categoria);
};

export const updateCategory = async (id, { nombre, descripcion, estado }) => {
  await updateData(async (data) => {
    data.categorias = data.categorias.map((item) =>
      item.id_categoria === id ? { ...item, nombre, descripcion, estado } : item,
    );
    return data;
  });

  return findCategoryById(id);
};

export const deleteCategory = async (id) => {
  await updateData(async (data) => {
    data.categorias = data.categorias.filter((item) => item.id_categoria !== id);
    return data;
  });
};
