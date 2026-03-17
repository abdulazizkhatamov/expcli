import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

/**
 * Returns an Express middleware that validates req.body against a Zod schema.
 * Attaches the parsed (typed) result back to req.body on success.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      next(Object.assign(new Error(`Validation failed: ${message}`), { statusCode: 400 }));
      return;
    }
    req.body = result.data;
    next();
  };
}
