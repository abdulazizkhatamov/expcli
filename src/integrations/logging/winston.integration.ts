import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class WinstonIntegration extends BaseIntegration {
  readonly name = 'winston';
  readonly description = 'Structured logging with Winston';
  readonly packages = {
    prod: ['winston'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'logger.ts.tpl', 'src/lib/logger.ts');
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'src/lib/logger.ts');
  }
}

export default WinstonIntegration;
