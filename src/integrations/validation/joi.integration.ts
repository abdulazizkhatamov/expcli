import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class JoiIntegration extends BaseIntegration {
  readonly name = 'joi';
  readonly description = 'Schema validation with Joi';
  readonly packages = {
    prod: ['joi'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'validate.ts.tpl', 'src/lib/validate.ts');
  }
}

export default JoiIntegration;
