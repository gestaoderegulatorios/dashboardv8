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
export function renderTable(container, view, columns, options = {}) {
  const { title, sortKey, sortDir, onSortClick, onPageChange, onExportCSV, onFullscreen, tableId } = options;

  const tableIdAttr = tableId ? ` id="${escapeHTML(tableId)}"` : '';

  // Toolbar: título + CSV + fullscreen
  const toolbar = `
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <span class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">${escapeHTML(title || 'Dados')}</span>
      <div class="flex gap-2">
        ${onExportCSV ? `<button type="button" data-action="csv" class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-surface-container-low rounded-lg transition-colors min-w-[44px] min-h-[36px] flex items-center" data-ripple aria-label="Exportar CSV"><span class="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">download</span>CSV</button>` : ''}
        ${onFullscreen ? `<button type="button" data-action="fullscreen" class="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors min-w-[44px] min-h-[36px] flex items-center justify-center" aria-label="Tela cheia"><span class="material-symbols-outlined text-sm align-middle" aria-hidden="true">fullscreen</span></button>` : ''}
      </div>
    </div>`;

  // Header row
  const thead = `
    <thead class="bg-surface-container-low">
      <tr>${columns.map((c) => {
        const align = c.align || 'left';
        const isSorted = sortKey === c.key;
        const sortIcon = isSorted
          ? (sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward')
          : 'swap_vert';
        const iconOpacity = isSorted ? '' : 'opacity-40';
        const baseCls = `px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider text-${align}`;
        if (c.sortable === false) {
          return `<th scope="col" class="${baseCls}">${escapeHTML(c.label)}</th>`;
        }
        const ariaSort = isSorted ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none';
        return `<th scope="col" aria-sort="${ariaSort}" class="${baseCls} cursor-pointer select-none hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-surface-tint" tabindex="0" data-sort="${escapeHTML(c.key)}">${escapeHTML(c.label)} <span class="material-symbols-outlined text-xs sort-icon ${iconOpacity}" aria-hidden="true">${sortIcon}</span></th>`;
      }).join('')}</tr>
    </thead>`;

  // Body
  const tbody = view.rows.length === 0
    ? `<tbody><tr><td colspan="${columns.length}" class="px-4 py-8 text-center text-sm text-on-surface-variant">Nenhum resultado.</td></tr></tbody>`
    : `<tbody class="text-sm text-on-surface">${view.rows.map((row) => `
        <tr class="border-t border-outline-variant hover:bg-surface-container-low transition-colors">
          ${columns.map((c) => {
            const v = row[c.key];
            const align = c.align || 'left';
            const cellCls = c.className ? c.className(v) : '';
            const numericCls = align === 'right' ? ' tabular-nums' : '';
            const inner = c.renderHTML ? c.renderHTML(v, row) : escapeHTML(c.format ? c.format(v, row) : (v ?? ''));
            return `<td class="px-4 py-3 text-${align}${numericCls} ${cellCls}">${inner}</td>`;
          }).join('')}
        </tr>`).join('')}</tbody>`;

  // Pagination footer (espelho V7: ← / N / X / →)
  const pagBtnCls = 'px-2 py-1 rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface-variant min-w-[36px]';
  const start = view.total === 0 ? 0 : (view.page - 1) * view.pageSize + 1;
  const end = Math.min(view.page * view.pageSize, view.total);
  const pagination = `
    <div class="flex items-center justify-between px-4 py-3 border-t border-outline-variant text-xs text-on-surface-variant">
      <span aria-live="polite">${start}-${end} de ${view.total} registro${view.total === 1 ? '' : 's'}</span>
      <div class="flex items-center gap-2">
        <button type="button" data-page="prev" class="${pagBtnCls}" ${view.page <= 1 ? 'disabled' : ''} aria-label="Página anterior">←</button>
        <span aria-live="polite">${view.page} / ${view.totalPages}</span>
        <button type="button" data-page="next" class="${pagBtnCls}" ${view.page >= view.totalPages ? 'disabled' : ''} aria-label="Próxima página">→</button>
      </div>
    </div>`;

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

  // Listeners
  if (onSortClick) {
    container.querySelectorAll('th[data-sort]').forEach((th) => {
      const fire = () => onSortClick(th.dataset.sort);
      th.addEventListener('click', fire);
      th.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
      });
    });
  }
  if (onPageChange) {
    container.querySelectorAll('button[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.page;
        const next = dir === 'next' ? Math.min(view.totalPages, view.page + 1) : Math.max(1, view.page - 1);
        if (next !== view.page) onPageChange(next);
      });
    });
  }
  const csvBtn = container.querySelector('button[data-action="csv"]');
  if (csvBtn && onExportCSV) csvBtn.addEventListener('click', onExportCSV);
  const fsBtn = container.querySelector('button[data-action="fullscreen"]');
  if (fsBtn && onFullscreen) fsBtn.addEventListener('click', onFullscreen);
}

/** Helper puro: clamp a página alvo. */
export function clampPage(target, totalPages) {
  if (!Number.isFinite(target) || target < 1) return 1;
  if (target > totalPages) return totalPages;
  return Math.floor(target);
}

/** Toggle sort: mesma key asc→desc; desc→none; key nova→asc + page 1. */
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

/** Dispara download de CSV no browser. */
export function downloadCSV(filename, csvText) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
