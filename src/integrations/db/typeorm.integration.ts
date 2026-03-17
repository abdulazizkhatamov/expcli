import path from 'path';
import { fileURLToPath } from 'url';
import { select } from '@clack/prompts';
import { BaseIntegration } from '../base.integration.js';
import { readFile, writeFile, ensureDir } from '../../utils/fs.js';
import { patchTsConfig } from '../../utils/patcher.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

type TypeOrmProvider = 'postgres' | 'mysql' | 'sqlite' | 'mssql';

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

export class TypeOrmIntegration extends BaseIntegration {
  readonly name = 'typeorm';
  readonly description = 'TypeORM data mapper ORM with decorator support';
  readonly packages = {
    prod: ['typeorm', 'reflect-metadata'],
    dev: [] as string[],
  };
  readonly conflictsWith = ['prisma', 'drizzle', 'mongoose'];

  async prompt(_ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>> {
    const provider = await select({
      message: 'Which database provider would you like to use?',
      options: [
        { value: 'postgres', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'mssql', label: 'Microsoft SQL Server' },
      ],
      initialValue: 'postgres',
    });

    return { provider: provider as string };
  }

  async run(ctx: IntegrationContext): Promise<void> {
    const provider = (ctx.options['provider'] as TypeOrmProvider | undefined) ?? 'postgres';

    const templatesRoot = getTemplatesRoot();
    const templatePath = path.join(templatesRoot, 'partials', 'typeorm', 'data-source.ts.tpl');
    let content = await readFile(templatePath);
    content = content.replace(/__TYPEORM_PROVIDER__/g, provider);

    const destPath = path.join(ctx.projectRoot, 'src', 'lib', 'data-source.ts');
    await ensureDir(path.dirname(destPath));
    await writeFile(destPath, content);
    logger.success('Scaffolded src/lib/data-source.ts');

    await patchTsConfig(ctx.projectRoot, {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    });
  }
}

export default TypeOrmIntegration;
