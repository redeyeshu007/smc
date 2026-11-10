import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env.js';
import { LOCAL_UPLOADS_DIR } from './config/storage.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/apiError.js';

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows 3D models & textures to be loaded by frontend
    })
  );

  // CORS setup
  const allowedOrigins = [
    env.CLIENT_ORIGIN,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static directory for uploaded files (models, images, textures) in dev/local mode
  app.use('/uploads', express.static(LOCAL_UPLOADS_DIR));

  // Root welcome
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'AR/VR Door & Window Showroom API',
      status: 'online',
      documentation: `${env.API_PREFIX}/health`,
    });
  });

  // API router
  app.use(env.API_PREFIX, apiRouter);

  // 404 handler
  app.use((req: Request, _res: Response, next) => {
    next(ApiError.notFound(`Route '${req.originalUrl}' not found on this server`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

