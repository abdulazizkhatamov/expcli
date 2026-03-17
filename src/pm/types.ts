export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface PmCommands {
  /** Arguments for installing all dependencies (e.g. ['install']) */
  install: string[];
  /** Returns args for adding packages (prod or dev) */
  add: (pkg: string[], dev: boolean) => string[];
  /** Returns args for running a binary via the package manager executor */
  exec: (cmd: string) => string[];
  /** Returns args for running a script defined in package.json */
  run: (script: string) => string[];
}
