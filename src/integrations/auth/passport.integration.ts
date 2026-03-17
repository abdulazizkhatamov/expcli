import { BaseIntegration } from '../base.integration.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

export class PassportIntegration extends BaseIntegration {
  readonly name = 'passport';
  readonly description = 'Authentication middleware with Passport.js';
  readonly packages = {
    prod: ['passport', 'passport-local'],
    dev: ['@types/passport', '@types/passport-local'],
  };
  // Soft requirement — warn but don't block
  readonly requires = [] as string[];

  async prompt(ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>> {
    const hasJwt = ctx.config.integrations.some((i) => i.name === 'jwt');
    const hasSessions = ctx.config.integrations.some((i) => i.name === 'sessions');

    if (!hasJwt && !hasSessions) {
      logger.warn(
        'Passport works best with either "jwt" or "sessions" installed. ' +
        'Consider running "expcli add jwt" or "expcli add sessions" first.',
      );
    }

    return {};
  }

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'passport.ts.tpl', 'src/lib/passport.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import { passport } from './lib/passport.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(passport.initialize());`,
      },
    ]);
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'src/lib/passport.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.revertPatches(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import { passport } from './lib/passport.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(passport.initialize());`,
      },
    ]);
  }
}

export default PassportIntegration;
