/**
 * ThemeService — manages the active color theme.
 *
 * Applies the theme by setting a `data-theme` attribute on the `<html>` element.
 * CSS rules use `[data-theme="dark"] { ... }` selectors to switch palettes.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import { StorageService } from './StorageService.js';

const THEME_KEY = 'todo_dashboard_theme';

export const ThemeService = {
  /**
   * Apply a theme by setting `data-theme` on `<html>`.
   * CSS custom-property rules keyed on `[data-theme="dark"]` handle the palette swap.
   *
   * @param {'light'|'dark'} theme
   * @returns {void}
   */
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  /**
   * Pure function — returns the opposite theme.
   * Returns `"dark"` when `current` is `"light"`, `"light"` otherwise.
   *
   * @param {'light'|'dark'} current
   * @returns {'light'|'dark'}
   */
  toggle(current) {
    return current === 'light' ? 'dark' : 'light';
  },

  /**
   * Read the persisted theme from localStorage.
   * Returns `"light"` as the default when no value is stored.
   *
   * @returns {'light'|'dark'}
   */
  load() {
    return StorageService.read(THEME_KEY, 'light');
  },

  /**
   * Persist the active theme to localStorage via StorageService.
   *
   * @param {'light'|'dark'} theme
   * @returns {{ ok: boolean, error?: string }}
   */
  save(theme) {
    return StorageService.write(THEME_KEY, theme);
  },
};
