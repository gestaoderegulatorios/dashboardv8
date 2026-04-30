// Acessibilidade automatizada via axe-core contra o output REAL de cada view.
// Diferente da versão sintética anterior: monta a view via mount(host, ctx)
// com store mockada, captura o HTML produzido, e roda axe.
// Se a view real introduzir bug de a11y, o teste pega.
// P1.4: reescrito para mount() real em vez de HTML sintético.

import { it, expect } from './runner.js';
import axe from 'axe-core';
import { createStore } from '../src/model/store.js';
import { obras as mockObras } from '../src/model/mock.js';
import { overviewView } from '../src/view/overview.js';
import { worksView } from '../src/view/works.js';
import { reportsView } from '../src/view/reports.js';
import { settingsView } from '../src/view/settings.js';
import { DEFAULTS as settingsDefaults } from '../src/model/settings.js';

function createTestStore() {
  return createStore({
    data: { obras: mockObras },
    filters: {},
    view: { sortKey: undefined, sortDir: undefined, page: 1, pageSize: 8 },
    persona: 'managerial',
    activeView: 'overview',
    story: 'hierarchical',
    isDemo: false,
    settings: { ...settingsDefaults },
    ui: { sidebarOpen: false, theme: 'light' }
  });
}

/**
 * Monta a view real num host, roda axe-core, desmonta.
 * @param {{ mount: (host: HTMLElement, ctx: any) => (() => void) }} view
 * @param {string} label
 */
async function axeMountedView(view, label) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const store = createTestStore();
  const ctx = { store, emit: () => {}, on: () => {} };
  let unmount = null;
  try {
    unmount = view.mount(host, ctx);
    const results = await axe.run(host, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      rules: {
        // Desabilitadas em jsdom (não têm CSS real, layouts quebrados)
        'color-contrast': { enabled: true }, // Enabled for a11y checks in headless jsdom; real-browser tests recommended for final validation
        'region': { enabled: false },
        'landmark-one-main': { enabled: false },
        'page-has-heading-one': { enabled: false }
      }
    });
    return { violations: results.violations, label };
  } finally {
    if (typeof unmount === 'function') { try { unmount(); } catch {} }
    host.remove();
  }
}

it('view/overview: mount() real passa axe-core WCAG AA (sem color-contrast)', async () => {
  const result = await axeMountedView(overviewView, 'overview');
  const critical = result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (critical.length > 0) {
    const msgs = critical.map((v) => {
      const targets = v.nodes ? v.nodes.map((n) => n.target).join(', ') : '';
      return `${v.id}: ${v.description} [${targets}]`;
    }).join('; ');
    console.warn(`[a11y] overview violations: ${msgs}`);
  }
  expect(critical.length).toBe(0);
});

it('view/works: mount() real passa axe-core WCAG AA (sem color-contrast)', async () => {
  const result = await axeMountedView(worksView, 'works');
  const critical = result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (critical.length > 0) {
    const msgs = critical.map((v) => `${v.id}: ${v.description}`).join('; ');
    console.warn(`[a11y] works violations: ${msgs}`);
  }
  expect(critical.length).toBe(0);
});

it('view/settings: mount() real passa axe-core WCAG AA', async () => {
  const result = await axeMountedView(settingsView, 'settings');
  const critical = result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (critical.length > 0) {
    const msgs = critical.map((v) => `${v.id}: ${v.description}`).join('; ');
    console.warn(`[a11y] settings violations: ${msgs}`);
  }
  expect(critical.length).toBe(0);
});

it('view/reports: mount() real passa axe-core WCAG AA', async () => {
  const result = await axeMountedView(reportsView, 'reports');
  const critical = result.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (critical.length > 0) {
    const msgs = critical.map((v) => `${v.id}: ${v.description}`).join('; ');
    console.warn(`[a11y] reports violations: ${msgs}`);
  }
  expect(critical.length).toBe(0);
});
