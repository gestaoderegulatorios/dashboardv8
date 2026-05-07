// Domain: HTML-escape utility. Pure function — no DOM dependency.
// Moved from view/shared.js (F2.1 — Audit-Fix: Layer Separation).
// Domain modules must not import from view/ — this resolves that violation.

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
