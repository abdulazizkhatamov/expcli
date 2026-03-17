function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: requireEnv('NODE_ENV', 'development'),
  PORT: Number(requireEnv('PORT', '3000')),
} as const;

export type Env = typeof env;
