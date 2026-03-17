import path from 'path';
import { BaseIntegration } from '../base.integration.js';
import { pathExists, writeFile, readFile } from '../../utils/fs.js';
import { logger } from '../../utils/logger.js';
import type { IntegrationContext } from '../integration.interface.js';

export class MongooseIntegration extends BaseIntegration {
  readonly name = 'mongoose';
  readonly description = 'MongoDB ODM with Mongoose';
  readonly packages = {
    prod: ['mongoose'],
    dev: [] as string[],
  };
  readonly conflictsWith = ['prisma', 'typeorm', 'drizzle'];

  async run(ctx: IntegrationContext): Promise<void> {
    await this.scaffoldFile(ctx, 'mongoose.ts.tpl', 'src/lib/mongoose.ts');

    // Add MONGODB_URI to .env
    const mongoUri = `mongodb://localhost:27017/${ctx.config.name}`;
    await appendEnvVar(ctx.projectRoot, '.env', `MONGODB_URI=${mongoUri}`);

    // Print hint for index.ts
    logger.info(
      'Add the following to src/index.ts to connect on startup:\n' +
      '  import { connectDatabase } from \'./lib/mongoose.js\';\n' +
      '  await connectDatabase();',
    );
  }

  async remove(ctx: IntegrationContext): Promise<void> {
    await super.remove(ctx);
    await this.removeFile(ctx.projectRoot, 'src/lib/mongoose.ts');
    logger.info('Remember to remove MONGODB_URI from your .env file');
  }
}

async function appendEnvVar(projectRoot: string, filename: string, line: string): Promise<void> {
  const filePath = path.join(projectRoot, filename);
  const key = line.split('=')[0] ?? '';
  if (await pathExists(filePath)) {
    const content = await readFile(filePath);
    if (!content.includes(key)) {
      await writeFile(filePath, content.trimEnd() + '\n' + line + '\n');
    }
  } else {
    await writeFile(filePath, line + '\n');
  }
}

export default MongooseIntegration;
