import type { ExpCliConfig } from '../config/schema.js';
import type { PackageManager } from '../pm/types.js';

export interface IntegrationContext {
  projectRoot: string;
  config: ExpCliConfig;
  pm: PackageManager;
  options: Record<string, unknown>;  // answers from integration-specific prompts
}

export interface IIntegration {
  readonly name: string;
  readonly description: string;
  readonly packages: { prod: string[]; dev: string[] };
  readonly requires: string[];        // integration names that must be present first
  readonly conflictsWith: string[];   // integration names that cannot coexist

  /** Ask integration-specific questions before install (optional) */
  prompt(ctx: Omit<IntegrationContext, 'options'>): Promise<Record<string, unknown>>;

  /** Install packages, scaffold files, patch existing files */
  run(ctx: IntegrationContext): Promise<void>;
}
