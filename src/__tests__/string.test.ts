import { describe, it, expect } from 'vitest';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toPlural,
  toSingular,
  capitalize,
} from '../utils/string.js';

describe('toPascalCase', () => {
  it('converts kebab-case', () => expect(toPascalCase('user-profile')).toBe('UserProfile'));
  it('converts snake_case', () => expect(toPascalCase('user_profile')).toBe('UserProfile'));
  it('converts space separated', () => expect(toPascalCase('user profile')).toBe('UserProfile'));
  it('keeps already PascalCase', () => expect(toPascalCase('UserProfile')).toBe('UserProfile'));
  it('handles single word', () => expect(toPascalCase('user')).toBe('User'));
  it('handles multiple separators', () => expect(toPascalCase('get-all-users')).toBe('GetAllUsers'));
});

describe('toCamelCase', () => {
  it('converts kebab-case', () => expect(toCamelCase('user-profile')).toBe('userProfile'));
  it('converts snake_case', () => expect(toCamelCase('user_profile')).toBe('userProfile'));
  it('converts PascalCase', () => expect(toCamelCase('UserProfile')).toBe('userProfile'));
  it('handles single word', () => expect(toCamelCase('user')).toBe('user'));
  it('handles multiple parts', () => expect(toCamelCase('get-all-users')).toBe('getAllUsers'));
});

describe('toKebabCase', () => {
  it('converts PascalCase', () => expect(toKebabCase('UserProfile')).toBe('user-profile'));
  it('converts camelCase', () => expect(toKebabCase('userProfile')).toBe('user-profile'));
  it('converts snake_case', () => expect(toKebabCase('user_profile')).toBe('user-profile'));
  it('keeps kebab-case', () => expect(toKebabCase('user-profile')).toBe('user-profile'));
  it('handles single word', () => expect(toKebabCase('User')).toBe('user'));
  it('collapses multiple separators', () => expect(toKebabCase('user--profile')).toBe('user-profile'));
});

describe('toSnakeCase', () => {
  it('converts kebab-case', () => expect(toSnakeCase('user-profile')).toBe('user_profile'));
  it('converts PascalCase', () => expect(toSnakeCase('UserProfile')).toBe('user_profile'));
  it('converts camelCase', () => expect(toSnakeCase('userProfile')).toBe('user_profile'));
  it('keeps snake_case', () => expect(toSnakeCase('user_profile')).toBe('user_profile'));
});

describe('toPlural', () => {
  it('adds s to regular words', () => expect(toPlural('user')).toBe('users'));
  it('converts consonant+y to ies', () => expect(toPlural('category')).toBe('categories'));
  it('converts consonant+y to ies (city)', () => expect(toPlural('city')).toBe('cities'));
  it('adds es to words ending in x', () => expect(toPlural('box')).toBe('boxes'));
  it('adds es to words ending in ch', () => expect(toPlural('church')).toBe('churches'));
  it('adds es to words ending in sh', () => expect(toPlural('dish')).toBe('dishes'));
  it('adds es to words ending in ss', () => expect(toPlural('class')).toBe('classes'));
  it('leaves already-plural words alone', () => expect(toPlural('posts')).toBe('posts'));
  it('leaves already-plural words alone (users)', () => expect(toPlural('users')).toBe('users'));
  it('leaves ies-ending words alone', () => expect(toPlural('categories')).toBe('categories'));
  it('handles vowel+y by adding s', () => expect(toPlural('day')).toBe('days'));
});

describe('toSingular', () => {
  it('strips s from regular plurals', () => expect(toSingular('users')).toBe('user'));
  it('converts ies back to y', () => expect(toSingular('categories')).toBe('category'));
  it('strips es from x-ending words', () => expect(toSingular('boxes')).toBe('box'));
  it('strips es from ch-ending words', () => expect(toSingular('churches')).toBe('church'));
  it('strips es from sh-ending words', () => expect(toSingular('dishes')).toBe('dish'));
  it('leaves non-plural words alone', () => expect(toSingular('user')).toBe('user'));
  it('leaves ss-ending words alone', () => expect(toSingular('class')).toBe('class'));
});

describe('capitalize', () => {
  it('capitalizes first letter', () => expect(capitalize('hello')).toBe('Hello'));
  it('keeps already capitalized', () => expect(capitalize('Hello')).toBe('Hello'));
  it('handles empty string', () => expect(capitalize('')).toBe(''));
  it('handles single char', () => expect(capitalize('a')).toBe('A'));
});
