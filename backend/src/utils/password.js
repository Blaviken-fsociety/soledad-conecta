import crypto from 'crypto';

const normalizePassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

const isLegacyHash = (value = '') => /^[a-f0-9]{64}$/i.test(value);

export const hashPassword = (password) => {
  return password;
};

export const verifyPassword = (password, passwordHash) => {
  if (!passwordHash) {
    return false;
  }

  if (password === passwordHash) {
    return true;
  }

  if (isLegacyHash(passwordHash)) {
    return normalizePassword(password) === passwordHash;
  }

  return false;
};

export const generateRandomPassword = (length = 10) => {
  let generated = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, PASSWORD_ALPHABET.length);
    generated += PASSWORD_ALPHABET[randomIndex];
  }

  return generated;
};
