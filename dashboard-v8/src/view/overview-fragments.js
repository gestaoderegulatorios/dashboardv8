// Overview Fragments: extracted helpers for overview.js
import { obraSchema } from '../domain/schema.js';
import { escape } from './shared.js';
import { orderKPIsByPersona } from '../domain/persona.js';
// Mock data imports are provided by the caller data object in render flow
import { safeDestroy } from '../ui/safe-cleanup.js';
import { mountChart, buildReceitaAreaOptions, buildComposicaoDonutOptions, buildGaugeOptions, buildSparklineOptions, getCSSVar } from '../domain/chart.js';

// Note: This module is self-contained for the essential fragment helpers.

// Helper: extract Overview Extra KPIs based on latest receita value
export function getOverviewExtraKPIs(receitaAtual) {
  return [
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
}

// Helper: render template fragment (HTML) for overview (reusable in hosting file)
export function buildKPIsSection(obras, persona, kpiResults, _overviewExtraKPIs) {
  const orderedKPIs = kpiResults ? kpiResults : [];
  return `
  <div class="col-span-12 grid grid-cols-12 gap-4 stagger" style="grid-auto-rows:min-content">
    <div class="col-span-12 sm:col-span-6 xl:col-span-3" data-kpi-slot="receita-mensal"></div>
    ${orderedKPIs.map((kpi) => `
    <div class="col-span-6 sm:col-span-3" data-kpi-slot="${escape(kpi.meta.id)}"></div>
    `).join('')}
  </div>`;
}

export function buildChartsSection() {
  return `
  <!-- Charts: área 12 meses (2/3) + donut tipo (1/3) -->
  <div class="col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Evolução da Receita 12 meses">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Evolução Receita</span>
        <div class="flex items-center gap-2"><span class="text-xs text-on-surface-variant">12 meses</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-area" data-title="Evolução Receita 12 Meses" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
      </div>
      <div id="ov-chart-area" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico de evolução da receita"></div>
    </div>

    <div class="lg:col-span-1 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Composição por Tipo">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Composição por Tipo</span>
        <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-donut" data-title="Composição por Tipo" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button>
      </div>
      <div id="ov-chart-donut" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Donut de composição por tipo"></div>
    </div>
  </div>`;
}

export function buildGaugeStatusSection(metaAnualPercent) {
  return `
  <!-- F9.3: Gauge + Status panel (border-l-4 semântico, tematizável) lado a lado -->
  <div class="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="lg:col-span-1 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Meta Anual">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Meta Anual</span>
        <div class="flex items-center gap-2"><span class="text-xs text-on-surface-variant">${metaAnualPercent}%</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="ov-chart-gauge" data-title="Meta Anual" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
      </div>
      <div id="ov-chart-gauge" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gauge de meta anual"></div>
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
  </div>`;
}

export function buildMargemSection(margemBruta) {
  return `
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
  </div>`;
}

export function templateHTML(obras, persona, kpiResults, margemBruta, overviewExtraKPIs, metaAnualPercent) {
  // Build final structure by composing sub-sections exactly as original HTML order
  const kpiSection = buildKPIsSection(obras, persona, kpiResults, overviewExtraKPIs);
  const chartsSection = buildChartsSection();
  const gaugeStatusSection = buildGaugeStatusSection(metaAnualPercent);
  const margemSection = buildMargemSection(margemBruta);

  // If inputs are missing, return empty string to avoid injecting broken HTML
  if (!obras) return '';
  return `
${kpiSection}
${chartsSection}
${gaugeStatusSection}
${margemSection}
`;
}

// Helper: destroy all charts in given charts object
export function destroyAllCharts(charts) {
  Object.keys(charts).forEach((k) => {
    safeDestroy(charts[k]);
    delete charts[k];
  });
}

// Helper: render KPIs into their slots
export function renderKPIsIntoSlots(host, obras, persona, obraKPIs, computeKPI, renderKPI, overviewExtraKPIs) {
  const orderedKPIs = orderKPIsByPersona(obraKPIs, persona);
  orderedKPIs.forEach((desc) => {
    const slot = host.querySelector(`[data-kpi-slot="${escape(desc.id)}"]`);
    if (slot) renderKPI(slot, computeKPI(desc, obras));
  });

  overviewExtraKPIs.forEach((desc) => {
    const slot = host.querySelector(`[data-kpi-slot="${escape(desc.id)}"]`);
    if (slot) renderKPI(slot, computeKPI(desc, obras));
  });
}

// Helper: render charts into their containers
export function renderCharts(host, charts, data) {
  const { meses12, receitaMensal, composicaoTipo, metaAnualPercent, heroSpark, margemSpark } = data;
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
