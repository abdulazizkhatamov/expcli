import { createApp } from './app.js';
import { env } from './config/env.js';

async function bootstrap(): Promise<void> {
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`[__PROJECT_NAME__] Server running → http://localhost:${env.PORT}`);
  });
}

bootstrap();
