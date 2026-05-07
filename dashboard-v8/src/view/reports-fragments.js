// Fragment module for Reports view (V8). This file contains the verbatim extracted code
// from dashboard-v8/src/view/reports.js for the REPORTS UI, report generation, and helpers.
// Exports are the functions used by the Reports view orchestrator in reports.js.

import { openContentFullscreen, closeModal } from '../ui/modal.js';
import { escape, showToast } from './shared.js';
import { BRANDING_DEFAULTS, REPORTS, REPORT_SUMMARIES } from '../model/branding.js';

// Data moved from reports.js
export const RECENT = [
  { name: 'Relatório Executivo — Mar/26', when: 'Gerado em 23/04/2026' },
  { name: 'Relatório Financeiro — Fev/26', when: 'Gerado em 15/03/2026' },
  { name: 'Relatório de Obras — Jan/26', when: 'Gerado em 02/02/2026' }
];

// Internal state kept in fragment to preserve verbatim behavior
let _currentSettings = {};
let lastReport = null;

/** Called by reports.js mount() to push store settings into the fragment */
export function setSettings(s) { _currentSettings = s || {}; }

// Core builder moved from reports.js
function _buildReportHTML(type) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear();
  const timeStr = pad(now.getHours()) + ':' + pad(now.getMinutes());

  const title = REPORTS.find(r => r.id === type)?.title || 'Relatório';
  const summary = REPORT_SUMMARIES[type] || 'Relatório gerado automaticamente.';
  // Fallbacks derivam de BRANDING_DEFAULTS + current settings
  const _s = { ...BRANDING_DEFAULTS, ..._currentSettings };
  const company = _s.companyName;
  const user = _s.username;
  const role = _s.role;
  const project = _s.projectName;

  const rep = { type, title, dateStr, timeStr, summary, user, role, company, project };

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${escape(rep.title)} — ${escape(rep.dateStr)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
@page { size: A4 portrait; margin: 20mm 18mm; }
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: #1a1a1a; font-family: Inter, -apple-system, Segoe UI, Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
h1, h2, h3 { font-family: inherit; color: #0a1f44; margin: 1.2em 0 0.4em; }
h1 { font-size: 26pt; margin-top: 0; letter-spacing: -0.5pt; }
h2 { font-size: 15pt; padding-bottom: 4pt; border-bottom: 2px solid #6b7fa8; }
main { max-width: 800px; margin: 0 auto; padding: 24px 16px; }
.cover { page-break-after: always; min-height: 85vh; display: flex; flex-direction: column; justify-content: center; }
.cover .brand { font-size: 10pt; color: #6b7fa8; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; }
.cover .tagline { margin-top: 14pt; color: #3d4d6d; font-size: 13pt; }
.cover .meta { margin-top: 32pt; border-top: 1px solid #dfe3ec; padding-top: 12pt; font-size: 10pt; color: #475569; }
.cover .meta div { margin-bottom: 4pt; }
section { page-break-inside: avoid; margin-bottom: 18pt; }
table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 10pt; }
th, td { padding: 6pt 8pt; text-align: left; border-bottom: 1px solid #dfe3ec; }
th { background: #f4f6fb; font-weight: 700; color: #0a1f44; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.5pt; }
tr:nth-child(even) td { background: #fafbfe; }
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10pt; margin: 10pt 0; }
.kpi { border: 1px solid #dfe3ec; padding: 10pt 12pt; border-radius: 4pt; background: #fafbfe; }
.kpi .label { font-size: 8pt; color: #6b7fa8; text-transform: uppercase; letter-spacing: 0.5pt; font-weight: 700; }
.kpi .value { font-size: 16pt; font-weight: 800; color: #0a1f44; margin-top: 2pt; }
.callout { background: #f4f6fb; border-left: 3px solid #6b7fa8; padding: 10pt 12pt; margin: 8pt 0; border-radius: 2pt; }
.positive { color: #2e7d32; font-weight: 600; }
.negative { color: #ba1a1a; font-weight: 600; }
.neutral  { color: #475569; }
footer { margin-top: 30pt; padding-top: 10pt; border-top: 1px solid #dfe3ec; font-size: 9pt; color: #6b7fa8; text-align: center; }
.print-controls { position: fixed; top: 16px; right: 16px; display: flex; gap: 8px; z-index: 100; }
.print-controls button { padding: 8px 14px; border: 1px solid #6b7fa8; background: #0a1f44; color: #fff; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
.print-controls button:hover { opacity: 0.9; }
@media print { .print-controls { display: none !important; } .cover { page-break-after: always; } section { page-break-inside: avoid; } }
</style></head><body>
<div class="print-controls"><button onclick="window.print()" title="Salvar como PDF">Imprimir / Salvar PDF</button></div>
<main>
  <section class="cover">
    <div class="brand">${escape(rep.company)}</div>
    <h1>${escape(rep.title)}</h1>
    <div class="tagline">${escape(rep.project)}</div>
    <div class="meta">
      <div><strong>Projeto:</strong> ${escape(rep.project)}</div>
      <div><strong>Responsável:</strong> ${escape(user)} — ${escape(role)}</div>
      <div><strong>Período:</strong> ${escape(dateStr)} · ${escape(timeStr)}</div>
    </div>
  </section>
  <section><h2>Sumário Executivo</h2>${escape(summary)}</section>
  <section><h2>Conteúdo</h2>${_reportContent(type)}</section>
  <section><h2>Conclusão</h2>${_reportConclusion(type)}</section>
  <footer>${escape(company)} · Documento gerado em ${escape(dateStr)} às ${escape(timeStr)}</footer>
</main>
</body></html>`;

  return { type, html, fileStem: `relatorio-${type}-${dateStr.replace(/\//g, '-')}`, dateStr, timeStr, user, role };
}

function _reportContent(_type) {
  const kpis = [
    { label: 'Receita', value: 'R$ 87,3M' },
    { label: 'Custos', value: 'R$ 69,9M' },
    { label: 'EBITDA', value: 'R$ 17,4M' },
    { label: 'Obras Ativas', value: '14' },
    { label: 'Lotes Vendidos', value: '127/200' },
    { label: 'Infra Concluída', value: '64,3%' }
  ];
  const kpisHtml = kpis.map(k => `<div class="kpi"><div class="label">${escape(k.label)}</div><div class="value">${escape(k.value)}</div></div>`).join('');
  const rows = [ ['Indicador', 'Meta', 'Real'], ['Margem Bruta', '19%', '18.8%'], ['Margem Líquida', '14%', '13.5%'] ];
  const table = rows.map(r => `<tr>${r.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="kpi-grid">${kpisHtml}</div><table>${table}</table>`;
}

function _reportConclusion(type) {
  switch (type) {
    case 'executive': return '<p>Visão consolidada aponta tendências de melhoria. Recomenda-se revisões mensais dos indicadores.</p>';
    case 'works': return '<p>Pendências em algumas torres; priorize as de maior GAP orçamentário.</p>';
    case 'financial': return '<p>Fluxo de caixa está estável; monitorar inadimplência e margens.</p>';
    case 'operational': return '<p>Operações estão estáveis com boa conformidade de qualidade.</p>';
    case 'land': return '<p>Progresso nos loteamentos mantém boa trajetória; manter cadência de vendas.</p>';
    default: return '<p>Relatório concluído. Adapte as seções conforme necessário.</p>';
  }
}

function generateReport(type) {
  type = type || 'executive';
  showToast('Gerando relatório...', 'info');
  const rep = _buildReportHTML(type);
  lastReport = rep;

  const preview = `<div class="space-y-4">` +
    `<div class="p-4 bg-surface-container-low rounded-lg">` +
      `<div class="text-xs font-bold text-on-surface-variant uppercase mb-1">Documento pronto</div>` +
      `<div class="text-sm text-primary font-semibold">${escape(rep.title)}</div>` +
      `<div class="text-xs text-on-surface-variant mt-1">${escape(rep.dateStr)} · ${escape(rep.timeStr)} · Responsável: ${escape(rep.user)} (${escape(rep.role)})</div>` +
    `</div>` +
    `<div class="p-4 border border-outline-variant rounded-lg">` +
      `<div class="text-xs font-bold text-on-surface-variant uppercase mb-2">Preview — Sumário Executivo</div>` +
      `<div class="text-sm text-primary">${escape(rep.summary)}</div>` +
    `</div>` +
    `<div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-on-tertiary-container"><strong>LEI:</strong> todo relatório fica disponível em <strong>HTML</strong> (arquivo editável) e em <strong>PDF</strong> (via print). Ambas as opções estão abaixo.</div>` +
    `<div class="flex items-center justify-between pt-4 border-t border-outline-variant gap-2 flex-wrap">` +
      `<div class="flex gap-2 flex-wrap">` +
        `<button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors" id="rp-download-html"><span class="material-symbols-outlined text-sm align-middle mr-1">html</span>Baixar HTML</button>` +
        `<button class="px-4 py-2 bg-primary-container text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors" id="rp-open-pdf"><span class="material-symbols-outlined text-sm align-middle mr-1">picture_as_pdf</span>Abrir e Imprimir PDF</button>` +
      `</div>` +
      `<button class="px-4 py-2 text-surface-tint border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors" id="rp-close-modal">Fechar</button>` +
    `</div>` +
  `</div>`;

  openContentFullscreen(rep.title, preview);

  setTimeout(() => {
    const dlBtn = document.getElementById('rp-download-html');
    const pdfBtn = document.getElementById('rp-open-pdf');
    const closeBtn = document.getElementById('rp-close-modal');
    if (dlBtn) dlBtn.addEventListener('click', () => _downloadReportHTML(type));
    if (pdfBtn) pdfBtn.addEventListener('click', () => _openReportPDF(type));
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
  }, 100);
}

function _downloadReportHTML(type) {
  if (!lastReport || lastReport.type !== type) lastReport = _buildReportHTML(type);
  const r = lastReport;
  const blob = new Blob([r.html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = r.fileStem + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  showToast('HTML baixado: ' + r.fileStem + '.html', 'success');
}

function _openReportPDF(type) {
  if (!lastReport || lastReport.type !== type) lastReport = _buildReportHTML(type);
  const r = lastReport;
  const w = window.open('', '_blank');
  if (!w) { showToast('Pop-up bloqueado. Permita pop-ups para gerar PDF.', 'error'); return; }
  w.document.open();
  w.document.write(r.html);
  w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch (_e) { /* noop: popup closed before print — user cancelled */ } }, 600);
  showToast('Janela aberta — confirme Salvar como PDF', 'info');
}

function template() {
  const cardsHTML = REPORTS.map((r) => {
    const iconBox = r.hero
      ? '<div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center"><span class="material-symbols-outlined text-white" aria-hidden="true">' + escape(r.icon) + '</span></div>'
      : '<div class="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center"><span class="material-symbols-outlined text-primary" aria-hidden="true">' + escape(r.icon) + '</span></div>';
    return `
    <div class="col-span-12 sm:col-span-6 lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm card-lift cursor-pointer reveal" role="button" tabindex="0" data-report="${escape(r.id)}" aria-label="${escape(r.title)}">
      <div class="flex items-center gap-3 mb-3">${iconBox}
        <div><div class="text-sm font-bold text-primary">${escape(r.title)}</div><div class="text-xs text-on-surface-variant">${escape(r.subtitle)}</div></div>
      </div>
      <p class="text-xs text-on-surface-variant">${escape(r.description)}</p>
    </div>`;
  }).join('');

  const recentHTML = RECENT.map((r, idx) => `
    <div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-on-surface-variant text-sm" aria-hidden="true">description</span>
        <div><div class="text-sm font-medium text-primary">${escape(r.name)}</div><div class="text-xs text-on-surface-variant">${escape(r.when)}</div></div>
      </div>
      <button type="button" data-recent="${idx}" data-title="${escape(r.name)}" class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-surface-container-low rounded-lg transition-colors min-h-[36px] flex items-center gap-1" aria-label="Baixar PDF de ${escape(r.name)}">
        <span class="material-symbols-outlined text-sm align-middle" aria-hidden="true">download</span> PDF
      </button>
    </div>`).join('');

  return `
  <section class="view-section grid grid-cols-12 gap-6 p-5 lg:p-8" role="region" aria-label="Relatórios">
    <div class="col-span-12">
      <h2 class="text-2xl font-extrabold text-primary mb-2">Relatórios</h2>
      <p class="text-sm text-on-surface-variant mb-6">Gere, visualize e exporte relatórios detalhados do empreendimento.</p>
    </div>
    ${cardsHTML}
    <div class="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-5 reveal" aria-label="Relatórios recentes">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Relatórios Recentes</div>
      <div id="rp-recent-list" class="space-y-2">${recentHTML}</div>
    </div>
  </section>`;
}

export { template as reportsTemplate, generateReport, _downloadReportHTML as downloadReportHTML, _openReportPDF as openReportPDF };
