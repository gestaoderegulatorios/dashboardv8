import { describe, it, expect, vi } from 'vitest';
import { on, emit, _reset } from '../src/model/bus.js';

describe('bus', () => {
  afterEach(() => _reset());

  it('emits and receives events', () => {
    const fn = vi.fn();
    on('test', fn);
    emit('test', { x: 1 });
    expect(fn).toHaveBeenCalledWith({ x: 1 });
  });

  it('allows multiple listeners for same event', () => {
    const a = vi.fn(), b = vi.fn();
    on('multi', a);
    on('multi', b);
    emit('multi', 42);
    expect(a).toHaveBeenCalledWith(42);
    expect(b).toHaveBeenCalledWith(42);
  });

  it('unsubscribe removes listener', () => {
    const fn = vi.fn();
    const off = on('off', fn);
    off();
    emit('off', 1);
    expect(fn).not.toHaveBeenCalled();
  });

  it('does not throw if no handlers exist', () => {
    expect(() => emit('missing', 1)).not.toThrow();
  });

  it('catches handler errors and logs them', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    on('error', () => { throw new Error('fail'); });
    expect(() => emit('error', 1)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
