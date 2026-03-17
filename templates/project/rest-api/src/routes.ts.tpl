import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';

// @expcli:imports

export const router = Router();

router.use('/health', healthRouter);

// @expcli:routes
