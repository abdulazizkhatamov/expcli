import type { Request, Response, NextFunction } from 'express';

export function __NAME_CAMEL__Guard(req: Request, _res: Response, next: NextFunction): void {
  // TODO: implement guard logic
  // Call next() to allow, or next(new Error('Forbidden')) to deny
  next();
}
