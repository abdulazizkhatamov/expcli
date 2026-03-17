import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Resolves the templates directory relative to the current module file.
 *
 * When running from dist/main.js:
 *   __dirname equivalent → dist/
 *   templates are at    → dist/templates/
 *
 * When running from src/main.ts via tsx during development:
 *   __dirname equivalent → src/
 *   templates are at    → templates/ (project root)
 *
 * The function tries dist/templates first, then falls back to the project-root
 * templates directory so both production and dev modes work correctly.
 */
function resolveTemplatesRoot(): string {
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);

  // In production: currentDir === <project>/dist/
  // dist/templates/ should exist
  const distTemplates = path.resolve(currentDir, 'templates');

  // In development: currentDir === <project>/src/
  // templates/ is one level up (project root)
  const devTemplates = path.resolve(currentDir, '..', 'templates');

  // We can't do an async check here (this is a sync helper), so we use a
  // heuristic: if the current file lives inside a "dist" directory, use the
  // sibling templates dir; otherwise use the project-root templates dir.
  if (currentDir.endsWith('dist') || currentDir.includes(`${path.sep}dist${path.sep}`)) {
    return distTemplates;
  }

  return devTemplates;
}

/**
 * Returns the absolute path to the templates root directory.
 *
 * In production (dist/): dist/templates/
 * In development (src/ via tsx): <project-root>/templates/
 */
export function getTemplatesRoot(): string {
  return resolveTemplatesRoot();
}

/**
 * Returns the absolute path to a project scaffold template directory.
 *
 * @param templateName - One of "minimal", "rest-api", "full"
 * @returns Absolute path to templates/project/<templateName>/
 */
export function getProjectTemplatePath(templateName: string): string {
  return path.join(getTemplatesRoot(), 'project', templateName);
}

/**
 * Returns the absolute path to a named partial template file.
 *
 * @param partialName - The partial file name (e.g. "tsconfig.json.tpl")
 * @returns Absolute path to templates/partials/<partialName>
 */
export function getPartialPath(partialName: string): string {
  return path.join(getTemplatesRoot(), 'partials', partialName);
}
