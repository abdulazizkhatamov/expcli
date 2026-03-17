import type { TemplateContext } from '../template/context.js';

export interface GeneratorContext {
  /** Raw input name, e.g. "user-profile" */
  name: string;
  /** Absolute path to project root (where expcli.json lives) */
  projectRoot: string;
  /** Absolute path to where files should be written */
  targetDir: string;
  context: TemplateContext;
  /** If true, write to targetDir directly (no sub-folder) */
  flat: boolean;
  /** If true, generate a test file */
  spec: boolean;
  /** If true, do not write any files — only report what would be created */
  dryRun?: boolean;
}

export interface IGenerator {
  generate(ctx: GeneratorContext): Promise<GeneratedFile[]>;
}

export interface GeneratedFile {
  /** Absolute path */
  path: string;
  content: string;
  /** True if user chose not to overwrite */
  skipped: boolean;
  /** True if --dry-run was active — file was not written */
  dryRun?: boolean;
}
