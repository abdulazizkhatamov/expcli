import { BaseIntegration } from '../base.integration.js';
import { patchPackageJsonScripts, revertPackageJsonScripts } from '../../utils/patcher.js';
import type { IntegrationContext } from '../integration.interface.js';

export class VitestIntegration extends BaseIntegration {
  readonly name = 'vitest';
  readonly description = 'Testing with Vitest';
  readonly packages = {
    prod: [] as string[],
    dev: ['vitest', '@vitest/coverage-v8', 'supertest', '@types/supertest'],
  };
  readonly conflictsWith = ['jest'];

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'vitest.config.ts.tpl', 'vitest.config.ts');
    await this.scaffoldFile(ctx, 'app.test.ts.tpl', 'src/__tests__/app.test.ts');

    await patchPackageJsonScripts(ctx.projectRoot, {
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:cov': 'vitest run --coverage',
    });
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'vitest.config.ts');
    await this.removeFile(ctx.projectRoot, 'src/__tests__/app.test.ts');

    await revertPackageJsonScripts(ctx.projectRoot, {
      test: 'vitest run',
      'test:watch': 'vitest',
      'test:cov': 'vitest run --coverage',
    });
  }
}

export default VitestIntegration;
