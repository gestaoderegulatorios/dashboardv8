import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isDarkMode, applyDarkMode, toggleDarkMode, initDarkMode } from '../src/ui/dark-mode.js';

describe('dark-mode', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark', 'light');
    // Remove existing toggle button if present
    const btn = document.querySelector('button[data-action="toggle-dark"]');
    if (btn) btn.remove();
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark', 'light');
  });

  it('isDarkMode returns false by default', () => {
    expect(isDarkMode()).toBe(false);
  });

  it('applyDarkMode(true) adds dark class', () => {
    applyDarkMode(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(isDarkMode()).toBe(true);
  });

  it('applyDarkMode(false) removes dark class', () => {
    applyDarkMode(true);
    applyDarkMode(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(isDarkMode()).toBe(false);
  });

  it('applies light class when dark is disabled', () => {
    applyDarkMode(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('dispatches v8:theme-change event', () => {
    let fired = false;
    let detail = null;
    const handler = (e) => { fired = true; detail = e.detail; };
    document.addEventListener('v8:theme-change', handler, { once: true });
    applyDarkMode(true);
    expect(fired).toBe(true);
    expect(detail.dark).toBe(true);
    document.removeEventListener('v8:theme-change', handler);
  });

  it('toggleDarkMode toggles state', () => {
    const store = { get: () => ({ ui: { theme: 'light' } }), set: () => {} };
    applyDarkMode(false);
    toggleDarkMode(store);
    expect(isDarkMode()).toBe(true);
  });

  it('initDarkMode reads theme from store', () => {
    const store = { get: () => ({ ui: { theme: 'dark' } }), set: () => {} };
    initDarkMode(store);
    expect(isDarkMode()).toBe(true);
  });

  it('initDarkMode defaults to light if no store', () => {
    initDarkMode();
    expect(isDarkMode()).toBe(false);
  });
});
