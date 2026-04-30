// ETL integration — live-binding via mock.js exports.
// Fetches snapshot.json at boot; if available, hydrates mock.js exports in-place.
// Consumers (overview.js, finance.js, works.js, demo.js, kpi.js, schema.js) unchanged.
// heroSpark stays in mock.js (derived metric, not in ETL).

import * as mockData from './mock.js';

let _loaded = false;

/**
 * Attempts to load ETL snapshot from /etl_v8/output/snapshot.json.
 * On success, hydrates mock.js exports via _hydrateFromSnapshot().
 * On failure (file missing, network error), falls back to mock defaults.
 */
export async function loadSnapshot() {
  if (_loaded) return;
  try {
    const r = await fetch('/etl_v8/output/snapshot.json');
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
    _loaded = true;
    console.log('[V8] ETL:', j.meta.total_obras, 'obras', j.meta.gerado_em);
  } catch (e) {
    console.warn('[V8] mock fallback:', e.message);
  }
}
