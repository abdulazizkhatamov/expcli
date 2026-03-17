import path from 'path';
import { Command } from 'commander';
import { intro, outro, isCancel } from '@clack/prompts';
import { validateProjectName } from '../utils/name-validator.js';
import { detectPackageManager } from '../pm/detector.js';
import { promptNewProject } from '../prompts/new.prompts.js';
import { ProjectGenerator } from '../generators/project.generator.js';
import type { PackageManager } from '../pm/types.js';

interface NewCommandOptions {
  template?: string;
  packageManager?: string;
  skipInstall: boolean;
  git: boolean; // Commander maps --no-git → options.git = false
  directory?: string;
  dryRun: boolean;
}

const VALID_TEMPLATES = ['minimal', 'rest-api', 'full'] as const;
const VALID_PMS = ['npm', 'yarn', 'pnpm', 'bun'] as const;

export function registerNewCommand(program: Command): void {
  program
    .command('new <name>')
    .description('Scaffold a new Express + TypeScript project')
    .option(
      '-t, --template <template>',
      'Project template to use (minimal, rest-api, full)',
    )
    .option(
      '-p, --package-manager <pm>',
      'Package manager to use (npm, yarn, pnpm, bun)',
    )
    .option('--skip-install', 'Skip dependency installation', false)
    .option('--no-git', 'Skip git initialization')
    .option('-d, --directory <dir>', 'Custom output directory (default: ./<name>)')
    .option('--dry-run', 'Show what files would be created without writing them', false)
    .action(async (name: string, options: NewCommandOptions) => {
      // Validate project name early
      const nameValidation = validateProjectName(name);
      if (!nameValidation.valid) {
        console.error(`error: ${nameValidation.error}`);
        process.exit(1);
      }

      // Determine target directory
      const targetDir = options.directory
        ? path.resolve(options.directory)
        : path.resolve(process.cwd(), name);

      // Validate --template flag if provided
      let template: (typeof VALID_TEMPLATES)[number] | undefined;
      if (options.template !== undefined) {
        if (!VALID_TEMPLATES.includes(options.template as (typeof VALID_TEMPLATES)[number])) {
          console.error(
            `error: Invalid template "${options.template}". Must be one of: ${VALID_TEMPLATES.join(', ')}`,
          );
          process.exit(1);
        }
        template = options.template as (typeof VALID_TEMPLATES)[number];
      }

      // Validate --package-manager flag if provided
      let packageManager: PackageManager | undefined;
      if (options.packageManager !== undefined) {
        if (!VALID_PMS.includes(options.packageManager as PackageManager)) {
          console.error(
            `error: Invalid package manager "${options.packageManager}". Must be one of: ${VALID_PMS.join(', ')}`,
          );
          process.exit(1);
        }
        packageManager = options.packageManager as PackageManager;
      }

      // In dry-run mode with all flags provided, skip interactive prompts entirely
      const needsPrompts = template === undefined || packageManager === undefined;

      // Auto-detect the package manager for use as default in the prompt
      const detectedPm = packageManager ?? (await detectPackageManager());

      let gitInit = options.git !== false;

      if (needsPrompts && !options.dryRun) {
        if (process.stdout.isTTY) intro(`Creating a new Express + TypeScript project: ${name}`);

        const answers = await promptNewProject(detectedPm);

        if (isCancel(answers)) {
          outro('Cancelled.');
          process.exit(0);
        }

        // Fill in any values not provided via flags
        if (template === undefined) template = answers.template;
        if (packageManager === undefined) packageManager = answers.packageManager;
        // git flag from prompts only applies if --no-git wasn't explicitly passed
        if (options.git !== false) {
          gitInit = answers.gitInit;
        }
      } else if (needsPrompts && options.dryRun) {
        // Dry-run: fill defaults without prompting
        if (template === undefined) template = 'minimal';
        if (packageManager === undefined) packageManager = detectedPm;
      }

      // At this point both template and packageManager are resolved
      const resolvedTemplate = template!;
      const resolvedPm = packageManager!;

      const generator = new ProjectGenerator();

      try {
        await generator.generate({
          name,
          template: resolvedTemplate,
          packageManager: resolvedPm,
          targetDir,
          skipInstall: options.skipInstall,
          gitInit,
          dryRun: options.dryRun,
        });

        if (!options.dryRun && needsPrompts && process.stdout.isTTY) {
          outro('Done! Happy coding.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`\nerror: ${message}`);
        process.exit(1);
      }
    });
}
