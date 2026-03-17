import type { Request, Response, NextFunction } from 'express';
import type { __NAME_PASCAL__Service } from './__NAME_KEBAB__.service.js';
import type { __NAME_PASCAL__ } from './__NAME_KEBAB__.types.js';

export class __NAME_PASCAL__Controller {
  constructor(private readonly __NAME_CAMEL__Service: __NAME_PASCAL__Service) {}

  findAll(_req: Request, res: Response): void {
    const items = this.__NAME_CAMEL__Service.findAll();
    res.json({ success: true, data: items });
  }

  findOne(req: Request, res: Response, next: NextFunction): void {
    try {
      const item = this.__NAME_CAMEL__Service.findById(req.params['id']!);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const item = this.__NAME_CAMEL__Service.create(req.body as Omit<__NAME_PASCAL__, 'id' | 'createdAt' | 'updatedAt'>);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const item = this.__NAME_CAMEL__Service.update(req.params['id']!, req.body as Partial<__NAME_PASCAL__>);
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  remove(req: Request, res: Response, next: NextFunction): void {
    try {
      this.__NAME_CAMEL__Service.remove(req.params['id']!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
