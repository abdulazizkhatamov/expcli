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
