// Topbar V8 — espelho V7. Hamburger, page-title, last-update, notifications,
// dark-mode toggle, command palette trigger. Tudo com touch target ≥ 44px.
// F9.4: ícone do dark-mode toggle inverte (light_mode quando em dark, dark_mode quando em light)

import { NAV_ITEMS, SIDEBAR_LOGO_ICON } from '../model/branding.js';
import { escape, showToast } from '../view/shared.js';

function isDarkMode() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}

function pageTitleFor(viewId) {
  const item = NAV_ITEMS.find((n) => n.id === viewId);
  return item ? item.label : 'Dashboard';
}

function formattedNow() {
  // pt-BR style: "Atualizado em DD/MM/YYYY às HH:MM"
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `Atualizado em ${dd}/${mm}/${yyyy} às ${hh}:${mi}`;
}

/**
 * @param {{ activeView: string, isDemo?: boolean }} options
 */
export function renderTopbar({ activeView, isDemo }) {
  const top = document.getElementById('top-bar');
  if (!top) return;

  const demoBadge = isDemo
    ? `<span class="bg-amber-400 text-slate-900 text-[0.6875rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full" title="Dataset estendido (~30 obras)">DEMO</span>`
    : '';

  top.innerHTML = `
    <div class="flex items-center gap-4">
      <button data-action="toggle-sidebar" class="p-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Abrir ou fechar menu" aria-expanded="false" aria-controls="sidebar" data-ripple>
        <span class="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <div class="flex items-center gap-2 text-on-surface font-bold text-xl">
        <span class="material-symbols-outlined text-on-surface" aria-hidden="true">${SIDEBAR_LOGO_ICON}</span>
        <span id="page-title">${escape(pageTitleFor(activeView))}</span>
      </div>
      ${demoBadge}
    </div>
    <div class="flex items-center gap-4">
      <div class="hidden sm:flex items-center gap-1.5 text-on-surface-variant">
        <span class="material-symbols-outlined text-sm" aria-hidden="true">schedule</span>
        <span id="last-update" class="text-[11px] font-medium">${escape(formattedNow())}</span>
      </div>
      <div class="h-6 w-px bg-outline-variant mx-2 hidden sm:block"></div>
      <button class="p-2 text-on-surface-variant hover:text-primary transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Notificações" data-action="notifications" data-ripple>
        <span class="material-symbols-outlined" aria-hidden="true">notifications</span>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-[9999px] border-2 border-surface-container-lowest"></span>
      </button>
      <button data-action="toggle-dark" class="p-2 text-on-surface-variant hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Alternar tema claro/escuro" title="Tema" data-ripple>
        <span class="material-symbols-outlined" aria-hidden="true">${isDarkMode() ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  `;
}

/** @param {{ store: any, onToggleSidebar: () => void, onToggleDark: () => void, onOpenPalette: () => void }} ctx */
export function mountTopbar({ store, onToggleSidebar, onToggleDark, onOpenPalette }) {
  const top = document.getElementById('top-bar');
  if (!top) return;

  const state = store.get();
  renderTopbar({ activeView: state.activeView, isDemo: state.isDemo });

  top.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'toggle-sidebar') onToggleSidebar();
    if (action === 'toggle-dark') onToggleDark();
    if (action === 'open-palette') onOpenPalette();
    if (action === 'notifications') showToast('Sem notificações novas', 'info');
  });

  // Re-render page-title quando view muda
  let lastView = store.get().activeView;
  store.subscribe((s) => {
    if (s.activeView !== lastView) {
      const titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = pageTitleFor(s.activeView);
      lastView = s.activeView;
    }
  });

  // F9.4: re-render quando tema alterna para inverter o ícone dark/light
  document.addEventListener('v8:theme-change', () => {
    renderTopbar({ activeView: store.get().activeView, isDemo: store.get().isDemo });
  });
}
