import { isDarkMode, toggleDarkMode } from '../ui/dark-mode.js';
import { escape, showToast } from './shared.js';

// Component visibility groups (moved from settings.js)
export const VISIBILITY_GROUPS = [
  { view: 'Visão Geral', items: [
    { id: 'kpi-receita', label: 'KPI Receita Mensal' },
    { id: 'chart-area-revenue', label: 'Gráfico Evolução Receita' },
    { id: 'chart-donut-type', label: 'Donut Composição' }
  ]},
  { view: 'Obras', items: [
    { id: 'chart-works-barv', label: 'Barras Orçado vs Executado' },
    { id: 'table-obras', label: 'Tabela de Obras' }
  ]},
  { view: 'Financeiro', items: [
    { id: 'chart-waterfall', label: 'Waterfall' },
    { id: 'chart-line-annotation', label: 'Receita vs Meta' },
    { id: 'chart-treemap', label: 'Treemap Custos' }
  ]},
  { view: 'Operacional', items: [
    { id: 'chart-heatmap', label: 'Heatmap de Desvios' },
    { id: 'chart-bar-h', label: 'Barras Horizontais' },
    { id: 'table-operacional', label: 'Tabela Operacional' }
  ]},
  { view: 'Loteamentos', items: [
    { id: 'kpi-lotes', label: 'KPI Lotes Vendidos' },
    { id: 'chart-donut-land', label: 'Donut por Fase' },
    { id: 'chart-gauge-land', label: 'Gauge Progresso' }
  ]}
];

// Rendered settings template extracted from the original view
export function settingsTemplate(settings) {
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm';

  const visibilityHTML = VISIBILITY_GROUPS.map(g => `
    <div class="p-4 border border-outline-variant rounded-lg">
      <div class="text-xs font-bold text-on-surface-variant uppercase mb-3">${escape(g.view)}</div>
      <div class="space-y-2">
        ${g.items.map(item => `
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm text-primary">${escape(item.label)}</span>
            <input type="checkbox" checked data-toggle="${escape(item.id)}" class="w-4 h-4 accent-surface-tint">
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
  <section class="view-section grid grid-cols-12 gap-6 p-5 lg:p-8" role="region" aria-label="Configurações">
    <div class="col-span-12">
      <h2 class="text-2xl font-extrabold text-primary mb-2">Configurações</h2>
      <p class="text-sm text-on-surface-variant mb-6">Personalize o dashboard e gerencie preferências do empreendimento.</p>
    </div>

    <!-- Usuário -->
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Dados do Usuário">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Dados do Usuário</div>
      <div class="space-y-4">
        <div><label for="setting-username" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Usuário</label><input type="text" id="setting-username" data-setting="username" value="${escape(settings.username)}" class="${inputCls}" autocomplete="off" spellcheck="false"></div>
        <div><label for="setting-role" class="block text-xs font-semibold text-on-surface-variant mb-1">Cargo</label><input type="text" id="setting-role" data-setting="role" value="${escape(settings.role)}" class="${inputCls}" autocomplete="off" spellcheck="false"></div>
      </div>
    </div>

    <!-- Empreendimento -->
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Dados do Empreendimento">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Empreendimento</div>
      <div class="space-y-4">
        <div><label for="setting-company" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome da Construtora</label><input type="text" id="setting-company" data-setting="companyName" value="${escape(settings.companyName)}" class="${inputCls}" autocomplete="off" spellcheck="false"></div>
        <div><label for="setting-project" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Empreendimento</label><input type="text" id="setting-project" data-setting="projectName" value="${escape(settings.projectName)}" class="${inputCls}" autocomplete="off" spellcheck="false"></div>
      </div>
    </div>

    <!-- Visibilidade de Componentes (espelho V7 linhas 1017–1066) -->
    <div class="col-span-12 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Visibilidade de Componentes">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Visibilidade de Componentes</div>
      <p class="text-xs text-on-surface-variant mb-4">Oculte ou exiba KPIs, gráficos e tabelas em cada view. Alterações são salvas automaticamente.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="visibility-toggles">
        ${visibilityHTML}
      </div>
    </div>

    <!-- Aparência -->
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Aparência">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Aparência</div>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-primary">Modo Escuro</span>
          <button type="button" data-action="toggle-dark" class="px-3 py-1.5 text-xs font-medium bg-surface-tint text-white rounded-lg hover:opacity-90 transition-colors min-h-[36px]">${isDarkMode() ? 'Modo Claro' : 'Modo Escuro'}</button>
        </div>
        <div class="flex items-center justify-between">
          <label for="setting-animations" class="text-sm text-primary">Animações</label>
          <input type="checkbox" id="setting-animations" data-setting="animations" ${settings.animations ? 'checked' : ''} class="w-4 h-4 accent-surface-tint">
        </div>
      </div>
    </div>

    <!-- Sobre -->
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Sobre o Sistema">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Sobre o Sistema</div>
      <div class="text-xs text-on-surface-variant space-y-1">
        <p>Borgonovi Design System V8</p>
        <p>Versão: 8.0.0</p>
        <p>Motor: HTML + Tailwind + ApexCharts (ES Modules nativos)</p>
        <p>Arquitetura modular: filtros/KPIs/charts como funções puras + lifecycle explícito.</p>
      </div>
    </div>

    <!-- Salvar -->
    <div class="col-span-12 flex items-center justify-end gap-3 pt-2">
      <span id="settings-save-status" class="text-xs text-on-surface-variant" aria-live="polite"></span>
      <button type="button" data-action="save" class="px-6 py-2.5 bg-surface-tint text-white rounded-lg text-sm font-bold hover:opacity-90 transition-colors shadow-sm min-h-[44px] flex items-center" aria-label="Salvar modificações">
        <span class="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">save</span>Salvar Modificações
      </button>
    </div>
  </section>`;
}

// Restore visibility state and wire events -- these are delegated to the fragment helpers
export function restoreVisibility(host, settings) {
  if (settings && settings.visibility) {
    try {
      const vis = JSON.parse(settings.visibility);
      Object.entries(vis).forEach(([key, val]) => {
        const cb = host.querySelector(`#visibility-toggles input[data-toggle="${key}"]`);
        if (cb) cb.checked = val;
      });
    } catch { /* noop: corrupted visibility JSON — defaults apply */ }
  }
}

export function wireSettingsEvents(host, { pushToStore, applyAnimationsPref, autosave, store }) {
  // V8 fix: NÃO faz store.set no input/blur — isso causa re-render da sidebar e flicker.
  // Comportamento espelho V7: valores ficam no DOM, só são salvos no store ao clicar "Salvar".

  function sv() {
    const v = {};
    host.querySelectorAll('#visibility-toggles input[type="checkbox"]').forEach((cb) => { v[cb.dataset.toggle] = cb.checked; });
    pushToStore({ visibility: JSON.stringify(v) });
    autosave('visibilidade');
  }

  // Checkboxes (animations): faz pushToStore imediato
  host.querySelectorAll('input[data-setting]').forEach((el) => {
    const key = el.dataset.setting;
    if (el.type === 'checkbox') {
      el.addEventListener('change', () => { pushToStore({ [key]: el.checked }); if (key === 'animations') applyAnimationsPref(el.checked); autosave(key); });
    }
    // Text inputs: NÃO faz pushToStore — evita re-render da sidebar que causa flicker
  });

  host.querySelectorAll('#visibility-toggles input[type="checkbox"]').forEach((cb) => { cb.addEventListener('change', () => sv()); });

  const darkBtn = host.querySelector('button[data-action="toggle-dark"]');
  if (darkBtn) {
    darkBtn.addEventListener('click', () => { toggleDarkMode(store); darkBtn.textContent = isDarkMode() ? 'Modo Claro' : 'Modo Escuro'; });
  }
  const saveBtn = host.querySelector('button[data-action="save"]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      // Lê valores dos inputs e salva no store (só agora, não a cada keystroke)
      const settings = {};
      host.querySelectorAll('input[data-setting]').forEach((el) => {
        const key = el.dataset.setting;
        settings[key] = el.type === 'checkbox' ? el.checked : el.value;
      });
      pushToStore(settings);
      showToast('Configurações salvas com sucesso', 'success');
      const status = host.querySelector('#settings-save-status');
      if (status) { status.textContent = 'Salvo!'; status.className = 'text-success'; setTimeout(() => { if (status) { status.textContent = ''; status.className = ''; } }, 2000); }
    });
  }
}
