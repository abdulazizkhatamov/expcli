import { program } from './cli.js';
import { registerInfoCommand } from './commands/info.command.js';
import { registerNewCommand } from './commands/new.command.js';
import { registerGenerateCommand } from './commands/generate.command.js';
import { registerBuildCommand } from './commands/build.command.js';
import { registerStartCommand } from './commands/start.command.js';
import { registerStartDevCommand } from './commands/start-dev.command.js';
import { registerAddCommand } from './commands/add.command.js';
import { registerListCommand } from './commands/list.command.js';
import { registerRemoveCommand } from './commands/remove.command.js';
import { registerUpdateCommand } from './commands/update.command.js';
import { logger } from './utils/logger.js';

// Register all commands
registerInfoCommand(program);
registerNewCommand(program);
registerGenerateCommand(program);
registerBuildCommand(program);
registerStartCommand(program);
registerStartDevCommand(program);
registerAddCommand(program);
registerListCommand(program);
registerRemoveCommand(program);
registerUpdateCommand(program);

// Parse and dispatch
program.parseAsync(process.argv).catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
