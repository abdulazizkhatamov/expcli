import { Router } from 'express';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';

const healthService = new HealthService();
const healthController = new HealthController(healthService);

export const healthRouter = Router();

healthRouter.get('/', (req, res) => healthController.check(req, res));
