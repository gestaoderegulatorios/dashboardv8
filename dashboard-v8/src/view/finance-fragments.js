// Finance Fragments (extracted from finance.js) - Bank of static data, template, and chart wiring

import { obraSchema } from '../domain/schema.js';
import { mountChart, tooltipBRL, getCSSVar } from '../domain/chart.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { escape } from './shared.js';
import { meses12, receitaMensal } from '../model/mock.js';
import { VIEW_LABELS } from '../model/branding.js';
import {
  FINANCE_MARGEM_LIQUIDA_PCT, FINANCE_INADIMPLENCIA_PCT, FINANCE_FLUXO_CAIXA,
  FINANCE_META_MULTIPLIER, FINANCE_META_MINIMA,
  FINANCE_WATERFALL, FINANCE_CUSTOS_TREEMAP,
  FINANCE_RECEITA_ROWS, FINANCE_CUSTOS_ROWS, FINANCE_MARGEM_ROWS,
  FINANCE_SPARK_MARGEM
} from '../model/constants.js';

// Dados estáticos (espelho V7 linhas 583–663)
const receitaAcumulada = receitaMensal.reduce((a, b) => a + b, 0);

export function financeTemplate() {
  return `
  <section class="view-section grid grid-cols-12 gap-6 p-5" role="region" aria-label="Financeiro">

    <!-- Filter Bar com datas -->
    <div class="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant p-4" aria-label="Filtros financeiros">
      <div class="flex flex-wrap items-center gap-3">
        <input type="search" id="fi-filter-search" aria-label="Pesquisar" placeholder="Pesquisar…" class="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20 transition-colors">
        <div class="flex items-center gap-2">
          <label for="fi-date-start" class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">De:</label>
          <input type="date" id="fi-date-start" aria-label="Data início financeiro" class="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm">
          <label for="fi-date-end" class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Até:</label>
          <input type="date" id="fi-date-end" aria-label="Data fim financeiro" class="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm">
        </div>
      </div>
    </div>

    <!-- 4 KPIs (espelho V7: Hero + Margem Líquida + Inadimplência + Fluxo de Caixa) -->
    <div class="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
      <!-- Hero: Receita Acumulada -->
      <div class="bg-primary-container rounded-xl border border-outline-variant p-5 card-tilt border-glow" aria-label="Receita Acumulada">
        <div class="text-xs uppercase text-on-primary-container font-semibold mb-1">Receita Acumulada</div>
        <div class="text-3xl font-extrabold text-white" data-animate-value data-target="${receitaAcumulada}" data-prefix="R$ " data-format="full" aria-live="polite">R$ 0</div>
        <div class="text-sm text-on-primary-container">+3,2% vs meta</div>
      </div>
      <!-- Margem Líquida -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 card-lift" aria-label="Margem Líquida">
        <div class="text-xs uppercase text-on-surface-variant font-semibold mb-1">Margem Líquida</div>
        <div class="text-3xl font-extrabold text-primary tabular-nums" data-animate-value data-target="${FINANCE_MARGEM_LIQUIDA_PCT}" data-suffix="%" aria-live="polite">0%</div>
        <div class="text-sm text-on-surface-variant">+1,8pp</div>
        <div id="fi-spark-margem" class="mt-2 h-6" role="img" aria-label="Sparkline margem"></div>
      </div>
      <!-- Inadimplência -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 card-lift" aria-label="Inadimplência">
        <div class="text-xs uppercase text-on-surface-variant font-semibold mb-1">Inadimplência</div>
        <div class="text-3xl font-extrabold text-primary tabular-nums" data-animate-value data-target="${FINANCE_INADIMPLENCIA_PCT}" data-suffix="%" aria-live="polite">0%</div>
        <div class="w-full bg-surface-container-low h-2 rounded mt-2" aria-label="Progresso inadimplência"><span class="block h-2 rounded bg-error" style="width:31%"></span></div>
      </div>
      <!-- Fluxo de Caixa -->
      <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 card-lift" aria-label="Fluxo de Caixa">
        <div class="text-xs uppercase text-on-surface-variant font-semibold mb-1">Fluxo de Caixa</div>
        <div class="text-3xl font-extrabold text-primary tabular-nums" data-animate-value data-target="${FINANCE_FLUXO_CAIXA}" data-prefix="R$ " data-format="full" aria-live="polite">R$ 0</div>
        <div class="text-sm text-on-surface-variant">Disponível</div>
      </div>
    </div>

    <!-- Charts: Waterfall + Receita vs Meta + Treemap (espelho V7) -->
    <div class="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Demonstrativo de Resultados">
        <div class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">Waterfall <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="fi-chart-waterfall" data-title="Demonstrativo de Resultados" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
    <div id="fi-chart-waterfall" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico waterfall"></div>
      </div>
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Receita vs Meta">
        <div class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">Receita vs Meta <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="fi-chart-line" data-title="Receita vs Meta" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
        <div id="fi-chart-line" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico linha com anotações"></div>
      </div>
      <div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Composição Custos">
        <div class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center justify-between">Custos (Treemap) <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="fi-chart-treemap" data-title="Composição de Custos" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
        <div id="fi-chart-treemap" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico treemap de custos"></div>
      </div>
    </div>

    <!-- Tabela com Tabs -->
    <div class="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant p-4" aria-label="Tabela financeira com tabs">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Receita | Custos | Margem</span>
        <div class="flex gap-2" role="tablist" aria-label="Tabs de visão financeira">
          <button class="tab-btn px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary-container text-white border-b-2 border-surface-tint" data-tab="receita" role="tab" aria-selected="true">Receita</button>
          <button class="tab-btn px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant border-b-2 border-transparent" data-tab="custos" role="tab" aria-selected="false">Custos</button>
          <button class="tab-btn px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant border-b-2 border-transparent" data-tab="margem" role="tab" aria-selected="false">Margem</button>
        </div>
      </div>
      <div data-panel="receita" role="tabpanel" aria-label="Painel de receita">
        <table class="w-full text-sm" aria-label="Tabela de receita"><thead><tr><th scope="col" class="px-3 py-2 text-left text-xs font-semibold text-on-surface-variant">Item</th><th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Valor</th><th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Meta</th><th scope="col" class="px-3 py-2 text-center text-xs font-semibold text-on-surface-variant">Status</th></tr></thead><tbody>
        ${FINANCE_RECEITA_ROWS.map(r => `<tr class="border-t border-outline-variant"><td class="px-3 py-2">${escape(r.item)}</td><td class="px-3 py-2 text-right tabular-nums">${obraSchema.formats.currency(r.valor)}</td><td class="px-3 py-2 text-right tabular-nums">${obraSchema.formats.currency(r.meta)}</td><td class="px-3 py-2 text-center"><span class="px-2 py-0.5 rounded-[9999px] ${r.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-on-tertiary-container'} text-xs font-semibold">${r.status === 'ok' ? 'OK' : 'Atenção'}</span></td></tr>`).join('')}
        </tbody></table>
      </div>
      <div data-panel="custos" class="hidden" role="tabpanel" aria-label="Painel de custos">
        <table class="w-full text-sm" aria-label="Tabela de custos"><thead><tr><th scope="col" class="px-3 py-2 text-left text-xs font-semibold text-on-surface-variant">Item</th><th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Valor</th><th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Meta</th></tr></thead><tbody>
        ${FINANCE_CUSTOS_ROWS.map(r => `<tr class="border-t border-outline-variant"><td class="px-3 py-2">${escape(r.item)}</td><td class="px-3 py-2 text-right tabular-nums">${obraSchema.formats.currency(r.valor)}</td><td class="px-3 py-2 text-right tabular-nums">${obraSchema.formats.currency(r.meta)}</td></tr>`).join('')}
        </tbody></table>
      </div>
      <div data-panel="margem" class="hidden" role="tabpanel" aria-label="Painel de margem">
        <table class="w-full text-sm" aria-label="Tabela de margem"><thead><tr><th scope="col" class="px-3 py-2 text-left text-xs font-semibold text-on-surface-variant">Item</th><th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Valor</th></tr></thead><tbody>
        ${FINANCE_MARGEM_ROWS.map(r => `<tr class="border-t border-outline-variant"><td class="px-3 py-2">${escape(r.item)}</td><td class="px-3 py-2 text-right tabular-nums">${r.valor}</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>

  </section>`;
}

export function mountFinanceCharts(host, charts) {
  // Waterfall
  const wf = host.querySelector('#fi-chart-waterfall');
  if (wf) {
    charts.waterfall = mountChart(wf, {
      chart: { type: 'bar', height: 280 },
      dataCurrency: true,
      series: [{ name: 'Variação', data: FINANCE_WATERFALL.map(d => d.value) }],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '50%', colors: { ranges: [{ from: -999999999, to: 0, color: getCSSVar('--chart-status-bad', '#ba1a1a') }, { from: 1, to: 999999999, color: getCSSVar('--chart-status-good', '#2e7d32') }] } } },
      xaxis: { categories: FINANCE_WATERFALL.map(d => d.label) },
      dataLabels: { enabled: true, formatter: (val) => tooltipBRL(val), style: { fontSize: '9px' } },
      tooltip: { y: { formatter: tooltipBRL } }
    });
  }

  // Receita vs Meta (linha)
  const lineEl = host.querySelector('#fi-chart-line');
  if (lineEl) {
    const metaArr = receitaMensal.map(v => Math.round(v * FINANCE_META_MULTIPLIER));
    charts.line = mountChart(lineEl, {
      chart: { type: 'line', height: 280 },
      dataCurrency: true,
      series: [
        { name: 'Real', data: receitaMensal },
        { name: 'Meta', data: metaArr }
      ],
      xaxis: { categories: meses12 },
      stroke: { width: [3, 2], dashArray: [0, 5], curve: 'smooth' },
      annotations: { yaxis: [{ y: FINANCE_META_MINIMA, borderColor: getCSSVar('--chart-status-bad', '#ba1a1a'), label: { text: 'Meta Mínima', style: { fontSize: '10px', color: getCSSVar('--color-on-error', '#ffffff'), background: getCSSVar('--chart-status-bad', '#ba1a1a') } } }] },
      tooltip: { y: { formatter: tooltipBRL } },
      colors: [getCSSVar('--chart-categorical-1', '#4c5e86'), getCSSVar('--chart-categorical-3', '#b37c59')]
    });
  }

  // Treemap
  const treemapEl = host.querySelector('#fi-chart-treemap');
  if (treemapEl) {
    charts.treemap = mountChart(treemapEl, {
      chart: { type: 'treemap', height: 280 },
      dataCurrency: true,
      series: [{ data: FINANCE_CUSTOS_TREEMAP.map(d => ({ x: d.name, y: d.value })) }],
      colors: [1,2,3,4,5,6].map(i => getCSSVar(`--chart-categorical-${i}`, '#4c5e86')),
      tooltip: { y: { formatter: tooltipBRL } }
    });
  }

  // Sparkline (margem)
  const sparkM = host.querySelector('#fi-spark-margem');
  if (sparkM) {
    charts.sparkM = mountChart(sparkM, {
      chart: { type: 'line', height: 24, sparkline: { enabled: true } },
      series: [{ data: FINANCE_SPARK_MARGEM }],
      stroke: { width: 2, curve: 'smooth' },
      tooltip: { enabled: false },
      colors: [getCSSVar('--chart-categorical-2', '#0a1f44')]
    });
  }

  // Hook up tab switching via dedicated function
  // Do not include tab logic here to avoid coupling; use wireFinanceTabs(host) externally
  // After mounting charts, init basic animations/reveal for host
  initAnimatedValues(host);
  initReveal(host);
}

export function wireFinanceTabs(host) {
  // Tab switching (event delegation)
  host.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      host.querySelectorAll('[data-panel]').forEach(p => { p.classList.toggle('hidden', p.dataset.panel !== tab); });
      host.querySelectorAll('[data-tab]').forEach(t => {
        const isActive = t.dataset.tab === tab;
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.className = isActive
          ? 'tab-btn px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary-container text-white border-b-2 border-surface-tint'
          : 'tab-btn px-3 py-1.5 rounded-lg text-sm font-medium text-on-surface-variant border-b-2 border-transparent';
      });
    });
  });
}

export { VIEW_LABELS };
