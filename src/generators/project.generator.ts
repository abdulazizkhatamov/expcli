import path from 'path';
import { spinner as clackSpinner } from '@clack/prompts';
import chalk from 'chalk';

function makeSpinner() {
  if (!process.stdout.isTTY) {
    return {
      start: (msg: string) => console.log(chalk.dim(`  → ${msg}`)),
      stop: (msg: string) => console.log(chalk.green('  ✔') + ' ' + msg),
    };
  }
  return clackSpinner();
}
import { validateProjectName } from '../utils/name-validator.js';
import { pathExists } from '../utils/fs.js';
import { runCommandSilent } from '../utils/process.js';
import { buildContext } from '../template/context.js';
import { renderDir } from '../template/renderer.js';
import { getProjectTemplatePath } from '../template/loader.js';
import { createDefaultConfig, writeConfig } from '../config/expcli-config.js';
import { installDeps } from '../pm/runner.js';
import type { PackageManager } from '../pm/types.js';

export interface ProjectGeneratorOptions {
  name: string;
  template: 'minimal' | 'rest-api' | 'full';
  packageManager: PackageManager;
  targetDir: string;
  skipInstall: boolean;
  gitInit: boolean;
  /** If true, do not create any files — only print what would be created */
  dryRun?: boolean;
}

export class ProjectGenerator {
  async generate(options: ProjectGeneratorOptions): Promise<void> {
    const { name, template, packageManager, targetDir, skipInstall, gitInit, dryRun } = options;

    // 1. Validate project name
    const validation = validateProjectName(name);
    if (!validation.valid) {
      throw new Error(`Invalid project name: ${validation.error}`);
    }

    // ── Dry-run mode ────────────────────────────────────────────────────────
    if (dryRun) {
      console.log('');
      console.log(chalk.yellow.bold('  Dry run — no files will be written'));
      console.log('');

      // Build context to enumerate template files
      const context = buildContext(name, name, {});
      const templateSrcPath = getProjectTemplatePath(template);

      // Collect all files that would be rendered
      const wouldCreate = await collectTemplateFiles(templateSrcPath, targetDir, context);

      // Sort for consistent output
      wouldCreate.sort();

      for (const filePath of wouldCreate) {
        const rel = path.relative(process.cwd(), filePath);
        console.log(`  ${chalk.dim('○')} Would create  ${chalk.cyan(rel)}`);
      }

      // Show what expcli.json would contain
      const config = createDefaultConfig(name, template, packageManager);
      console.log('');
      console.log(`  ${chalk.dim('○')} Would create  ${chalk.cyan(path.join(path.relative(process.cwd(), targetDir), 'expcli.json'))}`);
      console.log('');
      console.log(`  ${chalk.bold('expcli.json contents:')}`);
      const configLines = JSON.stringify(config, null, 2).split('\n');
      for (const line of configLines) {
        console.log(`    ${chalk.dim(line)}`);
      }

      console.log('');
      console.log(chalk.dim('  (No files were written. Remove --dry-run to scaffold for real.)'));
      console.log('');
      return;
    }

    // ── Normal mode ─────────────────────────────────────────────────────────

    // 2. Check target directory doesn't already exist
    if (await pathExists(targetDir)) {
      throw new Error(
        `Directory "${targetDir}" already exists. Choose a different name or remove the existing directory.`,
      );
    }

    // 3. Scaffold project structure
    const structureSpinner = makeSpinner();
    structureSpinner.start('Creating project structure...');

    try {
      // Build template context (name = project name, projectName = project name)
      const context = buildContext(name, name, {});

      // Resolve the template source directory
      const templateSrcPath = getProjectTemplatePath(template);

      // Render all template files into the target directory
      await renderDir(templateSrcPath, targetDir, context);

      // Write expcli.json
      const config = createDefaultConfig(name, template, packageManager);
      await writeConfig(config, targetDir);

      structureSpinner.stop('Project structure created.');
    } catch (err) {
      structureSpinner.stop('Failed to create project structure.');
      throw err;
    }

    // 4. Install dependencies
    if (!skipInstall) {
      const installSpinner = makeSpinner();
      installSpinner.start('Installing dependencies...');

      try {
        await installDeps(packageManager, targetDir);
        installSpinner.stop('Dependencies installed.');
      } catch (err) {
        installSpinner.stop('Dependency installation failed.');
        throw err;
      }
    }

    // 5. Git init
    if (gitInit) {
      try {
        await runCommandSilent('git', ['init'], targetDir);
        await runCommandSilent('git', ['add', '-A'], targetDir);
        await runCommandSilent('git', ['commit', '-m', 'Initial commit'], targetDir);
      } catch {
        // Git is optional — silently skip if not available or fails
      }
    }

    // 6. Print success message with next steps
    const relDir = path.relative(process.cwd(), targetDir) || name;
    const devScript = getDevScript(packageManager);

    console.log('');
    console.log(chalk.green('✔') + ' ' + chalk.bold(`Project "${name}" created successfully!`));
    console.log('');
    console.log(chalk.dim('Next steps:'));
    console.log('');
    console.log(`  ${chalk.cyan('cd')} ${relDir}`);
    if (skipInstall) {
      const installCmd = getInstallCommand(packageManager);
      console.log(`  ${chalk.cyan(installCmd)}`);
    }
    console.log(`  ${chalk.cyan(devScript)}`);
    console.log('');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

import fse from 'fs-extra';
import { renderTemplate } from '../template/engine.js';
import type { TemplateContext } from '../template/context.js';

const TEMPLATE_EXT = '.tpl';

/**
 * Recursively collect all output file paths that renderDir would produce,
 * without actually writing anything.
 */
async function collectTemplateFiles(
  srcDir: string,
  destDir: string,
  context: TemplateContext,
): Promise<string[]> {
  const results: string[] = [];
  const entries = await fse.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.gitkeep') continue;

    const renderedName = renderTemplate(entry.name, context);

    if (entry.isDirectory()) {
      const sub = await collectTemplateFiles(
        path.join(srcDir, entry.name),
        path.join(destDir, renderedName),
        context,
      );
      results.push(...sub);
    } else if (entry.isFile()) {
      if (renderedName.endsWith(TEMPLATE_EXT)) {
        results.push(path.join(destDir, renderedName.slice(0, -TEMPLATE_EXT.length)));
      } else {
        results.push(path.join(destDir, renderedName));
      }
    }
  }

  return results;
}

function getDevScript(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm run dev';
    case 'yarn':
      return 'yarn dev';
    case 'pnpm':
      return 'pnpm dev';
    case 'bun':
      return 'bun run dev';
  }
}

function getInstallCommand(pm: PackageManager): string {
  switch (pm) {
    case 'npm':
      return 'npm install';
    case 'yarn':
      return 'yarn install';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
  }
}
