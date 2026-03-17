import path from 'path';
import { confirm } from '@clack/prompts';
import { renderFile } from '../template/renderer.js';
import { getPartialPath } from '../template/loader.js';
import { pathExists, writeFile } from '../utils/fs.js';
import type { IGenerator, GeneratorContext, GeneratedFile } from './generator.interface.js';

export abstract class BaseGenerator implements IGenerator {
  abstract generate(ctx: GeneratorContext): Promise<GeneratedFile[]>;

  /**
   * Resolves the output directory for a given module name.
   * If flat=true: returns ctx.targetDir
   * If flat=false: returns ctx.targetDir/<name-kebab>
   */
  protected resolveOutputDir(ctx: GeneratorContext): string {
    if (ctx.flat) {
      return ctx.targetDir;
    }
    return path.join(ctx.targetDir, ctx.context.nameKebab);
  }

  /**
   * Gets the absolute path to a generator template by name.
   */
  protected getTemplatePath(templateName: string): string {
    return path.join(getPartialPath('generators'), templateName);
  }

  /**
   * Renders a generator template file and writes it to dest.
   * If dryRun is true, skips writing and returns a dry-run marker.
   * If the file exists, prompts the user whether to overwrite.
   * Returns a GeneratedFile.
   */
  protected async renderAndWrite(
    templateName: string,
    destPath: string,
    ctx: GeneratorContext,
  ): Promise<GeneratedFile> {
    const templatePath = this.getTemplatePath(templateName);
    const content = await renderFile(templatePath, ctx.context);

    // Dry-run: report what would be created without writing
    if (ctx.dryRun) {
      return { path: destPath, content: '', skipped: false, dryRun: true };
    }

    if (await pathExists(destPath)) {
      let shouldOverwrite = false;

      if (process.stdout.isTTY) {
        const answer = await confirm({
          message: `File ${destPath} already exists. Overwrite?`,
          initialValue: false,
        });
        // confirm() returns boolean | symbol (symbol if user cancels with Ctrl+C)
        shouldOverwrite = answer === true;
      }

      if (!shouldOverwrite) {
        return { path: destPath, content: '', skipped: true };
      }
    }

    await writeFile(destPath, content);
    return { path: destPath, content, skipped: false };
  }
}
