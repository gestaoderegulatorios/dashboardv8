// State: UI persistence (sidebar + theme). Single source of truth.
// Movido de ui/sidebar.js e ui/dark-mode.js (Pós-auditoria P1.1).
// Views/UI módulos leem via store; store carrega via loadUIState() no boot.

import { STORAGE_PREFIX } from './branding.js';

const STORAGE_KEY_SIDEBAR = `${STORAGE_PREFIX}-sidebar-open`;
const STORAGE_KEY_THEME = `${STORAGE_PREFIX}-theme`;

/**
 * @typedef {Object} UIState
 * @property {boolean} sidebarOpen
 * @property {'light'|'dark'} theme
 */

/** @returns {UIState} */
/** Carrega estado da UI (sidebar + tema) a partir do armazenamento local. */
export function loadUIState() {
  let sidebarOpen = false;
  try { sidebarOpen = localStorage.getItem(STORAGE_KEY_SIDEBAR) === '1'; } catch { /* noop: localStorage unavailable in private browsing mode */ }

  /** @type {'light'|'dark'} */
  let theme = 'light';
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') {
      theme = saved;
    } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch { /* noop: localStorage unavailable in private browsing mode */ }

  return { sidebarOpen, theme };
}

/** @param {UIState} ui */
/** Persiste estado da UI no armazenamento local. */
export function saveUIState(ui) {
try { localStorage.setItem(STORAGE_KEY_SIDEBAR, ui.sidebarOpen ? '1' : '0'); } catch { /* noop: localStorage unavailable in private browsing mode */ }
try { localStorage.setItem(STORAGE_KEY_THEME, ui.theme); } catch { /* noop: localStorage unavailable in private browsing mode */ }
}

/** Exporta as chaves de armazenamento de UI */
export { STORAGE_KEY_SIDEBAR, STORAGE_KEY_THEME };
