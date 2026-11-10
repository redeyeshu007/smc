import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

/**
 * Middleware ensuring MongoDB is actively connected before executing database operations
 */
export const checkDbConnection = (
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    return next(
      ApiError.serviceUnavailable(
        'Database connection is offline. Please verify MongoDB service status.'
      )
    );
  }
  next();
};

