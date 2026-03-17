import type { Request, Response, NextFunction } from 'express';

// TODO: wire up your service
// import type { __NAME_PASCAL__Service } from './__NAME_KEBAB__.service.js';

export class __NAME_PASCAL__Controller {
  // constructor(private readonly __NAME_CAMEL__Service: __NAME_PASCAL__Service) {}

  findAll(_req: Request, res: Response): void {
    res.json({ success: true, data: [] });
  }

  findOne(req: Request, res: Response, _next: NextFunction): void {
    res.json({ success: true, data: { id: req.params['id'] } });
  }

  create(req: Request, res: Response, _next: NextFunction): void {
    res.status(201).json({ success: true, data: req.body });
  }

  update(req: Request, res: Response, _next: NextFunction): void {
    res.json({ success: true, data: { id: req.params['id'], ...req.body } });
  }

  remove(req: Request, res: Response, _next: NextFunction): void {
    res.status(204).send();
  }
}
