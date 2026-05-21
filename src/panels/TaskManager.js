/**
 * TaskManager — full CRUD to-do list with localStorage persistence.
 *
 * Requirements: 3.1–3.12, 8.1–8.4
 * Implemented in Task 7.1.
 */

import { StorageService } from '../services/StorageService.js';

const STORAGE_KEY = 'todo_dashboard_tasks';
const MAX_DESCRIPTION_LENGTH = 500;

// ── Validation ───────────────────────────────────────────────────────────────

/**
 * Validate a task description.
 *
 * Returns `{ valid: false, error: string }` when:
 *   - the text is empty or whitespace-only
 *   - the trimmed text exceeds 500 characters
 *   - the trimmed, lowercased text matches an existing task (excluding `excludeId`)
 *
 * Returns `{ valid: true, error: null }` when all checks pass.
 *
 * @param {string} text
 * @param {Array<{id: string, description: string}>} tasks
 * @param {string|undefined} excludeId - id of the task being edited (excluded from duplicate check)
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateDescription(text, tasks, excludeId) {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Task description cannot be empty.' };
  }

  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Task description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  const normalised = trimmed.toLowerCase();
  const isDuplicate = tasks.some(
    (t) => t.id !== excludeId && t.description.trim().toLowerCase() === normalised
  );

  if (isDuplicate) {
    return { valid: false, error: 'A task with this description already exists.' };
  }

  return { valid: true, error: null };
}

// ── Task operations ──────────────────────────────────────────────────────────

/**
 * Generate a unique id for a new task.
 * @returns {string}
 */
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString() + Math.random().toString(36).slice(2);
}

/**
 * Add a new task to the list.
 * @param {string} description
 * @param {Array} tasks
 * @returns {{ ok: boolean, tasks?: Array, error?: string }}
 */
function addTask(description, tasks) {
  const validation = validateDescription(description, tasks, undefined);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const newTask = {
    id: generateId(),
    description: description.trim(),
    completed: false,
    createdAt: Date.now(),
  };

  return { ok: true, tasks: [...tasks, newTask] };
}

/**
 * Edit an existing task's description.
 * @param {string} id
 * @param {string} description
 * @param {Array} tasks
 * @returns {{ ok: boolean, tasks?: Array, error?: string }}
 */
function editTask(id, description, tasks) {
  const validation = validateDescription(description, tasks, id);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const updated = tasks.map((t) =>
    t.id === id ? { ...t, description: description.trim() } : t
  );

  return { ok: true, tasks: updated };
}

/**
 * Toggle the completed status of a task.
 * @param {string} id
 * @param {Array} tasks
 * @returns {Array}
 */
function toggleComplete(id, tasks) {
  return tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}

/**
 * Delete a task by id.
 * @param {string} id
 * @param {Array} tasks
 * @returns {Array}
 */
function deleteTask(id, tasks) {
  return tasks.filter((t) => t.id !== id);
}

// ── Persistence ──────────────────────────────────────────────────────────────

/**
 * Persist the task list to localStorage.
 * Shows an inline error in `errorEl` on failure.
 *
 * @param {Array} tasks
 * @param {HTMLElement} errorEl
 */
function persist(tasks, errorEl) {
  const result = StorageService.write(STORAGE_KEY, tasks);
  if (!result.ok) {
    if (errorEl) {
      errorEl.textContent = 'Task list could not be saved.';
    }
  } else {
    if (errorEl) {
      errorEl.textContent = '';
    }
  }
}

// ── Rendering ────────────────────────────────────────────────────────────────

/**
 * Full re-render of the task manager panel.
 *
 * @param {HTMLElement} rootEl
 * @param {{ tasks: Array, editingId: string|null }} state
 */
function render(rootEl, state) {
  const { tasks, editingId } = state;

  rootEl.innerHTML = `
    <h2>Tasks</h2>

    <div class="task-form">
      <input
        class="input"
        type="text"
        placeholder="Add a new task…"
        data-ref="add-input"
        maxlength="600"
        aria-label="New task description"
      />
      <button class="btn btn--primary btn--small" data-action="add-task" aria-label="Add task">Add</button>
    </div>

    <span class="inline-error" data-ref="add-error" role="alert"></span>
    <span class="inline-error" data-ref="persist-error" role="alert"></span>

    <ul class="task-list" aria-label="Task list">
      ${tasks.length === 0 ? '<li class="task-item" style="color:var(--color-text-secondary);font-size:0.875rem;">No tasks yet.</li>' : tasks.map((task) => renderTask(task, editingId)).join('')}
    </ul>
  `;
}

/**
 * Render a single task item as an HTML string.
 *
 * @param {{ id: string, description: string, completed: boolean }} task
 * @param {string|null} editingId
 * @returns {string}
 */
function renderTask(task, editingId) {
  const isEditing = task.id === editingId;
  const completedClass = task.completed ? ' task-item--completed' : '';

  if (isEditing) {
    return `
      <li class="task-item${completedClass}" data-task-id="${escapeAttr(task.id)}">
        <input
          class="input"
          type="text"
          value="${escapeAttr(task.description)}"
          data-ref="edit-input"
          maxlength="600"
          aria-label="Edit task description"
          style="flex:1;"
        />
        <div class="task-actions">
          <button class="btn btn--primary btn--small" data-action="save-edit" data-task-id="${escapeAttr(task.id)}" aria-label="Save edit">Save</button>
          <button class="btn btn--secondary btn--small" data-action="cancel-edit" data-task-id="${escapeAttr(task.id)}" aria-label="Cancel edit">Cancel</button>
        </div>
        <span class="inline-error" data-ref="edit-error" role="alert" style="display:block;width:100%;"></span>
      </li>
    `;
  }

  return `
    <li class="task-item${completedClass}" data-task-id="${escapeAttr(task.id)}">
      <span class="task-text">${escapeHtml(task.description)}</span>
      <div class="task-actions">
        <button
          class="btn btn--secondary btn--small"
          data-action="toggle-complete"
          data-task-id="${escapeAttr(task.id)}"
          aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
          title="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
        >${task.completed ? '↩' : '✓'}</button>
        <button
          class="btn btn--secondary btn--small"
          data-action="edit-task"
          data-task-id="${escapeAttr(task.id)}"
          aria-label="Edit task"
          title="Edit"
        >✏️</button>
        <button
          class="btn btn--danger btn--small"
          data-action="delete-task"
          data-task-id="${escapeAttr(task.id)}"
          aria-label="Delete task"
          title="Delete"
        >🗑</button>
      </div>
    </li>
  `;
}

// ── Escape helpers ───────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────────────────────────

/**
 * Initialise the Task Manager panel.
 *
 * @param {HTMLElement} rootEl
 */
export function initTaskManager(rootEl) {
  // Internal state
  const state = {
    tasks: StorageService.read(STORAGE_KEY, []),
    editingId: null,
  };

  // Initial render
  render(rootEl, state);

  // ── Event delegation ───────────────────────────────────────────────────────
  rootEl.addEventListener('click', (event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    const taskId = actionEl.dataset.taskId;

    // Resolve shared error elements (re-query after each render)
    const addError = rootEl.querySelector('[data-ref="add-error"]');
    const persistError = rootEl.querySelector('[data-ref="persist-error"]');

    switch (action) {
      case 'add-task': {
        const input = rootEl.querySelector('[data-ref="add-input"]');
        if (!input) break;

        const text = input.value;
        const result = addTask(text, state.tasks);

        if (!result.ok) {
          if (addError) addError.textContent = result.error;
          break;
        }

        if (addError) addError.textContent = '';
        state.tasks = result.tasks;
        persist(state.tasks, persistError);
        render(rootEl, state);
        // Focus the add input again for quick successive entries
        const newInput = rootEl.querySelector('[data-ref="add-input"]');
        if (newInput) newInput.focus();
        break;
      }

      case 'edit-task': {
        state.editingId = taskId;
        render(rootEl, state);
        // Focus the edit input
        const editInput = rootEl.querySelector('[data-ref="edit-input"]');
        if (editInput) {
          editInput.focus();
          // Place cursor at end
          const len = editInput.value.length;
          editInput.setSelectionRange(len, len);
        }
        break;
      }

      case 'save-edit': {
        const editInput = rootEl.querySelector('[data-ref="edit-input"]');
        if (!editInput) break;

        const text = editInput.value;
        const result = editTask(taskId, text, state.tasks);

        if (!result.ok) {
          const editError = rootEl.querySelector('[data-ref="edit-error"]');
          if (editError) editError.textContent = result.error;
          break;
        }

        state.tasks = result.tasks;
        state.editingId = null;
        persist(state.tasks, rootEl.querySelector('[data-ref="persist-error"]'));
        render(rootEl, state);
        break;
      }

      case 'cancel-edit': {
        state.editingId = null;
        render(rootEl, state);
        break;
      }

      case 'toggle-complete': {
        state.tasks = toggleComplete(taskId, state.tasks);
        persist(state.tasks, persistError);
        render(rootEl, state);
        break;
      }

      case 'delete-task': {
        state.tasks = deleteTask(taskId, state.tasks);
        // If we were editing this task, clear edit mode
        if (state.editingId === taskId) {
          state.editingId = null;
        }
        persist(state.tasks, persistError);
        render(rootEl, state);
        break;
      }

      default:
        break;
    }
  });

  // Allow pressing Enter in the add input to submit
  rootEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    const target = event.target;

    if (target.matches('[data-ref="add-input"]')) {
      event.preventDefault();
      const addBtn = rootEl.querySelector('[data-action="add-task"]');
      if (addBtn) addBtn.click();
      return;
    }

    if (target.matches('[data-ref="edit-input"]')) {
      event.preventDefault();
      // Find the save button for the task currently in edit mode
      const saveBtn = rootEl.querySelector('[data-action="save-edit"]');
      if (saveBtn) saveBtn.click();
      return;
    }
  });
}
