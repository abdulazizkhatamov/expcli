import path from 'path';
import { BaseIntegration } from '../base.integration.js';
import { pathExists, writeFile, readFile } from '../../utils/fs.js';
import type { IntegrationContext } from '../integration.interface.js';

export class SessionsIntegration extends BaseIntegration {
  readonly name = 'sessions';
  readonly description = 'Session middleware with express-session';
  readonly packages = {
    prod: ['express-session'],
    dev: ['@types/express-session'],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'session.ts.tpl', 'src/lib/session.ts');

    const appFile = `${ctx.projectRoot}/src/app.ts`;

    await this.patch(ctx, [
      {
        file: appFile,
        anchor: '@expcli:imports',
        code: `import { sessionMiddleware } from './lib/session.js';`,
      },
      {
        file: appFile,
        anchor: '@expcli:middleware',
        code: `app.use(sessionMiddleware);`,
      },
    ]);

    await appendEnvVar(ctx.projectRoot, '.env', 'SESSION_SECRET=change-me');
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

export default SessionsIntegration;
