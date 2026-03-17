import path from 'path';
import { BaseGenerator } from './base.generator.js';
import type { GeneratorContext, GeneratedFile } from './generator.interface.js';

export class ServiceGenerator extends BaseGenerator {
  async generate(ctx: GeneratorContext): Promise<GeneratedFile[]> {
    const outputDir = this.resolveOutputDir(ctx);
    const destPath = path.join(outputDir, `${ctx.context.nameKebab}.service.ts`);
    const file = await this.renderAndWrite('__NAME_KEBAB__.service.ts.tpl', destPath, ctx);
    return [file];
  }
}
