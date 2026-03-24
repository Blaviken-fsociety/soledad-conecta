import { query } from '../config/db.js';

export const findAllMicrotiendas = async () => {
  const sql = `
    SELECT
      m.id_microtienda,
      m.nombre,
      m.descripcion,
      m.sector_economico,
      m.whatsapp,
      m.redes_sociales,
      m.estado,
      m.fecha_creacion,
      c.id_categoria,
      c.nombre AS categoria,
      u.id_usuario,
      u.nombre AS propietario
    FROM microtienda m
    LEFT JOIN categoria c ON c.id_categoria = m.id_categoria
    LEFT JOIN usuario u ON u.id_usuario = m.id_usuario
    WHERE m.estado = TRUE
    ORDER BY m.fecha_creacion DESC
  `;

  return query(sql);
};

export const findMicrotiendaById = async (id) => {
  const sql = `
    SELECT
      m.id_microtienda,
      m.nombre,
      m.descripcion,
      m.sector_economico,
      m.whatsapp,
      m.redes_sociales,
      m.estado,
      m.fecha_creacion,
      c.id_categoria,
      c.nombre AS categoria,
      u.id_usuario,
      u.nombre AS propietario
    FROM microtienda m
    LEFT JOIN categoria c ON c.id_categoria = m.id_categoria
    LEFT JOIN usuario u ON u.id_usuario = m.id_usuario
    WHERE m.id_microtienda = ? AND m.estado = TRUE
    LIMIT 1
  `;

  const rows = await query(sql, [id]);
  return rows[0] || null;
};
