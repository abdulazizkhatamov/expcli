import type { IIntegration } from './integration.interface.js';
import { ZodIntegration } from './validation/zod.integration.js';
import { ClassValidatorIntegration } from './validation/class-validator.integration.js';
import { JoiIntegration } from './validation/joi.integration.js';
import { SwaggerIntegration } from './docs/swagger.integration.js';
import { JestIntegration } from './testing/jest.integration.js';
import { VitestIntegration } from './testing/vitest.integration.js';
import { HelmetIntegration } from './security/helmet.integration.js';
import { RateLimitIntegration } from './security/rate-limit.integration.js';
import { WinstonIntegration } from './logging/winston.integration.js';
import { PinoIntegration } from './logging/pino.integration.js';
import { PrismaIntegration } from './db/prisma.integration.js';
import { TypeOrmIntegration } from './db/typeorm.integration.js';
import { DrizzleIntegration } from './db/drizzle.integration.js';
import { MongooseIntegration } from './db/mongoose.integration.js';
import { JwtIntegration } from './auth/jwt.integration.js';
import { PassportIntegration } from './auth/passport.integration.js';
import { SessionsIntegration } from './auth/sessions.integration.js';
import { DockerIntegration } from './infra/docker.integration.js';
import { GithubActionsIntegration } from './infra/github-actions.integration.js';

type IntegrationFactory = () => IIntegration;

const INTEGRATION_FACTORIES: Record<string, IntegrationFactory> = {
  'zod': () => new ZodIntegration(),
  'class-validator': () => new ClassValidatorIntegration(),
  'joi': () => new JoiIntegration(),
  'swagger': () => new SwaggerIntegration(),
  'jest': () => new JestIntegration(),
  'vitest': () => new VitestIntegration(),
  'helmet': () => new HelmetIntegration(),
  'rate-limit': () => new RateLimitIntegration(),
  'winston': () => new WinstonIntegration(),
  'pino': () => new PinoIntegration(),
  'prisma': () => new PrismaIntegration(),
  'typeorm': () => new TypeOrmIntegration(),
  'drizzle': () => new DrizzleIntegration(),
  'mongoose': () => new MongooseIntegration(),
  'jwt': () => new JwtIntegration(),
  'passport': () => new PassportIntegration(),
  'sessions': () => new SessionsIntegration(),
  'docker': () => new DockerIntegration(),
  'github-actions': () => new GithubActionsIntegration(),
};

export const INTEGRATION_REGISTRY: Record<string, string> = Object.fromEntries(
  Object.keys(INTEGRATION_FACTORIES).map((name) => [name, name]),
);

export async function createIntegration(name: string): Promise<IIntegration> {
  const factory = INTEGRATION_FACTORIES[name];

  if (!factory) {
    const available = Object.keys(INTEGRATION_FACTORIES).sort().join('\n  ');
    throw new Error(
      `Unknown integration: "${name}"\n\nAvailable integrations:\n  ${available}`,
    );
  }

  return factory();
}
