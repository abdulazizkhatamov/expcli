import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import os from 'os';
import { Command } from 'commander';
import chalk from 'chalk';
import { detectPackageManager } from '../pm/detector.js';
import { readConfig, findConfigUp } from '../config/expcli-config.js';
import { runCommandSilent } from '../utils/process.js';
import type { ExpCliConfig, IntegrationEntry, ModuleEntry } from '../config/schema.js';

const _require = createRequire(import.meta.url);

function getPkgVersion(): string {
  try {
    const currentFile = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFile);
    for (const rel of ['../package.json', '../../package.json']) {
      const pkgPath = path.resolve(currentDir, rel);
      try {
        const pkg = _require(pkgPath) as { name?: string; version: string };
        if (pkg.name === 'expcli') return pkg.version;
      } catch {
        // try next
      }
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Fetches the latest published version of expcli from the npm registry.
 * Returns null if the check fails (no network, npm unavailable, etc).
 */
async function getLatestNpmVersion(): Promise<string | null> {
  try {
    const output = await runCommandSilent('npm', ['view', 'expcli', 'version']);
    const trimmed = output.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

/**
 * Compare two semver strings. Returns true if `latest` is newer than `current`.
 * Very lightweight — only handles simple x.y.z forms.
 */
function isNewer(current: string, latest: string): boolean {
  const parse = (v: string): number[] =>
    v
      .replace(/^v/, '')
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

  const [ca, cb, cc] = parse(current);
  const [la, lb, lc] = parse(latest);

  if (la !== ca) return la > ca;
  if (lb !== cb) return lb > cb;
  return lc > cc;
}

// ─── Formatting helpers ────────────────────────────────────────────────────────

const COL = 20; // label column width

function hr(): void {
  console.log(chalk.dim('  ' + '─'.repeat(34)));
}

function sectionHeader(title: string): void {
  console.log('');
  console.log(chalk.bold(`  ${title}`));
  hr();
}

function row(label: string, val: string): void {
  console.log(`  ${chalk.dim(label.padEnd(COL))} ${chalk.white(val)}`);
}

// ─── Project section ──────────────────────────────────────────────────────────

function printProjectSection(config: ExpCliConfig, projectDir: string): void {
  const pm = config.packageManager;
  const header = `Project: ${chalk.white.bold(config.name)}  ${chalk.dim(`(${config.template} template)`)}`;
  console.log('');
  console.log(`  ${header}`);
  hr();

  row('Source root', config.srcRoot);
  row('Entry file', config.entryFile);
  row('Output dir', config.outDir);

  // Modules
  const mods = config.modules as ModuleEntry[];
  if (mods.length > 0) {
    console.log('');
    console.log(`  ${chalk.bold(`Modules (${mods.length})`)}`);
    for (const mod of mods) {
      console.log(`    ${chalk.cyan(mod.name.padEnd(16))} ${chalk.dim(mod.path)}`);
    }
  }

  // Integrations
  const integrations = config.integrations as IntegrationEntry[];
  if (integrations.length > 0) {
    console.log('');
    console.log(`  ${chalk.bold(`Integrations (${integrations.length})`)}`);
    for (const integration of integrations) {
      console.log(`    ${chalk.green('✔')} ${chalk.white(integration.name)}`);
    }
  }

  void pm; // used in outer scope for package manager display
  void projectDir;
}

// ─── Main command ─────────────────────────────────────────────────────────────

export function registerInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Display information about the expcli environment and current project')
    .action(async () => {
      const version = getPkgVersion();

      console.log('');
      console.log(chalk.bold(`  expcli — v${version}`));

      // Check for update in parallel with the rest of the info gathering
      const updatePromise = getLatestNpmVersion();

      // ── System section ──────────────────────────────────────────────────────
      sectionHeader('System');

      row('Node.js', process.version);
      row('Platform', `${os.platform()} (${os.arch()})`);

      // Try to find project config first (needed for pm display)
      const projectDir = await findConfigUp(process.cwd());

      let pmSource = 'detected';
      let pmName = 'unknown';

      if (projectDir) {
        try {
          const config = await readConfig(projectDir);
          pmName = config.packageManager;
          pmSource = 'from expcli.json';
        } catch {
          // fall through to detect
        }
      }

      if (pmName === 'unknown') {
        try {
          pmName = await detectPackageManager(process.cwd());
          pmSource = 'detected';
        } catch {
          pmName = 'unknown';
          pmSource = '';
        }
      }

      row('Package Manager', pmSource ? `${pmName} (${pmSource})` : pmName);

      // ── Project section (if inside a project) ───────────────────────────────
      if (projectDir) {
        try {
          const config = await readConfig(projectDir);
          printProjectSection(config, projectDir);
        } catch (err) {
          sectionHeader('Project');
          console.log(`  ${chalk.yellow('⚠')} Failed to read expcli.json: ${String(err)}`);
        }
      } else {
        console.log('');
        console.log(`  ${chalk.dim("Run 'expcli new <name>' to scaffold a project.")}`);
      }

      // ── Update check ────────────────────────────────────────────────────────
      const latestVersion = await updatePromise;
      if (latestVersion && isNewer(version, latestVersion)) {
        console.log('');
        console.log(
          `  ${chalk.yellow('Update available:')} ${chalk.dim(version)} → ${chalk.green(latestVersion)}  ` +
            chalk.dim('(run: npm i -g expcli)'),
        );
      }

      console.log('');
    });
}
