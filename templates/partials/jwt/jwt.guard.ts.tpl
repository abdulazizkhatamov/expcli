import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: import('../../lib/jwt.js').JwtPayload;
    }
  }
}

export function jwtGuard(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    next(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));
    return;
  }
  try {
    req.user = verifyToken(authHeader.slice(7));
    next();
  } catch {
    next(Object.assign(new Error('Invalid or expired token'), { statusCode: 401 }));
  }
}
