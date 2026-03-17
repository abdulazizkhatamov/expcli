import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class RateLimitIntegration extends BaseIntegration {
  readonly name = 'rate-limit';
  readonly description = 'Global rate limiting with express-rate-limit';
  readonly packages = {
    prod: ['express-rate-limit'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'rate-limiter.ts.tpl', 'src/common/middleware/rate-limiter.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import { globalRateLimiter } from './common/middleware/rate-limiter.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(globalRateLimiter);`,
      },
    ]);
  }
}

export default RateLimitIntegration;
