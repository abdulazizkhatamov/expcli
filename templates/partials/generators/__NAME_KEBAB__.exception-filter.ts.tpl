import type { Request, Response, NextFunction } from 'express';

/**
 * Exception filter for __NAME_PASCAL__ errors.
 * Register in app.ts after your routes:
 *   app.use(__NAME_CAMEL__ExceptionFilter);
 */
export function __NAME_CAMEL__ExceptionFilter(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: handle specific error types
  // Call next(err) to pass to the next error handler
  next(err);
}
