import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { Command } from 'commander';

const _require = createRequire(import.meta.url);

function getVersion(): string {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    // Works from dist/main.js (1 level up) and src/cli.ts (1 level up)
    for (const rel of ['../package.json', '../../package.json']) {
      const pkgPath = path.resolve(currentDir, rel);
      try {
        const pkg = _require(pkgPath) as { name?: string; version: string };
        if (pkg.name === 'expcli-ts') return pkg.version;
      } catch {
        // try next
      }
    }
    return '0.1.0';
  } catch {
    return '0.1.0';
  }
}

/**
 * The root Commander program instance.
 * Commands are registered against this instance in main.ts.
 */
export const program = new Command()
  .name('expcli')
  .description('The CLI for building Express + TypeScript projects')
  .version(getVersion(), '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command')
  .allowUnknownOption(false);
