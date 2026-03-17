import path from 'path';
import { BaseGenerator } from './base.generator.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class DtoGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    const outputDir = this.resolveOutputDir(ctx);
    const destPath = path.join(outputDir, `${ctx.context.nameKebab}.dto.ts`);
    const file = await this.renderAndWrite('__NAME_KEBAB__.dto.ts.tpl', destPath, ctx);
    return [file];
  }
}
