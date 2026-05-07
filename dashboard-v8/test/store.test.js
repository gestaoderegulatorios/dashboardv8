import { describe, it, expect, vi } from 'vitest';
import { createStore } from '../src/model/store.js';

describe('createStore', () => {
  it('returns initial state', () => {
    const store = createStore({ count: 0 });
    expect(store.get()).toEqual({ count: 0 });
  });

  it('updates state with set()', () => {
    const store = createStore({ count: 0 });
    store.set({ count: 1 });
    expect(store.get()).toEqual({ count: 1 });
  });

  it('notifies subscribers on set()', () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    store.subscribe(fn);
    store.set({ count: 2 });
    expect(fn).toHaveBeenCalledWith({ count: 2 });
  });

  it('unsubscribe stops notifications', () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    const unsub = store.subscribe(fn);
    unsub();
    store.set({ count: 3 });
    expect(fn).not.toHaveBeenCalledWith({ count: 3 });
  });

  it('supports functional update', () => {
    const store = createStore({ count: 5 });
    store.set((prev) => ({ count: prev.count + 1 }));
    expect(store.get()).toEqual({ count: 6 });
  });

  it('_reset replaces state and notifies', () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    store.subscribe(fn);
    store._reset({ count: 99 });
    expect(store.get()).toEqual({ count: 99 });
    expect(fn).toHaveBeenCalledWith({ count: 99 });
  });

  it('merges partial updates without losing keys', () => {
    const store = createStore({ a: 1, b: 2 });
    store.set({ b: 3 });
    expect(store.get()).toEqual({ a: 1, b: 3 });
  });
});
