// View: Operacional. Espelho V7 — 12 KPIs compact + ApexCharts heatmap + bar chart
// + tabela densa com bulk actions + alertas fixos.
// Perfil operacional: permite 10-16 KPIs por view (regra do projeto).

import { mountChart, tooltipInteger, tooltipPercent, getCSSVar } from '../domain/chart.js';
import { VIEW_LABELS } from '../model/branding.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { safeDestroy } from '../ui/safe-cleanup.js';
import { escape, showToast } from './shared.js';
import {
  OPS_TOWERS, OPS_MATERIALS, OPS_KPIS,
  OPS_HEATMAP_DAYS, OPS_HEATMAP_HOURS,
  OPS_AVANCO_ATIVIDADE, OPS_TABLE_ROWS, OPS_ALERTS
} from '../model/constants.js';

// Heatmap data (espelho V7 — gerado proceduralmente)
const HEATMAP_SERIES = OPS_HEATMAP_DAYS.map(day => {
  return { name: day, data: OPS_HEATMAP_HOURS.map(hour => ({ x: hour, y: Math.floor(Math.random() * 35) + 5 })) };
});

// Espelho V7: torres usam layout compacto (label + valor empilhados)
// Materiais/OPS usam layout inline (label na mesma linha do pulse-dot)
function towerCard(item) {
  return `
  <div class="col-span-3 bg-surface-container rounded-xl p-3 border border-outline-variant relative reveal" aria-label="${escape(item.label)}">
    <span class="pulse-dot absolute top-2 right-2" aria-hidden="true"></span>
    <div class="text-xs uppercase text-on-surface-variant font-semibold mb-1">${escape(item.label)}</div>
    <div class="text-2xl font-bold ${item.color || 'text-primary'}" data-animate-value data-target="${item.value}" data-suffix="${escape(item.suffix)}" aria-live="polite">0${escape(item.suffix)}</div>
  </div>`;
}

function inlineCard(item) {
  return `
  <div class="col-span-3 bg-surface-container rounded-xl p-3 border border-outline-variant reveal" aria-label="${escape(item.label)}">
    ${escape(item.label)} <span class="pulse-dot" aria-hidden="true"></span>
    <div class="text-2xl font-bold mt-1 ${item.color || 'text-primary'}" data-animate-value data-target="${item.value}" data-suffix="${escape(item.suffix)}" aria-live="polite">0${escape(item.suffix)}</div>
  </div>`;
}

function template() {
  const kpisHTML = [
    ...OPS_TOWERS.map(t => towerCard(t)),
    ...OPS_MATERIALS.map(m => inlineCard(m)),
    ...OPS_KPIS.map(o => inlineCard(o))
  ].join('');

  const tableRowsHTML = OPS_TABLE_ROWS.map((r, idx) => `
    <tr class="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
      <td class="px-3 py-2"><input type="checkbox" class="row-check" aria-label="Selecionar linha" data-idx="${idx}"></td>
      <td class="px-3 py-2">${escape(r.name)}</td>
      <td class="px-3 py-2 text-right tabular-nums">${r.progress}%</td>
      <td class="px-3 py-2 text-right">${escape(r.person)}</td>
    </tr>`).join('');

  const alertsHTML = OPS_ALERTS.map(a => `
    <div class="${a.bg} border ${a.border} rounded-xl p-3 relative" ${a.type === 'critical' ? 'role="alert"' : 'role="status"'} aria-label="Alerta ${a.type}">
      <span class="pulse-dot absolute top-2 right-2" aria-hidden="true"></span>
      <strong class="text-xs uppercase ${a.text}">${a.label}</strong>
      <div class="mt-1 text-sm font-semibold text-primary">${escape(a.message)}</div>
    </div>`).join('');

  return `
  <section class="view-section grid grid-cols-12 gap-3 p-3" role="region" aria-label="Operacional">

  <!-- 12 KPIs compact — espelho V7: cada col-span-3 direto no grid-cols-12 -->
  ${kpisHTML}

    <!-- Heatmap + Bar Chart (espelho V7 — ApexCharts nativo) -->
    <div class="col-span-6 bg-surface-container rounded-xl p-3 border border-outline-variant reveal relative" aria-label="Heatmap de Atividade">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Atividade Dia/Hora</span>
        <button class="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="op-chart-heatmap" data-title="Atividade Dia/Hora" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button>
      </div>
    <div id="op-chart-heatmap" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico heatmap"></div>
    </div>

    <div class="col-span-6 bg-surface-container rounded-xl p-3 border border-outline-variant reveal relative" aria-label="Avanço por Atividade">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Avanço por Atividade</span>
        <button class="p-1 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="op-chart-bar" data-title="Avanço por Atividade" aria-label="Maximizar gráfico" title="Maximizar"><span class="material-symbols-outlined text-sm">fullscreen</span></button>
      </div>
      <div id="op-chart-bar" class="w-full min-h-[200px] sm:min-h-[240px] md:min-h-[320px]" role="img" aria-label="Gráfico barras horizontais"></div>
    </div>

    <!-- Tabela densa com Bulk Actions -->
    <div class="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant p-3" aria-label="Tabela de Atividades Operacionais">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Atividades Operacionais</span>
      </div>
      <table class="w-full text-sm" aria-label="Tabela com Bulk Actions">
        <thead><tr>
          <th scope="col" class="px-3 py-2 w-10"><input type="checkbox" id="op-select-all" aria-label="Selecionar todas"></th>
          <th scope="col" class="px-3 py-2 text-left text-xs font-semibold text-on-surface-variant">Atividade</th>
          <th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Progresso</th>
          <th scope="col" class="px-3 py-2 text-right text-xs font-semibold text-on-surface-variant">Responsável</th>
        </tr></thead>
        <tbody class="text-sm text-on-surface">${tableRowsHTML}</tbody>
      </table>
      <div class="mt-2 hidden" id="op-bulk-bar" aria-label="Bulk Actions">
        <div class="flex items-center gap-3">
          <span class="text-xs text-on-surface-variant"><span id="op-selected-count">0</span> selecionados</span>
          <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container text-xs font-medium" id="op-export-selected">Exportar selecionados</button>
        </div>
      </div>
    </div>

    <!-- Alertas -->
    <div class="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3" aria-label="Alertas Operacionais">${alertsHTML}</div>

  </section>`;
}

export function mount(host, _ctx) {
  const charts = {};

  function destroyAll() {
    Object.values(charts).forEach(c => { safeDestroy(c); });
    Object.keys(charts).forEach(k => delete charts[k]);
  }

  function renderAll() {
    destroyAll();
    host.innerHTML = template();

    // Heatmap (espelho V7 — ApexCharts heatmap nativo com colorScale)
    const heatmapEl = host.querySelector('#op-chart-heatmap');
    if (heatmapEl) {
      charts.heatmap = mountChart(heatmapEl, {
        chart: { type: 'heatmap', height: 180 },
        series: HEATMAP_SERIES,
        plotOptions: {
          heatmap: {
            radius: 4,
            colorScale: {
              ranges: [
{ from: 0, to: 15, color: getCSSVar('--chart-sequential-1', '#d9e2ff'), name: 'Baixo' },
      { from: 16, to: 25, color: getCSSVar('--chart-sequential-3', '#7687b2'), name: 'Médio' },
      { from: 26, to: 50, color: getCSSVar('--chart-sequential-6', '#0a1f44'), name: 'Alto' }
              ]
            }
          }
        },
        dataLabels: { enabled: true, style: { fontSize: '9px', fontFamily: 'Inter' } },
        tooltip: { y: { formatter: tooltipInteger } }
      });
    }

    // Bar chart horizontal (espelho V7 — avancoAtividade com 6 itens)
    const barEl = host.querySelector('#op-chart-bar');
    if (barEl) {
      charts.bar = mountChart(barEl, {
        chart: { type: 'bar', height: 180 },
    series: [{ name: 'Progresso %', data: OPS_AVANCO_ATIVIDADE.map(a => a.valor) }],
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
      xaxis: { categories: OPS_AVANCO_ATIVIDADE.map(a => a.atividade), max: 100 },
        tooltip: { y: { formatter: tooltipPercent } }
      });
    }

    initAnimatedValues(host);
    initReveal(host);
  }

  function wireEvents() {
    host.addEventListener('change', (e) => {
      if (e.target.id === 'op-select-all') {
        host.querySelectorAll('.row-check').forEach(c => { c.checked = e.target.checked; });
      }
      const checked = host.querySelectorAll('.row-check:checked').length;
      const bulkBar = host.querySelector('#op-bulk-bar');
      const countEl = host.querySelector('#op-selected-count');
      if (bulkBar) bulkBar.classList.toggle('hidden', checked === 0);
      if (countEl) countEl.textContent = checked;
    });

    host.addEventListener('click', (e) => {
      if (e.target.closest('#op-export-selected')) {
        showToast('Exportando selecionados...', 'info');
      }
    });
  }

  renderAll();
  wireEvents();

  return function unmount() {
    destroyAll();
  };
}

export const operationalView = { id: 'operational', ...VIEW_LABELS.operational, mount };
