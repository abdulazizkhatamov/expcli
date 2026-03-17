import path from 'path';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import { BaseIntegration } from '../base.integration.js';
import { readFile, writeFile, ensureDir, pathExists } from '../../utils/fs.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

function getTemplatesRoot(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  if (currentDir.includes(`${path.sep}dist`)) {
    const distIdx = currentDir.indexOf(`${path.sep}dist`);
    return path.join(currentDir.slice(0, distIdx), 'dist', 'templates');
  }
  const srcIdx = currentDir.indexOf(`${path.sep}src`);
  if (srcIdx !== -1) {
    return path.join(currentDir.slice(0, srcIdx), 'templates');
  }
  return path.resolve(currentDir, '..', '..', '..', 'templates');
}

export class GithubActionsIntegration extends BaseIntegration {
  readonly name = 'github-actions';
  readonly description = 'GitHub Actions CI workflow';
  readonly packages = {
    prod: [] as string[],
    dev: [] as string[],
  };

  async run(ctx: IntegrationContext): Promise<void> {
    // Scaffold base CI workflow
    await this.scaffoldFile(ctx, 'ci.yml.tpl', '.github/workflows/ci.yml');

    // If jest or vitest is installed, add a test step
    const installedIntegrations = ctx.config.integrations.map((i) => i.name);
    const hasJest = installedIntegrations.includes('jest');
    const hasVitest = installedIntegrations.includes('vitest');

    if (hasJest || hasVitest) {
      const ciPath = path.join(ctx.projectRoot, '.github', 'workflows', 'ci.yml');
      const templatesRoot = getTemplatesRoot();
      const testStepPath = path.join(templatesRoot, 'partials', 'github-actions', 'test-step.yml.tpl');

      try {
        let testStep = await readFile(testStepPath);
        testStep = testStep.replace(/__PROJECT_NAME__/g, ctx.config.name);
        const ciContent = await readFile(ciPath);
        await writeFile(ciPath, ciContent.trimEnd() + '\n\n' + testStep + '\n');
        logger.success('Added test step to CI workflow');
      } catch {
        // Test step template not found — add it inline
        const ciContent = await readFile(ciPath);
        const testStep = `
      - name: Run tests
        run: npm test
`;
        await writeFile(ciPath, ciContent.trimEnd() + testStep);
        logger.success('Added test step to CI workflow');
      }
    }
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, '.github/workflows/ci.yml');

    // Clean up empty directories
    const workflowsDir = path.join(ctx.projectRoot, '.github', 'workflows');
    const githubDir = path.join(ctx.projectRoot, '.github');

    if (await pathExists(workflowsDir)) {
      const workflowsEntries = await fse.readdir(workflowsDir);
      if (workflowsEntries.length === 0) {
        await fse.remove(workflowsDir);
        logger.success('Removed .github/workflows/');
      }
    }

    if (await pathExists(githubDir)) {
      const githubEntries = await fse.readdir(githubDir);
      if (githubEntries.length === 0) {
        await fse.remove(githubDir);
        logger.success('Removed .github/');
      }
    }
  }
}

export default GithubActionsIntegration;
