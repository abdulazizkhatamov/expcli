import type { Request, Response, NextFunction } from 'express';
import { ok, created, noContent } from '../../common/response/api-response.js';
import { validateCreateUserDto } from './dto/create-user.dto.js';
import { validateUpdateUserDto } from './dto/update-user.dto.js';
import { HttpException } from '../../common/errors/http-exception.js';
import type { UsersService } from './users.service.js';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  findAll(_req: Request, res: Response): void {
    const users = this.usersService.findAll();
    res.json(ok(users));
  }

  findOne(req: Request, res: Response, next: NextFunction): void {
    try {
      const user = this.usersService.findById(req.params['id']!);
      res.json(ok(user));
    } catch (err) {
      next(err);
    }
  }

  create(req: Request, res: Response, next: NextFunction): void {
    try {
      const validation = validateCreateUserDto(req.body);
      if (!validation.success) return next(HttpException.badRequest(validation.error));
      const user = this.usersService.create(validation.data);
      res.status(201).json(created(user));
    } catch (err) {
      next(err);
    }
  }

  update(req: Request, res: Response, next: NextFunction): void {
    try {
      const validation = validateUpdateUserDto(req.body);
      if (!validation.success) return next(HttpException.badRequest(validation.error));
      const user = this.usersService.update(req.params['id']!, validation.data);
      res.json(ok(user));
    } catch (err) {
      next(err);
    }
  }

  remove(req: Request, res: Response, next: NextFunction): void {
    try {
      this.usersService.remove(req.params['id']!);
      res.status(204).json(noContent());
    } catch (err) {
      next(err);
    }
  }
}
