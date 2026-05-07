// Boot logic — extracted from main.js (F-CONSOLIDATE S2e).
// Contains auth gate, ETL hydration, store creation, UI shell init,
// view controller, subscribers, and command palette setup.

import { isAuthenticated } from './src/model/auth.js';
import { mountLogin, hideLogin } from './src/ui/login.js';
import { createStore } from './src/model/store.js';
import { on, emit } from './src/model/bus.js';
import { resolveDataset } from './src/model/demo.js';
import { getPersona } from './src/domain/persona.js';
import { createViewController } from './src/view/nav.js';
import { mountSidebar, toggleSidebar } from './src/ui/sidebar.js';
import { mountTopbar } from './src/ui/topbar.js';
import { initDarkMode, toggleDarkMode } from './src/ui/dark-mode.js';
import { initCommandPalette, registerCommand, openPalette, clearCommands } from './src/ui/command-palette.js';
import { initModal, openChartFullscreen } from './src/ui/modal.js';
import { initReveal } from './src/ui/reveal.js';
import { initRipple } from './src/ui/ripple.js';
import { loadSettings, saveSettings } from './src/model/settings.js';
import { loadUIState, saveUIState } from './src/model/ui-state.js';
import { loadSnapshot, getLastSnapshot } from './src/model/snapshot.js';
import { showToast } from './src/view/shared.js';
import { startAutoRefresh } from './src/model/auto-refresh.js';
import { diff, hasChanges } from './src/model/snapshot-delta.js';
import { initTelemetry } from './src/model/telemetry.js';
import { initHealth, getHealth, getHealthReport, incrementViewMounts } from './src/model/health.js';
import * as mockData from './src/model/mock.js';

/**
 * Boot the V8 dashboard application.
 * Called from main.js on DOMContentLoaded.
 * @param {Array} views - registered view objects
 */
export async function boot(views) {
  // F1.3: Initialize telemetry FIRST — captures errors from boot onward
  initTelemetry();
  initHealth();

  // Gate boot by auth before rendering the app fully
  if (!isAuthenticated()) {
    await showLoginAndWait();
  }

  // F6.6: Hydrate mock.js with ETL snapshot if available (~50ms, fallback to mock on failure)
  await loadSnapshot();

  // Dataset (após loadSnapshot — se ETL disponível, obras já foram hidratadas em mock.js)
  const { obras, isDemo } = resolveDataset();

  // ─── Store ────────────────────────────────────────────────────────────────
  const savedSettings = loadSettings();
  const savedUI = loadUIState();

  const store = createStore({
    data: { obras },
    filters: {},
    view: { sortKey: undefined, sortDir: undefined, page: 1, pageSize: 8 },
    persona: 'managerial',
    activeView: 'overview',
    story: 'hierarchical',
    isDemo,
    settings: savedSettings,
    ui: savedUI
  });

  // ─── API global ───────────────────────────────────────────────────────────
  window.__V8 = {
  store,
  on,
  emit,
  setPersona: (id) => store.set({ persona: id }),
  setView: (id) => store.set({ activeView: id }),
  setFilter: (k, v) => store.set((s) => ({ filters: { ...s.filters, [k]: v } })),
  setStory: (p) => store.set({ story: p }),
  toggleSidebar,
  toggleDarkMode,
  openPalette,
  /** Reset filters, view state, persona and story — preserves ui (sidebar/theme) and settings (branding). */
  reset: () => store.set({
    filters: {}, view: { sortKey: undefined, sortDir: undefined, page: 1, pageSize: 8 }, persona: 'managerial',
    activeView: 'overview', story: 'hierarchical'
  })
};
window.__dashboard_health = getHealth;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function applyPersonaSideEffects() {
    const persona = getPersona(store.get().persona);
    document.body.dataset.density = persona.density;
  }

  function rebuildPaletteCommands() {
    clearCommands();

    views.forEach((v) => {
      registerCommand({
        label: `Ir para: ${v.label}`,
        hint: 'Navegação',
        icon: v.icon,
        action: () => store.set({ activeView: v.id })
      });
    });

    ['exec', 'managerial', 'operational'].forEach((id) => {
      const p = getPersona(id);
      registerCommand({
        label: `Persona: ${p.label}`,
        hint: 'Densidade',
        icon: p.icon,
        action: () => store.set({ persona: id })
      });
    });

    [
      { id: 'hierarchical', label: 'Storytelling: Hierárquico', icon: 'account_tree' },
      { id: 'comparative', label: 'Storytelling: Comparativo', icon: 'compare_arrows' },
      { id: 'drilldown', label: 'Storytelling: Drilldown', icon: 'unfold_more' }
    ].forEach((s) => {
      registerCommand({
        label: s.label,
        hint: 'Padrão narrativo',
        icon: s.icon,
        action: () => { store.set({ story: s.id }); emit('v8:story-change', { pattern: s.id }); }
      });
    });

    registerCommand({
      label: 'Alternar modo escuro/claro',
      hint: 'Aparência',
      icon: 'dark_mode',
      action: () => toggleDarkMode(store)
    });

    registerCommand({
      label: 'Recolher/expandir sidebar',
      hint: 'Layout',
      icon: 'menu',
      action: () => toggleSidebar(store)
    });

    registerCommand({
      label: 'Resetar filtros e view',
      hint: 'Sistema',
      icon: 'restart_alt',
      action: () => window.__V8.reset()
    });

registerCommand({
    label: 'Imprimir / Exportar PDF',
    hint: 'Relatório',
    icon: 'print',
    action: () => window.print()
  });

  registerCommand({
    label: 'Dashboard Health',
    hint: 'Sistema',
    icon: 'monitor_heart',
    action: () => {
      const report = getHealthReport();
      console.log('[V8 health]', getHealth());
      showToast(report, 'info');
    }
  });
  }

  const hostEl = document.getElementById('view-host');
  if (!hostEl) {
    console.error('[V8] #view-host não encontrado.');
    return;
  }

  // Init UI shell modules
  initDarkMode(store);
  initRipple();
  initCommandPalette();
  initModal();

  // Delegated handler: [data-fullscreen] buttons → openChartFullscreen
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fullscreen]');
    if (!btn) return;
    const title = btn.dataset.title || 'Gráfico';
    const chartId = btn.dataset.fullscreen;
    if (!chartId) return;
    openChartFullscreen(chartId, title);
  });

  // Sidebar + Topbar
  mountSidebar({ store });
  mountTopbar({
    store,
    onToggleSidebar: () => toggleSidebar(store),
    onToggleDark: () => toggleDarkMode(store),
    onOpenPalette: () => openPalette(),
    onRefreshData: async () => {
      // Force re-fetch snapshot, apply delta, remount active view
      const prev = getLastSnapshot();
      try {
        const r = await fetch('/etl_v8/output/snapshot.json', { cache: 'no-store' });
        if (!r.ok) return;
        const next = await r.json();
        if (prev && next.meta?.gerado_em === prev.meta?.gerado_em) {
          // Same data — no need to remount
          return;
        }
        const delta = diff(prev, next);
        if (hasChanges(delta)) {
          mockData._applyDelta(delta);
          await loadSnapshot(true);
          emit('v8:snapshot-updated', { delta, ts: Date.now() });
          if (typeof controller.remount === 'function') {
            controller.remount();
            initReveal(hostEl);
          }
        }
      } catch (e) {
        console.warn('[V8 refresh]', e.message);
      }
    }
  });

  // Backdrop mobile fecha sidebar
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) backdrop.addEventListener('click', () => toggleSidebar(store));

  // Modal close
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      const m = document.getElementById('modal-overlay');
      if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    });
  }

  applyPersonaSideEffects();

  // View controller
  const ctx = { store, emit, on };
  const controller = createViewController(hostEl, views, ctx);
  controller.show(store.get().activeView);
  incrementViewMounts();

  initReveal(hostEl);
  rebuildPaletteCommands();

  // Subscribers
  let lastPersona = store.get().persona;
  let lastView = store.get().activeView;
  store.subscribe((state) => {
    if (state.persona !== lastPersona) {
      applyPersonaSideEffects();
      lastPersona = state.persona;
    }
    if (state.activeView !== lastView) {
      controller.show(state.activeView);
      initReveal(hostEl);
      lastView = state.activeView;
    }
  });

  // Settings persistence
  let lastSettings = JSON.stringify(store.get().settings);
  store.subscribe((state) => {
    const cur = JSON.stringify(state.settings);
    if (cur !== lastSettings) {
      saveSettings(state.settings);
      lastSettings = cur;
    }
  });

  // UI persistence (P1.1)
  let lastUI = JSON.stringify(store.get().ui);
  store.subscribe((state) => {
    const cur = JSON.stringify(state.ui);
    if (cur !== lastUI) {
      saveUIState(state.ui);
      lastUI = cur;
    }
  });

  // Theme change → force remount (ApexCharts needs recolor)
  document.addEventListener('v8:theme-change', () => {
    if (typeof controller.remount === 'function') {
      controller.remount();
      initReveal(hostEl);
    }
  });

  emit('v8:ready', {
    obras: store.get().data.obras.length,
    view: store.get().activeView,
    demo: isDemo
  });
  console.log('[V8] booted with', store.get().data.obras.length, 'obras', isDemo ? '(DEMO MODE)' : '', '· view:', store.get().activeView);

  // P0: Auto-refresh — polling for ETL snapshot updates
  try {
    const intervalSec = store.get().settings?.refreshIntervalSec ?? 300;
    if (intervalSec > 0) {
      startAutoRefresh({
        intervalSec,
        onChange: (delta) => {
          console.log('[V8] data updated:', delta.added.length, 'added,', delta.modified.length, 'modified,', delta.removed.length, 'removed');
          // Re-render active view to reflect new data
          if (typeof controller.remount === 'function') {
            controller.remount();
            initReveal(hostEl);
          }
        }
      });
    }
  } catch (e) {
    console.warn('[V8] auto-refresh init failed:', e.message);
  }
}

// Helper: show login overlay and wait for authentication
async function showLoginAndWait() {
  return new Promise((resolve) => {
    mountLogin({ onSuccess: () => {
      hideLogin();
      resolve();
    }});
  });
}
