import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import { Command } from 'commander';
import { confirm, isCancel } from '@clack/prompts';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { runCommand, runCommandSilent } from '../utils/process.js';

const _require = createRequire(import.meta.url);

interface UpdateOptions {
  check: boolean;
}

function getCurrentVersion(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  for (const rel of ['../package.json', '../../package.json']) {
    try {
      const pkg = _require(path.resolve(currentDir, rel)) as { name?: string; version: string };
      if (pkg.name === 'expcli') return pkg.version;
    } catch {
      // try next
    }
  }
  return '0.0.0';
}

async function getLatestVersion(): Promise<string | null> {
  try {
    const result = await runCommandSilent('npm', ['view', 'expcli', 'version']);
    return result.trim();
  } catch {
    return null;
  }
}

/**
 * Compares two semver strings.
 * Returns true if `latest` is newer than `current`.
 */
function isNewer(current: string, latest: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const [cMaj, cMin, cPat] = parse(current);
  const [lMaj, lMin, lPat] = parse(latest);

  if (lMaj !== cMaj) return (lMaj ?? 0) > (cMaj ?? 0);
  if (lMin !== cMin) return (lMin ?? 0) > (cMin ?? 0);
  return (lPat ?? 0) > (cPat ?? 0);
}

export function registerUpdateCommand(program: Command): void {
  program
    .command('update')
    .description('Check for a newer version of expcli and update if available')
    .option('--check', 'Only check for updates without installing', false)
    .action(async (options: UpdateOptions) => {
      const current = getCurrentVersion();

      logger.step(`Current version: ${chalk.bold(`v${current}`)}`);
      logger.step('Checking npm registry...');

      const latest = await getLatestVersion();

      if (!latest) {
        logger.warn('Could not reach npm registry. Check your internet connection.');
        process.exit(1);
      }

      if (!isNewer(current, latest)) {
        logger.success(`You are already on the latest version ${chalk.bold(`v${current}`)}.`);
        return;
      }

      // A newer version is available
      console.log('');
      console.log(
        `  ${chalk.yellow('Update available')}  ${chalk.dim(`v${current}`)} → ${chalk.green(`v${latest}`)}`,
      );
      console.log('');

      if (options.check) {
        console.log(
          `  Run ${chalk.cyan('npm install -g expcli')} to update.`,
        );
        console.log('');
        return;
      }

      // Prompt to install unless not a TTY
      let confirmed = true;

      if (process.stdout.isTTY) {
        const answer = await confirm({ message: `Update to v${latest} now?` });
        if (isCancel(answer) || !answer) {
          console.log('');
          logger.log(chalk.dim('  Update skipped.'));
          console.log('');
          return;
        }
        confirmed = answer;
      }

      if (confirmed) {
        console.log('');
        logger.step(`Installing expcli@${latest} globally...`);
        console.log('');

        try {
          await runCommand('npm', ['install', '-g', `expcli@${latest}`]);
          console.log('');
          logger.success(`Updated to v${latest}.`);
        } catch {
          logger.error('Update failed. Try manually: npm install -g expcli');
          process.exit(1);
        }
      }
    });
}
