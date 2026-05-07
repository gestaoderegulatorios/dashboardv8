// Reports view orchestrator — delegates to reports-fragments.js
import { initReveal } from '../ui/reveal.js';
import { showToast } from './shared.js';
import { VIEW_LABELS } from '../model/branding.js';
import { reportsTemplate, generateReport, downloadReportHTML, setSettings } from './reports-fragments.js';

let _currentSettings = {};

export function mount(host, ctx) {
  _currentSettings = (ctx && ctx.store && ctx.store.get && ctx.store.get().settings) || {};
  setSettings(_currentSettings);

  function wireEvents() {
    host.querySelectorAll('[data-report]').forEach((el) => {
      const fire = () => generateReport(el.dataset.report);
      el.addEventListener('click', fire);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); } });
    });
    host.querySelectorAll('button[data-recent]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const title = btn.dataset.title || 'Relatório';
        showToast('Download iniciado', 'success');
        const typeMap = { 'Executivo': 'executive', 'Financeiro': 'financial', 'Obras': 'works' };
        const matchedType = Object.entries(typeMap).find(([k]) => title.includes(k));
        if (matchedType) generateReport(matchedType[1]);
        else downloadReportHTML('executive');
      });
    });
  }

  function renderAll() {
    host.innerHTML = reportsTemplate();
    wireEvents();
    initReveal(host);
  }

  renderAll();

  return function unmount() { /* static — no subscriptions */ };
}

export const reportsView = { id: 'reports', ...VIEW_LABELS.reports, mount };
