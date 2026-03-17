import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toPlural,
} from '../utils/string.js';

export interface TemplateContext {
  /** Raw input name, e.g. "user-profile" */
  name: string;
  /** PascalCase variant, e.g. "UserProfile" */
  namePascal: string;
  /** camelCase variant, e.g. "userProfile" */
  nameCamel: string;
  /** kebab-case variant, e.g. "user-profile" */
  nameKebab: string;
  /** snake_case variant, e.g. "user_profile" */
  nameSnake: string;
  /** Plural kebab-case variant, e.g. "user-profiles" */
  namePlural: string;
  /** Plural PascalCase variant, e.g. "UserProfiles" */
  namePluralPascal: string;
  /** The project name from expcli.json */
  projectName: string;
  /** The current year as a string, e.g. "2025" */
  year: string;
  /** Feature flags for conditional template blocks */
  flags: Record<string, boolean>;
}

/**
 * Builds a TemplateContext from a raw name string.
 *
 * @param name - The raw input name (e.g. "user-profile")
 * @param projectName - The project name from expcli.json
 * @param flags - Optional feature flags for conditional blocks
 */
export function buildContext(
  name: string,
  projectName: string,
  flags: Record<string, boolean> = {},
): TemplateContext {
  const nameKebab = toKebabCase(name);
  const namePluralKebab = toPlural(nameKebab);

  return {
    name,
    namePascal: toPascalCase(name),
    nameCamel: toCamelCase(name),
    nameKebab,
    nameSnake: toSnakeCase(name),
    namePlural: namePluralKebab,
    namePluralPascal: toPascalCase(namePluralKebab),
    projectName,
    year: new Date().getFullYear().toString(),
    flags,
  };
}
