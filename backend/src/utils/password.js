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

export const validatePasswordStrength = (password) => {
  const trimmedPassword = String(password || '').trim();

  if (trimmedPassword.length < 8) {
    return 'La contrasena debe tener al menos 8 caracteres';
  }

  if (!/[A-Z]/.test(trimmedPassword)) {
    return 'La contrasena debe incluir al menos una letra mayuscula';
  }

  if (!/\d/.test(trimmedPassword)) {
    return 'La contrasena debe incluir al menos un numero';
  }

  if (!/[^A-Za-z0-9]/.test(trimmedPassword)) {
    return 'La contrasena debe incluir al menos un caracter especial';
  }

  return null;
};

export const generateRandomPassword = (length = 10) => {
  let generated = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, PASSWORD_ALPHABET.length);
    generated += PASSWORD_ALPHABET[randomIndex];
  }

  return generated;
};
