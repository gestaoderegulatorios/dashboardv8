// View: Configurações. Espelho V7 — Dados do Usuário, Empreendimento,
// Visibilidade de Componentes, Aparência (dark mode + animações), Sobre o Sistema, Salvar.
// Fase 3: Persistência via state/settings.js. View lê/escreve via store (única fonte).

import { BRANDING_DEFAULTS, VIEW_LABELS } from '../model/branding.js';
import { settingsTemplate, restoreVisibility, wireSettingsEvents } from './settings-fragments.js';

// Remove in-file template; the actual rendering is handled by settings-fragments.js
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
    host.innerHTML = settingsTemplate(settings);
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
  } catch { /* noop: IntersectionObserver unavailable — reveals stay hidden, non-critical */ }
  }

renderAll();

  // Não re-renderiza a página a cada keystroke — só salva no store
  // A página de configurações não precisa reagir a mudanças externas

  return function unmount() {
    // cleanup se necessário
  };
}

export const settingsView = { id: 'settings', ...VIEW_LABELS.settings, mount };
