// View: Configurações. Espelho V7 — Dados do Usuário, Empreendimento,
// Visibilidade de Componentes, Aparência (dark mode + animações), Sobre o Sistema, Salvar.
// Fase 3: Persistência via state/settings.js. View lê/escreve via store (única fonte).

import { isDarkMode, toggleDarkMode } from '../ui/dark-mode.js';
import { BRANDING_DEFAULTS, VIEW_LABELS } from '../model/branding.js';
import { escape, showToast } from './shared.js';

// Componentes visíveis/ocultáveis por view (espelho V7 linhas 1017–1066)
const VISIBILITY_GROUPS = [
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

function template(settings) {
  const inputCls = 'w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20 transition-colors';

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
        <div><label for="setting-username" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Usuário</label><input type="text" id="setting-username" data-setting="username" value="${escape(settings.username)}" class="${inputCls}"></div>
        <div><label for="setting-role" class="block text-xs font-semibold text-on-surface-variant mb-1">Cargo</label><input type="text" id="setting-role" data-setting="role" value="${escape(settings.role)}" class="${inputCls}"></div>
      </div>
    </div>

    <!-- Empreendimento -->
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm reveal" aria-label="Dados do Empreendimento">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Empreendimento</div>
      <div class="space-y-4">
        <div><label for="setting-company" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome da Construtora</label><input type="text" id="setting-company" data-setting="companyName" value="${escape(settings.companyName)}" class="${inputCls}"></div>
        <div><label for="setting-project" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Empreendimento</label><input type="text" id="setting-project" data-setting="projectName" value="${escape(settings.projectName)}" class="${inputCls}"></div>
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

export function mount(host, ctx) {
  function currentSettings() {
    const s = ctx.store.get();
    return { ...BRANDING_DEFAULTS, ...(s.settings || {}) };
  }

  function applyAnimationsPref(animations) {
    document.body.classList.toggle('motion-reduced', !animations);
  }

  function pushToStore(updated) {
    ctx.store.set({ settings: { ...currentSettings(), ...updated } });
  }

  function autosave(reason) {
    const status = host.querySelector('#settings-save-status');
    if (status) {
      status.textContent = `Salvo automaticamente (${reason})`;
      setTimeout(() => { if (status) status.textContent = ''; }, 1800);
    }
  }

  function saveVisibility() {
    const visibility = {};
    host.querySelectorAll('#visibility-toggles input[type="checkbox"]').forEach(cb => {
      visibility[cb.dataset.toggle] = cb.checked;
    });
    pushToStore({ visibility: JSON.stringify(visibility) });
    autosave('visibilidade');
  }

  function restoreVisibility() {
    const settings = currentSettings();
    if (settings.visibility) {
      try {
        const vis = JSON.parse(settings.visibility);
        Object.entries(vis).forEach(([key, val]) => {
          const cb = host.querySelector(`#visibility-toggles input[data-toggle="${key}"]`);
          if (cb) cb.checked = val;
        });
      } catch {}
    }
  }

  function wireEvents() {
    // Text inputs + checkbox → store
    host.querySelectorAll('input[data-setting]').forEach((el) => {
      const key = el.dataset.setting;
      const evt = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, () => {
        const value = el.type === 'checkbox' ? el.checked : el.value;
        pushToStore({ [key]: value });
        if (key === 'animations') applyAnimationsPref(el.checked);
        autosave(key);
      });
    });

    // Visibility checkboxes → store
    host.querySelectorAll('#visibility-toggles input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener('change', () => saveVisibility());
    });

    // Toggle dark
    const darkBtn = host.querySelector('button[data-action="toggle-dark"]');
    if (darkBtn) {
      darkBtn.addEventListener('click', () => {
        toggleDarkMode(ctx.store);
        darkBtn.textContent = isDarkMode() ? 'Modo Claro' : 'Modo Escuro';
      });
    }

    // Save (feedback visual)
    const saveBtn = host.querySelector('button[data-action="save"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        showToast('Configurações salvas com sucesso', 'success');
        const status = host.querySelector('#settings-save-status');
        if (status) { status.textContent = 'Salvo!'; status.className = 'text-success'; setTimeout(() => { if (status) { status.textContent = ''; status.className = ''; } }, 2000); }
      });
    }
  }

  function renderAll() {
    const settings = currentSettings();
    host.innerHTML = template(settings);
    restoreVisibility();
    wireEvents();
    applyAnimationsPref(settings.animations);
    try {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('revealed'); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.1 });
      host.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    } catch {}
  }

  renderAll();

  let lastSettings = JSON.stringify(ctx.store.get().settings);
  const unsubscribe = ctx.store.subscribe((s) => {
    const cur = JSON.stringify(s.settings);
    if (cur !== lastSettings) { lastSettings = cur; renderAll(); }
  });

  return function unmount() {
    if (unsubscribe) { try { unsubscribe(); } catch {} }
  };
}

export const settingsView = { id: 'settings', ...VIEW_LABELS.settings, mount };
