import { Command } from 'commander';
import { confirm } from '@clack/prompts';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { findConfigUp, readConfig, addIntegration } from '../config/expcli-config.js';
import { createIntegration } from '../integrations/registry.js';
import { addPackages } from '../pm/runner.js';
import type { IntegrationContext } from '../integrations/integration.interface.js';
import type { PackageManager } from '../pm/types.js';

interface AddOptions {
  force: boolean;
  skipInstall: boolean;
}

async function runAddFlow(
  integrationName: string,
  options: AddOptions,
  projectRoot: string,
): Promise<void> {
  const config = await readConfig(projectRoot);
  const pm = config.packageManager as PackageManager;

  // Check if already installed
  const alreadyInstalled = config.integrations.some((i) => i.name === integrationName);
  if (alreadyInstalled && !options.force) {
    logger.warn(`Integration '${integrationName}' is already installed.`);
    logger.info(`Use ${chalk.cyan('--force')} to reinstall.`);
    return;
  }

  // Create integration instance
  const integration = await createIntegration(integrationName);

  // Check conflicts
  if (!options.force) {
    for (const conflictName of integration.conflictsWith) {
      const conflictInstalled = config.integrations.some((i) => i.name === conflictName);
      if (conflictInstalled) {
        logger.error(
          `'${integrationName}' conflicts with '${conflictName}'. ` +
          `Remove '${conflictName}' first or use ${chalk.cyan('--force')} to override.`,
        );
        process.exit(1);
      }
    }
  }

  // Check requirements — ask to install missing ones
  for (const requiredName of integration.requires) {
    const requiredInstalled = config.integrations.some((i) => i.name === requiredName);
    if (!requiredInstalled) {
      logger.warn(`'${integrationName}' requires '${requiredName}', which is not installed.`);

      let shouldInstall = false;
      if (process.stdout.isTTY) {
        const answer = await confirm({
          message: `Install '${requiredName}' first?`,
          initialValue: true,
        });
        shouldInstall = answer === true;
      }

      if (shouldInstall) {
        await runAddFlow(requiredName, options, projectRoot);
      }
    }
  }

  // Collect integration-specific options via prompt
  const baseCtx: Omit<IntegrationContext, 'options'> = {
    projectRoot,
    config: await readConfig(projectRoot), // re-read after potential recursive installs
    pm,
  };

  const integrationOptions = await integration.prompt(baseCtx);

  // Print what we are about to do
  logger.title(`\nAdding ${chalk.cyan(integrationName)}...`);

  // Install packages
  if (!options.skipInstall) {
    const { prod, dev } = integration.packages;

    if (prod.length > 0) {
      logger.step(`Installing packages: ${prod.join(', ')}`);
      await addPackages(pm, prod, false, projectRoot);
    }

    if (dev.length > 0) {
      logger.step(`Installing dev packages: ${dev.join(', ')}`);
      await addPackages(pm, dev, true, projectRoot);
    }
  } else if (integration.packages.prod.length > 0 || integration.packages.dev.length > 0) {
    const all = [...integration.packages.prod, ...integration.packages.dev];
    logger.info(`Skipping package install. Add manually: ${all.join(', ')}`);
  }

  // Run the integration
  const fullCtx: IntegrationContext = {
    ...baseCtx,
    config: await readConfig(projectRoot),
    options: integrationOptions,
  };

  await integration.run(fullCtx);

  // Register in expcli.json
  await addIntegration(integrationName, integrationOptions, projectRoot);

  logger.success(`Integration ${chalk.green(integrationName)} added successfully!`);
}

export function registerAddCommand(program: Command): void {
  program
    .command('add <integration>')
    .description('Add an integration to the current project (e.g. prisma, jwt, swagger)')
    .option('--force', 'Skip already-installed and conflict checks', false)
    .option('--skip-install', 'Skip installing packages', false)
    .action(async (integration: string, options: AddOptions) => {
      try {
        const projectRoot = await findConfigUp(process.cwd());

        if (!projectRoot) {
          logger.error('No expcli.json found. Are you inside an expcli project?');
          process.exit(1);
        }

        await runAddFlow(integration, options, projectRoot);
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
