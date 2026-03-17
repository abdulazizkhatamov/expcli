import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Request, Response, NextFunction } from 'express';
import type { ClassConstructor } from 'class-transformer';

export function validateBody<T extends object>(cls: ClassConstructor<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(cls, req.body);
    const errors: ValidationError[] = await validate(instance as object);
    if (errors.length > 0) {
      const message = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
      next(Object.assign(new Error(`Validation failed: ${message}`), { statusCode: 400 }));
      return;
    }
    req.body = instance;
    next();
  };
}
