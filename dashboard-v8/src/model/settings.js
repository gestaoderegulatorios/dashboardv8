// State: Settings persistence. Single source of truth for user preferences.
// Moved from view/settings.js (Fase 3 — boundary fix: view/ não deve ter lógica de persistência).
// Views leem settings via store; store carrega via loadSettings() no boot.

import { BRANDING_DEFAULTS, STORAGE_PREFIX } from './branding.js';

const STORAGE_KEY = `${STORAGE_PREFIX}-settings-v8`;

// Build defaults from branding defaults + non-branding defaults
const DEFAULTS = {
  ...BRANDING_DEFAULTS,
  animations: true,
  visibility: '{}'
};

/**
 * Carrega settings do localStorage, merge com DEFAULTS.
 * Remove chaves órfãs (ex.: visibility — removido na Fase 2).
 * @returns {typeof DEFAULTS}
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Persiste settings no localStorage.
 * @param {typeof DEFAULTS} settings
 * @returns {boolean} true se persistiu com sucesso
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

export { DEFAULTS, STORAGE_KEY };
