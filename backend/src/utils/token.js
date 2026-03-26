import crypto from 'crypto';

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'soledad-conecta-dev-secret';

const encode = (value) => {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
};

const decode = (value) => {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
};

const sign = (value) => {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(value).digest('base64url');
};

export const createAuthToken = (payload) => {
  const tokenPayload = {
    ...payload,
    iat: Date.now(),
  };

  const encodedPayload = encode(tokenPayload);
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    return decode(encodedPayload);
  } catch {
    return null;
  }
};
