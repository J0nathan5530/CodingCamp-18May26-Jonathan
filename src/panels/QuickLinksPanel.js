/**
 * QuickLinksPanel — user-defined shortcut buttons to external URLs.
 *
 * Requirements: 4.1–4.10
 */

import { StorageService } from '../services/StorageService.js';

const STORAGE_KEY = 'todo_dashboard_links';
const MAX_LINKS = 50;
const MAX_LABEL_LENGTH = 50;
const MAX_URL_LENGTH = 2048;

/**
 * Validate a label and URL for a new link.
 *
 * @param {string} label
 * @param {string} url
 * @param {Array<{id: string, label: string, url: string, createdAt: number}>} links - existing links for duplicate/cap checks
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateLink(label, url, links = []) {
  const trimmedLabel = typeof label === 'string' ? label.trim() : '';
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';

  // Label: non-empty and ≤ 50 chars
  if (trimmedLabel.length === 0) {
    return { valid: false, error: 'Label is required.' };
  }
  if (trimmedLabel.length > MAX_LABEL_LENGTH) {
    return { valid: false, error: `Label must be ${MAX_LABEL_LENGTH} characters or fewer.` };
  }

  // URL: non-empty
  if (trimmedUrl.length === 0) {
    return { valid: false, error: 'URL is required.' };
  }

  // URL: must start with http:// or https://
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return { valid: false, error: 'URL must begin with "http://" or "https://".' };
  }

  // URL: max 2048 chars
  if (trimmedUrl.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL must be ${MAX_URL_LENGTH} characters or fewer.` };
  }

  // Duplicate URL check
  const isDuplicate = links.some(link => link.url === trimmedUrl);
  if (isDuplicate) {
    return { valid: false, error: 'A link with this URL already exists.' };
  }

  // 50-item cap
  if (links.length >= MAX_LINKS) {
    return { valid: false, error: `Maximum of ${MAX_LINKS} links reached.` };
  }

  return { valid: true, error: null };
}

/**
 * Render the Quick Links panel into rootEl based on current state.
 *
 * @param {HTMLElement} rootEl
 * @param {{ links: Array<{id: string, label: string, url: string, createdAt: number}>, errorMessage: string | null }} state
 */
function render(rootEl, state) {
  const { links, errorMessage } = state;

  rootEl.innerHTML = `
    <h2>Quick Links</h2>

    <form class="link-form" data-form="add-link" novalidate>
      <div class="link-form-row">
        <input
          class="input"
          type="text"
          data-field="label"
          placeholder="Label (e.g. GitHub)"
          maxlength="${MAX_LABEL_LENGTH}"
          aria-label="Link label"
        />
        <input
          class="input"
          type="url"
          data-field="url"
          placeholder="https://example.com"
          aria-label="Link URL"
        />
        <button type="submit" class="btn btn--primary btn--small">Add</button>
      </div>
      <span class="inline-error" data-error="add-link" role="alert">${errorMessage || ''}</span>
    </form>

    <div class="links-grid" data-container="links">
      ${links.length === 0
        ? '<p style="color: var(--color-text-secondary); font-size: 0.875rem;">No links yet.</p>'
        : links.map(link => `
          <div class="link-btn-wrapper" data-link-id="${link.id}">
            <button
              class="link-btn"
              data-action="open-link"
              data-url="${escapeAttr(link.url)}"
              title="${escapeAttr(link.url)}"
            >${escapeHtml(link.label)}</button>
            <button
              class="link-delete-btn"
              data-action="delete-link"
              data-id="${link.id}"
              aria-label="Delete ${escapeAttr(link.label)}"
              title="Delete"
            >✕</button>
          </div>
        `).join('')
      }
    </div>
  `;
}

/**
 * Escape a string for safe use in HTML attribute values.
 * @param {string} str
 * @returns {string}
 */
function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape a string for safe use as HTML text content.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Persist the link list to localStorage.
 * Shows an inline error and preserves the displayed list on failure.
 *
 * @param {HTMLElement} rootEl
 * @param {Array} links
 * @param {{ links: Array, errorMessage: string | null }} state
 */
function persist(links, rootEl, state) {
  const result = StorageService.write(STORAGE_KEY, links);
  if (!result.ok) {
    state.errorMessage = 'Could not save links: ' + (result.error || 'unknown error');
    render(rootEl, state);
  }
}

/**
 * Initialise the Quick Links panel.
 *
 * @param {HTMLElement} rootEl
 */
export function initQuickLinksPanel(rootEl) {
  /** @type {{ links: Array<{id: string, label: string, url: string, createdAt: number}>, errorMessage: string | null }} */
  const state = {
    links: StorageService.read(STORAGE_KEY, []),
    errorMessage: null,
  };

  // Initial render
  render(rootEl, state);

  // --- addLink ---
  function addLink(label, url) {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    const validation = validateLink(trimmedLabel, trimmedUrl, state.links);
    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    const newLink = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString(),
      label: trimmedLabel,
      url: trimmedUrl,
      createdAt: Date.now(),
    };

    state.links = [...state.links, newLink];
    return { ok: true, error: null };
  }

  // --- deleteLink ---
  function deleteLink(id) {
    state.links = state.links.filter(link => link.id !== id);
  }

  // --- Event delegation ---
  rootEl.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-form="add-link"]');
    if (!form) return;
    event.preventDefault();

    const labelInput = form.querySelector('[data-field="label"]');
    const urlInput = form.querySelector('[data-field="url"]');
    const label = labelInput ? labelInput.value : '';
    const url = urlInput ? urlInput.value : '';

    // Clear previous error
    state.errorMessage = null;

    const result = addLink(label, url);
    if (!result.ok) {
      state.errorMessage = result.error;
      render(rootEl, state);
      return;
    }

    // Persist — render happens inside persist on failure, or we render on success
    const writeResult = StorageService.write(STORAGE_KEY, state.links);
    if (!writeResult.ok) {
      // Revert the optimistic add
      state.links = state.links.slice(0, -1);
      state.errorMessage = 'Could not save links: ' + (writeResult.error || 'unknown error');
      render(rootEl, state);
      return;
    }

    // Success — re-render (new button appears within 300ms per Req 4.1)
    render(rootEl, state);
  });

  rootEl.addEventListener('click', (event) => {
    // Open link in new tab
    const openBtn = event.target.closest('[data-action="open-link"]');
    if (openBtn) {
      const url = openBtn.dataset.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    // Delete link
    const deleteBtn = event.target.closest('[data-action="delete-link"]');
    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      if (!id) return;

      deleteLink(id);
      state.errorMessage = null;

      const writeResult = StorageService.write(STORAGE_KEY, state.links);
      if (!writeResult.ok) {
        state.errorMessage = 'Could not save links: ' + (writeResult.error || 'unknown error');
      }

      render(rootEl, state);
    }
  });
}
