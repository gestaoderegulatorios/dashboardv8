// View: Shared utilities. Funções comuns extraídas de views para eliminar duplicação.
// Fase 4: escape() era duplicado em 7 arquivos; showToast() em 2 arquivos.
// F2.1: escape() moved to domain/escape.js — re-exported here for backward compat.

import { escape } from '../domain/escape.js';
import { safeRemove } from '../ui/safe-cleanup.js';

export { escape } from '../domain/escape.js';

/**
 * Exibe toast temporário no container #toast-container.
 * @param {string} msg
 * @param {'success'|'error'|'info'} [kind='info']
 */
export function showToast(msg, kind = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const palette = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-error border-red-200',
    info: 'bg-surface-container-lowest text-primary border-outline-variant'
  };
  const cls = palette[kind] || palette.info;
  const el = document.createElement('div');
  el.className = `toast-animate ${cls} px-4 py-3 rounded-xl shadow-sm border text-sm font-semibold flex items-center gap-2 max-w-sm`;
  el.setAttribute('role', 'status');
  const icon = kind === 'success' ? 'check_circle' : (kind === 'error' ? 'error' : 'info');
  el.innerHTML = `<span class="material-symbols-outlined text-base" aria-hidden="true">${icon}</span><span>${escape(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity 240ms'; el.style.opacity = '0'; }, 2200);
  setTimeout(() => { safeRemove(el); }, 2600);
}

/**
 * Dispara download de CSV no browser.
 * Moved from domain/table.js (F2.2) — DOM access doesn't belong in domain/.
 * @param {string} filename
 * @param {string} csvText
 */
export function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
