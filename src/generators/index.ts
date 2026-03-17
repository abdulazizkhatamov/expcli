import type { IGenerator } from './generator.interface.js';

export type { IGenerator, GeneratorContext, GeneratedFile } from './generator.interface.js';

export const GENERATOR_ALIASES: Record<string, string> = {
  'controller': 'controller', 'co': 'controller',
  'service': 'service',       's': 'service',
  'route': 'route',           'r': 'route',
  'model': 'model',           'm': 'model',
  'dto': 'dto',               'd': 'dto',
  'middleware': 'middleware',  'mw': 'middleware',
  'guard': 'guard',           'gu': 'guard',
  'exception-filter': 'exception-filter', 'ef': 'exception-filter',
  'pipe': 'pipe',             'p': 'pipe',
  'module': 'module',         'mod': 'module',
  'spec': 'spec',             'sp': 'spec',
};

export async function createGenerator(type: string): Promise<IGenerator> {
  const resolved = GENERATOR_ALIASES[type];
  if (!resolved) {
    throw new Error(`Unknown generator type: "${type}"`);
  }

  switch (resolved) {
    case 'controller': {
      const { ControllerGenerator } = await import('./controller.generator.js');
      return new ControllerGenerator();
    }
    case 'service': {
      const { ServiceGenerator } = await import('./service.generator.js');
      return new ServiceGenerator();
    }
    case 'route': {
      const { RouteGenerator } = await import('./route.generator.js');
      return new RouteGenerator();
    }
    case 'model': {
      const { ModelGenerator } = await import('./model.generator.js');
      return new ModelGenerator();
    }
    case 'dto': {
      const { DtoGenerator } = await import('./dto.generator.js');
      return new DtoGenerator();
    }
    case 'middleware': {
      const { MiddlewareGenerator } = await import('./middleware.generator.js');
      return new MiddlewareGenerator();
    }
    case 'guard': {
      const { GuardGenerator } = await import('./guard.generator.js');
      return new GuardGenerator();
    }
    case 'exception-filter': {
      const { ExceptionFilterGenerator } = await import('./exception-filter.generator.js');
      return new ExceptionFilterGenerator();
    }
    case 'pipe': {
      const { PipeGenerator } = await import('./pipe.generator.js');
      return new PipeGenerator();
    }
    case 'module': {
      const { ModuleGenerator } = await import('./module.generator.js');
      return new ModuleGenerator();
    }
    case 'spec': {
      const { SpecGenerator } = await import('./spec.generator.js');
      return new SpecGenerator();
    }
    default:
      throw new Error(`No generator implemented for type: "${resolved}"`);
  }
}
