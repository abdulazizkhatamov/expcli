/**
 * Converts a string to PascalCase.
 * Handles kebab-case, snake_case, camelCase, and space-separated words.
 * e.g. "user-profile" → "UserProfile"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/^(.)/, (char: string) => char.toUpperCase());
}

/**
 * Converts a string to camelCase.
 * e.g. "user-profile" → "userProfile"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case.
 * Handles PascalCase, camelCase, snake_case, and space-separated words.
 * e.g. "UserProfile" → "user-profile"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, (char: string) => `-${char.toLowerCase()}`)
    .replace(/[\s_]+/g, '-')
    .replace(/^-/, '')
    .replace(/-+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case.
 * e.g. "user-profile" → "user_profile"
 */
export function toSnakeCase(str: string): string {
  return toKebabCase(str).replace(/-/g, '_');
}

/**
 * Basic pluralization.
 * e.g. "user" → "users", "category" → "categories", "address" → "addresses"
 */
export function toPlural(str: string): string {
  // Already plural-looking (ends with s, es, ies) — heuristic, not perfect
  if (/ies$/.test(str)) return str;
  if (/ses$|xes$|zes$|ches$|shes$/.test(str)) return str;

  // Words ending in consonant + y → ies
  if (/[^aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + 'ies';
  }

  // Words already ending in s (not ss) → treat as already plural
  if (/[^s]s$/.test(str)) {
    return str;
  }

  // Words ending in ss, x, z, ch, sh → es
  if (/ss$|[xz]$|[cs]h$/.test(str)) {
    return str + 'es';
  }

  // Default: add s
  return str + 's';
}

/**
 * Basic singularization — reverse of toPlural.
 * e.g. "users" → "user", "categories" → "category", "addresses" → "address"
 */
export function toSingular(str: string): string {
  // ends in ies → y (e.g. categories → category)
  if (/ies$/.test(str)) {
    return str.slice(0, -3) + 'y';
  }

  // ends in ses, xes, zes, ches, shes → strip es (e.g. addresses → address)
  if (/ses$|xes$|zes$|ches$|shes$/.test(str)) {
    return str.slice(0, -2);
  }

  // ends in s (but not ss) → strip s
  if (/[^s]s$/.test(str)) {
    return str.slice(0, -1);
  }

  return str;
}

/**
 * Capitalizes the first letter of a string.
 * e.g. "hello" → "Hello"
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
