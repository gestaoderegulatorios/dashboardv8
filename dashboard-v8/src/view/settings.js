// Settings View V8 - Exact V7 copy to bypass V8 architecture
// This uses V7's exact approach: inline oninput handlers, localStorage, no store interaction

export function mount(host) {
  // Exact V7 settings HTML with inline oninput handlers
  host.innerHTML = `
  <section class="view-section grid grid-cols-12 gap-6 p-5 lg:p-8" role="region" aria-label="Configurações">
    <div class="col-span-12">
      <h2 class="text-2xl font-extrabold text-primary mb-2">Configurações</h2>
      <p class="text-sm text-on-surface-variant mb-6">Personalize o dashboard e gerencie preferências do empreendimento.</p>
    </div>
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm" aria-label="Dados do Usuário">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Dados do Usuário</div>
      <div class="space-y-4">
        <div><label for="setting-username" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Usuário</label><input type="text" id="setting-username" value="${localStorage.getItem('v8-username') || 'Reinaldo Silva'}" class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" oninput="localStorage.setItem('v8-username',this.value)"></div>
        <div><label for="setting-role" class="block text-xs font-semibold text-on-surface-variant mb-1">Cargo</label><input type="text" id="setting-role" value="${localStorage.getItem('v8-role') || 'Diretor de Obras'}" class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" oninput="localStorage.setItem('v8-role',this.value)"></div>
      </div>
    </div>
    <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm" aria-label="Dados do Empreendimento">
      <div class="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Empreendimento</div>
      <div class="space-y-4">
        <div><label for="setting-company" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome da Construtora</label><input type="text" id="setting-company" value="${localStorage.getItem('v8-company') || 'Construtora Horizonte'}" class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" oninput="localStorage.setItem('v8-company',this.value)"></div>
        <div><label for="setting-project" class="block text-xs font-semibold text-on-surface-variant mb-1">Nome do Empreendimento</label><input type="text" id="setting-project" value="${localStorage.getItem('v8-project') || 'Horizonte Premium'}" class="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm" oninput="localStorage.setItem('v8-project',this.value)"></div>
      </div>
    </div>
    <div class="col-span-12 flex items-center justify-end gap-3 pt-2">
      <span id="settings-save-status" class="text-xs text-on-surface-variant" aria-live="polite"></span>
      <button type="button" id="settings-save-btn" class="px-6 py-2.5 bg-surface-tint text-white rounded-lg text-sm font-bold shadow-sm min-h-[44px] flex items-center" aria-label="Salvar modificações">
        <span class="material-symbols-outlined text-sm align-middle mr-1" aria-hidden="true">save</span>Salvar Modificações
      </button>
    </div>
  </section>`;

  // Save button - reads from localStorage and updates store ONCE
  const saveBtn = host.querySelector('#settings-save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const settings = {
        username: localStorage.getItem('v8-username') || 'Reinaldo Silva',
        role: localStorage.getItem('v8-role') || 'Diretor de Obras',
        companyName: localStorage.getItem('v8-company') || 'Construtora Horizonte',
        projectName: localStorage.getItem('v8-project') || 'Horizonte Premium'
      };
      // Update store once
      const event = new CustomEvent('v8:settings-save', { detail: settings });
      document.dispatchEvent(event);
      
      const status = host.querySelector('#settings-save-status');
      if (status) {
        status.textContent = 'Salvo!';
        status.className = 'text-success';
        setTimeout(() => { if (status) { status.textContent = ''; status.className = ''; } }, 2000);
      }
    });
  }

  return function unmount() {
    host.innerHTML = '';
  };
}

export const settingsView = { id: 'settings', mount };
