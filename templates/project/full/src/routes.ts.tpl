import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

// @expcli:imports

export const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);

// @expcli:routes
