// Minimal pub/sub store. ~30 lines. No magic.
// Why: avoid IIFE-mutable global state from V7. Predictable + testable.

/**
 * @template T
 * @param {T} initialState
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();

  return {
    /** @returns {T} */
    get() { return state; },

    /** @param {Partial<T>|((prev: T) => Partial<T>)} update */
    set(update) {
      const next = typeof update === 'function' ? update(state) : update;
      state = { ...state, ...next };
      listeners.forEach((fn) => fn(state));
    },

    /** @param {(state: T) => void} fn @returns {() => void} unsubscribe */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    /** test/debug only */
    _reset(s) { state = s; listeners.forEach((fn) => fn(state)); }
  };
}
