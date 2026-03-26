import {
  createUser,
  findAllUsers,
  findRoleByName,
  findUserByEmail,
} from '../models/userModel.js';
import { buildHttpError } from '../utils/httpError.js';

const sanitizeUser = (user) => {
  return {
    id: user.id_usuario,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol_nombre === 'ADMINISTRADOR' ? 'admin' : 'entrepreneur',
    rolNombre: user.rol_nombre,
    estado: Boolean(user.estado),
    fechaCreacion: user.fecha_creacion,
  };
};

export const getUsersService = async () => {
  const users = await findAllUsers();
  return users.map(sanitizeUser);
};

export const createUserService = async ({ nombre, correo, password, rol, estado }) => {
  if (!nombre || !correo || !password || !rol) {
    throw buildHttpError('Nombre, correo, contrasena y rol son obligatorios', 400);
  }

  const normalizedEmail = correo.trim().toLowerCase();
  const requestedRole = rol === 'admin' ? 'ADMINISTRADOR' : 'EMPRENDEDOR';

  if (!['admin', 'entrepreneur'].includes(rol)) {
    throw buildHttpError('El rol solicitado no es valido', 400);
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw buildHttpError('Ya existe un usuario con ese correo', 409);
  }

  const roleRecord = await findRoleByName(requestedRole);

  if (!roleRecord) {
    throw buildHttpError('No existe el rol configurado en la base de datos', 500);
  }

  const createdUser = await createUser({
    nombre: nombre.trim(),
    correo: normalizedEmail,
    password,
    idRol: roleRecord.id_rol,
    estado: estado ?? true,
  });

  return sanitizeUser(createdUser);
};
