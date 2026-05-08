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

import { safeDestroy, safeDisconnect, safeUpdate, safeUpdateSeries } from '../ui/safe-cleanup.js';
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
      animations: { enabled: true, easing: 'easeinout', speed: 1200, dynamicAnimation: { enabled: true, speed: 550 }, animateGradually: { enabled: true, delay: 150 } },
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

  let observer = null;
  let destroyed = false;
  let chart = null;

  requestAnimationFrame(() => {
    if (destroyed) return;
    chart = new window.ApexCharts(container, merged);
    chart.render();
    if (typeof window.ResizeObserver !== 'undefined') {
      observer = new window.ResizeObserver(() => safeUpdate(chart, {}, false, false));
      observer.observe(container);
    }
  });

  return {
    instance: chart,
    update(newOptions) { if (destroyed) return; safeUpdate(chart, newOptions, false, true); },
    updateSeries(series) { if (destroyed) return; safeUpdateSeries(chart, series, true); },
    resize() { if (destroyed) return; safeUpdate(chart, {}, false, false); },
    destroy() { if (destroyed) return; destroyed = true; safeDisconnect(observer); observer = null; safeDestroy(chart); }
  };
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
