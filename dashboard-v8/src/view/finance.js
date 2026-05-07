import { financeTemplate, mountFinanceCharts, wireFinanceTabs } from './finance-fragments.js';
import { VIEW_LABELS } from '../model/branding.js';
import { safeDestroy } from '../ui/safe-cleanup.js';

export function mount(host, _ctx) {
  const charts = {};

  function renderAll() {
    host.innerHTML = financeTemplate();
    mountFinanceCharts(host, charts);
    wireFinanceTabs(host);
  }

  renderAll();

  return function unmount() {
    Object.values(charts).forEach(c => { safeDestroy(c); });
  };
}

export const financeView = { id: 'finance', ...VIEW_LABELS.finance, mount };
