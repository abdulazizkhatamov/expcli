import path from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, ensureDir } from '../utils/fs.js';
import { applyPatches } from '../utils/patcher.js';
import { logger } from '../utils/logger.js';
import type { IIntegration, IntegrationContext } from './integration.interface.js';
import type { PatchOperation } from '../utils/patcher.js';

function getTemplatesRoot(): string {
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);

  // In production: currentDir === <project>/dist/integrations/...
  // templates are at dist/templates/
  // In development: currentDir === <project>/src/integrations/...
  // templates are at <project-root>/templates/

  // Walk up until we find the src or dist folder boundary
  if (currentDir.includes(`${path.sep}dist`)) {
    const distIdx = currentDir.indexOf(`${path.sep}dist`);
    const projectRoot = currentDir.slice(0, distIdx);
    return path.join(projectRoot, 'dist', 'templates');
  }

  const srcIdx = currentDir.indexOf(`${path.sep}src`);
  if (srcIdx !== -1) {
    const projectRoot = currentDir.slice(0, srcIdx);
    return path.join(projectRoot, 'templates');
  }

  // Fallback: two levels up from here
  return path.resolve(currentDir, '..', '..', 'templates');
}

export abstract class BaseIntegration implements IIntegration {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly packages: { prod: string[]; dev: string[] };
  readonly requires: string[] = [];
  readonly conflictsWith: string[] = [];

  async prompt(_ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>> {
    return {};
  }

  abstract run(ctx: IntegrationContext): Promise<void>;

  /**
   * Renders a template from templates/partials/<name>/<filename>
   * and writes it to projectRoot/destRelPath.
   * Creates parent directories as needed.
   */
  protected async scaffoldFile(
    ctx: IntegrationContext,
    templateRelPath: string,  // relative to templates/partials/<this.name>/
    destRelPath: string,       // relative to projectRoot
  ): Promise<void> {
    const templatesRoot = getTemplatesRoot();
    const templatePath = path.join(templatesRoot, 'partials', this.name, templateRelPath);
    const destPath = path.join(ctx.projectRoot, destRelPath);

    let content = await readFile(templatePath);

    // Replace __PROJECT_NAME__ token
    content = content.replace(/__PROJECT_NAME__/g, ctx.config.name);

    await ensureDir(path.dirname(destPath));
    await writeFile(destPath, content);

    logger.success(`Scaffolded ${destRelPath}`);
  }

  /**
   * Applies patch operations and logs results.
   * Warns (doesn't throw) if an anchor is not found.
   */
  protected async patch(ctx: IntegrationContext, ops: PatchOperation[]): Promise<void> {
    // Resolve relative file paths against projectRoot
    const resolvedOps = ops.map((op) => ({
      ...op,
      file: path.isAbsolute(op.file) ? op.file : path.join(ctx.projectRoot, op.file),
    }));

    const results = await applyPatches(resolvedOps);

    for (const result of results) {
      const relFile = path.relative(ctx.projectRoot, result.file);
      if (result.success) {
        logger.success(`Patched ${relFile}`);
      } else if (result.reason === 'already_patched') {
        logger.info(`${relFile} already patched — skipping`);
      } else if (result.reason === 'anchor_not_found') {
        logger.warn(`Could not patch ${relFile}: anchor not found (add manually)`);
      } else if (result.reason === 'file_not_found') {
        logger.warn(`Could not patch ${relFile}: file not found (skipping)`);
      }
    }
  }
}
