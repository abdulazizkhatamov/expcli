import chalk from 'chalk';

function info(msg: string): void {
  console.log(`${chalk.blue('ℹ')} ${msg}`);
}

function success(msg: string): void {
  console.log(`${chalk.green('✔')} ${msg}`);
}

function warn(msg: string): void {
  console.log(`${chalk.yellow('⚠')} ${msg}`);
}

function error(msg: string): void {
  console.log(`${chalk.red('✖')} ${msg}`);
}

function log(msg: string): void {
  console.log(msg);
}

function step(msg: string): void {
  console.log(`${chalk.dim('→')} ${chalk.dim(msg)}`);
}

function title(msg: string): void {
  console.log(chalk.bold(msg));
}

export const logger = {
  info,
  success,
  warn,
  error,
  log,
  step,
  title,
};
