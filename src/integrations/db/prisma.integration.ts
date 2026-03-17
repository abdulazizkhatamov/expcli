import path from 'path';
import { fileURLToPath } from 'url';
import { select } from '@clack/prompts';
import { BaseIntegration } from '../base.integration.js';
import { pathExists, writeFile, readFile, ensureDir } from '../../utils/fs.js';
import { runCommand } from '../../utils/process.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

type PrismaProvider = 'postgresql' | 'mysql' | 'sqlite' | 'mongodb' | 'sqlserver';

const PROVIDER_URLS: Record<PrismaProvider, string> = {
  postgresql: 'postgresql://user:password@localhost:5432/mydb?schema=public',
  mysql: 'mysql://user:password@localhost:3306/mydb',
  sqlite: 'file:./dev.db',
  mongodb: 'mongodb://localhost:27017/mydb',
  sqlserver: 'sqlserver://localhost:1433;database=mydb;user=sa;password=yourStrong(!)Password;encrypt=true',
};

function getTemplatesRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  if (currentDir.includes(`${path.sep}dist`)) {
    const distIdx = currentDir.indexOf(`${path.sep}dist`);
    return path.join(currentDir.slice(0, distIdx), 'dist', 'templates');
  }
  const srcIdx = currentDir.indexOf(`${path.sep}src`);
  if (srcIdx !== -1) {
    return path.join(currentDir.slice(0, srcIdx), 'templates');
  }
  return path.resolve(currentDir, '..', '..', '..', 'templates');
}

export class PrismaIntegration extends BaseIntegration {
  readonly name = 'prisma';
  readonly description = 'Type-safe database ORM with Prisma';
  readonly packages = {
    prod: ['@prisma/client'],
    dev: ['prisma'],
  };
  readonly conflictsWith = ['typeorm', 'drizzle', 'mongoose'];

  async prompt(_ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>> {
    const provider = await select({
      message: 'Which database provider would you like to use?',
      options: [
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mongodb', label: 'MongoDB' },
        { value: 'sqlserver', label: 'SQL Server' },
      ],
      initialValue: 'postgresql',
    });

    return { provider: provider as string };
  }

  async run(ctx: IntegrationContext): Promise<void> {
    const provider = (ctx.options['provider'] as PrismaProvider | undefined) ?? 'postgresql';

    // Scaffold prisma/schema.prisma (custom — needs token replacement for provider)
    const templatesRoot = getTemplatesRoot();
    const schemaTemplatePath = path.join(templatesRoot, 'partials', 'prisma', 'schema.prisma.tpl');
    let schemaContent = await readFile(schemaTemplatePath);
    schemaContent = schemaContent.replace(/__PRISMA_PROVIDER__/g, provider);

    const schemaDestPath = path.join(ctx.projectRoot, 'prisma', 'schema.prisma');
    await ensureDir(path.dirname(schemaDestPath));
    await writeFile(schemaDestPath, schemaContent);
    logger.success('Scaffolded prisma/schema.prisma');

    // Scaffold src/lib/prisma.ts
    await this.scaffoldFile(ctx, 'prisma.ts.tpl', 'src/lib/prisma.ts');

    // Patch .env and .env.example
    const dbUrl = PROVIDER_URLS[provider] ?? PROVIDER_URLS.postgresql;
    await appendEnvVar(ctx.projectRoot, '.env', `DATABASE_URL="${dbUrl}"`);
    await appendEnvVar(ctx.projectRoot, '.env.example', `DATABASE_URL="${dbUrl}"`);

    // Hint about graceful shutdown
    logger.info('Add prisma.$disconnect() to your shutdown handler in src/index.ts');

    // Run prisma generate
    logger.step('Running prisma generate...');
    try {
      await runCommand('npx', ['prisma', 'generate'], ctx.projectRoot);
    } catch (err) {
      logger.warn(
        `prisma generate failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      logger.warn('Run "npx prisma generate" manually after installing dependencies.');
    }
  }
}

async function appendEnvVar(projectRoot: string, filename: string, line: string): Promise<void> {
  const filePath = path.join(projectRoot, filename);
  if (await pathExists(filePath)) {
    const content = await readFile(filePath);
    if (!content.includes('DATABASE_URL')) {
      await writeFile(filePath, content.trimEnd() + '\n' + line + '\n');
    }
  } else {
    await writeFile(filePath, line + '\n');
  }
}

export default PrismaIntegration;
