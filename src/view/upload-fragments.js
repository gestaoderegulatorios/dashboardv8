// Fragments helper for Upload view (drag-and-drop CSV import)
// Exposes a slim template and a wiring helper that preserves exact behavior

// HTML template for the Upload view (identical to previous inline template)
export function template() {
  return `
<section class="view-section grid grid-cols-12 gap-6 p-5 lg:p-8 reveal" role="region" aria-label="Importar Dados">
  <div class="col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm p-6" aria-label="Dropzone de upload">
    <div id="dropzone" class="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-container-low cursor-pointer transition-colors" role="button" tabindex="0" aria-label="Área de upload de planilha. Clique para selecionar">
      <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-2xl text-surface-tint" aria-hidden="true">upload_file</span>
      </div>
      <p class="text-sm font-semibold text-primary mb-1">Arraste e solte o arquivo aqui</p>
      <p class="text-xs text-on-surface-variant mb-2">ou clique para selecionar</p>
      <div class="flex gap-3 mt-2">
        <button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium hover:bg-surface-tint-hover transition-colors" id="select-file-btn" type="button">Selecionar arquivo</button>
        <button class="px-4 py-2 text-surface-tint border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors" id="download-template-btn" type="button">Baixar modelo</button>
      </div>
      <input type="file" id="file-input" class="hidden" accept=".csv,.xlsx,.xls,.ods">
    </div>
  </div>

  <div id="upload-status" class="col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm p-5 hidden" aria-label="Status do upload">
    <div class="flex items-center justify-between mb-2">
      <span class="text-xs font-bold text-on-surface-variant uppercase">Arquivo:</span>
      <span id="filename" class="text-sm font-medium text-primary">Nenhum arquivo selecionado</span>
    </div>
    <div id="upload-info" class="text-xs text-on-surface-variant mb-3">Sem informações</div>
    <div class="flex items-center gap-2">
      <button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-surface-container-low rounded-lg transition-colors" id="visualize-btn" type="button">Visualizar dados</button>
      <button class="px-3 py-1.5 text-xs font-medium text-error hover:bg-red-50 rounded-lg transition-colors" id="remove-btn" type="button">Remover</button>
      <button class="ml-auto px-3 py-1.5 text-xs font-medium bg-surface-tint text-white rounded-lg hover:bg-surface-tint-hover transition-colors" id="confirm-btn" type="button">Confirmar carregamento</button>
    </div>
  </div>

  <!-- Data schema: estrutura esperada da planilha -->
  <div class="col-span-12 text-xs text-on-surface-variant" aria-label="Estrutura esperada da planilha">
    <p class="font-bold mb-1">Estrutura esperada da planilha:</p>
    <table class="w-full text-left">
      <tr><td class="pr-4 font-medium">Torre/Bloco:</td><td>Texto (obrigatório)</td></tr>
      <tr><td class="pr-4 font-medium">Avanço Previsto %:</td><td>Número (obrigatório)</td></tr>
      <tr><td class="pr-4 font-medium">Avanço Realizado %:</td><td>Número (obrigatório)</td></tr>
      <tr><td class="pr-4 font-medium">Custo Orçado:</td><td>Número (opcional)</td></tr>
      <tr><td class="pr-4 font-medium">Custo Executado:</td><td>Número (opcional)</td></tr>
      <tr><td class="pr-4 font-medium">Responsável:</td><td>Texto (opcional)</td></tr>
    </table>
  </div>

  <div id="upload-empty" class="col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm p-6" style="display:none" aria-label="Empty state de upload">
    <div class="flex items-center gap-3 text-center mx-auto justify-center flex-col" style="max-width:420px">
      <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-2">
        <span class="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">cloud_upload</span>
      </div>
      <div class="text-lg font-bold text-primary">Nenhum dado importado</div>
      <p class="text-sm text-on-surface-variant text-center">Insira uma planilha (.csv, .xlsx, .xls, .ods) para começar a visualização dos dados de medição.</p>
      <button class="mt-2 px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium hover:bg-surface-tint-hover transition-colors" id="load-file-btn" type="button">Carregar arquivo</button>
    </div>
  </div>
</section>
`;
}

// Wire the Upload UI: mounts the template and wires events.
export function wireUploadUI(host, ctx) {
  // Build DOM from template and wire all interactive parts to the provided ctx
  host.innerHTML = template();

  // References to DOM elements
  const dropzoneEl = host.querySelector('#dropzone');
  const fileInputEl = host.querySelector('#file-input');
  const statusEl = host.querySelector('#upload-status');
  const filenameEl = host.querySelector('#filename');
  const uploadInfoEl = host.querySelector('#upload-info');
  const emptyPanelEl = host.querySelector('#upload-empty');
  const selectBtnEl = host.querySelector('#select-file-btn');
  const downloadBtnEl = host.querySelector('#download-template-btn');
  const visualizeBtnEl = host.querySelector('#visualize-btn');
  const removeBtnEl = host.querySelector('#remove-btn');
  const confirmBtnEl = host.querySelector('#confirm-btn');
  const loadFileBtnEl = host.querySelector('#load-file-btn');

  // Helpers to mimic original behavior
  function onDragOver(e) {
    e.preventDefault();
    if (dropzoneEl) dropzoneEl.classList.add('bg-primary-fixed');
  }
  function onDragLeave() {
    if (dropzoneEl) dropzoneEl.style.backgroundColor = '';
  }
  function onDrop(e) {
    e.preventDefault();
    onDragLeave();
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) {
      handleFileLoaded(f.name);
      if (ctx && typeof ctx.showToast === 'function') ctx.showToast('Arquivo carregado com sucesso', 'success');
    }
  }
  function onFileInputChange() {
    const f = fileInputEl && fileInputEl.files && fileInputEl.files[0];
    if (f) {
      handleFileLoaded(f.name);
      if (ctx && typeof ctx.showToast === 'function') ctx.showToast('Arquivo carregado com sucesso', 'success');
    }
  }
  function handleFileLoaded(name) {
    if (!name) return;
    if (filenameEl) filenameEl.textContent = name;
    if (statusEl) statusEl.style.display = 'block';
    if (dropzoneEl) dropzoneEl.style.display = 'none';
    if (emptyPanelEl) emptyPanelEl.style.display = 'none';
  }
  function clearUpload() {
    if (statusEl) statusEl.style.display = 'none';
    if (dropzoneEl) dropzoneEl.style.display = 'block';
    if (filenameEl) filenameEl.textContent = 'Nenhum arquivo selecionado';
    if (fileInputEl) fileInputEl.value = '';
    if (emptyPanelEl) emptyPanelEl.style.display = 'none';
  }
  // Keyboard handler and buttons (exported-like UX)
  function onDropzoneKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      fileInputEl && fileInputEl.click();
    }
  }
  function onSelectFileClick() { fileInputEl && fileInputEl.click(); }
  function onDownloadTemplate() { if (ctx && typeof ctx.showToast === 'function') ctx.showToast('Modelo CSV baixado', 'success'); }
  function onVisualize() { if (ctx && typeof ctx.showToast === 'function') ctx.showToast('Visualização em desenvolvimento'); }
  function onConfirm() { if (ctx && typeof ctx.showToast === 'function') ctx.showToast('Dados importados para o dashboard', 'success'); }
  function onLoadFileClick() { fileInputEl && fileInputEl.click(); }

  // Attach events
  if (dropzoneEl) {
    dropzoneEl.addEventListener('dragover', onDragOver);
    dropzoneEl.addEventListener('dragleave', onDragLeave);
    dropzoneEl.addEventListener('drop', onDrop);
    dropzoneEl.addEventListener('keydown', onDropzoneKeyDown);
  }
  if (fileInputEl) fileInputEl.addEventListener('change', onFileInputChange);
  if (selectBtnEl) selectBtnEl.addEventListener('click', onSelectFileClick);
  if (downloadBtnEl) downloadBtnEl.addEventListener('click', onDownloadTemplate);
  if (visualizeBtnEl) visualizeBtnEl.addEventListener('click', onVisualize);
  if (removeBtnEl) removeBtnEl.addEventListener('click', clearUpload);
  if (confirmBtnEl) confirmBtnEl.addEventListener('click', onConfirm);
  if (loadFileBtnEl) loadFileBtnEl.addEventListener('click', onLoadFileClick);

  // Mounting complete; return unmount to clean up
  return function unmount() {
    try {
      if (dropzoneEl) {
        dropzoneEl.removeEventListener('dragover', onDragOver);
        dropzoneEl.removeEventListener('dragleave', onDragLeave);
        dropzoneEl.removeEventListener('drop', onDrop);
        dropzoneEl.removeEventListener('keydown', onDropzoneKeyDown);
      }
      if (fileInputEl) fileInputEl.removeEventListener('change', onFileInputChange);
      if (selectBtnEl) selectBtnEl.removeEventListener('click', onSelectFileClick);
      if (downloadBtnEl) downloadBtnEl.removeEventListener('click', onDownloadTemplate);
      if (visualizeBtnEl) visualizeBtnEl.removeEventListener('click', onVisualize);
      if (removeBtnEl) removeBtnEl.removeEventListener('click', clearUpload);
      if (confirmBtnEl) confirmBtnEl.removeEventListener('click', onConfirm);
      if (loadFileBtnEl) loadFileBtnEl.removeEventListener('click', onLoadFileClick);
    } catch {}
    host.innerHTML = '';
  };
}
