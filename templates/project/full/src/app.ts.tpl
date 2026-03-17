import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes.js';
import { errorHandler } from './common/errors/error-handler.js';
import { requestLogger } from './common/middleware/request-logger.js';

// @expcli:imports

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // @expcli:middleware

  app.use('/api', router);

  // @expcli:routes

  app.use(errorHandler);

  // @expcli:error-handler

  return app;
}
