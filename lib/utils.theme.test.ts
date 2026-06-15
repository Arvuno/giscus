import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAvailableTheme,
  isCustomTheme,
  normalizeThemeInput,
  resolveTheme,
  getThemeUrl,
} from './utils';
import type { Theme } from './variables';

// `isAvailableTheme`, `isCustomTheme`, and `normalizeThemeInput` are exported
// from `lib/utils.ts` as part of the new theme-validity helper surface. They
// are the single source of truth for "is this string a built-in theme?",
// "is this string a custom theme?", and "give me back a sanitized theme or
// `null`". These tests pin the contract so a future refactor (e.g., renaming
// the built-in theme list) does not silently change the embed script's
// behavior.

function asTheme(s: string): Theme {
  return s as Theme;
}

test('isAvailableTheme: returns true for every built-in theme', () => {
  // Sample a handful rather than enumerating the full list; the list is
  // already covered by the type-level `AvailableTheme` union.
  for (const theme of [
    'light',
    'dark',
    'preferred_color_scheme',
    'noborder_light',
    'catppuccin_mocha',
  ]) {
    assert.equal(
      isAvailableTheme(asTheme(theme)),
      true,
      `expected '${theme}' to be a built-in theme`,
    );
  }
});

test('isAvailableTheme: returns true for the custom sentinel (it is a built-in key)', () => {
  // `'custom'` lives in the `availableThemes` list — selecting it from the
  // configuration UI surfaces the URL field. Distinguishing "selected
  // custom" from "actual custom URL" is the caller's responsibility.
  assert.equal(isAvailableTheme(asTheme('custom')), true);
});

test('isAvailableTheme: returns false for arbitrary paths and URLs', () => {
  assert.equal(isAvailableTheme(asTheme('/themes/my-theme.css')), false);
  assert.equal(isAvailableTheme(asTheme('https://example.com/theme.css')), false);
  assert.equal(isAvailableTheme(asTheme('')), false);
});

test('isCustomTheme: inverts isAvailableTheme for non-empty strings', () => {
  // Built-in keys (including the 'custom' sentinel) are not custom.
  assert.equal(isCustomTheme(asTheme('light')), false);
  assert.equal(isCustomTheme(asTheme('custom')), false);
  // Anything else is a candidate custom theme.
  assert.equal(isCustomTheme(asTheme('/themes/my-theme.css')), true);
  assert.equal(isCustomTheme(asTheme('https://example.com/theme.css')), true);
});

test('isCustomTheme: returns false for empty and non-string inputs', () => {
  assert.equal(isCustomTheme(asTheme('')), false);
  // The function signature is `(theme: Theme)`, but JavaScript callers can
  // still pass anything. The runtime guard prevents `false` from leaking
  // through as a candidate custom theme.
  assert.equal(isCustomTheme(undefined as unknown as Theme), false);
  assert.equal(isCustomTheme(null as unknown as Theme), false);
});

test('normalizeThemeInput: returns null for non-string input', () => {
  assert.equal(normalizeThemeInput(null), null);
  assert.equal(normalizeThemeInput(undefined), null);
  assert.equal(normalizeThemeInput(42), null);
  assert.equal(normalizeThemeInput({}), null);
});

test('normalizeThemeInput: returns null for empty or whitespace-only input', () => {
  assert.equal(normalizeThemeInput(''), null);
  assert.equal(normalizeThemeInput('   '), null);
  assert.equal(normalizeThemeInput('\t\n'), null);
});

test('normalizeThemeInput: returns the built-in theme when one matches', () => {
  assert.equal(normalizeThemeInput('light'), 'light');
  assert.equal(normalizeThemeInput('dark'), 'dark');
  assert.equal(normalizeThemeInput('preferred_color_scheme'), 'preferred_color_scheme');
});

test('normalizeThemeInput: trims surrounding whitespace', () => {
  assert.equal(normalizeThemeInput('  light  '), 'light');
  assert.equal(normalizeThemeInput('  /themes/my-theme.css  '), '/themes/my-theme.css');
});

test('normalizeThemeInput: passes through arbitrary custom paths and URLs', () => {
  assert.equal(normalizeThemeInput('/themes/my-theme.css'), '/themes/my-theme.css');
  assert.equal(
    normalizeThemeInput('https://example.com/theme.css'),
    'https://example.com/theme.css',
  );
  // The function does not validate URL shape on purpose — that is the
  // caller's responsibility once a candidate custom theme is accepted.
  assert.equal(normalizeThemeInput('custom'), 'custom');
});

test('resolveTheme: returns preferred_color_scheme for empty input', () => {
  assert.equal(resolveTheme(asTheme('')), 'preferred_color_scheme');
});

test('resolveTheme: returns the built-in theme unchanged', () => {
  assert.equal(resolveTheme(asTheme('light')), 'light');
  assert.equal(resolveTheme(asTheme('dark_dimmed')), 'dark_dimmed');
});

test('resolveTheme: returns the custom sentinel for any non-built-in input', () => {
  assert.equal(resolveTheme(asTheme('/themes/my-theme.css')), 'custom');
  assert.equal(resolveTheme(asTheme('https://example.com/theme.css')), 'custom');
});

test('getThemeUrl: returns the built-in path for built-in themes', () => {
  assert.equal(getThemeUrl(asTheme('light'), asTheme('light')), '/themes/light.css');
  assert.equal(getThemeUrl(asTheme('dark'), asTheme('dark')), '/themes/dark.css');
});

test('getThemeUrl: returns the raw theme value for the custom sentinel', () => {
  assert.equal(
    getThemeUrl(asTheme('custom'), asTheme('/themes/my-theme.css')),
    '/themes/my-theme.css',
  );
  assert.equal(
    getThemeUrl(asTheme('custom'), asTheme('https://example.com/theme.css')),
    'https://example.com/theme.css',
  );
});
