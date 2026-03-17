import { BaseIntegration } from '../base.integration.js';
import { patchTsConfig } from '../../utils/patcher.js';
import type { IntegrationContext } from '../integration.interface.js';

export class ClassValidatorIntegration extends BaseIntegration {
  readonly name = 'class-validator';
  readonly description = 'Decorator-based validation with class-validator and class-transformer';
  readonly packages = {
    prod: ['class-validator', 'class-transformer'],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'validate.ts.tpl', 'src/lib/validate.ts');

    await patchTsConfig(ctx.projectRoot, {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    });
  }
}

export default ClassValidatorIntegration;
