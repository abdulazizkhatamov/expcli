import type { Request, Response, NextFunction } from 'express';
import { HttpException } from '../errors/http-exception.js';

type Validator<T> = (data: unknown) => { success: true; data: T } | { success: false; error: string };

/**
 * Returns an Express middleware that validates req.body using the provided
 * validator function, then attaches the typed result to req.body.
 *
 * Works with any validation library. Example with plain type guards:
 *   app.post('/users', validateBody(isCreateUserDto), controller.create)
 *
 * Run `expcli add zod` to scaffold a Zod-based validator helper.
 */
export function validateBody<T>(validator: Validator<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = validator(req.body);
    if (!result.success) {
      return next(HttpException.badRequest('Validation failed', result.error));
    }
    req.body = result.data;
    next();
  };
}
