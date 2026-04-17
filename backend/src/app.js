import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (origin.endsWith('.netlify.app')) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS'));
    },
  }),
);
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/api', (_request, response) => {
  response.json({
    success: true,
    message: 'API de Soledad Conecta operativa',
  });
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
