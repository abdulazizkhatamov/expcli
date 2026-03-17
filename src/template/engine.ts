import { logger } from '../utils/logger.js';
import type { TemplateContext } from './context.js';

/**
 * Maps token strings to their TemplateContext values.
 */
function buildTokenMap(context: TemplateContext): Record<string, string> {
  return {
    '__NAME__': context.name,
    '__NAME_PASCAL__': context.namePascal,
    '__NAME_CAMEL__': context.nameCamel,
    '__NAME_KEBAB__': context.nameKebab,
    '__NAME_SNAKE__': context.nameSnake,
    '__NAME_PLURAL__': context.namePlural,
    '__NAME_PLURAL_PASCAL__': context.namePluralPascal,
    '__PROJECT_NAME__': context.projectName,
    '__YEAR__': context.year,
  };
}

/**
 * Processes conditional blocks of the form:
 *
 *   //__IF_FLAGNAME__
 *   ...content...
 *   //__END_IF_FLAGNAME__
 *
 * If context.flags.FLAGNAME is truthy, the wrapper comments are removed and
 * the inner content is kept. Otherwise the entire block (including content)
 * is removed.
 */
function processConditionals(template: string, context: TemplateContext): string {
  // Match any //__IF_FLAGNAME__ ... //__END_IF_FLAGNAME__ block (multiline)
  const conditionalPattern =
    /\/\/__IF_([A-Z0-9_]+)__\r?\n([\s\S]*?)\/\/__END_IF_\1__/gm;

  return template.replace(
    conditionalPattern,
    (_match: string, flagName: string, innerContent: string): string => {
      const flagValue = context.flags[flagName] ?? false;
      if (flagValue) {
        // Keep the inner content, strip the wrapper comment lines
        // innerContent already excludes the directive lines due to the regex
        return innerContent;
      }
      // Remove the entire block
      return '';
    },
  );
}

/**
 * Replaces all known tokens in the template string with their context values.
 */
function replaceTokens(template: string, context: TemplateContext): string {
  const tokenMap = buildTokenMap(context);
  let result = template;

  for (const [token, value] of Object.entries(tokenMap)) {
    // Escape special regex chars in the token (tokens are __UPPER_CASE__ so
    // only _ and letters, but be safe)
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), value);
  }

  return result;
}

/**
 * Validates that no unreplaced tokens remain after rendering.
 * Logs a warning for each remaining token found.
 */
function validateNoRemainingTokens(rendered: string, sourceName?: string): void {
  const remaining = rendered.match(/__[A-Z][A-Z0-9_]*__/g);
  if (remaining) {
    const unique = [...new Set(remaining)];
    for (const token of unique) {
      logger.warn(
        `Unreplaced token "${token}" found in rendered output${sourceName ? ` (${sourceName})` : ''}.`,
      );
    }
  }
}

/**
 * Renders a template string by:
 * 1. Processing conditional blocks
 * 2. Replacing tokens
 * 3. Validating no tokens remain
 *
 * @param template - The raw template string
 * @param context - The template context
 * @returns The fully rendered string
 */
export function renderTemplate(template: string, context: TemplateContext): string {
  let result = processConditionals(template, context);
  result = replaceTokens(result, context);
  validateNoRemainingTokens(result);
  return result;
}
