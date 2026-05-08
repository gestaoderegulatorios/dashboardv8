// Settings View V8 - Definitive fix using Shadow DOM isolation
import { BRANDING_DEFAULTS, VIEW_LABELS } from '../model/branding.js';
import { settingsTemplate, restoreVisibility, wireSettingsEvents } from './settings-fragments.js';

export function mount(host, ctx) {
  const store = ctx.store;
  let shadow = null;

  function currentSettings() {
    const s = store.get();
    return { ...BRANDING_DEFAULTS, ...(s.settings || {}) };
  }

  function applyAnimationsPref(animations) {
    document.body.classList.toggle('motion-reduced', !animations);
  }

  function pushToStore(updated) {
    store.set({ settings: { ...currentSettings(), ...updated } });
  }

  function autosave(reason) {
    const status = host.querySelector('#settings-save-status');
    if (status) {
      status.textContent = `Salvo automaticamente (${reason})`;
      setTimeout(() => { if (status) status.textContent = ''; }, 1800);
    }
  }

  function renderAll() {
    const settings = currentSettings();
    
    // Create Shadow DOM for complete isolation
    if (!shadow) {
      host.innerHTML = '';
      shadow = host.attachShadow({ mode: 'open' });
      
      // Copy necessary styles into shadow DOM
      const style = document.createElement('style');
      style.textContent = `
        @import url('/src/styles/theme.css');
        @import url('/src/styles/app.css');
        .settings-wrapper { all: initial; }
      `;
      shadow.appendChild(style);
    }
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = settingsTemplate(settings);
    
    shadow.innerHTML = '';
    shadow.appendChild(wrapper.firstElementChild);
    
    // Wire events on light DOM elements
    const settingsHost = shadow.querySelector('section');
    if (settingsHost) {
      restoreVisibility(settingsHost, settings);
      wireSettingsEvents(settingsHost, { pushToStore, applyAnimationsPref, autosave, store });
    }
    applyAnimationsPref(settings.animations);
  }

  renderAll();

  return function unmount() {
    if (shadow) {
      shadow.innerHTML = '';
    }
  };
}

export const settingsView = { id: 'settings', ...VIEW_LABELS.settings, mount };
