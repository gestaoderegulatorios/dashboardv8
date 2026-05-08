// Chart wrapper. Lifecycle obrigatório: create / update / updateSeries / resize / destroy.
// Resolve POR CONSTRUÇÃO o bug do V7 onde modal/fullscreen reconstruía instância e leakava.
// Cada chart é uma instância isolada com ResizeObserver próprio.
//
// Estilo = espelho V7 (borgChartDefaults: paleta Inter 11px, easeinout 800ms,
// grid var(--chart-grid) strokeDashArray 4, BRL formatter).
//
// F2: borgChartDefaults é uma FUNÇÃO (lazy init) -- cores CSS vars são lidas
// quando mountChart() é chamado, não no import time. Isso permite tree-shaking
// e garante que cores reagem a mudanças de tema entre mounts.
//
// Registry: salva as opções de cada chart (espelho V7 state.chartConfigs)
// para que openChartFullscreen possa clonar via JSON.parse(JSON.stringify()).

import { safeDestroy, safeUpdate, safeUpdateSeries } from '../ui/safe-cleanup.js';
import { resolveCSSVar, isThemeDark, readChartTheme } from './chart-theme.js';

// Re-export for consumers that need theme injection
export { readChartTheme, resolveCSSVar, isThemeDark, CSS_VAR_MAP } from './chart-theme.js';

// Backward-compat: expose fragment builders from chart-fragments.js
export {
  tooltipBRL, tooltipPercent, tooltipInteger, getGaugeColor,
  buildAvancoBarOptions, buildComposicaoDonutOptions, buildReceitaAreaOptions,
  buildGaugeOptions, buildSparklineOptions
} from './chart-fragments.js';

/** @type {Map<string, object>} chartId → options (salvo na criação) */
const _chartConfigs = new Map();

/** Recupera as opções salvas de um chart (para openChartFullscreen). */
export function getChartConfig(chartId) { return _chartConfigs.get(chartId); }

// ─── Defaults V7 (espelho) ───────────────────────────────────────────────────
// F2.2: getCSSVar now delegates to resolveCSSVar with an optional theme param.
// If no theme is provided, it reads from DOM (backward compat).
// New code should pass theme explicitly for testability.
export function getCSSVar(name, fallback = '', theme) {
  if (theme) return resolveCSSVar(theme, name, fallback);
  // Backward compat: read from DOM if no theme provided
  return resolveCSSVar(readChartTheme(), name, fallback);
}

/**
 * Retorna um objeto fresco de defaults para ApexCharts.
 * F2.2: aceita theme opcional (de readChartTheme()). Se não fornecido, lê do DOM.
 * @param {Record<string, string|boolean>} [theme] -- pre-read CSS vars for testability
 */
export function getChartDefaults(theme) {
  const t = theme || readChartTheme();
  const isDark = isThemeDark(t);
  return {
    chart: {
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      background: 'transparent',
      animations: { enabled: true, easing: 'easeinout', speed: 800, animateGradually: { enabled: true, delay: 150 }, dynamicAnimation: { enabled: true, speed: 800 } },
      theme: { mode: isDark ? 'dark' : 'light' }
    },
colors: [
    resolveCSSVar(t, '--chart-categorical-1', '#4c5e86'),
    resolveCSSVar(t, '--chart-categorical-2', '#0a1f44'),
    resolveCSSVar(t, '--chart-categorical-3', '#b37c59'),
    resolveCSSVar(t, '--chart-categorical-4', '#ba1a1a'),
    resolveCSSVar(t, '--chart-categorical-5', '#7687b2'),
    resolveCSSVar(t, '--chart-categorical-6', '#585e70'),
  ],
  grid: { borderColor: resolveCSSVar(t, '--chart-grid', '#e0e3e5'), strokeDashArray: 4, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
  xaxis: {
    labels: { style: { colors: resolveCSSVar(t, '--chart-axis-label', '#75777f'), fontSize: '11px', fontFamily: 'Inter', fontWeight: 700 } },
    axisBorder: { color: resolveCSSVar(t, '--chart-axis-border', '#e5e7eb') },
    axisTicks: { color: resolveCSSVar(t, '--chart-axis-border', '#e5e7eb') }
  },
  yaxis: {
    labels: {
      style: { colors: resolveCSSVar(t, '--chart-axis-label', '#75777f'), fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 },
        formatter: function (val) {
          if (val == null) return '';
          if (this && this.chart && this.chart.w && this.chart.w.config && this.chart.w.config.dataCurrency) {
            return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          }
          return val.toLocaleString('pt-BR');
        }
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'Inter' }
    },
    legend: { fontSize: '11px', fontFamily: 'Inter', fontWeight: 500, labels: { colors: resolveCSSVar(t, '--chart-legend', '#44464e') }, markers: { radius: 2 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    states: { hover: { filter: { type: 'darken', value: 0.9 } }, active: { filter: { type: 'darken', value: 0.85 } } }
  };
}

// Backward compat alias -- views que importavam `borgChartDefaults` continuam funcionando
// mas agora recebem um getter que retorna objeto fresco a cada acesso.
// ATENÇÃO: usar getChartDefaults() diretamente é preferível para evitar re-criação
// em cada property access. Este alias existe só para compat com código legado.
export const borgChartDefaults = new Proxy({}, {
  get(_target, prop) {
    const defaults = getChartDefaults();
    return defaults[prop];
  },
  ownKeys() { return Reflect.ownKeys(getChartDefaults()); },
  getOwnPropertyDescriptor(_target, prop) {
    const defaults = getChartDefaults();
    if (prop in defaults) return { configurable: true, enumerable: true, value: defaults[prop] };
    return undefined;
  }
});

export function getSequentialPalette(theme) {
  const t = theme || readChartTheme();
  return [
    resolveCSSVar(t, '--chart-sequential-1', '#d9e2ff'),
    resolveCSSVar(t, '--chart-sequential-2', '#b4c6f4'),
    resolveCSSVar(t, '--chart-sequential-3', '#7687b2'),
    resolveCSSVar(t, '--chart-sequential-4', '#4c5e86'),
    resolveCSSVar(t, '--chart-sequential-5', '#34466d'),
    resolveCSSVar(t, '--chart-sequential-6', '#0a1f44'),
  ];
}

export function getDivergentPalette(theme) {
  const t = theme || readChartTheme();
  return [
    resolveCSSVar(t, '--chart-divergent-1', '#ba1a1a'),
    resolveCSSVar(t, '--chart-divergent-2', '#e57373'),
    resolveCSSVar(t, '--chart-divergent-3', '#e0e3e5'),
    resolveCSSVar(t, '--chart-divergent-4', '#81c784'),
    resolveCSSVar(t, '--chart-divergent-5', '#2e7d32'),
  ];
}

// Builders moved to chart-fragments.js

/**
 * @typedef {Object} ChartHandle
 * @property {object|null} instance
 * @property {(opts: object) => void} update
 * @property {(series: any[]) => void} updateSeries
 * @property {() => void} resize
 * @property {() => void} destroy
 */

/**
 * Cria um chart com defaults V7 + lifecycle gerenciado.
 * F2: usa getChartDefaults() para lazy init das cores.
 * @param {HTMLElement} container
 * @param {object} options
 * @returns {ChartHandle}
 */
export function mountChart(container, options, theme) {
  if (typeof window === 'undefined' || !window.ApexCharts) {
    container.innerHTML = '<p class="text-xs text-on-surface-variant p-4">ApexCharts não carregado.</p>';
    return noopHandle();
  }

  const merged = deepMerge(getChartDefaults(theme), options || {});
  if (container.id) _chartConfigs.set(container.id, merged);

  const staged = buildEntranceSeries(merged);
  return createChartHandle(container, merged, staged);
}

function createChartHandle(container, merged, staged) {
  let destroyed = false;
  let chart = null;
  let revealObserver = null;
  let revealTimer = null;

  function cleanupPendingReveal() {
    if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
    if (revealTimer) { clearTimeout(revealTimer); revealTimer = null; }
  }

  function renderWhenReady() {
    cleanupPendingReveal();
    const opts = staged ? deepMerge(merged, { series: staged.zeroSeries }) : merged;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (destroyed) return;
        chart = new window.ApexCharts(container, opts);
        const rendered = chart.render();
        Promise.resolve(rendered).then(() => scheduleEntranceUpdate({ chart, staged, isDestroyed: () => destroyed }));
      });
    });
  }

  const revealHost = container.closest('.reveal');
  if (revealHost && !revealHost.classList.contains('revealed')) {
    revealObserver = new MutationObserver(() => { if (revealHost.classList.contains('revealed')) renderWhenReady(); });
    revealObserver.observe(revealHost, { attributes: true, attributeFilter: ['class'] });
    revealTimer = setTimeout(renderWhenReady, 700);
  } else {
    renderWhenReady();
  }

  return {
    get instance() { return chart; },
    update(opts) { safeUpdate(chart, opts); },
    updateSeries(series) { safeUpdateSeries(chart, series, true); },
    resize() { if (chart && typeof chart.resize === 'function') chart.resize(); },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cleanupPendingReveal();
      safeDestroy(chart);
    }
  };
}

function scheduleEntranceUpdate({ chart, staged, isDestroyed }) {
  if (!staged || isDestroyed()) return;
  // Dois paints + atraso curto garantem que o usuário veja o estado zero antes do update animado.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!isDestroyed() && chart && typeof chart.updateSeries === 'function') {
          chart.updateSeries(staged.realSeries, true);
        }
      }, 120);
    });
  });
}

function noopHandle() {
  return { instance: null, update() {}, updateSeries() {}, resize() {}, destroy() {} };
}

function deepMerge(a, b) {
  if (!b) return a;
  const out = Array.isArray(a) ? a.slice() : { ...a };
  for (const k of Object.keys(b)) {
    const av = a ? a[k] : undefined, bv = b[k];
    if (bv === undefined) {
      // Não propaga undefined -- pode corromper ApexCharts (ex.: fill: undefined)
      continue;
    }
    if (av && typeof av === 'object' && !Array.isArray(av) &&
      bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = deepMerge(av, bv);
    } else {
      out[k] = bv;
    }
  }
  return out;
}

function buildEntranceSeries(options) {
  const type = options && options.chart && options.chart.type;
  if (!['bar', 'line', 'area', 'radialBar'].includes(type)) return null;
  if (!Array.isArray(options.series) || options.series.length === 0) return null;

  const realSeries = clone(options.series);
  const zeroSeries = realSeries.map(zeroSeriesEntry);
  return { realSeries, zeroSeries };
}

function zeroSeriesEntry(entry) {
  if (typeof entry === 'number') return 0;
  if (Array.isArray(entry)) return entry.map(zeroSeriesEntry);
  if (!entry || typeof entry !== 'object') return entry;
  if (Array.isArray(entry.data)) return { ...entry, data: entry.data.map(zeroDatum) };
  if (typeof entry.y === 'number') return { ...entry, y: 0 };
  return entry;
}

function zeroDatum(value) {
  if (typeof value === 'number') return 0;
  if (Array.isArray(value)) return value.map(zeroDatum);
  if (!value || typeof value !== 'object') return value;
  if (typeof value.y === 'number') return { ...value, y: 0 };
  return value;
}

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
