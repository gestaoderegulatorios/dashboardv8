// View: Shared utilities. Funções comuns extraídas de views para eliminar duplicação.
// Fase 4: escape() era duplicado em 7 arquivos; showToast() em 2 arquivos.

/**
 * HTML-escape para prevenir XSS em templates de string.
 * @param {string|number|undefined|null} s
 * @returns {string}
 */
export function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

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
  setTimeout(() => { try { container.removeChild(el); } catch {} }, 2600);
}
