import { createApp } from './app.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[__PROJECT_NAME__] Server running → http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[__PROJECT_NAME__] Received ${signal}, shutting down...`);
    server.close(() => {
      console.log('[__PROJECT_NAME__] Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap();
