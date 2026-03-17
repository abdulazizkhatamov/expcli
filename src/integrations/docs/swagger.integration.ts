import { BaseIntegration } from '../base.integration.js';
import type { IntegrationContext } from '../integration.interface.js';

export class SwaggerIntegration extends BaseIntegration {
  readonly name = 'swagger';
  readonly description = 'API documentation with Swagger UI and swagger-jsdoc';
  readonly packages = {
    prod: ['swagger-jsdoc', 'swagger-ui-express'],
    dev: ['@types/swagger-jsdoc', '@types/swagger-ui-express'],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'swagger.ts.tpl', 'src/docs/swagger.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import { swaggerUi, swaggerSpec } from './docs/swagger.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:routes',
        code: `app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));`,
      },
    ]);
  }
}

export default SwaggerIntegration;
