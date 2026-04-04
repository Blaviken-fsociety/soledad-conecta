import { findUserByEmail } from '../models/userModel.js';
import { buildHttpError } from '../utils/httpError.js';
import { verifyPassword } from '../utils/password.js';
import { createAuthToken } from '../utils/token.js';

const normalizeRole = (roleName) => {
  if (roleName === 'ADMINISTRADOR') {
    return 'admin';
  }

  if (roleName === 'EMPRENDEDOR') {
    return 'entrepreneur';
  }

  return null;
};

const sanitizeUser = (user) => {
  const isEntrepreneur = user.rol_nombre === 'EMPRENDEDOR';
  const mustChangePassword =
    isEntrepreneur && (user.must_change_password || !user.password_changed_by_user);

  return {
    id: user.id_usuario,
    nombre: user.nombre,
    correo: user.correo,
    rol: normalizeRole(user.rol_nombre),
    rolNombre: user.rol_nombre,
    mustChangePassword,
    estado: user.estado,
    fechaCreacion: user.fecha_creacion,
  };
};

export const loginService = async ({ correo, password, rol }) => {
  if (!correo || !password) {
    throw buildHttpError('Correo y contrasena son obligatorios', 400);
  }

  const normalizedEmail = correo.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || (!verifyPassword(password, user.password) && user.password !== password)) {
    throw buildHttpError('Credenciales invalidas', 401);
  }

  if (!user.estado || user.estado_revision !== 'APROBADO') {
    throw buildHttpError('El usuario se encuentra inactivo', 403);
  }

  if (rol && normalizeRole(user.rol_nombre) !== rol) {
    throw buildHttpError('El usuario no pertenece al rol seleccionado', 403);
  }

  const authUser = sanitizeUser(user);
  const token = createAuthToken(authUser);

  return {
    token,
    user: authUser,
  };
};
