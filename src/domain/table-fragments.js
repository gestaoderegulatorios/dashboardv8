// Fragments extracted from renderTable for better testability and maintainability.
// These are pure HTML builders. They include local HTML escaping to avoid
// cross-file dependencies.

// Basic HTML escape utility (safe subset for attribute/text escaping)
function escapeHTMLLocal(s) {
  const str = String(s ?? '');
  return str.replace(/[&<>"']/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return c;
    }
  });
}

// Toolbar: title + CSV + fullscreen actions
export function buildToolbar(title, onExportCSV, onFullscreen) {
  const t = escapeHTMLLocal(title || 'Dados');
  // Toolbar: título + CSV + fullscreen
  return `
    <div class="flex items-center justify-between p-4 border-b border-outline-variant">
      <span class="text-sm font-bold text-on-surface-variant uppercase tracking-wider">${t}</span>
      <div class="flex gap-2">
        ${onExportCSV ? `<button type="button" data-action="csv" class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-surface-container-low rounded-lg transition-colors min-w-[44px] min-h-[36px] flex items-center" data-ripple aria-label="Exportar CSV"><span class="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">download</span>CSV</button>` : ''}
        ${onFullscreen ? `<button type="button" data-action="fullscreen" class="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors min-w-[44px] min-h-[36px] flex items-center justify-center" aria-label="Tela cheia"><span class="material-symbols-outlined text-sm align-middle" aria-hidden="true">fullscreen</span></button>` : ''}
      </div>
    </div>`;
}

// Table head with sortable columns
export function buildTableHead(columns, sortKey, sortDir) {
  const theadCols = (columns || []).map((c) => {
    const align = c.align || 'left';
    const isSorted = sortKey === c.key;
    const sortIcon = isSorted ? (sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward') : 'swap_vert';
    const iconOpacity = isSorted ? '' : 'opacity-40';
    const baseCls = `px-4 py-3 text-xs font-bold text-outline uppercase tracking-wider text-${align}`;
    if (c.sortable === false) {
      return `<th scope="col" class="${baseCls}">${escapeHTMLLocal(c.label)}</th>`;
    }
    const ariaSort = isSorted ? (sortDir === 'desc' ? 'descending' : 'ascending') : 'none';
    return `<th scope="col" aria-sort="${ariaSort}" class="${baseCls} cursor-pointer select-none hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-surface-tint" tabindex="0" data-sort="${escapeHTMLLocal(c.key)}">${escapeHTMLLocal(c.label)} <span class="material-symbols-outlined text-xs sort-icon ${iconOpacity}" aria-hidden="true">${sortIcon}</span></th>`;
  }).join('');
  return `<thead class="bg-surface-container-low"><tr>${theadCols}</tr></thead>`;
}

// Table body (rows)
export function buildTableBody(view, columns) {
  const cols = columns || [];
  if (!view || !Array.isArray(view.rows) || view.rows.length === 0) {
    return `<tbody><tr><td colspan="${cols.length}" class="px-4 py-8 text-center text-sm text-on-surface-variant">Nenhum resultado.</td></tr></tbody>`;
  }
  const rowsHtml = view.rows.map((row) => {
    const cells = cols.map((c) => {
      const v = row[c.key];
      const align = c.align || 'left';
      const cellCls = c.className ? c.className(v) : '';
      const numericCls = align === 'right' ? ' tabular-nums' : '';
      const inner = c.renderHTML ? c.renderHTML(v, row) : escapeHTMLLocal(c.format ? c.format(v, row) : (v ?? ''));
      return `<td class="px-4 py-3 text-${align}${numericCls} ${cellCls}">${inner}</td>`;
    }).join('');
    return `<tr class="border-t border-outline-variant hover:bg-surface-container-low transition-colors">${cells}</tr>`;
  }).join('');
  return `<tbody class="text-sm text-on-surface">${rowsHtml}</tbody>`;
}

// Pagination strip
export function buildPagination(view) {
  const start = view.total === 0 ? 0 : (view.page - 1) * view.pageSize + 1;
  const end = Math.min(view.page * view.pageSize, view.total);
  const pagBtnCls = 'px-2 py-1 rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface-variant min-w-[36px]';
  const pagination = `
    <div class="flex items-center justify-between px-4 py-3 border-t border-outline-variant text-xs text-on-surface-variant">
      <span aria-live="polite">${start}-${end} de ${view.total} registro${view.total === 1 ? '' : 's'}</span>
      <div class="flex items-center gap-2">
        <button type="button" data-page="prev" class="${pagBtnCls}" ${view.page <= 1 ? 'disabled' : ''} aria-label="Página anterior">←</button>
        <span aria-live="polite">${view.page} / ${view.totalPages}</span>
        <button type="button" data-page="next" class="${pagBtnCls}" ${view.page >= view.totalPages ? 'disabled' : ''} aria-label="Próxima página">→</button>
      </div>
    </div>`;
  return pagination;
}

// Event wiring (sorting, pagination, CSV, fullscreen)
export function wireTableEvents(container, view, options = {}) {
  // Destructure handlers
  const { onSortClick, onPageChange, onExportCSV, onFullscreen } = options;
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
