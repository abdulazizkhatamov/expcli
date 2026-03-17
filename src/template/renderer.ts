import path from 'path';
import fse from 'fs-extra';
import { readFile, writeFile, ensureDir } from '../utils/fs.js';
import { renderTemplate } from './engine.js';
import type { TemplateContext } from './context.js';

const TEMPLATE_EXT = '.tpl';

/**
 * Reads a .tpl file from the given path and renders it using the provided context.
 *
 * @param templatePath - Absolute path to the .tpl file
 * @param context - The template context
 * @returns The rendered file content as a string
 */
export async function renderFile(
  templatePath: string,
  context: TemplateContext,
): Promise<string> {
  const raw = await readFile(templatePath);
  return renderTemplate(raw, context);
}

/**
 * Applies token replacement to a file or directory name.
 * e.g. "__NAME_KEBAB__.controller.ts.tpl" → "user-profile.controller.ts"
 * (the .tpl extension is NOT stripped here — that happens in renderDir)
 */
function renderFileName(fileName: string, context: TemplateContext): string {
  return renderTemplate(fileName, context);
}

/**
 * Recursively renders all .tpl files from srcDir into destDir.
 *
 * - .tpl files are rendered through the template engine and written without
 *   the .tpl extension.
 * - Non-.tpl files are copied as-is.
 * - Token replacement is also applied to file and directory names.
 *
 * @param srcDir - Absolute path to the source template directory
 * @param destDir - Absolute path to the destination directory
 * @param context - The template context
 */
export async function renderDir(
  srcDir: string,
  destDir: string,
  context: TemplateContext,
): Promise<void> {
  await ensureDir(destDir);

  const entries = await fse.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip placeholder files used only to preserve empty dirs in git
    if (entry.name === '.gitkeep') continue;

    const srcEntryPath = path.join(srcDir, entry.name);
    // Apply token replacement to the entry name as well
    const renderedName = renderFileName(entry.name, context);

    if (entry.isDirectory()) {
      const destSubDir = path.join(destDir, renderedName);
      await renderDir(srcEntryPath, destSubDir, context);
    } else if (entry.isFile()) {
      if (renderedName.endsWith(TEMPLATE_EXT)) {
        // Strip .tpl extension from the output file name
        const outputName = renderedName.slice(0, -TEMPLATE_EXT.length);
        const destFilePath = path.join(destDir, outputName);
        const rendered = await renderFile(srcEntryPath, context);
        await writeFile(destFilePath, rendered);
      } else {
        // Copy non-template files as-is
        const destFilePath = path.join(destDir, renderedName);
        await fse.copy(srcEntryPath, destFilePath, { overwrite: true });
      }
    }
  }
}
