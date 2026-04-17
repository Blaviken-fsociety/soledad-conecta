import { findUserById } from '../models/userModel.js';
import { buildHttpError } from '../utils/httpError.js';
import { verifyAuthToken } from '../utils/token.js';

const normalizeRole = (roleName) => {
  if (roleName === 'ADMINISTRADOR') {
    return 'admin';
  }

  if (roleName === 'EMPRENDEDOR') {
    return 'entrepreneur';
  }

  return null;
};

const getBearerToken = (authorizationHeader = '') => {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

export const requireAuth = async (request, _response, next) => {
  try {
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      throw buildHttpError('No autorizado', 401);
    }

    const tokenPayload = verifyAuthToken(token);

    if (!tokenPayload?.id) {
      throw buildHttpError('Token invalido', 401);
    }

    const user = await findUserById(tokenPayload.id);

    if (!user || !user.estado) {
      throw buildHttpError('Usuario no autorizado', 401);
    }

    request.auth = {
      id: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: normalizeRole(user.rol_nombre),
      rolNombre: user.rol_nombre,
      estado: user.estado,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (request, _response, next) => {
  try {
    const token = getBearerToken(request.headers.authorization);

    if (!token) {
      request.auth = null;
      next();
      return;
    }

    const tokenPayload = verifyAuthToken(token);

    if (!tokenPayload?.id) {
      request.auth = null;
      next();
      return;
    }

    const user = await findUserById(tokenPayload.id);

    if (!user || !user.estado) {
      request.auth = null;
      next();
      return;
    }

    request.auth = {
      id: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      rol: normalizeRole(user.rol_nombre),
      rolNombre: user.rol_nombre,
      estado: user.estado,
    };

    next();
  } catch (_error) {
    request.auth = null;
    next();
  }
};

export const requireRole = (role) => {
  return (request, _response, next) => {
    if (!request.auth || request.auth.rol !== role) {
      next(buildHttpError('No tiene permisos para esta accion', 403));
      return;
    }

    next();
  };
};
