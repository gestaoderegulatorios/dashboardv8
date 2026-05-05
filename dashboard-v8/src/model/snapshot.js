// ETL integration — live-binding via mock.js exports.
// Fetches snapshot.json at boot; if available, hydrates mock.js exports in-place.
// Consumers (overview.js, finance.js, works.js, demo.js, kpi.js, schema.js) unchanged.
// heroSpark stays in mock.js (derived metric, not in ETL).
//
// P0: _loaded boolean → _lastFetchTs timestamp + _lastSnapshot cache.
// loadSnapshot(force=true) allows re-fetch (auto-refresh uses force=true).

import * as mockData from './mock.js';

let _lastFetchTs = 0;
let _lastSnapshot = null;

/**
 * Attempts to load ETL snapshot from /etl_v8/output/snapshot.json.
 * On success, hydrates mock.js exports via _hydrateFromSnapshot().
 * On failure (file missing, network error), falls back to mock defaults.
 *
 * @param {boolean} [force=false] — If true, re-fetches even if already loaded.
 *   Auto-refresh uses force=true to update cache after detecting changes.
 */
export async function loadSnapshot(force = false) {
  if (!force && _lastFetchTs > 0) return;
  try {
    const r = await fetch('/etl_v8/output/snapshot.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    mockData._hydrateFromSnapshot({
      obras: j.obras,
      meses12: j.series.meses12,
      receitaMensal: j.series.receitaMensal,
      composicaoTipo: j.series.composicaoTipo,
      margemSpark: j.series.margemSpark,
      metaAnualPercent: j.series.metaAnualPercent
    });
    _lastFetchTs = Date.now();
    _lastSnapshot = j;
    console.log('[V8] ETL:', j.meta.total_obras, 'obras', j.meta.gerado_em);
  } catch (e) {
    console.warn('[V8] mock fallback:', e.message);
  }
}

/** Returns the last fetched snapshot object (null if never fetched). */
export function getLastSnapshot() {
  return _lastSnapshot;
}

/** Returns the timestamp (Date.now()) of the last successful fetch. 0 if never fetched. */
export function getLastFetchTs() {
  return _lastFetchTs;
}

/** Resets the snapshot cache — useful for tests. */
export function resetSnapshotCache() {
  _lastFetchTs = 0;
  _lastSnapshot = null;
}
