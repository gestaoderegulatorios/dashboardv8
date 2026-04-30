// Event bus. Replaces V7's `document.addEventListener('borg:*')` pattern.
// Same idea, but explicit and not coupled to DOM.

const handlers = new Map();

/**
 * @param {string} event
 * @param {(payload: any) => void} fn
 * @returns {() => void} unsubscribe
 */
export function on(event, fn) {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event).add(fn);
  return () => handlers.get(event).delete(fn);
}

/**
 * @param {string} event
 * @param {any} [payload]
 */
export function emit(event, payload) {
  const set = handlers.get(event);
  if (!set) return;
  set.forEach((fn) => {
    try { fn(payload); } catch (e) { console.error(`[bus] handler for "${event}" threw:`, e); }
  });
}

/** test/debug only */
export function _reset() { handlers.clear(); }
