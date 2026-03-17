import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import {
  applyPatches,
  removePatches,
  patchPackageJsonScripts,
  patchTsConfig,
  revertTsConfigKeys,
  revertPackageJsonScripts,
} from '../utils/patcher.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fse.mkdtemp(path.join(os.tmpdir(), 'expcli-patcher-'));
});

afterEach(async () => {
  await fse.remove(tmpDir);
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function file(name: string): string {
  return path.join(tmpDir, name);
}

async function write(name: string, content: string): Promise<string> {
  const p = file(name);
  await fse.outputFile(p, content);
  return p;
}

async function read(name: string): Promise<string> {
  return fse.readFile(file(name), 'utf8');
}

// ─── applyPatches ──────────────────────────────────────────────────────────────

describe('applyPatches', () => {
  it('inserts code after the anchor line', async () => {
    await write('app.ts', `const a = 1;\n// @expcli:imports\nconst b = 2;\n`);

    await applyPatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    const result = await read('app.ts');
    expect(result).toContain("// @expcli:imports\nimport foo from 'foo';\nconst b = 2;");
  });

  it('returns already_patched when code already exists', async () => {
    await write('app.ts', `// @expcli:imports\nimport foo from 'foo';\n`);

    const results = await applyPatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    expect(results[0]?.reason).toBe('already_patched');
  });

  it('returns anchor_not_found when anchor is missing', async () => {
    await write('app.ts', `const a = 1;\n`);

    const results = await applyPatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    expect(results[0]?.success).toBe(false);
    expect(results[0]?.reason).toBe('anchor_not_found');
  });

  it('returns file_not_found for missing file', async () => {
    const results = await applyPatches([{
      file: file('nonexistent.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    expect(results[0]?.success).toBe(false);
    expect(results[0]?.reason).toBe('file_not_found');
  });

  it('handles multiple operations on the same file', async () => {
    await write('app.ts', `// @expcli:imports\n// @expcli:middleware\n`);

    await applyPatches([
      { file: file('app.ts'), anchor: '@expcli:imports', code: `import foo from 'foo';` },
      { file: file('app.ts'), anchor: '@expcli:middleware', code: `app.use(foo());` },
    ]);

    const result = await read('app.ts');
    expect(result).toContain("import foo from 'foo';");
    expect(result).toContain('app.use(foo());');
  });

  it('is idempotent — applying twice does not duplicate', async () => {
    await write('app.ts', `// @expcli:imports\n`);

    const op = { file: file('app.ts'), anchor: '@expcli:imports', code: `import foo from 'foo';` };
    await applyPatches([op]);
    await applyPatches([op]);

    const result = await read('app.ts');
    const count = (result.match(/import foo from 'foo';/g) ?? []).length;
    expect(count).toBe(1);
  });
});

// ─── removePatches ─────────────────────────────────────────────────────────────

describe('removePatches', () => {
  it('removes previously patched code', async () => {
    await write('app.ts', `// @expcli:imports\nimport foo from 'foo';\nconst b = 2;\n`);

    await removePatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    const result = await read('app.ts');
    expect(result).not.toContain("import foo from 'foo';");
    expect(result).toContain('const b = 2;');
  });

  it('is a no-op when code is not present', async () => {
    const original = `// @expcli:imports\nconst b = 2;\n`;
    await write('app.ts', original);

    const results = await removePatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    expect(results[0]?.success).toBe(true);
    expect(results[0]?.reason).toBe('not_found');
    expect(await read('app.ts')).toBe(original);
  });

  it('is a no-op for missing file', async () => {
    const results = await removePatches([{
      file: file('nonexistent.ts'),
      anchor: '@expcli:imports',
      code: `import foo from 'foo';`,
    }]);

    expect(results[0]?.success).toBe(true);
  });

  it('is idempotent — removing twice does not error', async () => {
    await write('app.ts', `// @expcli:imports\nimport foo from 'foo';\n`);

    const op = { file: file('app.ts'), anchor: '@expcli:imports', code: `import foo from 'foo';` };
    await removePatches([op]);
    await removePatches([op]);

    expect(await read('app.ts')).not.toContain("import foo from 'foo';");
  });

  it('preserves the rest of the file after removal', async () => {
    await write('app.ts', [
      'import express from "express";',
      '// @expcli:imports',
      'import foo from "foo";',
      '',
      'const app = express();',
    ].join('\n'));

    await removePatches([{
      file: file('app.ts'),
      anchor: '@expcli:imports',
      code: 'import foo from "foo";',
    }]);

    const result = await read('app.ts');
    expect(result).toContain('import express from "express";');
    expect(result).toContain('const app = express();');
    expect(result).not.toContain('import foo from "foo";');
  });
});

// ─── patchPackageJsonScripts ───────────────────────────────────────────────────

describe('patchPackageJsonScripts', () => {
  it('adds new scripts to package.json', async () => {
    await write('package.json', JSON.stringify({ scripts: { build: 'tsup' } }));

    await patchPackageJsonScripts(tmpDir, { test: 'vitest run' });

    const pkg = JSON.parse(await read('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts['test']).toBe('vitest run');
    expect(pkg.scripts['build']).toBe('tsup');
  });

  it('does not remove existing scripts', async () => {
    await write('package.json', JSON.stringify({ scripts: { build: 'tsup', start: 'node dist' } }));

    await patchPackageJsonScripts(tmpDir, { test: 'jest' });

    const pkg = JSON.parse(await read('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts['start']).toBe('node dist');
  });
});

// ─── patchTsConfig ─────────────────────────────────────────────────────────────

describe('patchTsConfig', () => {
  it('merges new compilerOptions', async () => {
    await write('tsconfig.json', JSON.stringify({ compilerOptions: { strict: true } }));

    await patchTsConfig(tmpDir, { experimentalDecorators: true });

    const ts = JSON.parse(await read('tsconfig.json')) as { compilerOptions: Record<string, unknown> };
    expect(ts.compilerOptions['experimentalDecorators']).toBe(true);
    expect(ts.compilerOptions['strict']).toBe(true);
  });

  it('does not remove existing options', async () => {
    await write('tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', strict: true } }));

    await patchTsConfig(tmpDir, { emitDecoratorMetadata: true });

    const ts = JSON.parse(await read('tsconfig.json')) as { compilerOptions: Record<string, unknown> };
    expect(ts.compilerOptions['target']).toBe('ES2022');
  });
});

// ─── revertTsConfigKeys ────────────────────────────────────────────────────────

describe('revertTsConfigKeys', () => {
  it('removes specified keys from compilerOptions', async () => {
    await write('tsconfig.json', JSON.stringify({
      compilerOptions: { strict: true, experimentalDecorators: true, emitDecoratorMetadata: true },
    }));

    await revertTsConfigKeys(tmpDir, ['experimentalDecorators', 'emitDecoratorMetadata']);

    const ts = JSON.parse(await read('tsconfig.json')) as { compilerOptions: Record<string, unknown> };
    expect(ts.compilerOptions['experimentalDecorators']).toBeUndefined();
    expect(ts.compilerOptions['emitDecoratorMetadata']).toBeUndefined();
    expect(ts.compilerOptions['strict']).toBe(true);
  });

  it('is a no-op when tsconfig.json does not exist', async () => {
    await expect(revertTsConfigKeys(tmpDir, ['strict'])).resolves.not.toThrow();
  });
});

// ─── revertPackageJsonScripts ──────────────────────────────────────────────────

describe('revertPackageJsonScripts', () => {
  it('removes scripts with matching values', async () => {
    await write('package.json', JSON.stringify({
      scripts: { build: 'tsup', test: 'vitest run', 'test:watch': 'vitest' },
    }));

    await revertPackageJsonScripts(tmpDir, { test: 'vitest run', 'test:watch': 'vitest' });

    const pkg = JSON.parse(await read('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts['test']).toBeUndefined();
    expect(pkg.scripts['test:watch']).toBeUndefined();
    expect(pkg.scripts['build']).toBe('tsup');
  });

  it('does not remove scripts whose values do not match', async () => {
    await write('package.json', JSON.stringify({
      scripts: { test: 'jest --watchAll' },
    }));

    await revertPackageJsonScripts(tmpDir, { test: 'vitest run' });

    const pkg = JSON.parse(await read('package.json')) as { scripts: Record<string, string> };
    expect(pkg.scripts['test']).toBe('jest --watchAll');
  });

  it('is a no-op when package.json does not exist', async () => {
    await expect(revertPackageJsonScripts(tmpDir, { test: 'vitest' })).resolves.not.toThrow();
  });
});
