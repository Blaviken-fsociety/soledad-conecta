export const SESSION_KEY = 'soledad-conecta-session';

export const saveSession = (role) => {
  localStorage.setItem(SESSION_KEY, role);
};

export const getSessionRole = () => {
  return localStorage.getItem(SESSION_KEY);
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
