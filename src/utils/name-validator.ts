/**
 * A non-exhaustive list of names that are reserved by Node.js core modules
 * or are otherwise problematic as package/project names.
 */
const RESERVED_NAMES = new Set([
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'diagnostics_channel',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib',
  // Common reserved package names
  'node',
  'npm',
  'test',
]);

/**
 * Validates a project name.
 * Valid if:
 * - Matches /^[a-z0-9]([a-z0-9-_]*[a-z0-9])?$/i (or a single alphanumeric char)
 * - Less than 214 characters
 * - Not a reserved Node.js core module name
 */
export function validateProjectName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Project name cannot be empty.' };
  }

  if (name.length >= 214) {
    return {
      valid: false,
      error: `Project name must be less than 214 characters (got ${name.length}).`,
    };
  }

  const pattern = /^[a-z0-9]([a-z0-9\-_]*[a-z0-9])?$/i;
  if (!pattern.test(name)) {
    return {
      valid: false,
      error:
        'Project name may only contain letters, numbers, hyphens, and underscores, and must start and end with a letter or number.',
    };
  }

  if (RESERVED_NAMES.has(name.toLowerCase())) {
    return {
      valid: false,
      error: `"${name}" is a reserved name (Node.js built-in module or common reserved name).`,
    };
  }

  return { valid: true };
}

/**
 * Validates a module name.
 * Valid if it contains only letters and hyphens (e.g. "user-profile", "auth").
 */
export function validateModuleName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Module name cannot be empty.' };
  }

  const pattern = /^[a-zA-Z][a-zA-Z\-]*[a-zA-Z]$|^[a-zA-Z]$/;
  if (!pattern.test(name)) {
    return {
      valid: false,
      error:
        'Module name may only contain letters and hyphens, and must start and end with a letter.',
    };
  }

  return { valid: true };
}
