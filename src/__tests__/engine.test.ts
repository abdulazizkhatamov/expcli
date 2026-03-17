import { describe, it, expect } from 'vitest';
import { renderTemplate } from '../template/engine.js';
import { buildContext } from '../template/context.js';

const ctx = buildContext('user-profile', 'my-api');

describe('renderTemplate — token replacement', () => {
  it('replaces __NAME__', () => {
    expect(renderTemplate('hello __NAME__', ctx)).toBe('hello user-profile');
  });

  it('replaces __NAME_PASCAL__', () => {
    expect(renderTemplate('class __NAME_PASCAL__ {}', ctx)).toBe('class UserProfile {}');
  });

  it('replaces __NAME_CAMEL__', () => {
    expect(renderTemplate('const __NAME_CAMEL__ = 1', ctx)).toBe('const userProfile = 1');
  });

  it('replaces __NAME_KEBAB__', () => {
    expect(renderTemplate('file: __NAME_KEBAB__.ts', ctx)).toBe('file: user-profile.ts');
  });

  it('replaces __NAME_SNAKE__', () => {
    expect(renderTemplate('const __NAME_SNAKE__', ctx)).toBe('const user_profile');
  });

  it('replaces __NAME_PLURAL__', () => {
    expect(renderTemplate('route: /__NAME_PLURAL__', ctx)).toBe('route: /user-profiles');
  });

  it('replaces __NAME_PLURAL_PASCAL__', () => {
    expect(renderTemplate('class __NAME_PLURAL_PASCAL__ {}', ctx)).toBe('class UserProfiles {}');
  });

  it('replaces __PROJECT_NAME__', () => {
    expect(renderTemplate('app: __PROJECT_NAME__', ctx)).toBe('app: my-api');
  });

  it('replaces __YEAR__', () => {
    const year = new Date().getFullYear().toString();
    expect(renderTemplate('year: __YEAR__', ctx)).toBe(`year: ${year}`);
  });

  it('replaces multiple tokens in one string', () => {
    const result = renderTemplate(
      'export class __NAME_PASCAL__Controller { // __NAME_KEBAB__.controller.ts }',
      ctx,
    );
    expect(result).toBe('export class UserProfileController { // user-profile.controller.ts }');
  });

  it('replaces all occurrences of the same token', () => {
    const result = renderTemplate('__NAME_PASCAL__ and __NAME_PASCAL__', ctx);
    expect(result).toBe('UserProfile and UserProfile');
  });
});

describe('renderTemplate — conditional blocks', () => {
  const template = [
    'before',
    '//__IF_SWAGGER__',
    'swagger line',
    '//__END_IF_SWAGGER__',
    'after',
  ].join('\n');

  it('keeps block content when flag is true', () => {
    const result = renderTemplate(template, buildContext('user', 'app', { SWAGGER: true }));
    expect(result).toContain('swagger line');
    expect(result).not.toContain('//__IF_SWAGGER__');
    expect(result).not.toContain('//__END_IF_SWAGGER__');
  });

  it('removes entire block when flag is false', () => {
    const result = renderTemplate(template, buildContext('user', 'app', { SWAGGER: false }));
    expect(result).not.toContain('swagger line');
    expect(result).not.toContain('//__IF_SWAGGER__');
  });

  it('removes entire block when flag is missing', () => {
    const result = renderTemplate(template, buildContext('user', 'app', {}));
    expect(result).not.toContain('swagger line');
  });

  it('handles multiple conditional blocks independently', () => {
    const multi = [
      '//__IF_A__',
      'block A',
      '//__END_IF_A__',
      '//__IF_B__',
      'block B',
      '//__END_IF_B__',
    ].join('\n');

    const result = renderTemplate(multi, buildContext('x', 'app', { A: true, B: false }));
    expect(result).toContain('block A');
    expect(result).not.toContain('block B');
  });

  it('keeps surrounding content intact', () => {
    const result = renderTemplate(template, buildContext('user', 'app', { SWAGGER: false }));
    expect(result).toContain('before');
    expect(result).toContain('after');
  });
});

describe('renderTemplate — token replacement inside conditional blocks', () => {
  it('replaces tokens inside kept blocks', () => {
    const template = [
      '//__IF_FEAT__',
      'class __NAME_PASCAL__ {}',
      '//__END_IF_FEAT__',
    ].join('\n');

    const result = renderTemplate(template, buildContext('user', 'app', { FEAT: true }));
    expect(result).toContain('class User {}');
  });
});

describe('renderTemplate — passthrough', () => {
  it('returns string with no tokens unchanged', () => {
    expect(renderTemplate('hello world', ctx)).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(renderTemplate('', ctx)).toBe('');
  });
});
