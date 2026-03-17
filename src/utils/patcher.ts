import path from 'path';
import { readFile, writeFile, pathExists, readJson, writeJson } from './fs.js';

export interface PatchOperation {
  file: string;    // absolute path to the file to patch
  anchor: string;  // e.g. '@expcli:imports'
  code: string;    // the lines to insert after the anchor
}

export interface PatchResult {
  file: string;
  success: boolean;
  reason?: string;  // 'anchor_not_found' | 'already_patched' | 'file_not_found'
}

/**
 * Applies a series of patch operations to files.
 * Each operation inserts `code` on the line immediately after the anchor comment.
 * If the anchor is not found, returns a failed PatchResult with reason 'anchor_not_found'.
 * If the code is already present in the file (idempotency check), skips with reason 'already_patched'.
 */
export async function applyPatches(operations: PatchOperation[]): Promise<PatchResult[]> {
  const results: PatchResult[] = [];

  for (const op of operations) {
    if (!(await pathExists(op.file))) {
      results.push({ file: op.file, success: false, reason: 'file_not_found' });
      continue;
    }

    const content = await readFile(op.file);

    // Idempotency: if the code is already present, skip
    const trimmedCode = op.code.trim();
    if (content.includes(trimmedCode)) {
      results.push({ file: op.file, success: false, reason: 'already_patched' });
      continue;
    }

    // Find the anchor comment line
    const anchorComment = `// ${op.anchor}`;
    const anchorIndex = content.indexOf(anchorComment);

    if (anchorIndex === -1) {
      results.push({ file: op.file, success: false, reason: 'anchor_not_found' });
      continue;
    }

    // Find end of the anchor line
    const lineEnd = content.indexOf('\n', anchorIndex);
    if (lineEnd === -1) {
      // Anchor is on the last line — append code after it
      const newContent = content + '\n' + op.code;
      await writeFile(op.file, newContent);
    } else {
      // Insert code after the anchor line
      const newContent = content.slice(0, lineEnd + 1) + op.code + '\n' + content.slice(lineEnd + 1);
      await writeFile(op.file, newContent);
    }

    results.push({ file: op.file, success: true });
  }

  return results;
}

/**
 * Patches package.json scripts section by adding or merging new scripts.
 * Non-destructive: never removes existing scripts.
 */
export async function patchPackageJsonScripts(
  projectRoot: string,
  scripts: Record<string, string>,
): Promise<void> {
  const pkgPath = path.join(projectRoot, 'package.json');
  const raw = (await readJson(pkgPath)) as Record<string, unknown>;

  const existing = (raw['scripts'] as Record<string, string> | undefined) ?? {};
  raw['scripts'] = { ...existing, ...scripts };

  await writeJson(pkgPath, raw);
}

/**
 * Patches tsconfig.json compilerOptions by merging new options.
 * Non-destructive: never removes existing options.
 */
export async function patchTsConfig(
  projectRoot: string,
  compilerOptions: Record<string, unknown>,
): Promise<void> {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const raw = (await readJson(tsconfigPath)) as Record<string, unknown>;

  const existing = (raw['compilerOptions'] as Record<string, unknown> | undefined) ?? {};
  raw['compilerOptions'] = { ...existing, ...compilerOptions };

  await writeJson(tsconfigPath, raw);
}

/**
 * Reverses patch operations — removes the inserted code lines from each file.
 * Identifies the lines to remove by finding the exact `code` string in the file.
 * If the code is not found (already removed or never applied), skips silently.
 */
export async function removePatches(operations: PatchOperation[]): Promise<PatchResult[]> {
  const results: PatchResult[] = [];

  for (const op of operations) {
    if (!(await pathExists(op.file))) {
      results.push({ file: op.file, success: true, reason: 'not_found' });
      continue;
    }

    const content = await readFile(op.file);
    const trimmedCode = op.code.trim();

    if (!content.includes(trimmedCode)) {
      results.push({ file: op.file, success: true, reason: 'not_found' });
      continue;
    }

    // Remove the trimmedCode block from content
    // We need to handle multi-line code blocks and surrounding newlines carefully
    const lines = content.split('\n');
    const codeLines = trimmedCode.split('\n');

    // Find the starting line index of the code block
    let foundStart = -1;
    outer: for (let i = 0; i <= lines.length - codeLines.length; i++) {
      for (let j = 0; j < codeLines.length; j++) {
        if (lines[i + j]?.trim() !== codeLines[j]?.trim()) {
          continue outer;
        }
      }
      foundStart = i;
      break;
    }

    if (foundStart === -1) {
      results.push({ file: op.file, success: true, reason: 'not_found' });
      continue;
    }

    lines.splice(foundStart, codeLines.length);

    // Remove a trailing blank line left behind if the next line is blank
    // (only if we just left a double blank)
    let newContent = lines.join('\n');
    // Collapse any triple+ newlines down to double
    newContent = newContent.replace(/\n{3,}/g, '\n\n');

    await writeFile(op.file, newContent);
    results.push({ file: op.file, success: true });
  }

  return results;
}

/**
 * Removes specific keys from tsconfig.json compilerOptions.
 * Non-destructive: only removes the listed keys.
 */
export async function revertTsConfigKeys(
  projectRoot: string,
  keys: string[],
): Promise<void> {
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (!(await pathExists(tsconfigPath))) {
    return;
  }

  const raw = (await readJson(tsconfigPath)) as Record<string, unknown>;
  const compilerOptions = (raw['compilerOptions'] as Record<string, unknown> | undefined) ?? {};

  for (const key of keys) {
    delete compilerOptions[key];
  }

  raw['compilerOptions'] = compilerOptions;
  await writeJson(tsconfigPath, raw);
}

/**
 * Removes specific scripts from package.json only if their values match exactly.
 * Non-destructive: only removes if the current value === expectedValue.
 */
export async function revertPackageJsonScripts(
  projectRoot: string,
  scripts: Record<string, string>,
): Promise<void> {
  const pkgPath = path.join(projectRoot, 'package.json');
  if (!(await pathExists(pkgPath))) {
    return;
  }

  const raw = (await readJson(pkgPath)) as Record<string, unknown>;
  const existing = (raw['scripts'] as Record<string, string> | undefined) ?? {};

  for (const [key, expectedValue] of Object.entries(scripts)) {
    if (existing[key] === expectedValue) {
      delete existing[key];
    }
  }

  raw['scripts'] = existing;
  await writeJson(pkgPath, raw);
}
