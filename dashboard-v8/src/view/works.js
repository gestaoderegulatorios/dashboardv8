// Slim orchestrator for Works view. Heavy lifting is moved to works-fragments.js
import { VIEW_LABELS } from '../model/branding.js';
import { applyFilters } from '../domain/filter.js';
import { applyStorytelling } from '../domain/storytelling.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { safeCall, safeDestroy } from '../ui/safe-cleanup.js';
import { worksTemplate, renderWorksKPIsIntoSlots, mountWorksChart, mountWorksTable, mountWorksFilterBar, tableColumns } from './works-fragments.js';

export function mount(host, ctx) {
  let chartHandle = null;
  let unsubscribe = null;

  function getFiltered() {
    const s = ctx.store.get();
    const filtered = applyFilters(s.data.obras, s.filters);
    return applyStorytelling(filtered, s.story);
  }

  function renderAll() {
    host.innerHTML = worksTemplate(getFiltered, ctx);
    renderWorksKPIsIntoSlots(host, getFiltered, ctx);
    mountWorksFilterBar(host, ctx);
    chartHandle = mountWorksChart(host, getFiltered, ctx, chartHandle);
    mountWorksTable(host, getFiltered, ctx, tableColumns);
    initAnimatedValues(host);
    initReveal(host);
  }

  function updateDataOnly() {
    renderWorksKPIsIntoSlots(host, getFiltered, ctx);
    chartHandle = mountWorksChart(host, getFiltered, ctx, chartHandle);
    mountWorksTable(host, getFiltered, ctx, tableColumns);
    initAnimatedValues(host);
  }

  renderAll();

  let lastPersona = ctx.store.get().persona;
  let lastStory = ctx.store.get().story;
  let lastSerialized = JSON.stringify({ filters: ctx.store.get().filters, view: ctx.store.get().view });

  unsubscribe = ctx.store.subscribe((s) => {
    const personaChanged = s.persona !== lastPersona;
    const storyChanged = s.story !== lastStory;
    const dataChanged = JSON.stringify({ filters: s.filters, view: s.view }) !== lastSerialized;

    if (personaChanged || storyChanged) {
      lastPersona = s.persona;
      lastStory = s.story;
      lastSerialized = JSON.stringify({ filters: s.filters, view: s.view });
      renderAll(); // full remount
    } else if (dataChanged) {
      lastSerialized = JSON.stringify({ filters: s.filters, view: s.view });
      updateDataOnly(); // partial update
    }
  });

  return function unmount() {
if (unsubscribe) { safeCall(unsubscribe); }
  if (chartHandle) { safeDestroy(chartHandle); chartHandle = null; }
  };
}

export const worksView = {
  id: 'works',
  ...VIEW_LABELS.works,
  mount
};
