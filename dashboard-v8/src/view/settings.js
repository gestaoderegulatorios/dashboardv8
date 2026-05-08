// View: Configurações V8 - Using DOM API instead of innerHTML to prevent Chrome/Edge flicker
import { BRANDING_DEFAULTS, VIEW_LABELS } from '../model/branding.js';
import { settingsTemplate, restoreVisibility, wireSettingsEvents } from './settings-fragments.js';

export function mount(host, ctx) {
  const store = ctx.store;

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
    
    // Create wrapper element
    const wrapper = document.createElement('div');
    wrapper.innerHTML = settingsTemplate(settings);
    
    // Clear host and append
    host.innerHTML = '';
    host.appendChild(wrapper.firstElementChild);
    
    restoreVisibility(host, settings);
    wireSettingsEvents(host, { pushToStore, applyAnimationsPref, autosave, store });
    applyAnimationsPref(settings.animations);
    
    try {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      host.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    } catch { /* noop */ }
  }

  renderAll();

  return function unmount() {
    // cleanup
  };
}

export const settingsView = { id: 'settings', ...VIEW_LABELS.settings, mount };
