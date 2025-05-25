import { Request, Response, NextFunction } from 'express';
import { getADConfig } from '../config/azure';
import { ErrorResponse } from '../types';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ErrorResponse({
        code: 'AUTH_NO_TOKEN',
        message: 'No authorization token provided',
        status: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ErrorResponse({
        code: 'AUTH_INVALID_TOKEN',
        message: 'Invalid authorization token format',
        status: 401,
      });
    }

    const { audience, tenantId } = getADConfig();
    const jwksUri = `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`;

    // Verify token
    const decoded = jwt.verify(token, jwksUri, {
      audience,
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      algorithms: ['RS256'],
    }) as jwt.JwtPayload;

    // Extract user information
    req.user = {
      id: decoded.oid || decoded.sub || '',
      email: decoded.email || '',
      name: decoded.name || '',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(
        new ErrorResponse({
          code: 'AUTH_TOKEN_ERROR',
          message: 'Invalid token',
          status: 401,
          details: error,
        })
      );
    } else if (error instanceof jwt.TokenExpiredError) {
      next(
        new ErrorResponse({
          code: 'AUTH_TOKEN_EXPIRED',
          message: 'Token has expired',
          status: 401,
          details: error,
        })
      );
    } else {
      next(error);
    }
  }
};

export const requireSubscription = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const subscription = req.headers['x-subscription-type'];
    if (!subscription || subscription !== 'premium') {
      throw new ErrorResponse({
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'Premium subscription required for this operation',
        status: 403,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const rateLimiter = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const subscription = req.headers['x-subscription-type'];
    const dailyLimit = subscription === 'premium' ? Infinity : 2;

    // TODO: Implement rate limiting logic using Redis or similar
    // For now, we'll just pass through
    next();
  } catch (error) {
    next(error);
  }
};

export const errorHandler = (
  error: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = error.status || 500;
  const response = {
    code: error.code || 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { details: error.details }),
  };

  res.status(status).json(response);
}; 