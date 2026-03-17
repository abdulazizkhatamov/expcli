import { Router } from 'express';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

const usersService = new UsersService();
const usersController = new UsersController(usersService);

export const usersRouter = Router();

usersRouter.get('/', (req, res) => usersController.findAll(req, res));
usersRouter.get('/:id', (req, res, next) => usersController.findOne(req, res, next));
usersRouter.post('/', (req, res, next) => usersController.create(req, res, next));
usersRouter.patch('/:id', (req, res, next) => usersController.update(req, res, next));
usersRouter.delete('/:id', (req, res, next) => usersController.remove(req, res, next));
