import path from 'path';
import { fileURLToPath } from 'url';
import { select } from '@clack/prompts';
import { BaseIntegration } from '../base.integration.js';
import { readFile, writeFile, ensureDir } from '../../utils/fs.js';
import { patchPackageJsonScripts } from '../../utils/patcher.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

type DrizzleProvider = 'postgres' | 'mysql' | 'sqlite';

const DIALECT_MAP: Record<DrizzleProvider, string> = {
  postgres: 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
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

export class DrizzleIntegration extends BaseIntegration {
  readonly name = 'drizzle';
  readonly description = 'Lightweight TypeScript ORM with Drizzle';
  readonly packages = {
    prod: ['drizzle-orm'],
    dev: ['drizzle-kit'],
  };
  readonly conflictsWith = ['prisma', 'typeorm', 'mongoose'];

  async prompt(_ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>> {
    const provider = await select({
      message: 'Which database provider would you like to use?',
      options: [
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite' },
      ],
      initialValue: 'postgres',
    });

    return { provider: provider as string };
  }

  async run(ctx: IntegrationContext): Promise<void> {
    const provider = (ctx.options['provider'] as DrizzleProvider | undefined) ?? 'postgres';
    const dialect = DIALECT_MAP[provider] ?? 'postgresql';
    const templatesRoot = getTemplatesRoot();

    // Scaffold src/lib/db.ts — variant based on provider
    const dbTemplateName = provider === 'postgres' ? 'db.postgres.ts.tpl' : `db.${provider}.ts.tpl`;
    const dbTemplatePath = path.join(templatesRoot, 'partials', 'drizzle', dbTemplateName);
    let dbContent = await readFile(dbTemplatePath);
    dbContent = dbContent.replace(/__PROJECT_NAME__/g, ctx.config.name);

    const dbDestPath = path.join(ctx.projectRoot, 'src', 'lib', 'db.ts');
    await ensureDir(path.dirname(dbDestPath));
    await writeFile(dbDestPath, dbContent);
    logger.success('Scaffolded src/lib/db.ts');

    // Scaffold drizzle.config.ts
    const configTemplatePath = path.join(templatesRoot, 'partials', 'drizzle', 'drizzle.config.ts.tpl');
    let configContent = await readFile(configTemplatePath);
    configContent = configContent.replace(/__DRIZZLE_DIALECT__/g, dialect);

    const configDestPath = path.join(ctx.projectRoot, 'drizzle.config.ts');
    await writeFile(configDestPath, configContent);
    logger.success('Scaffolded drizzle.config.ts');

    // Add extra prod packages for postgres
    if (provider === 'postgres') {
      this.packages.prod.push('pg');
      logger.info('Note: "pg" has been added to production dependencies');
    }

    await patchPackageJsonScripts(ctx.projectRoot, {
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'drizzle-kit migrate',
      'db:studio': 'drizzle-kit studio',
    });
  }
}

export default DrizzleIntegration;
