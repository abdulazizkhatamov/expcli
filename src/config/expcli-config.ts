import path from 'path';
import { readJson, writeJson, pathExists } from '../utils/fs.js';
import { ExpCliConfigSchema } from './schema.js';
import type { ExpCliConfig, IntegrationEntry, ModuleEntry } from './schema.js';

const CONFIG_FILENAME = 'expcli.json';

/**
 * Returns the path to expcli.json in the given directory.
 */
function configPath(cwd: string): string {
  return path.join(cwd, CONFIG_FILENAME);
}

/**
 * Reads and validates expcli.json from the given directory.
 * Throws if the file is not found or does not match the schema.
 */
export async function readConfig(cwd?: string): Promise<ExpCliConfig> {
  const dir = cwd ?? process.cwd();
  const filePath = configPath(dir);

  if (!(await pathExists(filePath))) {
    throw new Error(`No expcli.json found in ${dir}. Are you inside an expcli project?`);
  }

  const raw = await readJson(filePath);
  const parsed = ExpCliConfigSchema.safeParse(raw);

  if (!parsed.success) {
    const messages = parsed.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Invalid expcli.json:\n${messages}`);
  }

  return parsed.data;
}

/**
 * Writes the config object to expcli.json in the given directory.
 */
export async function writeConfig(config: ExpCliConfig, cwd?: string): Promise<void> {
  const dir = cwd ?? process.cwd();
  await writeJson(configPath(dir), config);
}

/**
 * Walks up the directory tree from startDir looking for expcli.json.
 * Stops at the filesystem root or when a package.json with workspaces is found.
 *
 * @returns The directory containing expcli.json, or null if not found.
 */
export async function findConfigUp(startDir: string): Promise<string | null> {
  let current = path.resolve(startDir);

  while (true) {
    if (await pathExists(path.join(current, CONFIG_FILENAME))) {
      return current;
    }

    const parent = path.dirname(current);

    // Reached filesystem root
    if (parent === current) {
      return null;
    }

    // Stop if we hit a workspaces root (package.json with "workspaces" field)
    const parentPkgJson = path.join(parent, 'package.json');
    if (await pathExists(parentPkgJson)) {
      try {
        const pkg = (await readJson(parentPkgJson)) as Record<string, unknown>;
        if (Array.isArray(pkg['workspaces'])) {
          return null;
        }
      } catch {
        // Ignore read errors — just keep walking up
      }
    }

    current = parent;
  }
}

/**
 * Registers a module entry in expcli.json.
 * If a module with the same name already exists it is updated in place.
 */
export async function addModule(
  name: string,
  modulePath: string,
  cwd?: string,
): Promise<void> {
  const config = await readConfig(cwd);
  const existing = config.modules.findIndex((m: ModuleEntry) => m.name === name);

  if (existing >= 0) {
    config.modules[existing] = { name, path: modulePath };
  } else {
    config.modules.push({ name, path: modulePath });
  }

  await writeConfig(config, cwd);
}

/**
 * Registers an integration entry in expcli.json.
 * If an integration with the same name already exists it is updated in place.
 */
export async function addIntegration(
  name: string,
  options: Record<string, unknown> = {},
  cwd?: string,
): Promise<void> {
  const config = await readConfig(cwd);
  const existing = config.integrations.findIndex((i: IntegrationEntry) => i.name === name);

  if (existing >= 0) {
    config.integrations[existing] = { ...config.integrations[existing], name, options };
  } else {
    config.integrations.push({ name, options });
  }

  await writeConfig(config, cwd);
}

/**
 * Returns true if an integration with the given name is registered.
 */
export async function hasIntegration(name: string, cwd?: string): Promise<boolean> {
  try {
    const config = await readConfig(cwd);
    return config.integrations.some((i: IntegrationEntry) => i.name === name);
  } catch {
    return false;
  }
}

/**
 * Creates a default ExpCliConfig object without writing it to disk.
 */
export function createDefaultConfig(
  projectName: string,
  template: string,
  pm: string,
): ExpCliConfig {
  const validTemplate = ['minimal', 'rest-api', 'full'].includes(template)
    ? (template as 'minimal' | 'rest-api' | 'full')
    : 'minimal';

  const validPm = ['npm', 'yarn', 'pnpm', 'bun'].includes(pm)
    ? (pm as 'npm' | 'yarn' | 'pnpm' | 'bun')
    : 'npm';

  // Use parse with defaults so Zod fills in all the defaults
  return ExpCliConfigSchema.parse({
    name: projectName,
    template: validTemplate,
    packageManager: validPm,
  });
}
