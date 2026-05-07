// Fragments extracted from works.js for F-FRAGMENTS (verbatim code)
import { obraSchema } from '../domain/schema.js';
import { computeView, renderTable, toggleSort, statusBadge, rowsToCSV } from '../domain/table.js';
import { escape, downloadCSV } from './shared.js';
import { getPersona, orderKPIsByPersona } from '../domain/persona.js';
import { obraKPIs, computeKPI, renderKPI } from '../domain/kpi.js';
import { openTableFullscreen } from '../ui/modal.js';
import { mountChart, tooltipBRL } from '../domain/chart.js';
import { renderFilterBar } from '../domain/filter.js';

// KPIs adicionais específicos da view Obras (não canônicos — complementam obraKPIs)
export const worksExtraKPIs = [
  {
    id: 'custo-m2',
    label: 'Custo/m²',
    icon: 'attach_money',
    compute: () => 3247,
    format: (v) => obraSchema.formats.currency(v),
    color: 'primary',
    variant: 'standard',
    prefix: 'R$ ',
    target: 3247
  },
  {
    id: 'mao-de-obra',
    label: 'Mão de Obra',
    icon: 'engineering',
    compute: () => 387,
    format: (v) => obraSchema.formats.integer(v),
    color: 'primary',
    variant: 'standard',
    target: 387
  },
  {
    id: 'dias-sem-acidente',
    label: 'Dias Sem Acidente',
    icon: 'verified_user',
    compute: () => 47,
    format: (v) => `${v} dias`,
    color: 'success',
    variant: 'standard',
    suffix: ' dias',
    target: 47
  }
];

export const tableColumns = [
  { key: 'nome', label: 'Obra', align: 'left' },
  { key: 'tipo', label: 'Tipo', align: 'left' },
  { key: 'status', label: 'Status', align: 'left',
    renderHTML: (v) => statusBadge(v) },
  { key: 'avanco', label: 'Avanço', align: 'right',
    format: (v) => obraSchema.formats.percent(v) },
  { key: 'orcado', label: 'Orçado', align: 'right',
    format: (v) => obraSchema.formats.currency(v) },
  { key: 'executado', label: 'Executado', align: 'right',
    format: (v) => obraSchema.formats.currency(v) },
  { key: 'gap', label: 'GAP', align: 'right', sortable: true,
    format: (v) => obraSchema.formats.percent(v),
    className: (v) => v < 0 ? 'text-error' : (v > 0 ? 'text-green-700' : '') },
  { key: 'atrasoDias', label: 'Atraso', align: 'right',
    format: (v) => obraSchema.formats.days(v) }
];

export function worksTemplate(getFiltered, ctx) {
  const obras = getFiltered();
  const persona = getPersona(ctx.store.get().persona);

  // KPIs canônicos ordenados por persona
  const orderedCanonical = orderKPIsByPersona(obraKPIs, persona);
  const canonicalResults = orderedCanonical.map((desc) => computeKPI(desc, obras));

  // KPIs extras da view Obras
  const extraResults = worksExtraKPIs.map((desc) => computeKPI(desc, obras));

  // Todos os KPIs: canônicos primeiro, extras depois
  const allKPIs = [...canonicalResults, ...extraResults];

  return `
<section class="view-section grid grid-cols-12 gap-6 p-5 lg:p-8" role="region" aria-label="Obras">

  <!-- Filter Bar -->
  <div class="col-span-12" id="wk-filter-bar"></div>

  <!-- F9.6: KPI grid uniforme — 4 por linha em desktop (cada col-span-3) -->
  <div class="col-span-12 grid grid-cols-12 gap-4 stagger" style="grid-auto-rows:min-content">
    ${allKPIs.map((kpi) => `
    <div class="col-span-6 sm:col-span-4 lg:col-span-3" data-kpi-slot="${escape(kpi.meta.id)}"></div>
    `).join('')}
  </div>

  <!-- Bar Chart Orçado vs Executado (respeita persona.showChart) -->
  ${persona.showChart ? `
  <div class="col-span-12 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Orçado vs Executado">
      <div class="flex items-center justify-between mb-2"><span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Orçado vs Executado</span><div class="flex items-center gap-2"><span class="text-xs text-on-surface-variant">Barras verticais</span><button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="wk-chart-bar" data-title="Orçado vs Executado" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button></div></div>
      <div id="wk-chart-bar" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico de barras Orçado vs Executado"></div>
    </div>
  ` : ''}

  <!-- Sub-cards (4) com progress bars -->
  <div class="col-span-12 grid grid-cols-12 gap-4" aria-label="Subtítulos de obras">
    ${[
      { name: 'Torre A', pct: 68, color: 'bg-surface-tint' },
      { name: 'Torre B', pct: 43, color: 'bg-on-tertiary-container' },
      { name: 'Torre C', pct: 31, color: 'bg-error' },
      { name: 'Torre D', pct: 55, color: 'bg-green-700' }
    ].map((s) => `
    <div class="col-span-6 sm:col-span-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm card-lift">
      <div class="text-xs font-bold text-on-surface-variant uppercase mb-2">${escape(s.name)}</div>
      <div class="w-full bg-surface-container h-3 rounded"><span class="block h-3 rounded ${s.color}" style="width:${s.pct}%"></span></div>
      <div class="mt-1 text-xs font-semibold text-primary">${s.pct}%</div>
    </div>
    `).join('')}
  </div>

  <!-- Tabela principal (respeita persona.showTable) -->
  <div class="col-span-12 overflow-x-auto" id="wk-table-container"></div>

</section>
`;
}

export function renderWorksKPIsIntoSlots(host, getFiltered, ctx) {
  const obras = getFiltered();
  const persona = getPersona(ctx.store.get().persona);
  const orderedCanonical = orderKPIsByPersona(obraKPIs, persona);
  const canonicalResults = orderedCanonical.map((desc) => computeKPI(desc, obras));
  const extraResults = worksExtraKPIs.map((desc) => computeKPI(desc, obras));
  const allKPIs = [...canonicalResults, ...extraResults];

  allKPIs.forEach((kpi) => {
    const slot = host.querySelector(`[data-kpi-slot="${kpi.meta.id}"]`);
    if (slot) renderKPI(slot, kpi);
  });
}

export function mountWorksChart(host, getFiltered, ctx, chartHandle) {
  const persona = getPersona(ctx.store.get().persona);
  if (!persona.showChart) return chartHandle;

  const obras = getFiltered();
  const container = host.querySelector('#wk-chart-bar');
  if (!container) return chartHandle;

  const opts = {
    chart: { type: 'bar', height: 280 }, // TODO(#P1): move 280 to constants
    dataCurrency: true,
    series: [
      { name: 'Orçado', data: obras.map((o) => o.orcado) },
      { name: 'Executado', data: obras.map((o) => o.executado) }
    ],
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '60%' } },
    xaxis: { categories: obras.map((o) => o.nome) },
    tooltip: { y: { formatter: tooltipBRL } }
  };

  if (chartHandle) {
    chartHandle.update(opts);
  } else {
    chartHandle = mountChart(container, opts);
  }
  return chartHandle;
}

export function mountWorksTable(host, getFiltered, ctx, tableColumnsArg) {
  const container = host.querySelector('#wk-table-container');
  if (!container) return;
  const persona = getPersona(ctx.store.get().persona);
  if (!persona.showTable) {
    container.innerHTML = '';
    return;
  }
  const view = ctx.store.get().view;
  const filtered = getFiltered();
  const computed = computeView(filtered, { ...view, pageSize: persona.defaultPageSize || view.pageSize });

  renderTable(container, computed, tableColumnsArg, {
    title: 'Obras',
    tableId: 'wk-table',
    sortKey: view.sortKey,
    sortDir: view.sortDir,
    onSortClick: (key) => ctx.store.set((s) => ({ view: toggleSort(s.view, key) })),
    onPageChange: (page) => ctx.store.set((s) => ({ view: { ...s.view, page } })),
    onExportCSV: () => {
      const csv = rowsToCSV(filtered, tableColumnsArg);
      downloadCSV('obras.csv', csv);
    },
    onFullscreen: () => {
      const tableEl = container.querySelector('table');
      if (tableEl) openTableFullscreen('Obras', tableEl.outerHTML);
    }
  });
}

export function mountWorksFilterBar(host, ctx) {
  const bar = host.querySelector('#wk-filter-bar');
  if (!bar) return;
  const obras = ctx.store.get().data.obras;
  const filters = ctx.store.get().filters || {};
  renderFilterBar(bar, {
    obras,
    state: filters,
    onChange: (next) => ctx.store.set({ filters: next }),
    onReset: () => ctx.store.set({ filters: {} })
  });
}
