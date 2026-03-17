// Usage:
//   expcli list [type]
//   expcli ls [type]
//
// Arguments:
//   type    'schematics' | 'integrations'  (default: shows both)

import { Command } from 'commander';
import chalk from 'chalk';

// ─── Schematic definitions ────────────────────────────────────────────────────

interface SchematicEntry {
  name: string;
  alias: string;
  description: string;
}

const SCHEMATICS: SchematicEntry[] = [
  { name: 'module',           alias: 'mod', description: 'Full feature module (controller, service, routes, model, dto)' },
  { name: 'controller',       alias: 'co',  description: 'Express controller class' },
  { name: 'service',          alias: 's',   description: 'Service class with CRUD methods' },
  { name: 'route',            alias: 'r',   description: 'Express router file' },
  { name: 'model',            alias: 'm',   description: 'TypeScript interface/type' },
  { name: 'dto',              alias: 'd',   description: 'Data transfer objects with validators' },
  { name: 'middleware',       alias: 'mw',  description: 'Express middleware function' },
  { name: 'guard',            alias: 'gu',  description: 'Route guard middleware' },
  { name: 'exception-filter', alias: 'ef',  description: 'Express error handler (4-argument)' },
  { name: 'pipe',             alias: 'p',   description: 'Request body transform/validate middleware' },
];

// ─── Integration definitions ──────────────────────────────────────────────────

interface IntegrationEntry {
  name: string;
  description: string;
}

interface IntegrationGroup {
  label: string;
  integrations: IntegrationEntry[];
}

const INTEGRATION_GROUPS: IntegrationGroup[] = [
  {
    label: 'Validation',
    integrations: [
      { name: 'zod',             description: 'Schema validation with Zod' },
      { name: 'class-validator', description: 'Decorator-based validation' },
      { name: 'joi',             description: 'Joi schema validation' },
    ],
  },
  {
    label: 'Documentation',
    integrations: [
      { name: 'swagger', description: 'OpenAPI docs at /api-docs' },
    ],
  },
  {
    label: 'Testing',
    integrations: [
      { name: 'jest',   description: 'Jest test runner' },
      { name: 'vitest', description: 'Vitest test runner' },
    ],
  },
  {
    label: 'Security',
    integrations: [
      { name: 'helmet',     description: 'HTTP security headers' },
      { name: 'rate-limit', description: 'Request rate limiting' },
    ],
  },
  {
    label: 'Logging',
    integrations: [
      { name: 'winston', description: 'Winston structured logger' },
      { name: 'pino',    description: 'Pino high-performance logger' },
    ],
  },
  {
    label: 'Databases',
    integrations: [
      { name: 'prisma',   description: 'Prisma ORM' },
      { name: 'typeorm',  description: 'TypeORM' },
      { name: 'drizzle',  description: 'Drizzle ORM' },
      { name: 'mongoose', description: 'Mongoose ODM' },
    ],
  },
  {
    label: 'Auth',
    integrations: [
      { name: 'jwt',      description: 'JSON Web Token auth' },
      { name: 'sessions', description: 'Express sessions' },
      { name: 'passport', description: 'Passport.js strategies' },
    ],
  },
  {
    label: 'Infrastructure',
    integrations: [
      { name: 'docker',          description: 'Dockerfile + docker-compose' },
      { name: 'github-actions',  description: 'GitHub Actions CI workflow' },
    ],
  },
];

// ─── Formatters ───────────────────────────────────────────────────────────────

const HR = chalk.dim('  ' + '─'.repeat(54));

function sectionHeader(title: string): void {
  console.log('');
  console.log(chalk.bold(`  ${title}`));
  console.log(HR);
}

function printSchematics(): void {
  sectionHeader('Schematics');

  // Calculate column widths
  const nameW = Math.max(...SCHEMATICS.map((s) => s.name.length)) + 2;
  const aliasW = Math.max(...SCHEMATICS.map((s) => s.alias.length)) + 4;

  for (const s of SCHEMATICS) {
    console.log(
      `  ${chalk.cyan(s.name.padEnd(nameW))}` +
      `${chalk.dim(s.alias.padEnd(aliasW))}` +
      `${chalk.white(s.description)}`,
    );
  }
}

function printIntegrations(): void {
  sectionHeader('Integrations');

  for (const group of INTEGRATION_GROUPS) {
    console.log('');
    console.log(`  ${chalk.bold.underline(group.label)}`);

    const nameW = Math.max(...group.integrations.map((i) => i.name.length)) + 4;

    for (const integration of group.integrations) {
      console.log(
        `    ${chalk.cyan(integration.name.padEnd(nameW))}` +
        `${chalk.white(integration.description)}`,
      );
    }
  }
}

// ─── Command registration ─────────────────────────────────────────────────────

export function registerListCommand(program: Command): void {
  program
    .command('list [type]')
    .alias('ls')
    .description('List available schematics or integrations')
    .action((type: string | undefined) => {
      const normalized = type?.toLowerCase();

      if (normalized === undefined || normalized === '') {
        printSchematics();
        printIntegrations();
        console.log('');
        return;
      }

      if (normalized === 'schematics' || normalized === 'schematic') {
        printSchematics();
        console.log('');
        return;
      }

      if (normalized === 'integrations' || normalized === 'integration') {
        printIntegrations();
        console.log('');
        return;
      }

      console.error(
        `${chalk.red('✖')} Unknown type "${type}". Use 'schematics' or 'integrations'.`,
      );
      process.exit(1);
    });
}
