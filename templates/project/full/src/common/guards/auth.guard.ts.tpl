import type { Request, Response, NextFunction } from 'express';
import { HttpException } from '../errors/http-exception.js';

// @expcli:imports

/**
 * Auth guard middleware. Replace this implementation once you add
 * an auth integration (e.g. expcli add jwt).
 */
export function authGuard(req: Request, _res: Response, next: NextFunction): void {
  // @expcli:auth-strategy

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(HttpException.unauthorized());
  }

  // TODO: validate the token. Run `expcli add jwt` to scaffold JWT support.
  next();
}
