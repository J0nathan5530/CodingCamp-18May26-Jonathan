# Implementation Plan: To-Do List Dashboard

## Overview

Implement a single-page dashboard using HTML, CSS, and Vanilla JavaScript with ES Modules. The app has four self-contained panels (Greeting, Focus Timer, Task Manager, Quick Links) sharing a common `StorageService` for `localStorage` persistence, a `ThemeService` for light/dark mode, and no build step or external frameworks.

## Tasks

- [x] 1. Set up project structure and shared infrastructure
  - Create the directory layout: `src/services/`, `src/panels/`, `src/tests/`
  - Create `index.html` with the four panel root elements and `<script type="module" src="src/main.js">`
  - Create `src/main.js` that imports and initialises each panel module
  - Add a minimal `styles.css` with a CSS grid layout for the four panels at 1280×720 viewport
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 2. Implement `StorageService`
  - [x] 2.1 Create `src/services/StorageService.js` with `read`, `write`, and `isAvailable` methods
    - `read(key, fallback)` — wraps `JSON.parse(localStorage.getItem(key))` in `try/catch`, returns `fallback` on any error
    - `write(key, value)` — wraps `localStorage.setItem(key, JSON.stringify(value))` in `try/catch`, returns `{ ok: boolean, error? }`
    - `isAvailable()` — probes `localStorage` with a test write/delete, returns boolean
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 2.2 Write property test for `StorageService` round-trip (Property 7)
    - **Property 7: Task list persistence round-trip**
    - **Validates: Requirements 3.8, 3.9, 5.2, 5.3**
    - Use `fc.array(fc.record({ id: fc.string(), description: fc.string({ minLength: 1, maxLength: 500 }), completed: fc.boolean(), createdAt: fc.integer() }))` and assert deep equality after write → read

  - [ ]* 2.3 Write property test for `StorageService` round-trip (Property 8)
    - **Property 8: Link list persistence round-trip**
    - **Validates: Requirements 4.6, 4.7, 5.2, 5.3**
    - Use `fc.array(fc.record({ id: fc.string(), label: fc.string({ minLength: 1, maxLength: 50 }), url: fc.string(), createdAt: fc.integer() }))` and assert deep equality after write → read

  - [ ]* 2.4 Write unit tests for `StorageService`
    - Test `write` then `read` round-trip for tasks and links
    - Test `read` with a missing key returns the fallback value
    - Test `read` with corrupted JSON returns the fallback value
    - _Requirements: 5.3, 5.4_

- [x] 3. Implement `ThemeService`
  - [x] 3.1 Create `src/services/ThemeService.js` with `apply`, `toggle`, `load`, and `save` methods
    - `apply(theme)` — sets `document.documentElement.setAttribute('data-theme', theme)`; CSS rules use `[data-theme="dark"]` selectors to switch palettes
    - `toggle(current)` — pure function; returns `"dark"` when `current` is `"light"`, returns `"light"` otherwise
    - `load()` — calls `StorageService.read('todo_dashboard_theme', 'light')`; returns the stored theme or `"light"` as default
    - `save(theme)` — calls `StorageService.write('todo_dashboard_theme', theme)`; returns `{ ok, error? }`
    - Wire theme toggle control in `index.html`; call `ThemeService.load()` then `ThemeService.apply()` in `main.js` before any panel renders
    - On toggle: call `toggle`, `apply`, then `save`; show inline error in the toggle area if `save` returns `{ ok: false }`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 3.2 Write property test for theme toggle involution (Property 12)
    - **Property 12: Theme toggle is an involution**
    - **Validates: Requirements 7.2, 7.3**
    - Use `fc.constantFrom("light", "dark")`; call `ThemeService.toggle` twice; assert result equals original theme value
    - `// Feature: todo-dashboard, Property 12: theme toggle is an involution`

  - [ ]* 3.3 Write unit tests for `ThemeService`
    - `ThemeService.toggle("light")` → `"dark"`
    - `ThemeService.toggle("dark")` → `"light"`
    - `ThemeService.load()` with no stored value → `"light"`
    - `ThemeService.load()` with stored `"dark"` → `"dark"`
    - `ThemeService.apply("dark")` sets `document.documentElement.dataset.theme` to `"dark"`
    - `ThemeService.save` then `ThemeService.load` round-trip returns same value
    - _Requirements: 7.2, 7.3, 7.5, 7.6_

- [ ] 4. Implement `GreetingPanel`
  - [ ] 4.1 Create `src/panels/GreetingPanel.js` with `initGreetingPanel(rootEl)`
    - Implement `getGreeting(hour)` — pure function mapping hour [0–23] → greeting string per Requirements 1.4–1.7
    - Implement `formatTime(date)` — returns 12-hour AM/PM string matching `/^\d{1,2}:\d{2} (AM|PM)$/`
    - Implement `formatDate(date)` — returns "Day, Month DD" string
    - Implement `formatGreeting(baseGreeting, name)` — pure function; returns `"${baseGreeting}, ${trimmedName}"` when `name` is a non-empty trimmed string (≤ 50 chars), otherwise returns `baseGreeting` unchanged
    - Implement `render(rootEl, state)` — updates DOM; shows "Hello" fallback and omits time/date if clock unavailable
    - Add `userName` to internal state (`string | null`); on load call `StorageService.read('todo_dashboard_username', null)` to populate it
    - Render a name input control and submit button; on submit: if trimmed value is non-empty and ≤ 50 chars, update `userName`, re-render greeting, and call `StorageService.write('todo_dashboard_username', trimmedName)`; if empty/whitespace, set `userName` to `null` and clear stored name; if > 50 chars, show inline validation message without state change; show inline error if `StorageService.write` fails
    - Set `setInterval` to refresh every 60 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [ ]* 4.2 Write property test for greeting correctness (Property 1)
    - **Property 1: Greeting correctness for all hours**
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**
    - Use `fc.integer({ min: 0, max: 23 })` and assert `getGreeting(hour)` returns the correct greeting per time-range rules

  - [ ]* 4.3 Write property test for time format invariant (Property 2)
    - **Property 2: Time format invariant**
    - **Validates: Requirements 1.1**
    - Use `fc.date()` and assert `formatTime(date)` matches `/^\d{1,2}:\d{2} (AM|PM)$/`

  - [ ]* 4.4 Write property test for date format invariant (Property 3)
    - **Property 3: Date format invariant**
    - **Validates: Requirements 1.2**
    - Use `fc.date()` and assert `formatDate(date)` matches the weekday/month/day pattern

  - [ ]* 4.5 Write property test for greeting format with name (Property 14)
    - **Property 14: Greeting format with name always produces "BaseGreeting, Name" pattern**
    - **Validates: Requirements 9.2**
    - Use `fc.string({ minLength: 1 })` for base greeting and `fc.string({ minLength: 1, maxLength: 50 })` filtered to non-whitespace-only for name; assert `formatGreeting(baseGreeting, trimmedName)` equals `baseGreeting + ", " + trimmedName`
    - `// Feature: todo-dashboard, Property 14: greeting format with name always produces "BaseGreeting, Name" pattern`

  - [ ]* 4.6 Write unit tests for `GreetingPanel` pure functions
    - `getGreeting` — test each boundary: 5, 12, 18, 22, 0, 4
    - `formatTime` — midnight (12:00 AM), noon (12:00 PM), 1:05 PM
    - `formatDate` — known date produces expected string
    - `formatGreeting("Good Morning", "Alex")` → `"Good Morning, Alex"`
    - `formatGreeting("Good Night", null)` → `"Good Night"`
    - `formatGreeting("Good Afternoon", "  Alex  ")` → `"Good Afternoon, Alex"` (trimmed)
    - Name input: submitting a valid name updates greeting and persists to storage
    - Name input: submitting empty/whitespace clears stored name and reverts to generic greeting
    - Name input: submitting a name > 50 chars shows validation message and does not persist
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 9.2, 9.3, 9.4, 9.5_

- [ ] 5. Implement `FocusTimer`
  - [ ] 5.1 Create `src/panels/FocusTimer.js` with `initFocusTimer(rootEl)`
    - Implement `formatCountdown(seconds)` — converts integer [0–1500] to "MM:SS"
    - Implement internal state `{ remaining: 1500, running: false, intervalId: null }`
    - Wire start, stop, and reset controls; start ignores clicks when already running
    - Implement `tick` — decrements `remaining`, stops at 0, calls `notifyEnd()`
    - Implement `notifyEnd()` — plays a short beep via Web Audio API
    - Timer state is NOT persisted to `localStorage`; always resets to 25:00 on page load
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ]* 5.2 Write property test for countdown format invariant (Property 4)
    - **Property 4: Countdown format invariant**
    - **Validates: Requirements 2.1, 2.3**
    - Use `fc.integer({ min: 0, max: 1500 })` and assert `formatCountdown(n)` matches `/^\d{2}:\d{2}$/`

  - [ ]* 5.3 Write unit tests for `FocusTimer`
    - `formatCountdown(0)` → `"00:00"`
    - `formatCountdown(1500)` → `"25:00"`
    - `formatCountdown(90)` → `"01:30"`
    - _Requirements: 2.1, 2.3_

- [ ] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement `TaskManager`
  - [ ] 7.1 Create `src/panels/TaskManager.js` with `initTaskManager(rootEl)`
    - Implement `validateDescription(text, tasks, excludeId?)` — returns `{ valid: false }` for empty/whitespace-only or >500-char strings; performs a trimmed, case-insensitive duplicate check against all tasks except the one with `excludeId` (used during edits so a task is not flagged as a duplicate of itself); returns `{ valid: true }` only when all checks pass
    - Implement `addTask`, `editTask`, `toggleComplete`, `deleteTask`
    - Implement `persist(tasks)` — calls `StorageService.write`; shows inline error on failure
    - Implement `render(rootEl, state)` — full re-render; completed tasks get strikethrough + distinct style; edit mode renders inline input
    - Load tasks from `StorageService.read` on init; display empty list (no error) if no data
    - Use event delegation on root container with `event.target.closest('[data-action]')`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 7.2 Write property test for task description validation — rejects invalid (Property 5)
    - **Property 5: Task description validation rejects invalid input**
    - **Validates: Requirements 3.2, 3.5**
    - Use `fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1 })` and `fc.string({ minLength: 501 })`; assert `validateDescription(text, [], undefined)` returns `{ valid: false }`

  - [ ]* 7.3 Write property test for task description validation — accepts valid (Property 6)
    - **Property 6: Task description validation accepts valid input**
    - **Validates: Requirements 3.1, 3.4**
    - Use `fc.string({ minLength: 1, maxLength: 500 })` filtered to non-whitespace-only; assert `validateDescription(text, [], undefined)` returns `{ valid: true }`

  - [ ]* 7.4 Write property test for toggle completion involution (Property 11)
    - **Property 11: Toggle completion is an involution**
    - **Validates: Requirements 3.6**
    - Use `fc.record({ id: fc.string(), description: fc.string(), completed: fc.boolean(), createdAt: fc.integer() })`; toggle twice; assert `completed` equals original value

  - [ ]* 7.5 Write property test for duplicate detection (Property 13)
    - **Property 13: Duplicate detection is case-insensitive and trim-insensitive**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
    - Generate a non-empty task list via `fc.array(fc.record({ id: fc.uuid(), description: fc.string({ minLength: 1, maxLength: 500 }), ... }), { minLength: 1 })` and pick a random existing description; generate a variant by randomly changing its case and/or adding leading/trailing whitespace; assert `validateDescription(variant, tasks, undefined)` returns `{ valid: false }`
    - Also generate descriptions that do not match any existing task (after trim+lowercase) and assert `{ valid: true }`
    - `// Feature: todo-dashboard, Property 13: duplicate detection is case-insensitive and trim-insensitive`

  - [ ]* 7.6 Write unit tests for `TaskManager`
    - `validateDescription("", [], undefined)` → invalid
    - `validateDescription("   ", [], undefined)` → invalid
    - `validateDescription("a".repeat(501), [], undefined)` → invalid
    - `validateDescription("Buy milk", [], undefined)` → valid
    - `validateDescription("buy milk", [{ description: "Buy Milk", ... }], undefined)` → invalid (duplicate, case-insensitive)
    - `validateDescription("  Buy Milk  ", [{ description: "buy milk", ... }], undefined)` → invalid (duplicate, trim-insensitive)
    - `validateDescription("Buy milk", [{ id: "1", description: "Buy Milk", ... }], "1")` → valid (editing same task, excluded from duplicate check)
    - `addTask` with valid input increases task list length by 1
    - `deleteTask` removes the correct task by id
    - `toggleComplete` flips the `completed` flag
    - _Requirements: 3.1, 3.2, 3.6, 3.7, 8.1, 8.2, 8.3, 8.4_

- [ ] 8. Implement `QuickLinksPanel`
  - [ ] 8.1 Create `src/panels/QuickLinksPanel.js` with `initQuickLinksPanel(rootEl)`
    - Implement `validateLink(label, url)` — validates label length (1–50), URL prefix (`http://` or `https://`), URL length (≤2048), duplicate check, and 50-item cap
    - Implement `addLink`, `deleteLink`
    - Implement `persist(links)` — calls `StorageService.write`; shows inline error and preserves displayed list on failure
    - Implement `render(rootEl, state)` — renders link buttons; clicking a button opens URL in new tab; delete control removes link
    - Load links from `StorageService.read` on init; display empty panel (no error) if no data
    - New link button appears within 300 ms of valid submission
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

  - [ ]* 8.2 Write property test for URL prefix validation (Property 9)
    - **Property 9: URL validation rejects non-http/https schemes**
    - **Validates: Requirements 4.3**
    - Use `fc.string()` filtered to strings not starting with `"http://"` or `"https://"`; assert `validateLink(label, url)` returns `{ valid: false }`

  - [ ]* 8.3 Write property test for link cap enforcement (Property 10)
    - **Property 10: Link cap enforcement**
    - **Validates: Requirements 4.10**
    - Generate a list of exactly 50 valid links; attempt `addLink` with a valid new entry; assert result is `{ ok: false }` and list length remains 50

  - [ ]* 8.4 Write unit tests for `QuickLinksPanel`
    - `validateLink("", "https://example.com")` → invalid
    - `validateLink("Example", "ftp://example.com")` → invalid
    - `validateLink("Example", "https://example.com")` → valid
    - `addLink` when list has 50 items → rejected
    - _Requirements: 4.1, 4.2, 4.3, 4.10_

- [ ] 9. Implement global error handling and `localStorage` unavailability banner
  - [ ] 9.1 Add `localStorage` availability check in `main.js`
    - Call `StorageService.isAvailable()` on startup
    - If unavailable, render a persistent non-blocking warning banner in the page
    - Panels continue operating with empty in-memory state
    - _Requirements: 5.4, 5.5_

  - [ ]* 9.2 Write unit tests for unavailability and corrupted JSON paths
    - Mock `localStorage` to throw on `getItem`/`setItem`; assert warning banner appears
    - Mock `localStorage.getItem` to return invalid JSON; assert panels load with empty state
    - _Requirements: 5.4_

- [ ] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use [fast-check](https://github.com/dubzzz/fast-check) and validate universal correctness properties (minimum 100 iterations each)
- Unit tests use [Vitest](https://vitest.dev/) and validate specific examples and edge cases
- Timer state is intentionally not persisted — it always resets to 25:00 on page load (Requirement 2.8)
- All error messages are inline; no modal dialogs or page-blocking alerts
- `ThemeService` depends on `StorageService` and must be initialised after it; `ThemeService.load()` + `ThemeService.apply()` are called in `main.js` before any panel renders (Requirement 7.5)
- `validateDescription` now accepts `(text, tasks, excludeId?)` — the `excludeId` parameter prevents a task from being flagged as a duplicate of itself during edits (Requirements 8.1–8.4)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1", "5.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "5.2", "5.3", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "9.1"] },
    { "id": 7, "tasks": ["9.2"] }
  ]
}
```
