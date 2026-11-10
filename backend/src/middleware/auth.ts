import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Authenticate incoming request via JWT Bearer Token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token is missing. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw ApiError.unauthorized('Authentication token is malformed.');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;

      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        throw ApiError.unauthorized('Account no longer exists.');
      }

      req.user = user;
      next();
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Authentication token has expired. Please log in again.');
      }
      throw ApiError.unauthorized('Invalid or forged authentication token.');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optionally authenticate incoming request if Bearer token is provided
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET) as JwtTokenPayload;
          const user = await User.findById(decoded.userId).select('-passwordHash');
          if (user) {
            req.user = user;
          }
        } catch {
          // Token invalid/expired - continue as unauthenticated guest
        }
      }
    }
  } catch {
    // Continue as unauthenticated guest
  }
  next();
};

/**
 * Enforce Role-Based Access Control (RBAC)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required to access this resource'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: requires ${allowedRoles.join(' or ')} privilege.`
        )
      );
    }

    next();
  };
};
