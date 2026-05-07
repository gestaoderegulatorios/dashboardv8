// Dark mode V8 — espelho V7. Toggle classe .dark no <html>,
// re-renderiza charts ApexCharts (que precisam recolorir) emitindo evento.
// P1.1: localStorage removido — store é única fonte; persistência via state/ui.js.

export function isDarkMode() {
  return document.documentElement.classList.contains('dark');
}

export function applyDarkMode(enabled) {
  const html = document.documentElement;
  if (enabled) {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
  }
  // Atualiza ícone no topbar
  const btn = document.querySelector('button[data-action="toggle-dark"] .material-symbols-outlined');
  if (btn) btn.textContent = enabled ? 'light_mode' : 'dark_mode';
  // Notifica módulos (ex.: charts re-render)
  document.dispatchEvent(new CustomEvent('v8:theme-change', { detail: { dark: enabled } }));
  // P1.1: NÃO escreve mais em localStorage — store faz isso via subscriber
}

/** @param {any} [store] */
export function toggleDarkMode(store) {
  const enabled = !isDarkMode();
  applyDarkMode(enabled);
  // P1.1: persiste via store em vez de localStorage direto
  if (store) store.set((s) => ({ ui: { ...s.ui, theme: enabled ? 'dark' : 'light' } }));
}

/** @param {any} [store] */
export function initDarkMode(store) {
  let enabled = false;
  // P1.1: lê do store em vez de localStorage
  if (store) {
    const state = store.get();
    if (state?.ui?.theme) {
      enabled = state.ui.theme === 'dark';
    }
  } else if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // P4.1: detecta preferência do sistema
    enabled = true;
  }
  applyDarkMode(enabled);
}
