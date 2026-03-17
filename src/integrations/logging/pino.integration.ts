import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class PinoIntegration extends BaseIntegration {
  readonly name = 'pino';
  readonly description = 'High-performance logging with Pino';
  readonly packages = {
    prod: ['pino', 'pino-http'],
    dev: ['pino-pretty'],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'logger.ts.tpl', 'src/lib/logger.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import pinoHttp from 'pino-http';\nimport { logger } from './lib/logger.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(pinoHttp({ logger }));`,
      },
    ]);
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'src/lib/logger.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.revertPatches(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import pinoHttp from 'pino-http';\nimport { logger } from './lib/logger.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(pinoHttp({ logger }));`,
      },
    ]);
  }
}

export default PinoIntegration;
