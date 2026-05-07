// Health module (F1.3 — Audit-Fix: Observabilidade).
// Exposes a runtime health check via window.__dashboard_health().
// Integrates with command palette for easy access from UI.

import { getErrorLog } from './telemetry.js';

let _bootTime = 0;
let _viewMountCount = 0;

/**
 * Called once at boot to record start time.
 */
export function initHealth() {
  _bootTime = Date.now();
}

/**
 * Increment view mount counter. Called by nav.js when a view is shown.
 */
export function incrementViewMounts() {
  _viewMountCount++;
}

/**
 * Returns a health snapshot of the dashboard.
 * @returns {{
 *   version: string,
 *   uptime: number,
 *   errors: number,
 *   lastError: string,
 *   viewsMounted: number,
 *   timestamp: number
 * }}
 */
export function getHealth() {
  const errors = getErrorLog();
  const lastError = errors.length > 0 ? errors[errors.length - 1].message : '';
  return {
    version: '8.0',
    uptime: Math.round((Date.now() - _bootTime) / 1000),
    errors: errors.length,
    lastError,
    viewsMounted: _viewMountCount,
    timestamp: Date.now()
  };
}

/**
 * Formats health as a readable string for the command palette toast.
 * @returns {string}
 */
export function getHealthReport() {
  const h = getHealth();
  const uptimeMin = Math.floor(h.uptime / 60);
  const uptimeSec = h.uptime % 60;
  return [
    `Dashboard V${h.version}`,
    `Uptime: ${uptimeMin}m ${uptimeSec}s`,
    `Errors: ${h.errors}`,
    h.lastError ? `Last: ${h.lastError.slice(0, 80)}` : 'No errors',
    `Views mounted: ${h.viewsMounted}`
  ].join(' · ');
}
