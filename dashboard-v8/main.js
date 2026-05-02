// V8 boot. Native ES modules. main.js só ORQUESTRA.
// Cada view é um módulo isolado em view/. View controller garante que
// só uma monta por vez, e unmount anterior é chamado antes (sem leak).
// Espelho V7: sidebar 64↔240, topbar com hamburger/dark/palette/last-update,
// command palette Cmd+K, ripple, reveal, dark mode persistente.

// CSS (F1 — Theme tokens + Tailwind via PostCSS pipeline)
import './src/styles/theme.css';
import './src/styles/app.css';

import { isAuthenticated } from './src/model/auth.js';
import { mountLogin, hideLogin } from './src/ui/login.js';

import { createStore } from './src/model/store.js';
import { on, emit } from './src/model/bus.js';
import { resolveDataset } from './src/model/demo.js';
import { getPersona } from './src/domain/persona.js';
import { createViewController } from './src/view/nav.js';

// ApexCharts: npm dep empacotada pelo Vite (Fase 5.1 — era CDN).
// Em teste (jsdom), vitest-setup.js stuba window.ApexCharts ANTES dos testes.
// Este import é necessário para Vite empacotar a lib no build de produção.
import ApexCharts from 'apexcharts';
if (typeof window !== 'undefined') window.ApexCharts = ApexCharts;

// Views (todas espelho V7)
import { overviewView } from './src/view/overview.js';
import { worksView } from './src/view/works.js';
import { financeView } from './src/view/finance.js';
import { operationalView } from './src/view/operational.js';
import { landView } from './src/view/land.js';
import { uploadView } from './src/view/upload.js';
import { reportsView } from './src/view/reports.js';
import { settingsView } from './src/view/settings.js';

// UI modules
import { mountSidebar, toggleSidebar } from './src/ui/sidebar.js';
import { mountTopbar } from './src/ui/topbar.js';
import { initDarkMode, toggleDarkMode } from './src/ui/dark-mode.js';
import { initCommandPalette, registerCommand, openPalette, clearCommands } from './src/ui/command-palette.js';
import { initModal, openChartFullscreen } from './src/ui/modal.js';
import { initReveal } from './src/ui/reveal.js';
import { initRipple } from './src/ui/ripple.js';
import { loadSettings, saveSettings } from './src/model/settings.js';
import { loadUIState, saveUIState } from './src/model/ui-state.js';
import { loadSnapshot } from './src/model/snapshot.js';

// ─── Dataset + Store criados APÓS loadSnapshot() no DOMContentLoaded (F6.6) ──
// Era top-level, mas resolveDataset() lia obras de mock.js antes da hidratação ETL.
// Agora store e tudo que depende dele nasce dentro do callback async.

// ─── Settings (carregadas no boot, pré-store) ────────────────────────────────
const savedSettings = loadSettings();

// ─── UI state (sidebar + theme, carregadas no boot, pré-store) ──────────────
// P1.1: migrado de localStorage direto para store = única fonte
const savedUI = loadUIState();

// ─── Views registradas ────────────────────────────────────────────────────────
const views = [overviewView, worksView, financeView, operationalView, landView, uploadView, reportsView, settingsView];

// ─── Helpers ──────────────────────────────────────────────────────────────────
// (dependem de store — definidos dentro do boot, abaixo)

function rebuildPaletteCommands() {
  clearCommands();

  // Navegação
  views.forEach((v) => {
    registerCommand({
      label: `Ir para: ${v.label}`,
      hint: 'Navegação',
      icon: v.icon,
      action: () => store.set({ activeView: v.id })
    });
  });

  // Personas
  ['exec', 'managerial', 'operational'].forEach((id) => {
    const p = getPersona(id);
    registerCommand({
      label: `Persona: ${p.label}`,
      hint: 'Densidade',
      icon: p.icon,
      action: () => store.set({ persona: id })
    });
  });

  // Storytelling
  [
    { id: 'hierarchical', label: 'Storytelling: Hierárquico', icon: 'account_tree' },
    { id: 'comparative',  label: 'Storytelling: Comparativo', icon: 'compare_arrows' },
    { id: 'drilldown',    label: 'Storytelling: Drilldown',   icon: 'unfold_more' }
  ].forEach((s) => {
    registerCommand({
      label: s.label,
      hint: 'Padrão narrativo',
      icon: s.icon,
      action: () => { store.set({ story: s.id }); emit('v8:story-change', { pattern: s.id }); }
    });
  });

  // Aparência
  registerCommand({
    label: 'Alternar modo escuro/claro',
    hint: 'Aparência',
    icon: 'dark_mode',
    action: () => toggleDarkMode(store)
  });

  // Sidebar
  registerCommand({
    label: 'Recolher/expandir sidebar',
    hint: 'Layout',
    icon: 'menu',
    action: () => toggleSidebar(store)
  });

  // Reset
  registerCommand({
    label: 'Resetar filtros e view',
    hint: 'Sistema',
    icon: 'restart_alt',
    action: () => window.__V8.reset()
  });

  // Imprimir
  registerCommand({
    label: 'Imprimir / Exportar PDF',
    hint: 'Relatório',
    icon: 'print',
    action: () => window.print()
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Gate boot by auth before rendering the app fully
  if (!isAuthenticated()) {
    await showLoginAndWait();
  }
  // F6.6: Hydrate mock.js with ETL snapshot if available (~50ms, fallback to mock on failure)
  await loadSnapshot();

  // Dataset (após loadSnapshot — se ETL disponível, obras já foram hidratadas em mock.js)
  const { obras, isDemo } = resolveDataset();

  // ─── Store ────────────────────────────────────────────────────────────────
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
      filters: {}, view: { page: 1, pageSize: 8 }, persona: 'managerial',
      activeView: 'overview', story: 'hierarchical'
    })
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function applyPersonaSideEffects() {
    const persona = getPersona(store.get().persona);
    document.body.dataset.density = persona.density;
  }

  function rebuildPaletteCommands() {
    clearCommands();

    // Navegação
    views.forEach((v) => {
      registerCommand({
        label: `Ir para: ${v.label}`,
        hint: 'Navegação',
        icon: v.icon,
        action: () => store.set({ activeView: v.id })
      });
    });

    // Personas
    ['exec', 'managerial', 'operational'].forEach((id) => {
      const p = getPersona(id);
      registerCommand({
        label: `Persona: ${p.label}`,
        hint: 'Densidade',
        icon: p.icon,
        action: () => store.set({ persona: id })
      });
    });

    // Storytelling
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

    // Aparência
    registerCommand({
      label: 'Alternar modo escuro/claro',
      hint: 'Aparência',
      icon: 'dark_mode',
      action: () => toggleDarkMode(store)
    });

    // Sidebar
    registerCommand({
      label: 'Recolher/expandir sidebar',
      hint: 'Layout',
      icon: 'menu',
      action: () => toggleSidebar(store)
    });

    // Reset
    registerCommand({
      label: 'Resetar filtros e view',
      hint: 'Sistema',
      icon: 'restart_alt',
      action: () => window.__V8.reset()
    });

    // Imprimir
    registerCommand({
      label: 'Imprimir / Exportar PDF',
      hint: 'Relatório',
      icon: 'print',
      action: () => window.print()
    });
  }

  const hostEl = document.getElementById('view-host');
  if (!hostEl) {
    console.error('[V8] #view-host não encontrado.');
    return;
  }

  // Init UI shell modules ----------------------------------------------------
  initDarkMode(store); // P1.1: recebe store para ler ui.theme
  initRipple(); // listener delegado [data-ripple]
  initCommandPalette(); // listener Cmd/Ctrl+K + paleta DOM
  initModal(); // P3: modal fullscreen para charts

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
    onOpenPalette: () => openPalette()
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

  // Persona side-effects iniciais
  applyPersonaSideEffects();

  // View controller -----------------------------------------------------------
  const ctx = { store, emit, on };
  const controller = createViewController(hostEl, views, ctx);
  controller.show(store.get().activeView);

  // Reveal observer (rodando após primeira view montada)
  initReveal(hostEl);

  // Command palette commands
  rebuildPaletteCommands();

  // Subscribers --------------------------------------------------------------
  let lastPersona = store.get().persona;
  let lastView = store.get().activeView;
  store.subscribe((state) => {
    if (state.persona !== lastPersona) {
      applyPersonaSideEffects();
      lastPersona = state.persona;
    }
    if (state.activeView !== lastView) {
      controller.show(state.activeView);
      // Re-init reveal para a nova view
      initReveal(hostEl);
      lastView = state.activeView;
    }
  });

  // Settings persistence — store é única fonte; subscriber persiste no localStorage
  let lastSettings = JSON.stringify(store.get().settings);
  store.subscribe((state) => {
    const cur = JSON.stringify(state.settings);
    if (cur !== lastSettings) {
      saveSettings(state.settings);
      lastSettings = cur;
    }
  });

  // UI persistence (P1.1) — store é única fonte; subscriber persiste no localStorage
  let lastUI = JSON.stringify(store.get().ui);
  store.subscribe((state) => {
    const cur = JSON.stringify(state.ui);
    if (cur !== lastUI) {
      saveUIState(state.ui);
      lastUI = cur;
    }
  });

  // Quando tema muda, força re-render da view atual (charts ApexCharts precisam recolorir)
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
});

// Helper: show login overlay and wait for authentication
async function showLoginAndWait() {
  return new Promise((resolve) => {
    mountLogin({ onSuccess: () => {
      hideLogin();
      resolve();
    }});
  });
}
