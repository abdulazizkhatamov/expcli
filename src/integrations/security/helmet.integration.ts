import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class HelmetIntegration extends BaseIntegration {
  readonly name = 'helmet';
  readonly description = 'Security headers middleware with Helmet';
  readonly packages = {
    prod: ['helmet'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import helmet from 'helmet';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(helmet());`,
      },
    ]);
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.revertPatches(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import helmet from 'helmet';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(helmet());`,
      },
    ]);
  }
}

export default HelmetIntegration;
