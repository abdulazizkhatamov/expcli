import { select, confirm, isCancel } from '@clack/prompts';
import type { PackageManager } from '../pm/types';

export interface NewProjectAnswers {
  template: 'minimal' | 'rest-api' | 'full';
  packageManager: PackageManager;
  gitInit: boolean;
}

export async function promptNewProject(detectedPm: PackageManager): Promise<NewProjectAnswers> {
  const templateResult = await select({
    message: 'Select a project template',
    options: [
      {
        value: 'minimal',
        label: 'minimal',
        hint: 'Bare Express + TypeScript setup',
      },
      {
        value: 'rest-api',
        label: 'rest-api',
        hint: 'Structured API with modules, CORS, Helmet, and a health check',
      },
      {
        value: 'full',
        label: 'full',
        hint: 'Full setup with error handling, guards, CRUD module, and response helpers',
      },
    ],
  });

  if (isCancel(templateResult)) {
    process.exit(0);
  }

  const pmResult = await select({
    message: 'Select a package manager',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'bun' },
    ],
    initialValue: detectedPm,
  });

  if (isCancel(pmResult)) {
    process.exit(0);
  }

  const gitInitResult = await confirm({
    message: 'Initialize a git repository?',
    initialValue: true,
  });

  if (isCancel(gitInitResult)) {
    process.exit(0);
  }

  return {
    template: templateResult as 'minimal' | 'rest-api' | 'full',
    packageManager: pmResult as PackageManager,
    gitInit: gitInitResult as boolean,
  };
}
