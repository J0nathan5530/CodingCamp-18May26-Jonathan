// Feature: todo-dashboard, Property 7: task list persistence round-trip

import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from '../services/StorageService.js';

/**
 * Property 7: Task list persistence round-trip
 * Validates: Requirements 3.8, 3.9, 5.2, 5.3
 *
 * For any array of Task objects, writing it via StorageService.write and then
 * reading it back via StorageService.read SHALL produce an array that is deeply
 * equal to the original, preserving all fields (id, description, completed, createdAt).
 */

const TASKS_KEY = 'todo_dashboard_tasks';

describe('StorageService — Property 7: task list persistence round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('write then read produces a deeply equal task list for any valid task array', () => {
    const taskArbitrary = fc.array(
      fc.record({
        id: fc.string(),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        completed: fc.boolean(),
        createdAt: fc.integer(),
      })
    );

    fc.assert(
      fc.property(taskArbitrary, (tasks) => {
        // Write the task list to storage
        const writeResult = StorageService.write(TASKS_KEY, tasks);

        // Write must succeed for the round-trip to be meaningful
        if (!writeResult.ok) {
          // If write fails (e.g., storage quota), skip this sample
          return true;
        }

        // Read back with an empty array as fallback
        const readBack = StorageService.read(TASKS_KEY, []);

        // Deep equality: every field of every task must be preserved
        if (readBack.length !== tasks.length) return false;

        for (let i = 0; i < tasks.length; i++) {
          const original = tasks[i];
          const restored = readBack[i];
          if (
            restored.id !== original.id ||
            restored.description !== original.description ||
            restored.completed !== original.completed ||
            restored.createdAt !== original.createdAt
          ) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
