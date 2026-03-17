import express, { Application } from 'express';

export function createApp(): Application {
  const app = express();

  // @expcli:imports

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // @expcli:middleware

  app.get('/', (_req, res) => {
    res.json({ message: 'Hello from __PROJECT_NAME__!' });
  });

  // @expcli:routes

  // @expcli:error-handler

  return app;
}
