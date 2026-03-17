import { z } from 'zod';

const IntegrationSchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  options: z.record(z.unknown()).default({}),
});

const ModuleEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
});

export const ExpCliConfigSchema = z.object({
  version: z.string().default('1'),
  name: z.string(),
  template: z.enum(['minimal', 'rest-api', 'full']),
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']),
  language: z.literal('typescript').default('typescript'),
  srcRoot: z.string().default('src'),
  modulesDir: z.string().default('src/modules'),
  entryFile: z.string().default('src/index.ts'),
  outDir: z.string().default('dist'),
  integrations: z.array(IntegrationSchema).default([]),
  modules: z.array(ModuleEntrySchema).default([]),
  generate: z
    .object({
      spec: z.boolean().default(false),
      flat: z.boolean().default(false),
    })
    .default({}),
});

export type ExpCliConfig = z.infer<typeof ExpCliConfigSchema>;
export type IntegrationEntry = z.infer<typeof IntegrationSchema>;
export type ModuleEntry = z.infer<typeof ModuleEntrySchema>;
