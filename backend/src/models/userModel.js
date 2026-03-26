import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const sql = `
    SELECT
      usuario.id_usuario,
      usuario.nombre,
      usuario.correo,
      usuario.password,
      usuario.estado,
      usuario.fecha_creacion,
      r.id_rol,
      r.nombre AS rol_nombre
    FROM usuario
    INNER JOIN rol r ON r.id_rol = usuario.id_rol
    WHERE usuario.correo = ?
    LIMIT 1
  `;

  const rows = await query(sql, [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const sql = `
    SELECT
      usuario.id_usuario,
      usuario.nombre,
      usuario.correo,
      usuario.estado,
      usuario.fecha_creacion,
      r.id_rol,
      r.nombre AS rol_nombre
    FROM usuario
    INNER JOIN rol r ON r.id_rol = usuario.id_rol
    WHERE usuario.id_usuario = ?
    LIMIT 1
  `;

  const rows = await query(sql, [id]);
  return rows[0] || null;
};

export const findAllUsers = async () => {
  const sql = `
    SELECT
      usuario.id_usuario,
      usuario.nombre,
      usuario.correo,
      usuario.estado,
      usuario.fecha_creacion,
      r.id_rol,
      r.nombre AS rol_nombre
    FROM usuario
    INNER JOIN rol r ON r.id_rol = usuario.id_rol
    ORDER BY usuario.fecha_creacion DESC, usuario.id_usuario DESC
  `;

  return query(sql);
};

export const findRoleByName = async (roleName) => {
  const sql = `
    SELECT id_rol, nombre
    FROM rol
    WHERE UPPER(nombre) = UPPER(?)
    LIMIT 1
  `;

  const rows = await query(sql, [roleName]);
  return rows[0] || null;
};

export const createUser = async ({ nombre, correo, password, idRol, estado }) => {
  const sql = `
    INSERT INTO usuario (nombre, correo, password, id_rol, estado)
    VALUES (?, ?, ?, ?, ?)
  `;

  const result = await query(sql, [nombre, correo, password, idRol, estado]);
  return findUserById(result.insertId);
};
