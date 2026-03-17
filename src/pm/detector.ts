import path from 'path';
import { pathExists } from '../utils/fs.js';
import { runCommandSilent } from '../utils/process.js';
import type { PackageManager } from './types.js';

/**
 * Parses the npm_config_user_agent string to extract the package manager name.
 * e.g. "pnpm/8.0.0 npm/? node/v18.0.0 linux x64" → "pnpm"
 */
function parseUserAgent(userAgent: string): PackageManager | null {
  const knownPMs: PackageManager[] = ['bun', 'pnpm', 'yarn', 'npm'];
  for (const pm of knownPMs) {
    if (userAgent.startsWith(pm + '/') || userAgent.includes(` ${pm}/`)) {
      return pm;
    }
  }
  return null;
}

/**
 * Checks whether a binary is available on PATH.
 */
async function isAvailable(binary: string): Promise<boolean> {
  try {
    await runCommandSilent('which', [binary]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects which package manager to use.
 *
 * Priority:
 * 1. npm_config_user_agent env var (set by the PM that invoked the script)
 * 2. Lockfile detection in cwd:
 *    bun.lockb → bun, yarn.lock → yarn, pnpm-lock.yaml → pnpm, package-lock.json → npm
 * 3. Availability check: bun → pnpm → yarn → npm
 * 4. Fallback: npm
 */
export async function detectPackageManager(cwd?: string): Promise<PackageManager> {
  const dir = cwd ?? process.cwd();

  // 1. Check user agent
  const userAgent = process.env['npm_config_user_agent'];
  if (userAgent) {
    const detected = parseUserAgent(userAgent);
    if (detected) return detected;
  }

  // 2. Check for lockfiles
  const lockfiles: Array<[string, PackageManager]> = [
    ['bun.lockb', 'bun'],
    ['yarn.lock', 'yarn'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['package-lock.json', 'npm'],
  ];

  for (const [lockfile, pm] of lockfiles) {
    if (await pathExists(path.join(dir, lockfile))) {
      return pm;
    }
  }

  // 3. Check PATH availability (prefer bun → pnpm → yarn)
  const candidates: PackageManager[] = ['bun', 'pnpm', 'yarn'];
  for (const pm of candidates) {
    if (await isAvailable(pm)) {
      return pm;
    }
  }

  // 4. Fallback
  return 'npm';
}
