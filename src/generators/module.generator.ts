import path from 'path';
import chalk from 'chalk';
import { BaseGenerator } from './base.generator.js';
import { addModule } from '../config/expcli-config.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class ModuleGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    // Module always creates a subfolder regardless of --flat
    const outputDir = path.join(ctx.targetDir, ctx.context.nameKebab);

    const templates: Array<[string, string]> = [
      ['__NAME_KEBAB__.module-controller.ts.tpl', `${ctx.context.nameKebab}.controller.ts`],
      ['__NAME_KEBAB__.service.ts.tpl', `${ctx.context.nameKebab}.service.ts`],
      ['__NAME_KEBAB__.module-routes.ts.tpl', `${ctx.context.nameKebab}.routes.ts`],
      ['__NAME_KEBAB__.types.ts.tpl', `${ctx.context.nameKebab}.types.ts`],
      ['__NAME_KEBAB__.dto.ts.tpl', `${ctx.context.nameKebab}.dto.ts`],
    ];

    const files: GeneratedFile[] = [];

    for (const [templateName, outputFileName] of templates) {
      const destPath = path.join(outputDir, outputFileName);
      const file = await this.renderAndWrite(templateName, destPath, ctx);
      files.push(file);
    }

    // Only register module in expcli.json when not in dry-run mode
    if (!ctx.dryRun) {
      const modulePath = path.relative(ctx.projectRoot, outputDir);
      await addModule(ctx.context.nameKebab, modulePath, ctx.projectRoot);
    }

    // Print helpful hint (skip during dry run — no actual files created)
    if (!ctx.dryRun) {
      const nameKebab = ctx.context.nameKebab;
      const nameCamel = ctx.context.nameCamel;
      const namePlural = ctx.context.namePlural;

      console.log('');
      console.log(
        chalk.dim('  → Remember to register your new module\'s router in src/routes.ts:'),
      );
      console.log(
        chalk.cyan(
          `     import { ${nameCamel}Router } from './modules/${nameKebab}/${nameKebab}.routes.js';`,
        ),
      );
      console.log(chalk.cyan(`     router.use('/${namePlural}', ${nameCamel}Router);`));
      console.log('');
    }

    return files;
  }
}
