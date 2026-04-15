import { getNextId, readData, updateData } from '../utils/jsonDb.js';

export const findAllPqrs = async () => {
  const data = await readData();

  return [...data.pqrs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const createPqrs = async ({ tipo, nombre, correo, telefono, asunto, mensaje, estado }) => {
  let created = null;

  await updateData(async (data) => {
    created = {
      id_pqrs: getNextId(data.pqrs, 'id_pqrs'),
      tipo,
      nombre,
      correo,
      telefono,
      asunto,
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

export const updatePqrsStatus = async (id, estado) => {
  await updateData(async (data) => {
    data.pqrs = data.pqrs.map((item) =>
      item.id_pqrs === id ? { ...item, estado } : item,
    );
    return data;
  });

  return findPqrsById(id);
};

export const deletePqrs = async (id) => {
  await updateData(async (data) => {
    data.pqrs = data.pqrs.filter((item) => item.id_pqrs !== id);
    return data;
  });
};
