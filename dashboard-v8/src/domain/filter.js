// Filtros como funções puras. Cada filtro: (obras, value) -> obras filtradas.
// applyFilters compõe todos. Zero efeito colateral.
// renderFilterBar: UI espelho V7 (input + selects + datas + chips de filtro ativo).

/** @typedef {{ search?: string, tipo?: string, status?: string, avancoMin?: number, avancoMax?: number }} FilterState */

/**
 * Aplica filtros aos dados de obras de forma pura, retornando uma nova lista filtrada.
 * @param {any[]} obras - Array de obras a serem filtradas
 * @param {FilterState} [state] - Estado atual dos filtros (search, tipo, status, avancoMin, avancoMax)
 * @returns {any[]} Obras filtradas
 */

import { escape } from './escape.js';

const filterFns = {
  search: (obras, q) => {
    if (!q || typeof q !== 'string') return obras;
    const needle = q.trim().toLowerCase();
    if (!needle) return obras;
    return obras.filter((o) => o.nome.toLowerCase().includes(needle));
  },
  tipo: (obras, tipo) => {
    if (!tipo || tipo === 'all') return obras;
    return obras.filter((o) => o.tipo === tipo);
  },
  status: (obras, status) => {
    if (!status || status === 'all') return obras;
    return obras.filter((o) => o.status === status);
  },
  avancoMin: (obras, min) => {
    if (typeof min !== 'number' || isNaN(min)) return obras;
    return obras.filter((o) => o.avanco >= min);
  },
  avancoMax: (obras, max) => {
    if (typeof max !== 'number' || isNaN(max)) return obras;
    return obras.filter((o) => o.avanco <= max);
  }
};

/**
 * Aplica todos os filtros em sequência. Cada filtro é puro.
 * @param {any[]} obras @param {FilterState} [state]
 */
export function applyFilters(obras, state = {}) {
  return Object.keys(filterFns).reduce((acc, key) => {
    if (!(key in state)) return acc;
    return filterFns[key](acc, state[key]);
  }, obras);
}

/**
 * Retorna as categorias distintas de tipo de obra, em ordem alfabética.
 * @param {any[]} obras
 * @returns {string[]}
 */
export function listTipos(obras) {
  return [...new Set(obras.map((o) => o.tipo))].sort();
}
/**
 * Retorna os statuses distintos das obras, em ordem alfabética.
 * @param {any[]} obras
 * @returns {string[]}
 */
export function listStatuses(obras) {
  return [...new Set(obras.map((o) => o.status))].sort();
}
/**
 * Estado inicial padrão dos filtros (sem filtros ativos).
 * @returns {FilterState}
 */
export function emptyFilterState() { return {}; }

/**
 * Renderiza barra de filtros (espelho V7). Auto-aplica em input/change.
 * @param {HTMLElement} container
 * @param {{ obras: any[], state: FilterState, onChange: (newState: FilterState) => void, onReset: () => void }} ctx
 */
/**
 * Renderiza a barra de filtros e vincula eventos de mudança e reset.
 * @param {HTMLElement} container
 * @param {{ obras: any[], state: FilterState, onChange: (newState: FilterState) => void, onReset: () => void }} ctx
 */
export function renderFilterBar(container, { obras, state, onChange, onReset }) {
  const tipos = listTipos(obras);
  const statuses = listStatuses(obras);

  const inputCls = 'px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20 transition-colors min-h-[40px]';

  const tipoOptions = ['<option value="all">Todos os tipos</option>']
    .concat(tipos.map((t) => `<option value="${escape(t)}"${state.tipo === t ? ' selected' : ''}>${escape(t)}</option>`))
    .join('');
  const statusOptions = ['<option value="all">Todos os status</option>']
    .concat(statuses.map((s) => `<option value="${escape(s)}"${state.status === s ? ' selected' : ''}>${escape(s)}</option>`))
    .join('');

  const activeChips = renderActiveChips(state);

  container.innerHTML = `
    <div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4" aria-label="Filtros de obras">
      <div class="flex flex-wrap items-center gap-3">
        <input type="search" data-filter="search" aria-label="Pesquisar obra" placeholder="Pesquisar obra…" value="${escape(state.search || '')}" class="flex-1 min-w-[180px] ${inputCls}">
        <select data-filter="tipo" aria-label="Tipo" class="${inputCls}">${tipoOptions}</select>
        <select data-filter="status" aria-label="Status" class="${inputCls}">${statusOptions}</select>
        <!-- Date filters removed: obras data has no date fields in this dataset -->
        ${hasActiveFilters(state) ? `<button type="button" data-action="reset" class="px-3 py-2 text-xs font-semibold text-error hover:bg-red-50 rounded-lg transition-colors min-h-[40px]" aria-label="Limpar filtros"><span class="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">clear</span>Limpar</button>` : ''}
      </div>
      ${activeChips ? `<div class="flex flex-wrap gap-2 mt-3" aria-label="Filtros ativos">${activeChips}</div>` : ''}
    </div>
  `;

  // Wire inputs
  container.querySelectorAll('[data-filter]').forEach((el) => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const next = { ...state };
      const key = el.dataset.filter;
      const v = el.value;
      if (v === '' || v === 'all') delete next[key]; else next[key] = v;
      onChange(next);
    });
  });
  // Reset
  const resetBtn = container.querySelector('button[data-action="reset"]');
  if (resetBtn) resetBtn.addEventListener('click', onReset);
  // Chips remove
  container.querySelectorAll('button[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = { ...state };
      delete next[btn.dataset.remove];
      onChange(next);
    });
  });
}

function hasActiveFilters(state) {
  return Object.keys(state).some((k) => state[k] != null && state[k] !== '' && state[k] !== 'all');
}

function chipLabel(key, value) {
  const labels = {
    search: 'Busca',
    tipo: 'Tipo',
    status: 'Status',
    avancoMin: 'Avanço ≥',
    avancoMax: 'Avanço ≤'
  };
  return `${labels[key] || key}: ${value}`;
}

function renderActiveChips(state) {
  const chips = Object.keys(state)
    .filter((k) => state[k] != null && state[k] !== '' && state[k] !== 'all')
    .map((k) => `
      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-[9999px] bg-surface-tint/10 text-xs font-semibold text-surface-tint">
        ${escape(chipLabel(k, state[k]))}
        <button type="button" data-remove="${escape(k)}" class="hover:bg-surface-container rounded-full p-0.5" aria-label="Remover filtro ${escape(k)}">
          <span class="material-symbols-outlined text-[14px]" aria-hidden="true">close</span>
        </button>
      </span>
    `).join('');
  return chips;
}
