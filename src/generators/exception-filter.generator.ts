import path from 'path';
import { BaseGenerator } from './base.generator.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class ExceptionFilterGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    const outputDir = this.resolveOutputDir(ctx);
    const destPath = path.join(outputDir, `${ctx.context.nameKebab}.exception-filter.ts`);
    const file = await this.renderAndWrite('__NAME_KEBAB__.exception-filter.ts.tpl', destPath, ctx);
    return [file];
  }
}
