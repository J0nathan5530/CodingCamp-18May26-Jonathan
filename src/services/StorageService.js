/**
 * StorageService — thin wrapper around localStorage.
 * Handles serialisation, deserialisation, and error recovery.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

export const StorageService = {
  /**
   * Read and deserialise a value from localStorage.
   * Returns `fallback` when the key is absent, the stored value is null,
   * or the JSON cannot be parsed.
   *
   * @param {string} key
   * @param {*} fallback - returned when key is absent or JSON is unparseable
   * @returns {*}
   */
  read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  /**
   * Serialise and write a value to localStorage.
   * Returns `{ ok: true }` on success or `{ ok: false, error: string }` on failure.
   *
   * @param {string} key
   * @param {*} value
   * @returns {{ ok: boolean, error?: string }}
   */
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  },

  /**
   * Probe localStorage to determine if it is available and writable.
   * Performs a test write and delete; returns false if either throws.
   *
   * @returns {boolean}
   */
  isAvailable() {
    const TEST_KEY = '__storage_probe__';
    try {
      localStorage.setItem(TEST_KEY, '1');
      localStorage.removeItem(TEST_KEY);
      return true;
    } catch {
      return false;
    }
  },
};
