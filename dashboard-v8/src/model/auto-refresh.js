import { loadSnapshot, getLastSnapshot } from './snapshot.js';
import { diff, hasChanges } from './snapshot-delta.js';
import * as mockData from './mock.js';
import { emit } from './bus.js';
import { REFRESH_MIN_SEC, REFRESH_MAX_SEC, REFRESH_DEFAULT_SEC } from './constants.js';

let _intervalId = null;
let _isPolling = false;
let _intervalSec = REFRESH_DEFAULT_SEC;

/**
 * Inicia polling em background.
 * @param {Object} [opts]
 * @param {number} [opts.intervalSec=300] -- polling interval (mín 30s, máx 3600s)
 * @param {(delta: Object) => void} [opts.onChange] -- callback quando snapshot muda
 */
export function startAutoRefresh(opts = {}) {
  if (_intervalId) return; // já rodando
  _intervalSec = Math.max(REFRESH_MIN_SEC, Math.min(REFRESH_MAX_SEC, opts.intervalSec || REFRESH_DEFAULT_SEC));
  document.addEventListener('visibilitychange', _handleVisibility);
  _intervalId = setInterval(() => _tick(opts), _intervalSec * 1000);
  console.log('[V8 auto-refresh] started, interval=' + _intervalSec + 's');
}

export function stopAutoRefresh() {
  if (_intervalId) clearInterval(_intervalId);
  _intervalId = null;
  document.removeEventListener('visibilitychange', _handleVisibility);
  console.log('[V8 auto-refresh] stopped');
}

export function isAutoRefreshActive() {
  return _intervalId !== null;
}

async function _tick(opts) {
  if (_isPolling || document.hidden) return;
  _isPolling = true;
  try {
    const prev = getLastSnapshot();
    const r = await fetch('/etl_v8/output/snapshot.json', { cache: 'no-store' });
    if (!r.ok) return;
    const next = await r.json();
    // Exit early se mesmo snapshot (gerado_em timestamp)
    if (prev && next.meta?.gerado_em === prev.meta?.gerado_em) return;
    const delta = diff(prev, next);
    if (hasChanges(delta)) {
      mockData._applyDelta(delta);
      await loadSnapshot(true); // force=true atualiza _lastFetchTs e _lastSnapshot
      emit('v8:snapshot-updated', { delta, ts: Date.now() });
      if (opts.onChange) opts.onChange(delta);
    }
  } catch (e) {
    console.warn('[V8 auto-refresh]', e.message);
  } finally {
    _isPolling = false;
  }
}

function _handleVisibility() {
  // Não pausa interval (continua tickando), mas _tick faz exit early se hidden
}
