// Chart wrapper. Lifecycle obrigatório: create / update / updateSeries / resize / destroy.
// Resolve POR CONSTRUÇÃO o bug do V7 onde modal/fullscreen reconstruía instância e leakava.
// Cada chart é uma instância isolada com ResizeObserver próprio.
//
// Estilo = espelho V7 (borgChartDefaults: paleta Inter 11px, easeinout 800ms,
// grid #e0e3e5 strokeDashArray 4, BRL formatter).
//
// F2: borgChartDefaults é uma FUNÇÃO (lazy init) — cores CSS vars são lidas
// quando mountChart() é chamado, não no import time. Isso permite tree-shaking
// e garante que cores reagem a mudanças de tema entre mounts.
//
// Registry: salva as opções de cada chart (espelho V7 state.chartConfigs)
// para que openChartFullscreen possa clonar via JSON.parse(JSON.stringify()).

/** @type {Map<string, object>} chartId → options (salvo na criação) */
const _chartConfigs = new Map();

/** Recupera as opções salvas de um chart (para openChartFullscreen). */
export function getChartConfig(chartId) { return _chartConfigs.get(chartId); }

// ─── Defaults V7 (espelho) ───────────────────────────────────────────────────
// Helper: read CSS Custom Properties from :root with safe fallback
export function getCSSVar(name, fallback = '') {
  if (typeof document === 'undefined' || !document.documentElement) return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val || fallback;
}

/**
 * Retorna um objeto fresco de defaults para ApexCharts.
 * F2: convertido de `export const` para `export function` — lazy init.
 * Cores CSS vars são lidas aqui, no momento do mount, não no import time.
 * Isso permite: (1) tree-shaking, (2) cores reagem a tema entre mounts.
 */
export function getChartDefaults() {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  return {
    chart: {
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      background: 'transparent',
      animations: { enabled: true, easing: 'easeinout', speed: 800, dynamicAnimation: { enabled: true, speed: 400 } },
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      theme: { mode: isDark ? 'dark' : 'light' }
    },
    colors: [
      getCSSVar('--chart-categorical-1', '#4c5e86'),
      getCSSVar('--chart-categorical-2', '#0a1f44'),
      getCSSVar('--chart-categorical-3', '#b37c59'),
      getCSSVar('--chart-categorical-4', '#ba1a1a'),
      getCSSVar('--chart-categorical-5', '#7687b2'),
      getCSSVar('--chart-categorical-6', '#585e70'),
    ],
    grid: { borderColor: getCSSVar('--chart-grid', '#e0e3e5'), strokeDashArray: 4, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    xaxis: {
      labels: { style: { colors: getCSSVar('--chart-axis-label', '#75777f'), fontSize: '11px', fontFamily: 'Inter', fontWeight: 700 } },
      axisBorder: { color: getCSSVar('--chart-axis-border', '#e5e7eb') },
      axisTicks: { color: getCSSVar('--chart-axis-border', '#e5e7eb') }
    },
    yaxis: {
      labels: {
        style: { colors: getCSSVar('--chart-axis-label', '#75777f'), fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 },
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
    legend: { fontSize: '11px', fontFamily: 'Inter', fontWeight: 500, labels: { colors: getCSSVar('--chart-legend', '#44464e') }, markers: { radius: 2 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    states: { hover: { filter: { type: 'darken', value: 0.9 } }, active: { filter: { type: 'darken', value: 0.85 } } }
  };
}

// Backward compat alias — views que importavam `borgChartDefaults` continuam funcionando
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

export function getSequentialPalette() {
  return [
    getCSSVar('--chart-sequential-1', '#d9e2ff'),
    getCSSVar('--chart-sequential-2', '#b4c6f4'),
    getCSSVar('--chart-sequential-3', '#7687b2'),
    getCSSVar('--chart-sequential-4', '#4c5e86'),
    getCSSVar('--chart-sequential-5', '#34466d'),
    getCSSVar('--chart-sequential-6', '#0a1f44'),
  ];
}

export function getDivergentPalette() {
  return [
    getCSSVar('--chart-divergent-1', '#ba1a1a'),
    getCSSVar('--chart-divergent-2', '#e57373'),
    getCSSVar('--chart-divergent-3', '#e0e3e5'),
    getCSSVar('--chart-divergent-4', '#81c784'),
    getCSSVar('--chart-divergent-5', '#2e7d32'),
  ];
}

export const tooltipBRL = (val) => val != null ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : val;
export const tooltipPercent = (val) => val != null ? val.toFixed(1) + '%' : val;
export const tooltipInteger = (val) => val != null ? Math.round(val).toLocaleString('pt-BR') : val;
export const getGaugeColor = (v) =>
  v < 40 ? getCSSVar('--chart-status-bad', '#ba1a1a') :
  v < 70 ? getCSSVar('--chart-status-warn', '#b37c59') :
  getCSSVar('--chart-status-good', '#2e7d32');

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
export function mountChart(container, options) {
  if (typeof window === 'undefined' || !window.ApexCharts) {
    container.innerHTML = '<p class="text-xs text-on-surface-variant p-4">ApexCharts não carregado.</p>';
    return noopHandle();
  }

  const merged = deepMerge(getChartDefaults(), options || {});

  // Salva config no registry (espelho V7 state.chartConfigs)
  if (container.id) _chartConfigs.set(container.id, merged);

  const chart = new window.ApexCharts(container, merged);
  chart.render();

  let observer = null;
  if (typeof window.ResizeObserver !== 'undefined') {
    observer = new window.ResizeObserver(() => {
      try { chart.updateOptions({}, false, false); } catch (e) {}
    });
    observer.observe(container);
  }

  let destroyed = false;
  return {
    instance: chart,
    update(newOptions) {
      if (destroyed) return;
      try { chart.updateOptions(newOptions, false, true); } catch (e) {}
    },
    updateSeries(series) {
      if (destroyed) return;
      try { chart.updateSeries(series, true); } catch (e) {}
    },
    resize() {
      if (destroyed) return;
      try { chart.updateOptions({}, false, false); } catch (e) {}
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      try { observer && observer.disconnect(); } catch (e) {}
      observer = null;
      try { chart.destroy(); } catch (e) {}
    }
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
      // Não propaga undefined — pode corromper ApexCharts (ex.: fill: undefined)
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

/**
 * Constrói opções para um bar chart de Avanço por Obra (espelho V7).
 * Função pura — não acessa DOM. Mantém compatibilidade com testes anteriores.
 * @param {Array<{nome: string, avanco: number}>} obras
 */
export function buildAvancoBarOptions(obras) {
  return {
    chart: { type: 'bar', height: 320 },
    series: [{ name: 'Avanço', data: obras.map((o) => o.avanco) }],
    xaxis: {
      categories: obras.map((o) => o.nome),
      min: 0, max: 100,
      labels: { formatter: (v) => `${Math.round(Number(v))}%` }
    },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%', dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      formatter: (v) => `${v}%`,
      offsetX: 28,
      style: { colors: [getCSSVar('--chart-datalabel', '#0a1f44')], fontSize: '11px', fontWeight: 600 }
    },
    colors: [getCSSVar('--chart-categorical-1', '#4c5e86')],
    tooltip: { y: { formatter: (v) => `${v}%` } }
  };
}

/**
 * Opções para o donut "Composição por Tipo" (espelho V7).
 * @param {Array<{name: string, value: number}>} composicao
 */
export function buildComposicaoDonutOptions(composicao) {
  return {
    chart: { type: 'donut', height: 320 },
    series: composicao.map((c) => c.value),
    labels: composicao.map((c) => c.name),
    plotOptions: { donut: { size: '70%' } },
    tooltip: { y: { formatter: tooltipPercent } },
    legend: { position: 'bottom' }
  };
}

/**
 * Opções para a área "Evolução Receita 12 meses" (espelho V7).
 * @param {string[]} meses
 * @param {number[]} receitaMensal
 */
export function buildReceitaAreaOptions(meses, receitaMensal) {
  return {
    chart: { type: 'area', height: 320 },
    dataCurrency: true,
    series: [{ name: 'Receita', data: receitaMensal }],
    xaxis: { categories: meses },
    tooltip: { y: { formatter: tooltipBRL } },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.6, opacityTo: 0.1 } }
  };
}

/**
 * Opções para o gauge radial (espelho V7).
 * @param {number} percent 0..100
 * @param {string} [label]
 */
export function buildGaugeOptions(percent, label) {
  return {
    chart: { type: 'radialBar', height: 280 },
    series: [percent],
    labels: [label || 'Meta'],
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        dataLabels: { name: { show: true, fontSize: '14px' }, value: { show: true, fontSize: '28px', formatter: (v) => v + '%' } }
      }
    },
    colors: [getGaugeColor(percent)]
  };
}

/**
 * Sparkline genérico (linha pequena sem eixos). Espelho V7.
 * @param {number[]} data
 * @param {string} [color]
 * @param {'line'|'area'} [type]
 */
export function buildSparklineOptions(data, color, type) {
  const opts = {
    chart: { type: type || 'line', height: 40, sparkline: { enabled: true } },
    series: [{ data }],
    stroke: { width: 2, curve: 'smooth' },
    tooltip: { enabled: false },
    colors: [color || getCSSVar('--chart-status-good', '#2e7d32')]
  };
  if (type === 'area') opts.fill = { type: 'gradient', gradient: { opacityFrom: 0.5, opacityTo: 0.05 } };
  return opts;
}
