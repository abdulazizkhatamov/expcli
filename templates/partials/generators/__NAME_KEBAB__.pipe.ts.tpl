import type { Request, Response, NextFunction } from 'express';

/**
 * Pipe middleware for __NAME_PASCAL__.
 * Use before route handlers to transform or validate req.body.
 */
export function __NAME_CAMEL__Pipe(req: Request, _res: Response, next: NextFunction): void {
  // TODO: transform or validate req.body
  next();
}
