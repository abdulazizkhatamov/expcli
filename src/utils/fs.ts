import fse from 'fs-extra';

/**
 * Ensures a directory exists, creating it and all parent directories if needed.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fse.ensureDir(dirPath);
}

/**
 * Writes content to a file, creating parent directories as needed.
 * Uses outputFile which automatically creates any missing parent directories.
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fse.outputFile(filePath, content, 'utf-8');
}

/**
 * Reads a file and returns its content as a string.
 */
export async function readFile(filePath: string): Promise<string> {
  return fse.readFile(filePath, 'utf-8');
}

/**
 * Checks whether a path exists on the filesystem.
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return fse.pathExists(filePath);
}

/**
 * Copies a directory recursively from src to dest.
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await fse.copy(src, dest, { overwrite: true });
}

/**
 * Removes a directory and all its contents.
 */
export async function removeDir(dirPath: string): Promise<void> {
  await fse.remove(dirPath);
}

/**
 * Reads and parses a JSON file.
 */
export async function readJson(filePath: string): Promise<unknown> {
  return fse.readJson(filePath);
}

/**
 * Writes data to a JSON file with 2-space indentation.
 */
export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fse.writeJson(filePath, data, { spaces: 2 });
}
