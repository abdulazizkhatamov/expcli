// Usage:
//   expcli generate <schematic> <name> [options]
//   expcli g <schematic> <name> [options]
//
// Schematics: controller (co), service (s), route (r), model (m), dto (d),
//             middleware (mw), guard (gu), exception-filter (ef), pipe (p),
//             module (mod)
//
// Options:
//   --flat          Generate files in modulesDir directly, no subfolder
//   --spec          Generate a test spec file alongside
//   --path <path>   Custom output path (overrides modulesDir from config)
//   --dry-run       Show what files would be created without writing them

import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { validateModuleName } from '../utils/name-validator.js';
import { findConfigUp, readConfig } from '../config/expcli-config.js';
import { buildContext } from '../template/context.js';
import { GENERATOR_ALIASES, createGenerator } from '../generators/index.js';

interface GenerateOptions {
  flat: boolean;
  spec: boolean;
  path?: string;
  dryRun: boolean;
}

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate [schematic] [name]')
    .alias('g')
    .description('Generate a schematic (module, controller, service, model, ...)')
    .option('--flat', 'Generate files in the current directory without a sub-folder', false)
    .option('--spec', 'Generate a spec (test) file alongside the schematic', false)
    .option('--path <path>', 'Custom output path (overrides modulesDir from config)')
    .option('--dry-run', 'Show what files would be created without writing them', false)
    .action(async (
      schematic: string | undefined,
      name: string | undefined,
      options: GenerateOptions,
    ) => {
      // 1. Validate schematic
      if (!schematic) {
        const validSchematics = [...new Set(Object.values(GENERATOR_ALIASES))].sort();
        logger.error('Missing schematic. Usage: expcli generate <schematic> <name>');
        logger.log('');
        logger.log('Available schematics:');
        for (const s of validSchematics) {
          const aliases = Object.entries(GENERATOR_ALIASES)
            .filter(([, v]) => v === s && /^[a-z]/.test(v))
            .map(([k]) => k)
            .filter((k) => k !== s)
            .join(', ');
          logger.log(`  ${s}${aliases ? `  (${aliases})` : ''}`);
        }
        process.exit(1);
      }

      const resolvedSchematic = GENERATOR_ALIASES[schematic];
      if (!resolvedSchematic) {
        const validSchematics = [...new Set(Object.values(GENERATOR_ALIASES))].sort();
        logger.error(`Unknown schematic: "${schematic}"`);
        logger.log('');
        logger.log('Valid schematics:');
        logger.log(`  ${validSchematics.join(', ')}`);
        logger.log('');
        logger.log('Aliases:');
        const aliasLines = Object.entries(GENERATOR_ALIASES)
          .filter(([k, v]) => k !== v)
          .map(([k, v]) => `  ${k} → ${v}`)
          .join('\n');
        logger.log(aliasLines);
        process.exit(1);
      }

      // 2. Validate name
      if (!name) {
        logger.error('Missing name. Usage: expcli generate <schematic> <name>');
        process.exit(1);
      }

      const nameValidation = validateModuleName(name);
      if (!nameValidation.valid) {
        logger.error(`Invalid name: ${nameValidation.error}`);
        process.exit(1);
      }

      // 3. Find expcli.json
      const projectRoot = await findConfigUp(process.cwd());
      if (!projectRoot) {
        logger.error('No expcli.json found. Run this command from inside a project.');
        process.exit(1);
      }

      const config = await readConfig(projectRoot);

      // 4. Resolve targetDir
      let targetDir: string;
      if (options.path) {
        targetDir = path.isAbsolute(options.path)
          ? options.path
          : path.resolve(process.cwd(), options.path);
      } else {
        targetDir = path.isAbsolute(config.modulesDir)
          ? config.modulesDir
          : path.join(projectRoot, config.modulesDir);
      }

      // 5. Build TemplateContext
      const context = buildContext(name, config.name);

      // 6. Build GeneratorContext
      const generatorCtx = {
        name,
        projectRoot,
        targetDir,
        context,
        flat: options.flat,
        spec: options.spec,
        dryRun: options.dryRun,
      };

      // Dry-run header
      if (options.dryRun) {
        console.log('');
        console.log(chalk.yellow.bold('  Dry run — no files will be written'));
        console.log('');
      }

      // 7. Run generator
      const generator = await createGenerator(resolvedSchematic);
      const files = await generator.generate(generatorCtx);

      // 8. Log results
      for (const file of files) {
        const relativePath = path.relative(projectRoot, file.path);
        if (file.dryRun) {
          logger.log(`${chalk.dim('○')} Would create  ${chalk.cyan(relativePath)}`);
        } else if (file.skipped) {
          logger.log(`○ Skipped  ${relativePath}`);
        } else {
          logger.success(`Created  ${relativePath}`);
        }
      }

      if (options.dryRun) {
        console.log('');
        console.log(chalk.dim('  (No files were written. Remove --dry-run to generate for real.)'));
      }
    });
}
