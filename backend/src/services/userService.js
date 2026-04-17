import {
  createUser,
  deleteUser,
  findAllUsers,
  findRoleByName,
  findUserByEmail,
  findUserById,
  updateUser,
} from '../models/userModel.js';
import { deleteMicrotienda, findMicrotiendaByUserId } from '../models/microtiendaModel.js';
import { createPqrs, findAllPqrs } from '../models/pqrsModel.js';
import { buildHttpError } from '../utils/httpError.js';
import { hashPassword, validatePasswordStrength, verifyPassword } from '../utils/password.js';

const PASSWORD_RESET_SUBJECT = 'Solicitud de cambio de password';

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
  const initialPassword = password?.trim();

  if (!initialPassword) {
    throw buildHttpError('Debes indicar una contrasena inicial', 400);
  }

  const createdUser = await createUser({
    nombre: nombre.trim(),
    tipoDocumento: tipoDocumento?.trim() || '',
    numeroDocumento: numeroDocumento?.trim() || '',
    direccion: direccion?.trim() || '',
    telefono: telefono?.trim() || '',
    correo: normalizedEmail,
    password: hashPassword(initialPassword),
    mustChangePassword: rol === 'entrepreneur',
    passwordChangedByUser: rol !== 'entrepreneur',
    estado: estado ?? true,
    estadoRevision: 'APROBADO',
    idRol: roleRecord.id_rol,
  });

  return buildUserResponse(createdUser);
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

export const createPasswordResetRequestService = async ({
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

  const normalizedEmail = correo.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user || user.rol_nombre !== 'EMPRENDEDOR') {
    throw buildHttpError('No encontramos un emprendedor registrado con esos datos', 404);
  }

  const sameIdentity =
    user.nombre?.trim() === nombre.trim() &&
    (user.tipo_documento || '').trim() === (tipoDocumento || '').trim() &&
    (user.numero_documento || '').trim() === (numeroDocumento || '').trim() &&
    (user.direccion || '').trim() === (direccion || '').trim() &&
    (user.telefono || '').trim() === (telefono || '').trim();

  if (!sameIdentity) {
    throw buildHttpError('Los datos no coinciden con la cuenta registrada', 400);
  }

  const existingRequests = await findAllPqrs();
  const activeResetRequest = existingRequests.find(
    (item) =>
      item.tipo === 'PETICION' &&
      item.asunto === PASSWORD_RESET_SUBJECT &&
      item.correo?.trim().toLowerCase() === normalizedEmail &&
      item.estado !== 'COMPLETADO',
  );

  if (activeResetRequest) {
    throw buildHttpError(
      'Ya existe una solicitud de cambio de password pendiente para este usuario',
      409,
    );
  }

  return createPqrs({
    tipo: 'PETICION',
    nombre: nombre.trim(),
    correo: normalizedEmail,
    telefono: telefono.trim(),
    asunto: PASSWORD_RESET_SUBJECT,
    mensaje: [
      'El usuario solicita restablecer su contraseÃ±a inicial.',
      `Tipo de documento: ${tipoDocumento.trim()}`,
      `NÃºmero de documento: ${numeroDocumento.trim()}`,
      `DirecciÃ³n registrada: ${direccion.trim()}`,
    ].join('\n'),
    estado: 'PENDIENTE',
  });
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
  const providedPassword = payload.password?.trim();

  if (isApprovingApplicant && !providedPassword) {
    throw buildHttpError('Debes asignar una contrasena inicial para aprobar al emprendedor', 400);
  }

  const nextPassword = providedPassword ? hashPassword(providedPassword) : user.password;
  const nextPasswordChangedByUser = providedPassword
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

  return buildUserResponse(updatedUser);
};

export const changeMyPasswordService = async (authUser, { currentPassword, newPassword }) => {
  if (!currentPassword?.trim() || !newPassword?.trim()) {
    throw buildHttpError('Debes indicar la contrasena actual y la nueva contrasena', 400);
  }

  const passwordValidationError = validatePasswordStrength(newPassword.trim());

  if (passwordValidationError) {
    throw buildHttpError(passwordValidationError, 400);
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

  const linkedMicrotienda = await findMicrotiendaByUserId(numericId, { includeInactive: true });

  if (linkedMicrotienda?.id_microtienda) {
    await deleteMicrotienda(linkedMicrotienda.id_microtienda);
  }

  await deleteUser(numericId);
};

