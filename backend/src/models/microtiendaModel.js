import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const buildMicrotienda = (microtienda, data) => {
  if (!microtienda) {
    return null;
  }

  const categoria = data.categorias.find((item) => item.id_categoria === microtienda.id_categoria);
  const usuario = data.usuarios.find((item) => item.id_usuario === microtienda.id_usuario);
  const productos = data.productos.filter(
    (item) =>
      item.id_microtienda === microtienda.id_microtienda &&
      item.estado &&
      item.estado_revision === 'APROBADO',
  );
  const calificaciones = data.calificaciones.filter(
    (item) =>
      item.id_microtienda === microtienda.id_microtienda && item.estado_revision === 'APROBADO',
  );
  const promedio =
    calificaciones.length > 0
      ? calificaciones.reduce((acc, item) => acc + Number(item.puntuacion), 0) / calificaciones.length
      : 0;

  return {
    ...microtienda,
    categoria: categoria?.nombre || null,
    propietario: usuario?.nombre || null,
    logo_imagen: microtienda.logo_imagen || '',
    total_productos: productos.length,
    total_calificaciones: calificaciones.length,
    promedio_calificacion: Number(promedio.toFixed(1)),
  };
};

export const findAllMicrotiendas = async ({ includePending = false } = {}) => {
  const data = await readData();

  return data.microtiendas
    .filter((item) => item.estado && (includePending || item.estado_revision === 'APROBADO'))
    .map((item) => buildMicrotienda(item, data))
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
};

export const findMicrotiendaById = async (id, { includeInactive = false } = {}) => {
  const data = await readData();
  const microtienda =
    data.microtiendas.find(
      (item) => item.id_microtienda === id && (includeInactive || item.estado),
    ) || null;

  return buildMicrotienda(microtienda, data);
};

export const findMicrotiendaByUserId = async (userId, { includeInactive = false } = {}) => {
  const data = await readData();
  const microtienda =
    data.microtiendas.find((item) => item.id_usuario === userId && (includeInactive || item.estado)) ||
    null;

  return buildMicrotienda(microtienda, data);
};

export const createMicrotienda = async ({
  nombre,
  descripcion,
  sectorEconomico,
  whatsapp,
  redesSociales,
  logoImagen,
  estado,
  estadoRevision,
  observacionRevision,
  idUsuario,
  idCategoria,
}) => {
  let created = null;

  await updateData(async (data) => {
    created = {
      id_microtienda: getNextId(data.microtiendas, 'id_microtienda'),
      nombre,
      descripcion,
      sector_economico: sectorEconomico,
      whatsapp,
      redes_sociales: redesSociales,
      logo_imagen: logoImagen,
      estado,
      estado_revision: estadoRevision,
      observacion_revision: observacionRevision,
      fecha_creacion: new Date().toISOString(),
      id_usuario: idUsuario,
      id_categoria: idCategoria,
    };

    data.microtiendas.push(created);
    return data;
  });

  return findMicrotiendaById(created.id_microtienda, { includeInactive: true });
};

export const updateMicrotienda = async (
  id,
  {
    nombre,
    descripcion,
    sectorEconomico,
    whatsapp,
    redesSociales,
    logoImagen,
    estado,
    estadoRevision,
    observacionRevision,
    idCategoria,
  },
) => {
  await updateData(async (data) => {
    data.microtiendas = data.microtiendas.map((item) =>
      item.id_microtienda === id
        ? {
            ...item,
            nombre,
            descripcion,
            sector_economico: sectorEconomico,
            whatsapp,
            redes_sociales: redesSociales,
            logo_imagen: logoImagen,
            estado,
            estado_revision: estadoRevision,
            observacion_revision: observacionRevision,
            id_categoria: idCategoria,
          }
        : item,
    );
    return data;
  });

  return findMicrotiendaById(id, { includeInactive: true });
};

export const deleteMicrotienda = async (id) => {
  await updateData(async (data) => {
    data.microtiendas = data.microtiendas.filter((item) => item.id_microtienda !== id);
    data.productos = data.productos.filter((item) => item.id_microtienda !== id);
    data.calificaciones = data.calificaciones.filter((item) => item.id_microtienda !== id);
    return data;
  });
};
