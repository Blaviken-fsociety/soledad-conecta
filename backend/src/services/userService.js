import {
  createUser,
  deleteUser,
  findAllUsers,
  findRoleByName,
  findUserByEmail,
  findUserById,
  updateUser,
} from '../models/userModel.js';
import { buildHttpError } from '../utils/httpError.js';
import { generateRandomPassword, hashPassword, verifyPassword } from '../utils/password.js';

const sanitizeUser = (user) => {
  const isEntrepreneur = user.rol_nombre === 'EMPRENDEDOR';
  const mustChangePassword =
    isEntrepreneur && (user.must_change_password || !user.password_changed_by_user);

  return {
    id: user.id_usuario,
    nombre: user.nombre,
    tipoDocumento: user.tipo_documento || '',
    numeroDocumento: user.numero_documento || '',
    direccion: user.direccion || '',
    telefono: user.telefono || '',
    correo: user.correo,
    rol: user.rol_nombre === 'ADMINISTRADOR' ? 'admin' : 'entrepreneur',
    rolNombre: user.rol_nombre,
    password: user.password || '',
    mustChangePassword,
    estado: Boolean(user.estado),
    estadoRevision: user.estado_revision || 'PENDIENTE',
    fechaCreacion: user.fecha_creacion,
  };
};

const buildUserResponse = (user, extra = {}) => ({
  ...sanitizeUser(user),
  ...extra,
});

const resolveRole = async (rol) => {
  const requestedRole = rol === 'admin' ? 'ADMINISTRADOR' : 'EMPRENDEDOR';

  if (!['admin', 'entrepreneur'].includes(rol)) {
    throw buildHttpError('El rol solicitado no es valido', 400);
  }

  const roleRecord = await findRoleByName(requestedRole);

  if (!roleRecord) {
    throw buildHttpError('No existe el rol configurado en la base de datos', 500);
  }

  return roleRecord;
};

const validateEntrepreneurData = ({ rol, tipoDocumento, numeroDocumento, direccion, telefono }) => {
  if (
    rol === 'entrepreneur' &&
    (!tipoDocumento?.trim() || !numeroDocumento?.trim() || !direccion?.trim() || !telefono?.trim())
  ) {
    throw buildHttpError(
      'Para emprendedores debes registrar tipo de documento, numero, direccion y telefono',
      400,
    );
  }
};

export const getUsersService = async () => {
  const users = await findAllUsers();
  return users.map(sanitizeUser);
};

const generateUniquePassword = async () => {
  const users = await findAllUsers();
  let generatedPassword = generateRandomPassword();

  while (users.some((user) => verifyPassword(generatedPassword, user.password) || user.password === generatedPassword)) {
    generatedPassword = generateRandomPassword();
  }

  return generatedPassword;
};

export const createUserService = async ({
  nombre,
  tipoDocumento,
  numeroDocumento,
  direccion,
  telefono,
  correo,
  password,
  rol,
  estado,
}) => {
  if (!nombre || !correo || !rol) {
    throw buildHttpError('Nombre, correo y rol son obligatorios', 400);
  }

  validateEntrepreneurData({ rol, tipoDocumento, numeroDocumento, direccion, telefono });

  const normalizedEmail = correo.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw buildHttpError('Ya existe un usuario con ese correo', 409);
  }

  const roleRecord = await resolveRole(rol);
  const generatedPassword = password?.trim() || (await generateUniquePassword());

  const createdUser = await createUser({
    nombre: nombre.trim(),
    tipoDocumento: tipoDocumento?.trim() || '',
    numeroDocumento: numeroDocumento?.trim() || '',
    direccion: direccion?.trim() || '',
    telefono: telefono?.trim() || '',
    correo: normalizedEmail,
    password: hashPassword(generatedPassword),
    mustChangePassword: rol === 'entrepreneur',
    passwordChangedByUser: rol !== 'entrepreneur',
    estado: estado ?? true,
    estadoRevision: 'APROBADO',
    idRol: roleRecord.id_rol,
  });

  return buildUserResponse(createdUser, {
    generatedPassword,
  });
};

export const createEntrepreneurRequestService = async ({
  nombre,
  tipoDocumento,
  numeroDocumento,
  direccion,
  telefono,
  correo,
}) => {
  if (!nombre || !correo) {
    throw buildHttpError('Nombre y correo son obligatorios', 400);
  }

  validateEntrepreneurData({
    rol: 'entrepreneur',
    tipoDocumento,
    numeroDocumento,
    direccion,
    telefono,
  });

  const normalizedEmail = correo.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw buildHttpError('Ya existe una solicitud o usuario con ese correo', 409);
  }

  const roleRecord = await resolveRole('entrepreneur');

  const createdUser = await createUser({
    nombre: nombre.trim(),
    tipoDocumento: tipoDocumento.trim(),
    numeroDocumento: numeroDocumento.trim(),
    direccion: direccion.trim(),
    telefono: telefono.trim(),
    correo: normalizedEmail,
    password: '',
    mustChangePassword: false,
    passwordChangedByUser: false,
    estado: false,
    estadoRevision: 'PENDIENTE',
    idRol: roleRecord.id_rol,
  });

  return sanitizeUser(createdUser);
};

export const updateUserService = async (id, payload) => {
  const numericId = Number(id);
  const user = await findUserById(numericId);

  if (!user) {
    throw buildHttpError('Usuario no encontrado', 404);
  }

  const rol = payload.rol || (user.rol_nombre === 'ADMINISTRADOR' ? 'admin' : 'entrepreneur');
  validateEntrepreneurData({
    rol,
    tipoDocumento: payload.tipoDocumento ?? user.tipo_documento,
    numeroDocumento: payload.numeroDocumento ?? user.numero_documento,
    direccion: payload.direccion ?? user.direccion,
    telefono: payload.telefono ?? user.telefono,
  });

  const normalizedEmail = (payload.correo || user.correo).trim().toLowerCase();
  const duplicateUser = await findUserByEmail(normalizedEmail);

  if (duplicateUser && duplicateUser.id_usuario !== numericId) {
    throw buildHttpError('Ya existe un usuario con ese correo', 409);
  }

  const roleRecord = await resolveRole(rol);
  const nextEstadoRevision = payload.estadoRevision || user.estado_revision || 'PENDIENTE';
  const nextEstado =
    typeof payload.estado === 'boolean'
      ? payload.estado
      : nextEstadoRevision === 'APROBADO'
        ? true
        : user.estado;
  const isApprovingApplicant =
    user.estado_revision !== 'APROBADO' &&
    nextEstadoRevision === 'APROBADO' &&
    roleRecord.nombre === 'EMPRENDEDOR';
  const generatedPassword = isApprovingApplicant ? await generateUniquePassword() : null;
  const nextPassword =
    generatedPassword ||
    (payload.password && payload.password.trim() ? hashPassword(payload.password.trim()) : user.password);
  const nextPasswordChangedByUser =
    generatedPassword || (payload.password && payload.password.trim())
      ? roleRecord.nombre !== 'EMPRENDEDOR'
      : Boolean(user.password_changed_by_user);
  const nextMustChangePassword =
    typeof payload.mustChangePassword === 'boolean'
      ? payload.mustChangePassword
      : roleRecord.nombre === 'EMPRENDEDOR'
        ? !nextPasswordChangedByUser
        : false;

  if (nextEstadoRevision === 'APROBADO' && !nextPassword) {
    throw buildHttpError('Debes asignar una contrasena para aprobar al emprendedor', 400);
  }

  const updatedUser = await updateUser(numericId, {
    nombre: (payload.nombre || user.nombre).trim(),
    tipoDocumento: payload.tipoDocumento ?? user.tipo_documento ?? '',
    numeroDocumento: payload.numeroDocumento ?? user.numero_documento ?? '',
    direccion: payload.direccion ?? user.direccion ?? '',
    telefono: payload.telefono ?? user.telefono ?? '',
    correo: normalizedEmail,
    password: nextPassword,
    mustChangePassword: nextMustChangePassword,
    passwordChangedByUser: nextPasswordChangedByUser,
    estado: nextEstado,
    estadoRevision: nextEstadoRevision,
    idRol: roleRecord.id_rol,
  });

  return buildUserResponse(updatedUser, generatedPassword ? { generatedPassword } : {});
};

export const changeMyPasswordService = async (authUser, { currentPassword, newPassword }) => {
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw buildHttpError('Debes indicar la contrasena actual y la nueva contrasena', 400);
  }

  if (newPassword.trim().length < 6) {
    throw buildHttpError('La nueva contrasena debe tener al menos 6 caracteres', 400);
  }

  const user = await findUserById(authUser.id);

  if (!user) {
    throw buildHttpError('Usuario no encontrado', 404);
  }

  if (!verifyPassword(currentPassword.trim(), user.password)) {
    throw buildHttpError('La contrasena actual no es correcta', 401);
  }

  const updatedUser = await updateUser(authUser.id, {
    nombre: user.nombre,
    tipoDocumento: user.tipo_documento ?? '',
    numeroDocumento: user.numero_documento ?? '',
    direccion: user.direccion ?? '',
    telefono: user.telefono ?? '',
    correo: user.correo,
    password: newPassword.trim(),
    mustChangePassword: false,
    passwordChangedByUser: true,
    estado: user.estado,
    estadoRevision: user.estado_revision || 'APROBADO',
    idRol: user.id_rol,
  });

  return sanitizeUser(updatedUser);
};

export const deleteUserService = async (id) => {
  const numericId = Number(id);
  const user = await findUserById(numericId);

  if (!user) {
    throw buildHttpError('Usuario no encontrado', 404);
  }

  await deleteUser(numericId);
};
