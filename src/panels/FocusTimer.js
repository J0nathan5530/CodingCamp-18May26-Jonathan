/**
 * FocusTimer — 25-minute Pomodoro countdown timer.
 * Timer state is NOT persisted; always resets to 25:00 on page load.
 *
 * Requirements: 2.1–2.8
 */

/**
 * Converts an integer number of seconds [0–1500] to "MM:SS" format.
 * Both minutes and seconds are always zero-padded to 2 digits.
 *
 * @param {number} seconds - Integer in [0, 1500]
 * @returns {string} e.g. "25:00", "01:30", "00:00"
 */
export function formatCountdown(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Plays a short beep using the Web Audio API (no external file required).
 * Silently no-ops if the Web Audio API is unavailable.
 */
function notifyEnd() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.8);

    oscillator.onended = () => ctx.close();
  } catch (_) {
    // Web Audio API unavailable — silently skip the beep
  }
}

/**
 * Initialises the Focus Timer panel inside `rootEl`.
 *
 * @param {HTMLElement} rootEl - The panel's root DOM element
 */
export function initFocusTimer(rootEl) {
  /** @type {{ remaining: number, running: boolean, intervalId: number|null }} */
  const state = {
    remaining: 1500, // 25 * 60 seconds
    running: false,
    intervalId: null,
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  function render() {
    rootEl.innerHTML = `
      <h2>Focus Timer</h2>
      <div class="timer-display" aria-live="polite" aria-atomic="true">
        ${formatCountdown(state.remaining)}
      </div>
      <div class="timer-controls">
        <button class="btn btn--primary" data-action="start" aria-label="Start timer">Start</button>
        <button class="btn btn--secondary" data-action="stop" aria-label="Stop timer">Stop</button>
        <button class="btn btn--secondary" data-action="reset" aria-label="Reset timer">Reset</button>
      </div>
    `;
  }

  // ── Tick ────────────────────────────────────────────────────────────────────

  function tick() {
    state.remaining -= 1;

    // Update only the display text to avoid re-rendering and losing event listeners
    const display = rootEl.querySelector('.timer-display');
    if (display) {
      display.textContent = formatCountdown(state.remaining);
    }

    if (state.remaining <= 0) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      state.running = false;
      notifyEnd();
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  function start() {
    if (state.running) return; // Requirement 2.7 — ignore if already running
    state.running = true;
    state.intervalId = setInterval(tick, 1000);
  }

  function stop() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.running = false;
    render();
  }

  function reset() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.remaining = 1500;
    state.running = false;
    render();
  }

  // ── Event delegation ─────────────────────────────────────────────────────────

  rootEl.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;

    switch (btn.dataset.action) {
      case 'start': start(); break;
      case 'stop':  stop();  break;
      case 'reset': reset(); break;
    }
  });

  // ── Initial render ───────────────────────────────────────────────────────────
  render();
}
