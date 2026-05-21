/**
 * main.js — Application entry point
 *
 * Initialises services and all four panel modules in the correct order:
 *   1. StorageService (no DOM dependency)
 *   2. ThemeService  (must apply theme before panels render — Req 7.5)
 *   3. Panel modules (Greeting, FocusTimer, TaskManager, QuickLinks)
 *   4. Global localStorage availability check (banner if unavailable — Req 5.4)
 */

import { StorageService } from './services/StorageService.js';
import { ThemeService } from './services/ThemeService.js';
import { initGreetingPanel } from './panels/GreetingPanel.js';
import { initFocusTimer } from './panels/FocusTimer.js';
import { initTaskManager } from './panels/TaskManager.js';
import { initQuickLinksPanel } from './panels/QuickLinksPanel.js';

// ── 1. Check localStorage availability ──────────────────────────────────────
if (!StorageService.isAvailable()) {
  const banner = document.getElementById('storage-warning-banner');
  if (banner) {
    banner.hidden = false;
  }
}

// ── 2. Apply persisted theme before first paint ──────────────────────────────
const currentTheme = ThemeService.load();
ThemeService.apply(currentTheme);

// Keep the toggle button label in sync with the active theme
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
  themeToggleBtn.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

  themeToggleBtn.addEventListener('click', () => {
    const active = document.documentElement.getAttribute('data-theme') || 'light';
    const next = ThemeService.toggle(active);
    ThemeService.apply(next);
    themeToggleBtn.textContent = next === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    const result = ThemeService.save(next);
    const errorEl = document.getElementById('theme-toggle-error');
    if (errorEl) {
      errorEl.textContent = result.ok
        ? ''
        : 'Theme preference could not be saved.';
    }
  });
}

// ── 3. Initialise panels ─────────────────────────────────────────────────────
const greetingRoot = document.getElementById('greeting-panel');
if (greetingRoot) initGreetingPanel(greetingRoot);

const timerRoot = document.getElementById('focus-timer-panel');
if (timerRoot) initFocusTimer(timerRoot);

const taskRoot = document.getElementById('task-manager-panel');
if (taskRoot) initTaskManager(taskRoot);

const linksRoot = document.getElementById('quick-links-panel');
if (linksRoot) initQuickLinksPanel(linksRoot);
