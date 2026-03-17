import path from 'path';
import { BaseGenerator } from './base.generator.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class ModelGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    const outputDir = this.resolveOutputDir(ctx);
    const destPath = path.join(outputDir, `${ctx.context.nameKebab}.types.ts`);
    const file = await this.renderAndWrite('__NAME_KEBAB__.types.ts.tpl', destPath, ctx);
    return [file];
  }
}
