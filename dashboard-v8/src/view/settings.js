// Settings View V8. Inputs de texto ficam locais ao DOM até o usuário salvar.
// Isso evita escrita síncrona em localStorage/store a cada tecla e elimina flicker por efeito colateral.

import { settingsTemplate, restoreVisibility, wireSettingsEvents } from './settings-fragments.js';

export function mount(host, ctx = {}) {
  const store = ctx.store;
  const settings = store?.get?.().settings || {};

  host.innerHTML = settingsTemplate(settings);
  restoreVisibility(host, settings);

  const pushToStore = (nextSettings) => {
    if (!store) return;
    store.set((state) => ({
      settings: {
        ...(state.settings || {}),
        ...nextSettings
      }
    }));
  };

  const applyAnimationsPref = (enabled) => {
    document.body.classList.toggle('motion-reduced', !enabled);
  };

  wireSettingsEvents(host, { pushToStore, applyAnimationsPref, store });

  return function unmount() {
    host.innerHTML = '';
  };
}

export const settingsView = { id: 'settings', mount };