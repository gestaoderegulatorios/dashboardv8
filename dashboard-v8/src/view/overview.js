// View: Visão Geral. Espelho V7 — KPI Hero (Receita) + 3 standards + área 12 meses
// + donut tipo + gauge meta anual + alertas + KPI margem bruta com sparkline.
// Fase 4: Consome renderKPI/obraKPIs (kpi/kpi.js), dados de data/mock.js, persona.

import { obraSchema } from '../domain/schema.js';
import { VIEW_LABELS } from '../model/branding.js';
import { applyFilters } from '../domain/filter.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { safeCall } from '../ui/safe-cleanup.js';
// (no direct DOM escaping here) - KPI fragment handles it
import { getOverviewExtraKPIs, templateHTML as templateHTMLFragment, destroyAllCharts as fragDestroyAllCharts, renderKPIsIntoSlots as fragRenderKPIsIntoSlots, renderCharts as fragRenderCharts } from './overview-fragments.js';
import { obraKPIs, computeKPI, renderKPI } from '../domain/kpi.js';
import { getPersona, orderKPIsByPersona } from '../domain/persona.js';
import { meses12, receitaMensal, composicaoTipo, margemSpark, heroSpark, metaAnualPercent } from '../model/mock.js';

// KPI Hero específico da Visão Geral (Receita Mensal). Renderizado via kpi/renderKPI
// variant 'hero' — mantém o único caminho de renderização de KPI no projeto
// (espelha o padrão worksExtraKPIs em view/works.js).

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

  // Fragment data is computed inside renderAll for safety

  function renderAll() {
    const obras = getObras();
    const persona = getPersona(ctx.store.get().persona);

    // Canonical KPIs ordered by persona
    const orderedKPIs = orderKPIsByPersona(obraKPIs, persona);
    const kpiResults = orderedKPIs.map((desc) => computeKPI(desc, obras));

    // Margin from Obras
    const margemBruta = obraSchema.measures.margemBrutaPercent(obras);

    // Extra KPIs depend on latest receita value
    const receitaAtual = receitaMensal[receitaMensal.length - 1];
    const overviewExtraKPIs = getOverviewExtraKPIs(receitaAtual);

    // Build HTML via fragment (no inline templates)
    const html = templateHTMLFragment(obras, persona, kpiResults, margemBruta, overviewExtraKPIs, metaAnualPercent);
    host.innerHTML = html;

    // Delegate KPI rendering to fragment
    fragRenderKPIsIntoSlots(host, obras, persona, obraKPIs, computeKPI, renderKPI, overviewExtraKPIs);

    // Delegate charts rendering to fragment
    fragRenderCharts(host, charts, { meses12, receitaMensal, composicaoTipo, metaAnualPercent, heroSpark, margemSpark });

    initAnimatedValues(host);
    initReveal(host);
  }

  function destroyAllCharts() {
    fragDestroyAllCharts(charts);
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
    if (unsubscribe) { safeCall(unsubscribe); }
    destroyAllCharts();
  };
}

export const overviewView = {
  id: 'overview',
  ...VIEW_LABELS.overview,
  mount
};
