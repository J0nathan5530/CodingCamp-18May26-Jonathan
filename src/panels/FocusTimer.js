/**
 * FocusTimer — 25-minute Pomodoro countdown timer.
 * Timer state is NOT persisted; always resets to 25:00 on page load.
 *
 * Implemented in Task 5.1.
 */

export function initFocusTimer(rootEl) {
  // TODO: implement in Task 5.1
  rootEl.innerHTML = `<h2>Focus Timer</h2><p class="timer-display">25:00</p>`;
}
