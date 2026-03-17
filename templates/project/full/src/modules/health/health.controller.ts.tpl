import type { Request, Response } from 'express';
import type { HealthService } from './health.service.js';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  check(_req: Request, res: Response): void {
    const status = this.healthService.check();
    res.json(status);
  }
}
