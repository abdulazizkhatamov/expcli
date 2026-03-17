import path from 'path';
import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { findConfigUp, readConfig } from '../config/expcli-config.js';
import { runCommand } from '../utils/process.js';
import { pathExists } from '../utils/fs.js';

interface StartDevOptions {
  entryFile?: string;
  clear: boolean; // --no-clear sets this to false
}

export function registerStartDevCommand(program: Command): void {
  program
    .command('start:dev')
    .alias('start-dev')
    .description('Start the application in watch mode using tsx')
    .option('--entryFile <file>', 'Override the entry file (default: from expcli.json)')
    .option('--no-clear', 'Do not clear the screen on restart')
    .action(async (options: StartDevOptions) => {
      const projectRoot = await findConfigUp(process.cwd());
      if (!projectRoot) {
        logger.error('No expcli.json found. Run this command from inside a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);
      const entryFile = options.entryFile ?? config.entryFile;
      const absEntry = path.resolve(projectRoot, entryFile);

      if (!(await pathExists(absEntry))) {
        logger.error(`Entry file not found: ${entryFile}`);
        process.exit(1);
      }

      // Prefer tsx from the project's own node_modules, fall back to global
      const localTsx = path.join(projectRoot, 'node_modules', '.bin', 'tsx');
      const tsxBin = (await pathExists(localTsx)) ? localTsx : 'tsx';

      if (tsxBin === 'tsx') {
        // Check if tsx is globally available
        try {
          const { runCommandSilent } = await import('../utils/process.js');
          await runCommandSilent('tsx', ['--version']);
        } catch {
          logger.error(
            'tsx not found. Install it in your project:\n  npm install -D tsx',
          );
          process.exit(1);
        }
      }

      logger.info(`Starting ${config.name} in watch mode...`);
      logger.step(`Entry: ${entryFile}`);
      if (!options.clear) logger.step('Screen clearing disabled');

      const args = ['watch'];
      if (!options.clear) args.push('--clear-screen=false');
      args.push(absEntry);

      try {
        await runCommand(tsxBin, args, projectRoot);
      } catch {
        // tsx exits on unrecoverable errors — surface them without a redundant message
        process.exit(1);
      }
    });
}
