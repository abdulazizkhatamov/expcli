import type { Request, Response, NextFunction } from 'express';
import { HttpException } from './http-exception.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  console.error('[error]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}
