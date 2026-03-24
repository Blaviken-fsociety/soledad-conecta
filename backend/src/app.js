import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
);
app.use(express.json());

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
