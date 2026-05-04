// Sidebar V8 — espelho V7. 64↔240px, nav-items, tooltips quando colapsado,
// logo + user persistente. Estado vivo na store ({ ui.sidebarOpen }).
// P1.1: localStorage removido — store é única fonte; persistência via state/ui.js.

import { NAV_ITEMS, SIDEBAR_LOGO_ICON, BRANDING_DEFAULTS } from '../model/branding.js';
import { getAuthUser, logout } from '../model/auth.js';

import { escape } from '../view/shared.js';

/**
 * @param {{ activeView: string, items?: NavItem[], settings?: { companyName?: string, projectName?: string, username?: string, role?: string } }} options
 */
export function renderSidebar({ activeView, items = NAV_ITEMS, settings = {} } = {}) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  // Single source of truth: settings do store; fallback para DEFAULTS (state/settings.js).
  const companyName = settings.companyName || BRANDING_DEFAULTS.companyName;
  const projectName = settings.projectName || BRANDING_DEFAULTS.projectName;
  // Prefer real auth user data if available
  const authUser = getAuthUser();
  const username = (authUser && authUser.name) || (settings.username || BRANDING_DEFAULTS.username);
  const role = (authUser && authUser.roles && authUser.roles.length > 0)
    ? authUser.roles.join(', ')
    : (settings.role || BRANDING_DEFAULTS.role);

  // Agrupa por `group` mantendo ordem
  const groups = [];
  const seen = new Map();
  for (const item of items) {
    const g = item.group || 'geral';
    if (!seen.has(g)) {
      const arr = [];
      seen.set(g, arr);
      groups.push(arr);
    }
    seen.get(g).push(item);
  }

  const navHTML = groups.map((groupItems, idx) => {
    const itemsHTML = groupItems.map((item) => {
      const active = item.id === activeView;
      const cls = active
        ? 'nav-item flex items-center gap-2 px-4 py-2 text-white rounded hover:bg-white/10 transition-colors'
        : 'nav-item flex items-center gap-2 px-4 py-2 text-on-primary-container rounded hover:bg-white/10 transition-colors';
      const aria = active ? ' aria-current="page"' : '';
      return `<a href="#" class="${cls}" data-view="${escape(item.id)}" data-tooltip="${escape(item.label)}"${aria}>
        <span class="material-symbols-outlined min-w-[24px]" aria-hidden="true">${escape(item.icon)}</span><span class="nav-text">${escape(item.label)}</span>
      </a>`;
    }).join('');
    const divider = idx < groups.length - 1 ? '<hr class="mx-4 border-t sidebar-divider"/>' : '';
    return itemsHTML + divider;
  }).join('');

  sidebar.innerHTML = `
  <div class="px-5 mb-10 flex items-center gap-4 overflow-hidden">
    <div class="min-w-[24px] flex-shrink-0"><span class="material-symbols-outlined text-white text-2xl">${escape(SIDEBAR_LOGO_ICON)}</span></div>
    <div class="logo-text">
      <h1 class="text-white font-bold text-lg tracking-tighter uppercase break-words leading-tight">${escape(companyName)}</h1>
      <p class="text-on-primary-container text-[10px] break-words">${escape(projectName)}</p>
    </div>
  </div>
  <nav class="flex-1 space-y-1" aria-label="Navegação do dashboard">${navHTML}</nav>
  <div id="sidebar-user" class="px-4 mt-auto flex items-center gap-4 pt-6 border-t sidebar-divider overflow-hidden sidebar-user cursor-pointer" data-tooltip="${escape(username)} — ${escape(role)}" title="Clique para sair">
    <div class="w-8 h-8 rounded-[9999px] bg-surface-tint flex items-center justify-center min-w-[32px] flex-shrink-0">
      <span class="material-symbols-outlined text-white text-sm">person</span>
    </div>
    <div class="nav-text">
      <p class="text-white text-xs font-medium truncate">${escape(username)}</p>
      <p class="text-on-primary-container text-[10px] truncate">${escape(role)}</p>
    </div>
  </div>
  `;

  // Attach logout interaction AFTER innerHTML (element now exists in DOM)
  const userEl = document.getElementById('sidebar-user');
  if (userEl) {
    userEl.addEventListener('click', (e) => {
      // Don't trigger if click was on a nav link
      if (e.target.closest('a[data-view]')) return;
      logout();
      window.location.reload();
    });
  }
}

/** Tipa `mountSidebar({ store })`. Wires clicks → store.set({ activeView }). */
export function mountSidebar({ store }) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const s0 = store.get();

  // Estado inicial colapsado/expandido (lê store — P1.1: era localStorage)
  applySidebarState(s0.ui.sidebarOpen);

  // Renderização inicial: lê activeView + settings do store (única fonte de verdade).
  renderSidebar({ activeView: s0.activeView, settings: s0.settings });

  // Delegação de cliques
  sidebar.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-view]');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.view;
    if (id) store.set({ activeView: id });
    // Auto-close on mobile after navigation
    try {
      if (window.matchMedia('(max-width: 1024px)').matches) {
        applySidebarState(false);
        store.set((s) => ({ ui: { ...s.ui, sidebarOpen: false } }));
      }
    } catch {
      // no-op in non-browser environments
    }
  });

  // Re-render quando view ativa OU settings mudam (Princípio 7: store = única fonte).
  let lastView = s0.activeView;
  let lastSettingsJSON = JSON.stringify(s0.settings);
  store.subscribe((s) => {
    const settingsJSON = JSON.stringify(s.settings);
    if (s.activeView !== lastView || settingsJSON !== lastSettingsJSON) {
      renderSidebar({ activeView: s.activeView, settings: s.settings });
      lastView = s.activeView;
      lastSettingsJSON = settingsJSON;
    }
  });
}

// ─── colapse/expand ──────────────────────────────────────────────────────────
/** @param {import('../model/store.js').ReturnType<typeof import('../model/store.js').createStore>} [store] */
export function toggleSidebar(store) {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelectorAll('.main-content');
  if (!sidebar) return;
  const open = sidebar.classList.contains('sidebar-expanded');
  applySidebarState(!open);
  // P1.1: persiste via store em vez de localStorage direto
  if (store) store.set((s) => ({ ui: { ...s.ui, sidebarOpen: !open } }));
}

export function applySidebarState(open) {
  const sidebar = document.getElementById('sidebar');
  const mainEls = document.querySelectorAll('.main-content');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;
  if (open) {
    sidebar.classList.remove('sidebar-collapsed');
    sidebar.classList.add('sidebar-expanded');
    mainEls.forEach((el) => el.classList.add('main-content-expanded'));
    if (backdrop && window.matchMedia('(max-width: 1024px)').matches) backdrop.classList.remove('hidden');
  } else {
    sidebar.classList.add('sidebar-collapsed');
    sidebar.classList.remove('sidebar-expanded');
    mainEls.forEach((el) => el.classList.remove('main-content-expanded'));
    if (backdrop) backdrop.classList.add('hidden');
  }
  // ARIA on hamburger button (atualizado no topbar)
  const hb = document.querySelector('[data-action="toggle-sidebar"]');
  if (hb) hb.setAttribute('aria-expanded', String(open));
}
