import { getNextId, readData, updateData } from '../utils/jsonDb.js';

const mapUserWithRole = (user, roles) => {
  if (!user) {
    return null;
  }

  const role = roles.find((item) => item.id_rol === user.id_rol);

  return {
    ...user,
    rol_nombre: role?.nombre || null,
  };
};

export const findUserByEmail = async (email) => {
  const data = await readData();
  const user = data.usuarios.find((item) => item.correo === email) || null;
  return mapUserWithRole(user, data.roles);
};

export const findUserById = async (id) => {
  const data = await readData();
  const user = data.usuarios.find((item) => item.id_usuario === id) || null;
  return mapUserWithRole(user, data.roles);
};

export const findAllUsers = async () => {
  const data = await readData();

  return data.usuarios
    .map((user) => mapUserWithRole(user, data.roles))
    .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
};

export const findRoleByName = async (roleName) => {
  const data = await readData();
  return data.roles.find((item) => item.nombre.toUpperCase() === roleName.toUpperCase()) || null;
};

export const createUser = async ({
  nombre,
  tipoDocumento,
  numeroDocumento,
  direccion,
  telefono,
  correo,
  password,
  mustChangePassword,
  passwordChangedByUser,
  estado,
  estadoRevision,
  idRol,
}) => {
  let createdUser = null;

  await updateData(async (data) => {
    createdUser = {
      id_usuario: getNextId(data.usuarios, 'id_usuario'),
      nombre,
      tipo_documento: tipoDocumento || '',
      numero_documento: numeroDocumento || '',
      direccion: direccion || '',
      telefono: telefono || '',
      correo,
      password,
      must_change_password: Boolean(mustChangePassword),
      password_changed_by_user: Boolean(passwordChangedByUser),
      estado,
      estado_revision: estadoRevision,
      fecha_creacion: new Date().toISOString(),
      id_rol: idRol,
    };

    data.usuarios.push(createdUser);
    return data;
  });

  return findUserById(createdUser.id_usuario);
};

export const updateUser = async (
  id,
  {
    nombre,
    tipoDocumento,
    numeroDocumento,
    direccion,
    telefono,
    correo,
    password,
    mustChangePassword,
    passwordChangedByUser,
    estado,
    estadoRevision,
    idRol,
  },
) => {
  await updateData(async (data) => {
    data.usuarios = data.usuarios.map((item) =>
      item.id_usuario === id
        ? {
            ...item,
            nombre,
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
            direccion,
            telefono,
            correo,
            password,
            must_change_password: Boolean(mustChangePassword),
            password_changed_by_user: Boolean(passwordChangedByUser),
            estado,
            estado_revision: estadoRevision,
            id_rol: idRol,
          }
        : item,
    );
    return data;
  });

  return findUserById(id);
};

export const deleteUser = async (id) => {
  await updateData(async (data) => {
    data.usuarios = data.usuarios.filter((item) => item.id_usuario !== id);
    return data;
  });
};
