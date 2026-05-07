// Telemetry module (F1.3 — Audit-Fix: Observabilidade).
// Captures uncaught errors and unhandled promise rejections.
// Emits events on the bus for downstream consumers (health, future Sentry, etc.).
// Zero external deps — lightweight, production-safe.

import { emit } from './bus.js';

const _errors = [];
const MAX_ERRORS = 50;
let _mounted = false;

/**
 * Initialize telemetry hooks. Call once at boot, before any view logic.
 * Installs window.onerror and window.unhandledrejection handlers.
 */
export function initTelemetry() {
  if (_mounted) return;
  _mounted = true;

  window.onerror = function handler(message, source, lineno, colno, error) {
    const entry = {
      type: 'error',
      message: String(message),
      source: source || '',
      lineno: lineno || 0,
      colno: colno || 0,
      stack: error?.stack || '',
      ts: Date.now()
    };
    _errors.push(entry);
    if (_errors.length > MAX_ERRORS) _errors.shift();
    console.error('[telemetry]', entry.message, entry.source + ':' + entry.lineno);
    try { emit('telemetry:error', entry); } catch { /* bus not ready — silent */ }
    return false; // let browser default handler also run
  };

  window.addEventListener('unhandledrejection', function handler(event) {
    const entry = {
      type: 'unhandledrejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      ts: Date.now()
    };
    _errors.push(entry);
    if (_errors.length > MAX_ERRORS) _errors.shift();
    console.error('[telemetry] unhandled rejection:', entry.message);
    try { emit('telemetry:error', entry); } catch { /* bus not ready — silent */ }
  });
}

/**
 * Record a manual error entry (e.g., from catch blocks that want telemetry).
 * @param {string} message
 * @param {Error} [error]
 */
export function recordError(message, error) {
  const entry = {
    type: 'manual',
    message,
    stack: error?.stack || '',
    ts: Date.now()
  };
  _errors.push(entry);
  if (_errors.length > MAX_ERRORS) _errors.shift();
}

/**
 * @returns {Array} copy of error log (newest last)
 */
export function getErrorLog() {
  return _errors.slice();
}
