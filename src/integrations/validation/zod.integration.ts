import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class ZodIntegration extends BaseIntegration {
  readonly name = 'zod';
  readonly description = 'Schema validation with Zod';
  readonly packages = {
    prod: ['zod'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'validate.ts.tpl', 'src/lib/validate.ts');
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'src/lib/validate.ts');
  }
}

export default ZodIntegration;
