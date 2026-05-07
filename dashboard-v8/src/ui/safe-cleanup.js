// Safe cleanup utilities (F1.1 — Audit-Fix: Error Handling).
// Centralizes intentional catch-and-ignore patterns with explicit rationale.
// All "empty catch" cleanup logic lives here so the reason is documented once.

/**
 * Safely destroy an ApexCharts handle or any object with .destroy().
 * noop: chart may already be destroyed or uninitialized — cleanup is best-effort.
 * @param {{ destroy?: () => void } | null | undefined} handle
 */
export function safeDestroy(handle) {
  try { if (handle && typeof handle.destroy === 'function') handle.destroy(); }
  catch { /* noop: cleanup — resource already released or uninitialized */ }
}

/**
 * Safely disconnect a ResizeObserver, IntersectionObserver, or similar.
 * noop: observer may already be disconnected or null — cleanup is best-effort.
 * @param {{ disconnect?: () => void } | null | undefined} observer
 */
export function safeDisconnect(observer) {
  try { if (observer && typeof observer.disconnect === 'function') observer.disconnect(); }
  catch { /* noop: cleanup — observer already disconnected */ }
}

/**
 * Safely call an unsubscribe function returned by store.subscribe().
 * noop: subscription may already be torn down — cleanup is best-effort.
 * @param {(() => void) | null | undefined} fn
 */
export function safeCall(fn) {
  try { if (typeof fn === 'function') fn(); }
  catch { /* noop: cleanup — function threw after subscription ended */ }
}

/**
 * Safely update chart options (ApexCharts updateOptions).
 * noop: chart may be mid-destroy or already unmounted — update is best-effort.
 * @param {{ updateOptions?: (...args: any[]) => void } | null | undefined} handle
 * @param {object} opts
 * @param {...any} args
 */
export function safeUpdate(handle, opts, ...args) {
  try { if (handle && typeof handle.updateOptions === 'function') handle.updateOptions(opts, ...args); }
  catch { /* noop: chart update after destroy — non-critical */ }
}

/**
 * Safely update chart series (ApexCharts updateSeries).
 * noop: chart may be mid-destroy — update is best-effort.
 * @param {{ updateSeries?: (...args: any[]) => void } | null | undefined} handle
 * @param {any} series
 * @param {...any} args
 */
export function safeUpdateSeries(handle, series, ...args) {
  try { if (handle && typeof handle.updateSeries === 'function') handle.updateSeries(series, ...args); }
  catch { /* noop: chart series update after destroy — non-critical */ }
}

/**
 * Safely remove a DOM element from its parent.
 * noop: element may already be removed from DOM — cleanup is best-effort.
 * @param {Element | null | undefined} el
 */
export function safeRemove(el) {
  try { if (el && el.parentNode) el.parentNode.removeChild(el); }
  catch { /* noop: cleanup — DOM element already removed */ }
}

/**
 * Safely focus a DOM element.
 * noop: element may be hidden, disconnected, or not focusable — best-effort.
 * @param {HTMLElement | null | undefined} el
 */
export function safeFocus(el) {
  try { if (el && typeof el.focus === 'function') el.focus(); }
  catch { /* noop: element not focusable or already removed */ }
}
