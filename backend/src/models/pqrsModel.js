import { getNextId, readData, updateData } from '../utils/jsonDb.js';

export const findAllPqrs = async () => {
  const data = await readData();

  return [...data.pqrs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const createPqrs = async ({ tipo, nombre, correo, mensaje, estado }) => {
  let created = null;

  await updateData(async (data) => {
    created = {
      id_pqrs: getNextId(data.pqrs, 'id_pqrs'),
      tipo,
      nombre,
      correo,
      mensaje,
      fecha: new Date().toISOString(),
      estado,
    };

    data.pqrs.push(created);
    return data;
  });

  return created;
};

export const findPqrsById = async (id) => {
  const data = await readData();
  return data.pqrs.find((item) => item.id_pqrs === id) || null;
};
