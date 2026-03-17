import { BaseIntegration } from '../base.integration.js';
import { patchPackageJsonScripts, revertPackageJsonScripts } from '../../utils/patcher.js';
import type { IntegrationContext } from '../integration.interface.js';

export class JestIntegration extends BaseIntegration {
  readonly name = 'jest';
  readonly description = 'Testing with Jest and ts-jest';
  readonly packages = {
    prod: [] as string[],
    dev: ['jest', '@types/jest', 'ts-jest', 'supertest', '@types/supertest'],
  };
  readonly conflictsWith = ['vitest'];

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'jest.config.ts.tpl', 'jest.config.ts');
    await this.scaffoldFile(ctx, 'app.test.ts.tpl', 'src/__tests__/app.test.ts');

    await patchPackageJsonScripts(ctx.projectRoot, {
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
    });
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'jest.config.ts');
    await this.removeFile(ctx.projectRoot, 'src/__tests__/app.test.ts');

    await revertPackageJsonScripts(ctx.projectRoot, {
      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
    });
  }
}

export default JestIntegration;
