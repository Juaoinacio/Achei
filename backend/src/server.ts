import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRoutes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (mobile, curl, SSR)
      if (!origin) return callback(null, true);
      // Em desenvolvimento, permite qualquer localhost ou 127.0.0.1
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        process.env.NODE_ENV === 'development'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Healthcheck
app.get('/', (_req, res) => {
  res.json({
    name: 'Achei Unochapecó API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api',
  });
});

// Main API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorMiddleware);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Achei Unochapecó rodando em http://localhost:${PORT}`);
    console.log(`📡 Endpoints disponíveis em http://localhost:${PORT}/api`);
  });
}

export { app };
