import { execa } from 'execa';

/**
 * Runs a command, piping stdout/stderr to the terminal.
 * Throws a clean error message on non-zero exit.
 */
export async function runCommand(
  cmd: string,
  args: string[],
  cwd?: string,
): Promise<void> {
  try {
    await execa(cmd, args, {
      cwd,
      stdout: 'inherit',
      stderr: 'inherit',
    });
  } catch (err) {
    const exitCode =
      err != null && typeof err === 'object' && 'exitCode' in err
        ? (err as { exitCode: unknown }).exitCode
        : 'unknown';
    throw new Error(
      `Command failed: ${cmd} ${args.join(' ')} (exit code ${exitCode})`,
    );
  }
}

/**
 * Runs a command and captures its stdout without printing to the terminal.
 * Returns the captured stdout as a string.
 * Throws a clean error message on non-zero exit.
 */
export async function runCommandSilent(
  cmd: string,
  args: string[],
  cwd?: string,
): Promise<string> {
  try {
    const result = await execa(cmd, args, {
      cwd,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    return result.stdout;
  } catch (err) {
    const exitCode =
      err != null && typeof err === 'object' && 'exitCode' in err
        ? (err as { exitCode: unknown }).exitCode
        : 'unknown';
    throw new Error(
      `Command failed: ${cmd} ${args.join(' ')} (exit code ${exitCode})`,
    );
  }
}
