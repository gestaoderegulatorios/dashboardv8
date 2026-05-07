import { describe, it, expect, vi } from 'vitest';
import {
  loadUIState, saveUIState, STORAGE_KEY_SIDEBAR, STORAGE_KEY_THEME
} from '../src/model/ui-state.js';

describe('ui-state', () => {
  const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loadUIState: defaults to sidebarOpen=false, theme=light', () => {
    getItem.mockReturnValue(null);
    const state = loadUIState();
    expect(state.sidebarOpen).toBe(false);
    expect(state.theme).toBe('light');
  });

  it('loadUIState: reads sidebarOpen=1 as true', () => {
    getItem.mockImplementation((key) => {
      if (key === STORAGE_KEY_SIDEBAR) return '1';
      return null;
    });
    const state = loadUIState();
    expect(state.sidebarOpen).toBe(true);
  });

  it('loadUIState: reads saved theme', () => {
    getItem.mockImplementation((key) => {
      if (key === STORAGE_KEY_THEME) return 'dark';
      return null;
    });
    const state = loadUIState();
    expect(state.theme).toBe('dark');
  });

  it('loadUIState: ignores invalid theme values', () => {
    getItem.mockImplementation((key) => {
      if (key === STORAGE_KEY_THEME) return 'neon';
      return null;
    });
    const state = loadUIState();
    // Falls back to prefers-color-scheme or light; in jsdom no matchMedia so light
    expect(state.theme).toBe('light');
  });

  it('saveUIState: persists sidebar and theme', () => {
    saveUIState({ sidebarOpen: true, theme: 'dark' });
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_SIDEBAR, '1');
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_THEME, 'dark');
  });

  it('saveUIState: persists closed sidebar', () => {
    saveUIState({ sidebarOpen: false, theme: 'light' });
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_SIDEBAR, '0');
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY_THEME, 'light');
  });

  it('handles localStorage error gracefully', () => {
    getItem.mockImplementation(() => { throw new Error('quota'); });
    expect(() => loadUIState()).not.toThrow();
  });
});
