export const SESSION_KEY = 'soledad-conecta-session';

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const getSession = () => {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    clearSession();
    return null;
  }
};

export const getSessionRole = () => {
  return getSession()?.user?.rol || null;
};

export const getSessionToken = () => {
  return getSession()?.token || null;
};

export const updateSessionUser = (userPatch) => {
  const currentSession = getSession();

  if (!currentSession) {
    return;
  }

  saveSession({
    ...currentSession,
    user: {
      ...currentSession.user,
      ...userPatch,
    },
  });
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
