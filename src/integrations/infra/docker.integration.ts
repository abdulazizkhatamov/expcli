import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class DockerIntegration extends BaseIntegration {
  readonly name = 'docker';
  readonly description = 'Docker and docker-compose configuration';
  readonly packages = {
    prod: [] as string[],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'Dockerfile.tpl', 'Dockerfile');
    await this.scaffoldFile(ctx, '.dockerignore.tpl', '.dockerignore');
    await this.scaffoldFile(ctx, 'docker-compose.yml.tpl', 'docker-compose.yml');
  }
}

export default DockerIntegration;
