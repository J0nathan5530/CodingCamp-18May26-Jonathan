/**
 * Unit tests for StorageService
 * Requirements: 5.3, 5.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from '../services/StorageService.js';

// ---------------------------------------------------------------------------
// localStorage mock helpers
// ---------------------------------------------------------------------------

function createLocalStorageMock() {
  let store = {};
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _store: () => store,
  };
}

let localStorageMock;

beforeEach(() => {
  localStorageMock = createLocalStorageMock();
  vi.stubGlobal('localStorage', localStorageMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Round-trip tests
// ---------------------------------------------------------------------------

describe('StorageService — write then read round-trip', () => {
  it('round-trips a task list (tasks key)', () => {
    const tasks = [
      { id: '1', description: 'Buy milk', completed: false, createdAt: 1000 },
      { id: '2', description: 'Walk the dog', completed: true, createdAt: 2000 },
    ];

    const writeResult = StorageService.write('todo_dashboard_tasks', tasks);
    expect(writeResult.ok).toBe(true);

    const readResult = StorageService.read('todo_dashboard_tasks', []);
    expect(readResult).toEqual(tasks);
  });

  it('round-trips a link list (links key)', () => {
    const links = [
      { id: 'a', label: 'GitHub', url: 'https://github.com', createdAt: 3000 },
      { id: 'b', label: 'MDN', url: 'https://developer.mozilla.org', createdAt: 4000 },
    ];

    const writeResult = StorageService.write('todo_dashboard_links', links);
    expect(writeResult.ok).toBe(true);

    const readResult = StorageService.read('todo_dashboard_links', []);
    expect(readResult).toEqual(links);
  });

  it('preserves all task fields after round-trip', () => {
    const task = { id: 'xyz', description: 'Test task', completed: true, createdAt: 9999 };

    StorageService.write('todo_dashboard_tasks', [task]);
    const [readBack] = StorageService.read('todo_dashboard_tasks', []);

    expect(readBack.id).toBe(task.id);
    expect(readBack.description).toBe(task.description);
    expect(readBack.completed).toBe(task.completed);
    expect(readBack.createdAt).toBe(task.createdAt);
  });

  it('preserves all link fields after round-trip', () => {
    const link = { id: 'lnk1', label: 'Example', url: 'https://example.com', createdAt: 5555 };

    StorageService.write('todo_dashboard_links', [link]);
    const [readBack] = StorageService.read('todo_dashboard_links', []);

    expect(readBack.id).toBe(link.id);
    expect(readBack.label).toBe(link.label);
    expect(readBack.url).toBe(link.url);
    expect(readBack.createdAt).toBe(link.createdAt);
  });
});

// ---------------------------------------------------------------------------
// Missing key — fallback
// ---------------------------------------------------------------------------

describe('StorageService.read — missing key returns fallback', () => {
  it('returns the default fallback (null) when key is absent', () => {
    const result = StorageService.read('nonexistent_key');
    expect(result).toBeNull();
  });

  it('returns a custom array fallback when key is absent', () => {
    const result = StorageService.read('nonexistent_key', []);
    expect(result).toEqual([]);
  });

  it('returns a custom object fallback when key is absent', () => {
    const fallback = { default: true };
    const result = StorageService.read('nonexistent_key', fallback);
    expect(result).toEqual(fallback);
  });

  it('returns a custom string fallback when key is absent', () => {
    const result = StorageService.read('nonexistent_key', 'light');
    expect(result).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// Corrupted JSON — fallback
// ---------------------------------------------------------------------------

describe('StorageService.read — corrupted JSON returns fallback', () => {
  it('returns null fallback when stored value is not valid JSON', () => {
    // Directly inject corrupted data into the mock store
    localStorageMock.setItem('bad_key', 'not-valid-json{{{');
    // Reset the call count so we can verify getItem is called
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{');

    const result = StorageService.read('bad_key');
    expect(result).toBeNull();
  });

  it('returns custom fallback when stored value is corrupted JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('{broken: json}');

    const result = StorageService.read('bad_key', []);
    expect(result).toEqual([]);
  });

  it('returns fallback for truncated JSON', () => {
    localStorageMock.getItem.mockReturnValueOnce('[{"id":"1","description":"Buy milk"');

    const result = StorageService.read('bad_key', []);
    expect(result).toEqual([]);
  });

  it('returns fallback for empty-string stored value (not valid JSON)', () => {
    localStorageMock.getItem.mockReturnValueOnce('');

    const result = StorageService.read('bad_key', 'fallback');
    // Empty string is not valid JSON — JSON.parse('') throws
    expect(result).toBe('fallback');
  });
});

// ---------------------------------------------------------------------------
// write — error handling
// ---------------------------------------------------------------------------

describe('StorageService.write — error handling', () => {
  it('returns { ok: true } on a successful write', () => {
    const result = StorageService.write('some_key', { data: 42 });
    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns { ok: false, error } when localStorage.setItem throws', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException('QuotaExceededError');
    });

    const result = StorageService.write('some_key', { data: 42 });
    expect(result.ok).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});
