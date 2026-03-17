import { runCommand } from '../utils/process.js';
import type { PackageManager, PmCommands } from './types.js';

/**
 * Returns the command map for the given package manager.
 */
export function getCommands(pm: PackageManager): PmCommands {
  switch (pm) {
    case 'npm':
      return {
        install: ['install'],
        add: (pkgs: string[], dev: boolean) =>
          dev ? ['install', '--save-dev', ...pkgs] : ['install', '--save', ...pkgs],
        exec: (cmd: string) => ['exec', '--', cmd],
        run: (script: string) => ['run', script],
      };

    case 'yarn':
      return {
        install: ['install'],
        add: (pkgs: string[], dev: boolean) =>
          dev ? ['add', '--dev', ...pkgs] : ['add', ...pkgs],
        exec: (cmd: string) => ['exec', cmd],
        run: (script: string) => ['run', script],
      };

    case 'pnpm':
      return {
        install: ['install'],
        add: (pkgs: string[], dev: boolean) =>
          dev ? ['add', '--save-dev', ...pkgs] : ['add', ...pkgs],
        exec: (cmd: string) => ['exec', cmd],
        run: (script: string) => ['run', script],
      };

    case 'bun':
      return {
        install: ['install'],
        add: (pkgs: string[], dev: boolean) =>
          dev ? ['add', '--dev', ...pkgs] : ['add', ...pkgs],
        exec: (cmd: string) => ['x', cmd],
        run: (script: string) => ['run', script],
      };
  }
}

/**
 * Installs all dependencies in the given directory.
 */
export async function installDeps(pm: PackageManager, cwd: string): Promise<void> {
  const cmds = getCommands(pm);
  await runCommand(pm, cmds.install, cwd);
}

/**
 * Adds packages to the project.
 *
 * @param pm - The package manager to use.
 * @param packages - The list of package names to add.
 * @param dev - Whether to add as devDependencies.
 * @param cwd - The working directory.
 */
export async function addPackages(
  pm: PackageManager,
  packages: string[],
  dev: boolean,
  cwd: string,
): Promise<void> {
  if (packages.length === 0) return;
  const cmds = getCommands(pm);
  const args = cmds.add(packages, dev);
  await runCommand(pm, args, cwd);
}

/**
 * Uninstalls packages from the project.
 *
 * @param pm - The package manager to use.
 * @param packages - The list of package names to remove.
 * @param cwd - The working directory.
 */
export async function uninstallPackages(
  pm: PackageManager,
  packages: string[],
  cwd: string,
): Promise<void> {
  if (packages.length === 0) return;

  let uninstallCmd: string;
  switch (pm) {
    case 'npm':
      uninstallCmd = 'uninstall';
      break;
    case 'yarn':
      uninstallCmd = 'remove';
      break;
    case 'pnpm':
      uninstallCmd = 'remove';
      break;
    case 'bun':
      uninstallCmd = 'remove';
      break;
  }

  await runCommand(pm, [uninstallCmd, ...packages], cwd);
}
