// Tabela: HTML nativo + funções puras (decisão Spike 3).
// computeView (PURA), toggleSort (PURA), clampPage (PURA) — testáveis.
// renderTable: escreve no container com estilo espelho V7
// (status badges arredondados, sort icon Material, CSV/fullscreen toolbar,
//  paginação ←/→ + indicador de página).

/**
 * @typedef {Object} Column
 * @property {string} key
 * @property {string} label
 * @property {(v: any, row?: object) => string} [format]
 * @property {'left'|'right'|'center'} [align]
 * @property {boolean} [sortable]
 * @property {(v: any, row?: object) => string} [renderHTML]  // opt-out do format texto: HTML cru (ex: status badge)
 * @property {(v: any) => string} [className]
 */

/**
 * @typedef {Object} ViewState
 * @property {string} [sortKey]
 * @property {'asc'|'desc'} [sortDir]
 * @property {number} [page]
 * @property {number} [pageSize]
 */

/** @param {any[]} data @param {ViewState} [view] */
import { buildToolbar, buildTableHead, buildTableBody, buildPagination, wireTableEvents } from './table-fragments.js';

/**
 * Calcula a visão tabular com paginação e ordenação aplicadas.
 * @param {any[]} data
 * @param {ViewState} [view]
 * @returns {{ rows: any[], total: number, page: number, pageSize: number, totalPages: number }}
 */
export function computeView(data, view = {}) {
  let rows = [...data];

  if (view.sortKey) {
    const dir = view.sortDir === 'desc' ? -1 : 1;
    rows.sort((a, b) => {
      const va = a[view.sortKey];
      const vb = b[view.sortKey];
      if (va === vb) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'pt-BR') * dir;
    });
  }

  const total = rows.length;
  const pageSize = view.pageSize && view.pageSize > 0 ? view.pageSize : total || 1;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const requested = view.page && view.page > 0 ? view.page : 1;
  const page = Math.min(requested, totalPages);
  const start = (page - 1) * pageSize;
  const paged = rows.slice(start, start + pageSize);

  return { rows: paged, total, page, pageSize, totalPages };
}

const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/** Status badge V7. */
/**
 * Gera um badge HTML para um status de obra.
 * @param {string} status
 * @returns {string} HTML do badge
 */
export function statusBadge(status) {
  const s = String(status || '').toLowerCase();
  let cls = 'bg-surface-container text-on-surface-variant';
  if (s.includes('progresso') || s.includes('andamento') || s.includes('em ')) cls = 'status-success';
  else if (s.includes('aten')) cls = 'status-warning';
  else if (s.includes('conclu')) cls = 'status-success';
  else if (s.includes('plan')) cls = 'bg-surface-container text-on-surface-variant';
  else if (s.includes('pend')) cls = 'bg-surface-container text-on-surface-variant';
  return `<span class="px-2 py-0.5 rounded-[9999px] ${cls} text-xs font-semibold">${escapeHTML(status)}</span>`;
}

/**
 * @param {HTMLElement} container
 * @param {ReturnType<typeof computeView>} view
 * @param {Column[]} columns
 * @param {{ title?: string, sortKey?: string, sortDir?: 'asc'|'desc',
 *           onSortClick?: (key: string) => void, onPageChange?: (page: number) => void,
 *           onExportCSV?: () => void, onFullscreen?: () => void,
 *           tableId?: string }} [options]
 */
/**
 * Renderiza a tabela completa no container fornecido.
 * @param {HTMLElement} container
 * @param {ReturnType<typeof computeView>} view
 * @param {Column[]} columns
 * @param {{ title?: string, sortKey?: string, sortDir?: 'asc'|'desc',
  *           onSortClick?: (key: string) => void, onPageChange?: (page: number) => void,
  *           onExportCSV?: () => void, onFullscreen?: () => void,
  *           tableId?: string }} [options]
 */
export function renderTable(container, view, columns, options = {}) {
  const { title, sortKey, sortDir, onSortClick, onPageChange, onExportCSV, onFullscreen, tableId } = options;

  const tableIdAttr = tableId ? ` id="${escapeHTML(tableId)}"` : '';

  // Toolbar: título + CSV + fullscreen
  const toolbar = buildToolbar(title, onExportCSV, onFullscreen);

  // Header row (delegated to fragment)
  const thead = buildTableHead(columns, sortKey, sortDir);

  // Body
  const tbody = buildTableBody(view, columns);

  // Pagination footer (delegated to fragment)
  const pagination = buildPagination(view);

  container.innerHTML = `
    <div${tableIdAttr} class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      ${toolbar}
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse" role="table">
          ${thead}
          ${tbody}
        </table>
      </div>
      ${pagination}
    </div>
  `;

  // Event wiring via fragment helper (no inline logic here)
  wireTableEvents(container, view, {
    onSortClick,
    onPageChange,
    onExportCSV,
    onFullscreen
  });
}

/** Helper puro: clamp a página alvo. */
/**
 * Garante que a página alvo está dentro do range válido.
 * @param {number} target
 * @param {number} totalPages
 * @returns {number}
 */
export function clampPage(target, totalPages) {
  if (!Number.isFinite(target) || target < 1) return 1;
  if (target > totalPages) return totalPages;
  return Math.floor(target);
}

/** Toggle sort: mesma key asc→desc; desc→none; key nova→asc + page 1. */
/**
 * Alterna o estado de ordenação para uma coluna específica.
 * @param {ViewState} view
 * @param {string} key
 * @returns {ViewState}
 */
export function toggleSort(view, key) {
  if (view.sortKey !== key) return { ...view, sortKey: key, sortDir: 'asc', page: 1 };
  if (view.sortDir === 'asc') return { ...view, sortDir: 'desc' };
  return { ...view, sortKey: undefined, sortDir: undefined };
}

/**
 * Exporta linhas para CSV (texto). Não baixa — retorna string.
 * Útil para testar separado do download.
 * @param {any[]} rows
 * @param {Column[]} columns
 */
export function rowsToCSV(rows, columns) {
  const header = columns.map((c) => csvEscape(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => {
    const v = row[c.key];
    const txt = c.format ? c.format(v, row) : (v == null ? '' : String(v));
    return csvEscape(txt);
  }).join(',')).join('\n');
  return header + '\n' + body;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// downloadCSV moved to view/shared.js (F2.2 — DOM access doesn't belong in domain).
// Consumers import downloadCSV from view/shared.js directly.
