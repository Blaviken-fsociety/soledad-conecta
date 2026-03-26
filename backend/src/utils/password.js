import crypto from 'crypto';

const normalizePassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const hashPassword = (password) => {
  return normalizePassword(password);
};

export const verifyPassword = (password, passwordHash) => {
  return normalizePassword(password) === passwordHash;
};
