import path from 'path';
import { BaseIntegration } from '../base.integration.js';
import { pathExists, writeFile, readFile } from '../../utils/fs.js';
import type { IntegrationContext } from '../integration.interface.js';

export class JwtIntegration extends BaseIntegration {
  readonly name = 'jwt';
  readonly description = 'JSON Web Token authentication helpers';
  readonly packages = {
    prod: ['jsonwebtoken'],
    dev: ['@types/jsonwebtoken'],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'jwt.ts.tpl', 'src/lib/jwt.ts');
    await this.scaffoldFile(ctx, 'jwt.guard.ts.tpl', 'src/common/guards/jwt.guard.ts');

    await appendEnvVar(ctx.projectRoot, '.env', 'JWT_SECRET=change-me');
    await appendEnvVar(ctx.projectRoot, '.env', 'JWT_EXPIRES_IN=7d');
    await appendEnvVar(ctx.projectRoot, '.env.example', 'JWT_SECRET=change-me');
    await appendEnvVar(ctx.projectRoot, '.env.example', 'JWT_EXPIRES_IN=7d');
  }
}

async function appendEnvVar(projectRoot: string, filename: string, line: string): Promise<void> {
  const filePath = path.join(projectRoot, filename);
  const key = line.split('=')[0] ?? '';
  if (await pathExists(filePath)) {
    const content = await readFile(filePath);
    if (!content.includes(key)) {
      await writeFile(filePath, content.trimEnd() + '\n' + line + '\n');
    }
  } else {
    await writeFile(filePath, line + '\n');
  }
}

export default JwtIntegration;
