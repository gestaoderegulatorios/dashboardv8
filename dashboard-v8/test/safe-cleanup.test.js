import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  safeDestroy, safeDisconnect, safeCall, safeUpdate, safeUpdateSeries, safeRemove, safeFocus
} from '../src/ui/safe-cleanup.js';

describe('safe-cleanup', () => {
  describe('safeDestroy', () => {
    it('calls destroy() on a valid handle', () => {
      const handle = { destroy: vi.fn() };
      safeDestroy(handle);
      expect(handle.destroy).toHaveBeenCalled();
    });
    it('ignores null handle', () => {
      expect(() => safeDestroy(null)).not.toThrow();
    });
    it('ignores handle without destroy method', () => {
      expect(() => safeDestroy({})).not.toThrow();
    });
  });

  describe('safeDisconnect', () => {
    it('calls disconnect() on a valid observer', () => {
      const observer = { disconnect: vi.fn() };
      safeDisconnect(observer);
      expect(observer.disconnect).toHaveBeenCalled();
    });
    it('ignores null observer', () => {
      expect(() => safeDisconnect(null)).not.toThrow();
    });
  });

  describe('safeCall', () => {
    it('calls a function', () => {
      const fn = vi.fn();
      safeCall(fn);
      expect(fn).toHaveBeenCalled();
    });
    it('ignores non-function', () => {
      expect(() => safeCall(null)).not.toThrow();
    });
    it('catches thrown errors', () => {
      const fn = () => { throw new Error('fail'); };
      expect(() => safeCall(fn)).not.toThrow();
    });
  });

  describe('safeUpdate', () => {
    it('calls updateOptions on valid handle', () => {
      const handle = { updateOptions: vi.fn() };
      safeUpdate(handle, {});
      expect(handle.updateOptions).toHaveBeenCalled();
    });
    it('ignores null handle', () => {
      expect(() => safeUpdate(null, {})).not.toThrow();
    });
  });

  describe('safeUpdateSeries', () => {
    it('calls updateSeries on valid handle', () => {
      const handle = { updateSeries: vi.fn() };
      safeUpdateSeries(handle, []);
      expect(handle.updateSeries).toHaveBeenCalledWith([]);
    });
    it('ignores null handle', () => {
      expect(() => safeUpdateSeries(null, [])).not.toThrow();
    });
  });

  describe('safeRemove', () => {
    it('removes a real DOM element', () => {
      const el = document.createElement('div');
      document.body.appendChild(el);
      safeRemove(el);
      expect(document.body.contains(el)).toBe(false);
    });
    it('ignores null element', () => {
      expect(() => safeRemove(null)).not.toThrow();
    });
    it('ignores detached element', () => {
      const el = document.createElement('div');
      expect(() => safeRemove(el)).not.toThrow();
    });
  });

  describe('safeFocus', () => {
    it('focuses a focusable element', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      safeFocus(input);
      expect(document.activeElement).toBe(input);
      document.body.removeChild(input);
    });
    it('ignores null element', () => {
      expect(() => safeFocus(null)).not.toThrow();
    });
  });
});
