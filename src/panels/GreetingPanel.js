/**
 * GreetingPanel — displays current time, date, and a time-aware greeting.
 * Also manages a personalised name input.
 *
 * Requirements: 1.1–1.8, 9.1–9.8
 */

import { StorageService } from '../services/StorageService.js';

const STORAGE_KEY = 'todo_dashboard_username';
const REFRESH_INTERVAL_MS = 60_000;

// ---------------------------------------------------------------------------
// Pure helper functions (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Maps an hour value [0–23] to a time-of-day greeting string.
 *
 * Morning:   05–11 → "Good Morning"
 * Afternoon: 12–17 → "Good Afternoon"
 * Evening:   18–21 → "Good Evening"
 * Night:     22–04 → "Good Night"
 *
 * @param {number} hour - integer in [0, 23]
 * @returns {string}
 */
export function getGreeting(hour) {
  if (hour >= 5 && hour <= 11) return 'Good Morning';
  if (hour >= 12 && hour <= 17) return 'Good Afternoon';
  if (hour >= 18 && hour <= 21) return 'Good Evening';
  return 'Good Night'; // 22–23 and 0–4
}

/**
 * Formats a Date object as a 12-hour AM/PM time string.
 * Matches /^\d{1,2}:\d{2} (AM|PM)$/.
 *
 * @param {Date} date
 * @returns {string} e.g. "2:30 PM", "12:00 AM"
 */
export function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const mm = String(minutes).padStart(2, '0');
  return `${hours}:${mm} ${period}`;
}

/**
 * Formats a Date object as "Day, Month DD" (e.g. "Thursday, May 21").
 *
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const day = dayNames[date.getDay()];
  const month = monthNames[date.getMonth()];
  const dd = date.getDate();
  return `${day}, ${month} ${dd}`;
}

/**
 * Combines a base greeting with an optional user name.
 * Returns "BaseGreeting, TrimmedName" when name is a non-empty trimmed string
 * of ≤ 50 characters; otherwise returns baseGreeting unchanged.
 *
 * @param {string} baseGreeting
 * @param {string|null} name
 * @returns {string}
 */
export function formatGreeting(baseGreeting, name) {
  if (name == null) return baseGreeting;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 50) return baseGreeting;
  return `${baseGreeting}, ${trimmed}`;
}

// ---------------------------------------------------------------------------
// DOM rendering
// ---------------------------------------------------------------------------

/**
 * Renders the greeting panel into rootEl based on current state.
 *
 * @param {HTMLElement} rootEl
 * @param {{ userName: string|null }} state
 */
function render(rootEl, state) {
  let now;
  let clockAvailable = true;
  try {
    now = new Date();
    if (isNaN(now.getTime())) clockAvailable = false;
  } catch {
    clockAvailable = false;
  }

  const timeHTML = clockAvailable
    ? `<div class="greeting-time">${formatTime(now)}</div>
       <div class="greeting-date">${formatDate(now)}</div>`
    : '';

  const baseGreeting = clockAvailable ? getGreeting(now.getHours()) : 'Hello';
  const greetingText = formatGreeting(baseGreeting, state.userName);

  rootEl.innerHTML = `
    <h2>Greeting</h2>
    ${timeHTML}
    <div class="greeting-message">${greetingText}</div>
    <form class="name-form" data-action="submit-name" novalidate>
      <input
        class="input"
        type="text"
        name="userName"
        placeholder="Enter your name"
        value="${escapeHtml(state.userName ?? '')}"
        maxlength="51"
        aria-label="Your display name"
      />
      <button type="submit" class="btn btn--primary btn--small">Save</button>
    </form>
    <span class="inline-error" role="alert" aria-live="polite"></span>
  `;

  // Attach submit handler
  const form = rootEl.querySelector('.name-form');
  const errorEl = rootEl.querySelector('.inline-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const raw = form.elements.userName.value;
    const trimmed = raw.trim();

    if (trimmed.length > 50) {
      errorEl.textContent = 'Name must be 50 characters or fewer.';
      return;
    }

    if (trimmed.length === 0) {
      // Clear stored name and revert to generic greeting
      state.userName = null;
      StorageService.write(STORAGE_KEY, null);
    } else {
      // Persist and update
      state.userName = trimmed;
      const result = StorageService.write(STORAGE_KEY, trimmed);
      if (!result.ok) {
        errorEl.textContent = 'Name could not be saved. Changes apply for this session only.';
      }
    }

    render(rootEl, state);
  });
}

/**
 * Escapes a string for safe insertion into an HTML attribute value.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// Panel initialisation
// ---------------------------------------------------------------------------

/**
 * Initialises the Greeting Panel.
 * Reads persisted user name, renders immediately, then refreshes every 60 s.
 *
 * @param {HTMLElement} rootEl
 */
export function initGreetingPanel(rootEl) {
  const state = {
    userName: StorageService.read(STORAGE_KEY, null),
  };

  render(rootEl, state);

  setInterval(() => {
    render(rootEl, state);
  }, REFRESH_INTERVAL_MS);
}
