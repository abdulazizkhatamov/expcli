import path from 'path';
import { BaseGenerator } from './base.generator.js';
import { findConfigUp, readConfig } from '../config/expcli-config.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class SpecGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    // Detect test runner from expcli.json integrations
    let hasVitest = false;
    const configPath = await findConfigUp(ctx.projectRoot);
    if (configPath) {
      const config = await readConfig(configPath);
      hasVitest = config.integrations.includes('vitest');
    }

    // Place spec file inside the module folder: src/modules/<name>/<name>.spec.ts
    const outputDir = ctx.flat
      ? ctx.targetDir
      : path.join(ctx.targetDir, ctx.context.nameKebab);

    const destPath = path.join(outputDir, `${ctx.context.nameKebab}.spec.ts`);

    // Inject VITEST flag into template context
    const specContext = {
      ...ctx.context,
      flags: { ...ctx.context.flags, VITEST: hasVitest },
    };

    const specCtx: GeneratorContext = { ...ctx, context: specContext };
    const file = await this.renderAndWrite('__NAME_KEBAB__.spec.ts.tpl', destPath, specCtx);

    return [file];
  }
}
