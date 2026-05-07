// View: Land/Loteamentos — slim shell delegating to land-fragments.js

import { landTemplate, renderLandCharts, wireDrawer, wireTabs, wireRowExpand, wireCrossFilter } from './land-fragments.js';
import { VIEW_LABELS } from '../model/branding.js';
import { initAnimatedValues } from '../ui/animate.js';
import { initReveal } from '../ui/reveal.js';
import { safeDestroy } from '../ui/safe-cleanup.js';

export function mount(host, _ctx) {
  const charts = {};

  function renderAll() {
    host.innerHTML = landTemplate();
    renderLandCharts(host, charts);
    wireDrawer(host);
    wireTabs(host);
    wireRowExpand(host);
    wireCrossFilter(host);
    initAnimatedValues(host);
    initReveal(host);
  }

  renderAll();

  return function unmount() {
    Object.values(charts).forEach(c => { safeDestroy(c); });
  };
}

export const landView = { id: 'land', ...VIEW_LABELS.land, mount };
