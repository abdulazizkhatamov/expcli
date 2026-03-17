import path from 'path';
import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { findConfigUp, readConfig } from '../config/expcli-config.js';
import { runCommand } from '../utils/process.js';
import { pathExists } from '../utils/fs.js';

interface StartOptions {
  entryFile?: string;
}

export function registerStartCommand(program: Command): void {
  program
    .command('start')
    .description('Start the compiled application')
    .option('--entryFile <file>', 'Override the compiled entry file path (e.g. dist/index.js)')
    .action(async (options: StartOptions) => {
      const projectRoot = await findConfigUp(process.cwd());
      if (!projectRoot) {
        logger.error('No expcli.json found. Run this command from inside a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);

      // Derive compiled entry: src/index.ts → dist/index.js
      const entryFile = options.entryFile ?? deriveCompiledEntry(config.entryFile, config.outDir);
      const absEntry = path.resolve(projectRoot, entryFile);

      if (!(await pathExists(absEntry))) {
        logger.error(
          `Compiled entry not found: ${entryFile}\nRun 'expcli build' first.`,
        );
        process.exit(1);
      }

      logger.info(`Starting ${config.name}...`);

      try {
        await runCommand('node', [absEntry], projectRoot);
      } catch {
        logger.error('Process exited with an error.');
        process.exit(1);
      }
    });
}

/**
 * Converts a TypeScript source entry to its compiled JS equivalent.
 * e.g. src/index.ts → dist/index.js
 */
function deriveCompiledEntry(entryFile: string, outDir: string): string {
  // Strip srcRoot prefix and replace with outDir
  const parts = entryFile.replace(/\\/g, '/').split('/');
  const fileName = parts[parts.length - 1]!.replace(/\.ts$/, '.js');
  return path.join(outDir, fileName);
}
