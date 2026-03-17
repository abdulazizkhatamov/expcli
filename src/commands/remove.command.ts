// Usage: expcli remove <integration>
//        expcli rm <integration>
//
// Options:
//   --skip-uninstall   Skip package uninstallation
//   --force            Skip confirmation prompt

import { Command } from 'commander';
import { confirm } from '@clack/prompts';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { findConfigUp, readConfig, removeIntegration } from '../config/expcli-config.js';
import { createIntegration } from '../integrations/registry.js';
import { uninstallPackages } from '../pm/runner.js';
import type { IntegrationContext } from '../integrations/integration.interface.js';
import type { PackageManager } from '../pm/types.js';

interface RemoveOptions {
  force: boolean;
  skipUninstall: boolean;
}

async function runRemoveFlow(
  integrationName: string,
  options: RemoveOptions,
  projectRoot: string,
): Promise<void> {
  // Check that the integration is known
  const integration = await createIntegration(integrationName);

  // Read config and verify it's installed
  const config = await readConfig(projectRoot);
  const entry = config.integrations.find((i) => i.name === integrationName);

  if (!entry) {
    logger.error(`'${integrationName}' is not installed. Nothing to remove.`);
    process.exit(1);
  }

  // Confirmation prompt unless --force
  if (!options.force) {
    if (process.stdout.isTTY) {
      const answer = await confirm({
        message: `Remove integration '${chalk.cyan(integrationName)}'? This will delete its files.`,
        initialValue: false,
      });

      if (answer !== true) {
        logger.info('Aborted.');
        return;
      }
    }
  }

  const pm = config.packageManager as PackageManager;

  // Build integration context using saved options from config entry
  const ctx: IntegrationContext = {
    projectRoot,
    config,
    pm,
    options: entry.options ?? {},
  };

  logger.title(`\nRemoving ${chalk.cyan(integrationName)}...`);

  if (options.skipUninstall) {
    // Run remove but skip the actual package uninstall by patching the pm
    // We do this by temporarily overriding uninstallPackages — instead, we
    // call remove() normally but the caller asked to skip uninstall.
    // Since there's no built-in skip mechanism, we call remove() and then
    // note packages that would have been removed.
    const allPackages = [...integration.packages.prod, ...integration.packages.dev];
    if (allPackages.length > 0) {
      logger.info(`Skipping package uninstall. Remove manually: ${allPackages.join(', ')}`);
    }

    // Create a context with a fake pm that won't run uninstall
    // We achieve this by running remove() but catching the uninstall step.
    // The cleanest approach: call remove() with a sentinel pm value.
    // Actually the simplest: duplicate the remove logic without uninstall.
    // We use a proxy approach: override pm to a dummy and catch errors.
    const ctxSkipUninstall: IntegrationContext = {
      ...ctx,
      // We keep the real pm so file operations still work.
      // We rely on integration.remove() calling super.remove() which calls
      // uninstallPackages. We need to intercept that.
      // The cleanest solution here: call remove() and suppress the uninstall
      // by setting packages to empty before calling.
    };

    // Temporarily clear packages to skip uninstall in default base.remove()
    const originalProd = integration.packages.prod.slice();
    const originalDev = integration.packages.dev.slice();
    (integration.packages as { prod: string[]; dev: string[] }).prod = [];
    (integration.packages as { prod: string[]; dev: string[] }).dev = [];

    try {
      await integration.remove(ctxSkipUninstall);
    } finally {
      (integration.packages as { prod: string[]; dev: string[] }).prod = originalProd;
      (integration.packages as { prod: string[]; dev: string[] }).dev = originalDev;
    }
  } else {
    await integration.remove(ctx);
  }

  // Update expcli.json
  await removeIntegration(integrationName, projectRoot);

  logger.success(`Integration '${chalk.green(integrationName)}' removed.`);
}

export function registerRemoveCommand(program: Command): void {
  const removeCmd = new Command('remove')
    .description('Remove an integration from the current project')
    .argument('<integration>', 'Integration name to remove')
    .option('--skip-uninstall', 'Skip package uninstallation', false)
    .option('--force', 'Skip confirmation prompt', false)
    .action(async (integration: string, options: RemoveOptions) => {
      try {
        const projectRoot = await findConfigUp(process.cwd());

        if (!projectRoot) {
          logger.error('No expcli.json found. Are you inside an expcli project?');
          process.exit(1);
        }

        await runRemoveFlow(integration, options, projectRoot);
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });

  program.addCommand(removeCmd);
  program.addCommand(
    new Command('rm')
      .description('Alias for remove')
      .argument('<integration>', 'Integration name to remove')
      .option('--skip-uninstall', 'Skip package uninstallation', false)
      .option('--force', 'Skip confirmation prompt', false)
      .action(async (integration: string, options: RemoveOptions) => {
        try {
          const projectRoot = await findConfigUp(process.cwd());

          if (!projectRoot) {
            logger.error('No expcli.json found. Are you inside an expcli project?');
            process.exit(1);
          }

          await runRemoveFlow(integration, options, projectRoot);
        } catch (err) {
          logger.error(err instanceof Error ? err.message : String(err));
          process.exit(1);
        }
      }),
  );
}
