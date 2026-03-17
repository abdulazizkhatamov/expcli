import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';

export function validateBody(schema: Joi.Schema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      next(Object.assign(new Error(`Validation failed: ${message}`), { statusCode: 400 }));
      return;
    }
    req.body = value;
    next();
  };
}
