import path from 'path';
import { Command } from 'commander';
import { logger } from '../utils/logger.js';
import { findConfigUp, readConfig } from '../config/expcli-config.js';
import { runCommand } from '../utils/process.js';

interface BuildOptions {
  watch: boolean;
  outDir?: string;
}

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .description('Compile the project with tsup')
    .option('--watch', 'Watch for file changes and rebuild automatically', false)
    .option('--outDir <dir>', 'Override the output directory from expcli.json')
    .action(async (options: BuildOptions) => {
      const projectRoot = await findConfigUp(process.cwd());
      if (!projectRoot) {
        logger.error('No expcli.json found. Run this command from inside a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);
      const outDir = options.outDir ?? config.outDir;

      logger.info(`Building ${config.name}...`);

      const args = ['--out-dir', outDir];
      if (options.watch) args.push('--watch');

      // Resolve tsup bin from the project's own node_modules
      const tsupBin = path.join(projectRoot, 'node_modules', '.bin', 'tsup');

      try {
        await runCommand(tsupBin, args, projectRoot);
        if (!options.watch) logger.success('Build complete.');
      } catch {
        logger.error('Build failed. Make sure tsup is installed: npm install -D tsup');
        process.exit(1);
      }
    });
}
