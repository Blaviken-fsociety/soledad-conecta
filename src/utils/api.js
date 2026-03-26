const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const buildHeaders = (token, hasJsonBody = false) => {
  const headers = {};

  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'No se pudo completar la solicitud');
  }

  return payload?.data;
};

export const loginRequest = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(null, true),
    body: JSON.stringify(credentials),
  });

  return parseResponse(response);
};

export const getUsersRequest = async (token) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    headers: buildHeaders(token),
  });

  return parseResponse(response);
};

export const createUserRequest = async (token, userData) => {
  const response = await fetch(`${API_URL}/usuarios`, {
    method: 'POST',
    headers: buildHeaders(token, true),
    body: JSON.stringify(userData),
  });

  return parseResponse(response);
};
