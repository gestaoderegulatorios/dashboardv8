import { mountChart, buildComposicaoDonutOptions, buildGaugeOptions, buildSparklineOptions, getCSSVar } from '../domain/chart.js';
import { VIEW_LABELS } from '../model/branding.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { escape, showToast } from './shared.js';

export const DONUT_LABELS = ['Parque','Jardim Europa','Horizon Hills'];
export const DONUT_SERIES = [80,72,48];
export const VENDA_MEDIA_LOTE = 285437;
export const INFRA_CONCLUIDA = 64.3;
export const ESTOQUE_LOTES = 73;

export const PANELS = [
  { id: 'lote-panel-1', tabId: 'tab-lote-1', title: 'Residencial Parque', text: 'Residencial Parque — 80 lotes distribuídos em 6 quadras. Infraestrutura 78% concluída. Venda média R$ 310.000/lote.' },
  { id: 'lote-panel-2', tabId: 'tab-lote-2', title: 'Jardim Europa', text: 'Jardim Europa — 72 lotes em 5 quadras. Infraestrutura 55% concluída. Venda média R$ 265.000/lote.' },
  { id: 'lote-panel-3', tabId: 'tab-lote-3', title: 'Horizon Hills', text: 'Horizon Hills — 48 lotes em 4 quadras. Infraestrutura 42% concluída. Venda média R$ 340.000/lote.' }
];

export const TABLE_ROWS = [
  { lote:'L1-01', tipo:'Tipo A', status:'Concluída', area:'350', preco:'R$ 320.000', expand:'Quadra: Q1 · Lotes: 12 · Infra: 95%', rowId:'row-land-1' },
  { lote:'L1-02', tipo:'Tipo B', status:'Em andamento', area:'420', preco:'R$ 360.000', expand:'Quadra: Q2 · Lotes: 14 · Infra: 60%', rowId:'row-land-2' },
  { lote:'L2-03', tipo:'Tipo A', status:'Concluída', area:'380', preco:'R$ 335.000', expand:'Quadra: Q3 · Lotes: 10 · Infra: 100%', rowId:'row-land-3' },
  { lote:'L2-04', tipo:'Tipo C', status:'Planejada', area:'500', preco:'R$ 410.000', expand:'Quadra: Q4 · Lotes: 8 · Infra: 20%', rowId:'row-land-4' },
  { lote:'L3-05', tipo:'Tipo B', status:'Em andamento', area:'290', preco:'R$ 275.000', expand:'Quadra: Q5 · Lotes: 16 · Infra: 45%', rowId:'row-land-5' },
  { lote:'L3-06', tipo:'Tipo A', status:'Concluída', area:'340', preco:'R$ 298.000', expand:'Quadra: Q6 · Lotes: 11 · Infra: 88%', rowId:'row-land-6' }
];

export function landTemplate() {
  const tabsHTML = PANELS.map((p, i) => {
    const active = i === 0;
    const cls = active
      ? 'tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-on-surface border-b-2 border-surface-tint'
      : 'tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant border-b-2 border-transparent';
    return `<button class="${cls}" role="tab" aria-selected="${active}" aria-controls="${p.id}" id="${p.tabId}" data-tab="${p.id}">${escape(p.title)}</button>`;
  }).join('');

  const panelsHTML = PANELS.map((p, i) => {
    return `<div id="${p.id}" role="tabpanel" aria-labelledby="${p.tabId}" class="col-span-12 p-4 bg-surface rounded-xl border border-outline-variant shadow-sm${i !== 0 ? ' hidden' : ''}"><p class="text-sm text-on-surface-variant">${escape(p.text)}</p></div>`;
  }).join('');

  const rowsHTML = TABLE_ROWS.map(r => {
    return `<tr class="hover:bg-surface-container-low cursor-pointer transition-colors" data-expand="${r.rowId}" aria-expanded="false"><td class="px-3 py-2">${escape(r.lote)}</td><td class="px-3 py-2">${escape(r.tipo)}</td><td class="px-3 py-2">${escape(r.status)}</td><td class="px-3 py-2 tabular-nums">${escape(r.area)}</td><td class="px-3 py-2 tabular-nums">${escape(r.preco)}</td></tr><tr id="${r.rowId}" class="expand-row hidden"><td colspan="5" class="px-3 py-2 text-xs text-on-surface-variant bg-surface-container-low">${escape(r.expand)}</td></tr>`;
  }).join('');

  return `
<section id="view-land" class="view-section grid grid-cols-12 gap-6 p-5" role="region" aria-label="Loteamentos">
<!-- KPI Hero — Lotes Vendidos (card-tilt + border-glow, máx 1 por view) -->
<div class="col-span-12 lg:col-span-3 bg-primary-container border border-primary-fixed-dim rounded-xl p-5 shadow-sm card-tilt border-glow">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[0.6875rem] font-bold text-on-primary-container uppercase tracking-wider">Lotes Vendidos</span>
    <span class="text-[0.6875rem] font-bold text-white/60">acumulado</span>
  </div>
  <div class="flex items-end justify-between gap-2">
    <span class="text-2xl font-extrabold text-white" data-animate-value data-target="127" data-prefix="" data-suffix="/200" data-format="full-text" data-full-text="127/200">127/200</span>
    <span class="text-sm font-semibold text-green-200">+8.5%</span>
  </div>
  <div id="spark-hero-land" class="w-full mt-3 h-[40px]"></div>
</div>

<!-- 3 KPIs do bloco Gerencial -->
<div class="col-span-12 lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 grid-gap-6">
  <!-- Variant C: Venda Média/Lote com Progress Ring -->
  <div class="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex items-center justify-between gap-4 reveal">
    <div>
      <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Venda Média/Lote</span>
      <div class="flex items-center gap-3 mt-2">
        <span class="text-3xl font-extrabold text-primary" data-animate-value data-target="${VENDA_MEDIA_LOTE}" data-prefix="R$ " data-suffix="" data-format="full">R$ 0</span>
        <span class="text-xs font-bold text-surface-tint bg-surface-tint/10 px-2 py-0.5 rounded-lg">/lote</span>
      </div>
    </div>
    <div class="w-14 h-14 flex-shrink-0" aria-label="Progresso venda média">
      <svg viewBox="0 0 36 36" width="56" height="56" role="img" aria-label="Progresso: 62%">
      <path d="M18 2.0845 a15.9155 15.9155 0 1 1 0 31.831" fill="none" style="stroke: var(--chart-axis-border)" stroke-width="3"></path>
        <path d="M18 2.0845 a15.9155 15.9155 0 1 1 0 31.831" fill="none" style="stroke: var(--chart-categorical-1)" stroke-width="3" stroke-dasharray="62,100" stroke-linecap="round"></path>
      </svg>
    </div>
  </div>
  <!-- Variant D: Infra Concluída 64,3% + Sparkline -->
  <div class="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between gap-2 reveal">
    <div>
      <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Infra Concluída</span>
      <div class="flex items-center justify-between mt-2">
        <span class="text-3xl font-extrabold text-primary" data-animate-value data-target="${INFRA_CONCLUIDA}" data-prefix="" data-suffix="%">0%</span>
        <span class="text-xs font-bold text-green-700">+12pp</span>
      </div>
    </div>
    <div id="spark-infra-land" class="w-full h-[40px]"></div>
  </div>
  <!-- Variant B: Estoque 73 lotes -->
  <div class="bg-surface p-5 rounded-xl border border-outline-variant shadow-sm flex flex-col justify-between gap-2 reveal">
    <div>
      <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Estoque</span>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-3xl font-extrabold text-primary" data-animate-value data-target="${ESTOQUE_LOTES}" data-prefix="" data-suffix="">0</span>
        <span class="text-xs font-bold text-surface-tint">lotes</span>
      </div>
    </div>
    <div class="text-sm text-on-surface-variant mt-1">3 loteamentos</div>
  </div>
  </div>
 
<!-- Tabs: 3 loteamentos -->
<div class="col-span-12 bg-surface rounded-xl border border-outline-variant shadow-sm p-4" role="tablist" aria-label="Loteamentos tabs">
  <div class="flex gap-2">${tabsHTML}</div>
</div>
 
<!-- Tabpanels -->
${panelsHTML}
 
  <!-- Cross-filter Donut + Gauge -->
  <div class="col-span-12 lg:col-span-6 bg-surface p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" data-drawer-trigger>
  <div class="flex justify-between items-center mb-3">
    <span class="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-wider">Distribuição por Loteamento</span>
    <div class="flex items-center gap-2"><button class="px-2 py-1 text-xs font-medium text-surface-tint bg-surface hover:bg-surface-container-low rounded-lg border border-outline-variant transition-colors" data-cross-filter-clear aria-label="Limpar filtro">Limpar filtro</button><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="chart-donut-land" data-title="Distribuição por Loteamento" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
  </div>
  <div id="chart-donut-land" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]"></div>
</div>
<div class="col-span-12 lg:col-span-6 bg-surface p-5 rounded-xl border border-outline-variant shadow-sm reveal relative">
  <div class="flex items-center justify-between mb-2"><span class="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-wider">Progresso Geral Infra</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="chart-gauge-land" data-title="Progresso Geral Infra" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div>
  <div id="chart-gauge-land" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px] mt-2"></div>
</div>
 
<!-- Drawer de Loteamento -->
<div id="drawer-loteamento" class="detail-drawer bg-surface border border-outline-variant rounded-xl shadow-lg p-5 hidden" role="region" aria-label="Detalhes do Loteamento">
  <div class="flex justify-between items-start mb-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white"><span class="material-symbols-outlined" aria-hidden="true">map</span></div>
      <div>
        <div id="drawer-loteamento-name" class="text-lg font-bold">Loteamento</div>
        <div id="drawer-loteamento-quadras" class="text-xs text-on-surface-variant">Quadras: 0</div>
      </div>
    </div>
    <button id="drawer-loteamento-close" class="p-2 hover:bg-surface-container-low rounded-lg transition-colors" aria-label="Fechar"><span class="material-symbols-outlined" aria-hidden="true">close</span></button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" aria-label="Resumo do loteamento">
    <div class="p-3 border border-outline-variant rounded-lg"><div class="text-xs font-bold text-on-surface-variant uppercase">Área total</div><div class="text-sm font-semibold text-primary" data-field="area">—</div></div>
    <div class="p-3 border border-outline-variant rounded-lg"><div class="text-xs font-bold text-on-surface-variant uppercase">Infra</div><div class="text-sm font-semibold text-primary" data-field="infra">—</div></div>
    <div class="p-3 border border-outline-variant rounded-lg"><div class="text-xs font-bold text-on-surface-variant uppercase">Progresso</div><div class="h-2 w-full bg-surface-container-low rounded-[9999px]"><span class="block h-full bg-surface-tint rounded-[9999px]" data-field="progressBar" style="width:60%"></span></div></div>
  </div>
  <div class="border-t border-outline-variant pt-4 mb-2"></div>
  <div class="grid grid-cols-2 gap-4 text-xs text-on-surface-variant">
    <div>Quadras: <strong id="drawer-loteamento-quadras-count">0</strong></div>
    <div>Área total m²: <strong id="drawer-loteamento-area">0</strong></div>
  </div>
</div>

<!-- Tabela com Row Expand -->
<div class="col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm p-5" aria-label="Tabela de Loteamentos com detalhes">
  <div class="flex items-center justify-between mb-3"><span class="text-[0.75rem] font-bold text-on-surface-variant uppercase tracking-wider">Quadras e Lotes</span></div>
  <table id="table-land-expand" class="w-full text-sm text-left" aria-label="Tabela de Loteamentos">
    <thead class="bg-surface-container-low">
      <tr>
        <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Lote</th>
        <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Tipo</th>
        <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Status Infra</th>
        <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Área m²</th>
        <th class="px-3 py-2 text-[10px] font-bold uppercase tracking-wider">Preço</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
  </table>
</div>

</section>`;
}

export function renderLandCharts(host, charts) {
  // Render DOM first
  host.innerHTML = landTemplate();

  // Sparklines
  const sparkHero = host.querySelector('#spark-hero-land');
  if (sparkHero) charts.hero = mountChart(sparkHero, buildSparklineOptions([5,8,12,15,20,18,25,30], getCSSVar('--chart-categorical-1', '#4c5e86')));
  const sparkInfra = host.querySelector('#spark-infra-land');
  if (sparkInfra) charts.infra = mountChart(sparkInfra, buildSparklineOptions([3,6,9,7,12,8,14], getCSSVar('--chart-status-good', '#2e7d32')));

  // Donut + Gauge
  const donutEl = host.querySelector('#chart-donut-land');
  if (donutEl) {
    const composicao = DONUT_LABELS.map((name, i) => ({ name, value: DONUT_SERIES[i] }));
    charts.donut = mountChart(donutEl, buildComposicaoDonutOptions(composicao));
  }
  const gaugeEl = host.querySelector('#chart-gauge-land');
  if (gaugeEl) charts.gauge = mountChart(gaugeEl, buildGaugeOptions(INFRA_CONCLUIDA, 'Infra'));
}

export function wireDrawer(host) {
  const drawer = host.querySelector('#drawer-loteamento');
  // DonutCard is the card container with data-drawer-trigger
  const donutCard = host.querySelector('[data-drawer-trigger]') || host.querySelector('#chart-donut-land')?.closest('[class*="bg-surface"]') || host.querySelector('#chart-donut-land');
  if (donutCard && drawer) donutCard.addEventListener('click', (e) => {
    if (e.target.closest('[data-fullscreen]')) return;
    drawer.classList.remove('hidden');
    drawer.classList.add('open');
  });
  const drawerClose = host.querySelector('#drawer-loteamento-close');
  if (drawerClose && drawer) drawerClose.addEventListener('click', () => { drawer.classList.remove('open'); drawer.classList.add('hidden'); });
}

export function wireTabs(host, PANELS) {
  host.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanel = btn.dataset.tab;
      host.querySelectorAll('[data-tab]').forEach(t => {
        t.className = 'tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant border-b-2 border-transparent';
        t.setAttribute('aria-selected', 'false');
      });
      btn.className = 'tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-on-surface border-b-2 border-surface-tint';
      btn.setAttribute('aria-selected', 'true');
      PANELS.forEach(p => {
        const panel = host.querySelector('#' + p.id);
        if (panel) panel.classList.toggle('hidden', p.id !== targetPanel);
      });
    });
  });
}

export function wireRowExpand(host) {
  host.querySelectorAll('[data-expand]').forEach(row => {
    row.addEventListener('click', () => {
      const expandId = row.dataset.expand;
      const expandRow = host.querySelector('#' + expandId);
      if (expandRow) expandRow.classList.toggle('hidden');
      row.setAttribute('aria-expanded', String(!expandRow || expandRow.classList.contains('hidden')));
    });
  });
}

// Optional: cross-filter clear wiring can be added here if needed in future
