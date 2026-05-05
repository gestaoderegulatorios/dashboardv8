/**
 * Compara snapshots, retorna delta por chave 'obra.nome'.
 * @param {Object|null} prev — snapshot anterior (null no primeiro fetch)
 * @param {Object} next — snapshot novo
 * @returns {{
 *   added: Array,
 *   modified: Array,
 *   removed: Array,
 *   unchanged: number,
 *   seriesChanged: boolean,
 *   next: Object
 * }}
 */
export function diff(prev, next) {
  const nextObras = Array.isArray(next && next.obras) ? next.obras : [];
  // Edge: initial fetch
  if (prev == null) {
    return {
      added: nextObras.slice(),
      modified: [],
      removed: [],
      unchanged: 0,
      seriesChanged: true,
      next: next,
    };
  }

  const prevObras = Array.isArray(prev.obras) ? prev.obras : [];
  const prevMap = new Map();
  for (const o of prevObras) {
    if (!o || typeof o.nome !== 'string') continue;
    prevMap.set(o.nome, o);
  }

  // Build next map and warn about duplicates
  const nextMap = new Map();
  const seen = new Set();
  for (const o of nextObras) {
    if (!o || typeof o.nome !== 'string') continue;
    const name = o.nome;
    if (seen.has(name)) {
      console.warn('[V8 snapshot-delta] duplicate obra nome:', name);
      // keep the first occurrence as identity
      continue;
    }
    seen.add(name);
    nextMap.set(name, o);
  }

  const added = [];
  for (const [name, ob] of nextMap.entries()) {
    if (!prevMap.has(name)) added.push(ob);
  }

  const removed = [];
  for (const [name, ob] of prevMap.entries()) {
    if (!nextMap.has(name)) removed.push(ob);
  }

  let unchangedCount = 0;
  const modified = [];
  for (const [name, nextOb] of nextMap.entries()) {
    if (prevMap.has(name)) {
      const prevOb = prevMap.get(name);
      const isModified = JSON.stringify(prevOb) !== JSON.stringify(nextOb);
      if (isModified) {
        modified.push(nextOb);
      } else {
        unchangedCount++;
      }
    }
  }

  // seriesChanged handling
  let seriesChanged = false;
  if (Object.prototype.hasOwnProperty.call(next, 'series')) {
    const prevSeries = prev.series;
    const nextSeries = next.series;
    seriesChanged = JSON.stringify(prevSeries) !== JSON.stringify(nextSeries);
  } else {
    seriesChanged = false;
  }

  return {
    added,
    modified,
    removed,
    unchanged: unchangedCount,
    seriesChanged,
    next,
  };
}

/** True se houve QUALQUER mudança (added/modified/removed/seriesChanged). */
export function hasChanges(delta) {
  if (!delta) return false;
  return (
    (Array.isArray(delta.added) && delta.added.length > 0) ||
    (Array.isArray(delta.modified) && delta.modified.length > 0) ||
    (Array.isArray(delta.removed) && delta.removed.length > 0) ||
    !!delta.seriesChanged
  );
}
