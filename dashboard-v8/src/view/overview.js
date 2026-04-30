// View: Visão Geral. Espelho V7 — KPI Hero (Receita) + 3 standards + área 12 meses
// + donut tipo + gauge meta anual + alertas + KPI margem bruta com sparkline.
// Fase 4: Consome renderKPI/obraKPIs (kpi/kpi.js), dados de data/mock.js, persona.

import { obraSchema } from '../domain/schema.js';
import { VIEW_LABELS } from '../model/branding.js';
import { mountChart, buildReceitaAreaOptions, buildComposicaoDonutOptions, buildGaugeOptions, buildSparklineOptions, getCSSVar } from '../domain/chart.js';
import { applyFilters } from '../domain/filter.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { escape } from './shared.js';
import { obraKPIs, computeKPI, renderKPI } from '../domain/kpi.js';
import { getPersona, orderKPIsByPersona } from '../domain/persona.js';
import { meses12, receitaMensal, composicaoTipo, margemSpark, heroSpark, metaAnualPercent } from '../model/mock.js';

// KPI Hero específico da Visão Geral (Receita Mensal). Renderizado via kpi/renderKPI
// variant 'hero' — mantém o único caminho de renderização de KPI no projeto
// (espelha o padrão worksExtraKPIs em view/works.js).
const receitaAtual = receitaMensal[receitaMensal.length - 1];
const overviewExtraKPIs = [
  {
    id: 'receita-mensal',
    label: 'Receita Mensal',
    variant: 'hero',
    period: 'Mar/26',
    unit: 'ÚLTIMA MEDIDA',
    sparklineId: 'ov-spark-hero',
    prefix: 'R$ ',
    animateFormat: 'full',
    compute: () => receitaAtual,
    format: (v) => obraSchema.formats.currency(v),
    target: receitaAtual
  }
];

/**
 * @param {HTMLElement} host
 * @param {{ store: any }} ctx
 * @returns {() => void}
 */
export function mount(host, ctx) {
  const charts = {};
  let unsubscribe = null;

  function getObras() {
    const s = ctx.store.get();
    return applyFilters(s.data.obras, s.filters);
  }

  function template() {
    const obras = getObras();
    const persona = getPersona(ctx.store.get().persona);

    // KPIs canônicos (ordenados por persona)
    const orderedKPIs = orderKPIsByPersona(obraKPIs, persona);
    const kpiResults = orderedKPIs.map((desc) => computeKPI(desc, obras));

    // Margem Bruta (derivada das obras)
    const margemBruta = obraSchema.measures.margemBrutaPercent(obras);

    return `
<section class="view-section grid grid-cols-12 gap-6 p-6 lg:p-8" role="region" aria-label="Visão Geral">

  <!-- F9.6: 4 KPIs em fileira única (Hero + 3 canônicos), todos col-span-3 -->
  <div class="col-span-12 grid grid-cols-12 gap-4 stagger" style="grid-auto-rows:min-content">
    <div class="col-span-12 sm:col-span-6 xl:col-span-3" data-kpi-slot="receita-mensal"></div>
    ${kpiResults.map((kpi) => `
    <div class="col-span-6 sm:col-span-3" data-kpi-slot="${escape(kpi.meta.id)}"></div>
    `).join('')}
  </div>

  <!-- Charts: área 12 meses (2/3) + donut tipo (1/3) -->
  <div class="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Evolução da Receita 12 meses">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Evolução Receita</span>
        <div class="flex items-center gap-2"><span class="text-xs text-on-surface-variant">12 meses</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-area" data-title="Evolução Receita 12 Meses" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
      </div>
      <div id="ov-chart-area" class="w-full h-[320px]" role="img" aria-label="Gráfico de evolução da receita"></div>
    </div>

    <div class="lg:col-span-1 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Composição por Tipo">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Composição por Tipo</span>
        <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-donut" data-title="Composição por Tipo" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button>
      </div>
      <div id="ov-chart-donut" class="w-full h-[320px]" role="img" aria-label="Donut de composição por tipo"></div>
    </div>
  </div>

  <!-- F9.3: Gauge + Status panel (border-l-4 semântico, tematizável) lado a lado -->
  <div class="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Meta Anual">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Meta Anual</span>
        <div class="flex items-center gap-2"><span class="text-xs text-on-surface-variant">${metaAnualPercent}%</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-gauge" data-title="Meta Anual" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
      </div>
      <div id="ov-chart-gauge" class="w-full h-[280px]" role="img" aria-label="Gauge de meta anual"></div>
    </div>

    <aside class="lg:col-span-2 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Status do empreendimento">
      <h3 class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Status</h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 rounded-lg border-l-4 border-error bg-surface-container-low" role="alert" aria-label="Alerta crítico">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-error text-base" aria-hidden="true">error</span>
            <span class="text-sm font-semibold text-on-surface">Crítico</span>
            <span class="text-xs font-bold text-on-surface-variant bg-surface-container px-1.5 rounded">2</span>
          </div>
          <span class="text-xs text-on-surface-variant">Agora</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg border-l-4 border-warning bg-surface-container-low" role="status" aria-label="Alerta atenção">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-warning text-base" aria-hidden="true">warning</span>
            <span class="text-sm font-semibold text-on-surface">Atenção</span>
            <span class="text-xs font-bold text-on-surface-variant bg-surface-container px-1.5 rounded">2</span>
          </div>
          <span class="text-xs text-on-surface-variant">Hoje</span>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg border-l-4 border-info bg-surface-container-low" role="status" aria-label="Alerta info">
          <div class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-info text-base" aria-hidden="true">info</span>
            <span class="text-sm font-semibold text-on-surface">Info</span>
            <span class="text-xs font-bold text-on-surface-variant bg-surface-container px-1.5 rounded">1</span>
          </div>
          <span class="text-xs text-on-surface-variant">Boas práticas</span>
        </div>
      </div>
    </aside>
  </div>

  <!-- KPI Row: Margem Bruta com sparkline -->
  <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm card-lift density-pad" role="region" aria-label="Margem Bruta">
    <div class="flex items-center justify-between mb-2">
      <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Margem Bruta</span>
      <span class="inline-flex items-center gap-1 text-xs font-bold text-surface-tint bg-surface-container-low px-1.5 py-0.5 rounded-[9999px]" aria-label="Variação"><span class="material-symbols-outlined text-sm" aria-hidden="true">trending_up</span> +2.1pp</span>
    </div>
    <div class="flex items-end justify-between">
      <span class="text-3xl font-extrabold text-on-surface tabular-nums" data-animate-value data-target="${margemBruta.toFixed(1)}" data-suffix="%" aria-label="Margem bruta">0%</span>
      <div id="ov-spark-margem" class="w-20 h-8" role="img" aria-label="Sparkline margem"></div>
    </div>
  </div>

</section>
`;
  }

  function destroyAllCharts() {
    Object.keys(charts).forEach((k) => {
      try { charts[k] && charts[k].destroy(); } catch {}
      delete charts[k];
    });
  }

  function renderKPIsIntoSlots() {
    // Preenche os slots [data-kpi-slot] com KPIs renderizados via renderKPI.
    // Canônicos (obraKPIs, ordenados por persona) + extras da view (Hero Receita).
    const obras = getObras();
    const persona = getPersona(ctx.store.get().persona);
    const orderedKPIs = orderKPIsByPersona(obraKPIs, persona);

    orderedKPIs.forEach((desc) => {
      const slot = host.querySelector(`[data-kpi-slot="${desc.id}"]`);
      if (slot) renderKPI(slot, computeKPI(desc, obras));
    });

    overviewExtraKPIs.forEach((desc) => {
      const slot = host.querySelector(`[data-kpi-slot="${desc.id}"]`);
      if (slot) renderKPI(slot, computeKPI(desc, obras));
    });
  }

  function renderCharts() {
    const area = host.querySelector('#ov-chart-area');
    if (area) charts.area = mountChart(area, buildReceitaAreaOptions(meses12, receitaMensal));

    const donut = host.querySelector('#ov-chart-donut');
    if (donut) charts.donut = mountChart(donut, buildComposicaoDonutOptions(composicaoTipo));

    const gauge = host.querySelector('#ov-chart-gauge');
    if (gauge) charts.gauge = mountChart(gauge, buildGaugeOptions(metaAnualPercent, 'Meta Anual'));

    const sparkH = host.querySelector('#ov-spark-hero');
    if (sparkH) charts.sparkH = mountChart(sparkH, buildSparklineOptions(heroSpark, getCSSVar('--chart-status-good', '#2e7d32'), 'area'));

    const sparkM = host.querySelector('#ov-spark-margem');
    if (sparkM) charts.sparkM = mountChart(sparkM, buildSparklineOptions(margemSpark, getCSSVar('--chart-categorical-3', '#b37c59')));
  }

  function renderAll() {
    destroyAllCharts();
    host.innerHTML = template();
    renderKPIsIntoSlots();
    renderCharts();
    initAnimatedValues(host);
    initReveal(host);
  }

  renderAll();

  // Re-render quando filtros ou persona mudam
  let lastKey = JSON.stringify({ filters: ctx.store.get().filters, persona: ctx.store.get().persona });
  unsubscribe = ctx.store.subscribe((s) => {
    const cur = JSON.stringify({ filters: s.filters, persona: s.persona });
    if (cur !== lastKey) {
      lastKey = cur;
      renderAll();
    }
  });

  return function unmount() {
    if (unsubscribe) { try { unsubscribe(); } catch {} }
    destroyAllCharts();
  };
}

export const overviewView = {
  id: 'overview',
  ...VIEW_LABELS.overview,
  mount
};
