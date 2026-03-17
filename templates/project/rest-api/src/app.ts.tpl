import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes.js';

// @expcli:imports

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // @expcli:middleware

  app.use('/api', router);

  // @expcli:routes

  // @expcli:error-handler

  return app;
}
