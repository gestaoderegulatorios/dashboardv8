# 📂 BORGONOVI V7 — DATA UPLOAD

> Sistema de upload de planilhas (XLSX/CSV) para carregamento dinâmico de dados no dashboard.
> Dropzone visual, parser com validação, mapeamento de colunas, atualização reativa de
> KPIs/gráficos/tabelas e template de planilha para download.
> Consultar este arquivo quando o dashboard precisar aceitar dados externos via upload.

---

## FILOSOFIA

> O dashboard Borgonovi pode funcionar de DUAS formas:
> 1. **Dados hardcoded** — A IA gera o HTML com dados fixos no código
> 2. **Dados via upload** — O HTML tem dropzone e o usuário carrega a planilha
>
> Ambas são válidas. O upload é recomendado quando:
> - O usuário atualiza dados periodicamente (semanal, mensal)
> - Múltiplas pessoas usam o mesmo dashboard com dados diferentes
> - Os dados vêm de exportações de ERP/SAP/Excel

---

## STACK TÉCNICA

### CDN adicional (incluir no head APENAS quando dashboard tem upload)

```html
<!-- SheetJS para leitura de Excel (.xlsx) -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
Capacidades
Formato	Tecnologia	Suporte
.xlsx (Excel)	SheetJS (XLSX)	✅ Leitura completa, múltiplas abas
.xls (Excel legado)	SheetJS (XLSX)	✅ Leitura completa
.csv	Parser nativo JS	✅ Sem dependência externa
.ods (LibreOffice)	SheetJS (XLSX)	✅ Suportado
O que NÃO suporta
Limitação	Motivo
Fórmulas do Excel	SheetJS lê o valor calculado, não a fórmula
Macros VBA	Ignoradas (segurança)
Formatação visual	Apenas dados — cores/fontes do Excel são ignoradas
Arquivos protegidos por senha	SheetJS não suporta
Arquivos > 10MB	Performance no navegador degrada
COMPONENTE: DROPZONE DE UPLOAD
Variante A — Dropzone como seção no topo da view
HTML

<div id="upload-section" class="col-span-12">
    <div id="dropzone"
         class="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8
                flex flex-col items-center justify-center text-center
                hover:border-surface-tint hover:bg-surface-container-low
                transition-all duration-200 cursor-pointer min-h-[160px]"
         role="button"
         tabindex="0"
         aria-label="Área de upload de planilha. Clique ou arraste um arquivo."
         onclick="document.getElementById('file-input').click()">

        <!-- Ícone -->
        <div class="w-14 h-14 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-3xl text-surface-tint" aria-hidden="true">upload_file</span>
        </div>

        <!-- Texto principal -->
        <p class="text-sm font-semibold text-primary mb-1">
            Arraste sua planilha aqui ou clique para selecionar
        </p>

        <!-- Texto secundário -->
        <p class="text-xs text-on-surface-variant mb-4">
            Formatos aceitos: .xlsx, .xls, .csv — Máximo 10MB
        </p>

        <!-- Botão secundário -->
        <div class="flex gap-3">
            <button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium
                           hover:bg-[#3d4d6d] active:scale-95 transition-all min-h-[44px]
                           flex items-center gap-2"
                    onclick="event.stopPropagation(); document.getElementById('file-input').click()">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">folder_open</span>
                Selecionar arquivo
            </button>
            <button class="px-4 py-2 text-surface-tint border border-slate-200 rounded-lg text-sm font-medium
                           hover:bg-slate-50 active:scale-95 transition-all min-h-[44px]
                           flex items-center gap-2"
                    onclick="event.stopPropagation(); Borg.downloadTemplate()">
                <span class="material-symbols-outlined text-sm" aria-hidden="true">download</span>
                Baixar modelo
            </button>
        </div>

        <!-- Input hidden -->
        <input type="file" id="file-input" class="hidden"
               accept=".xlsx,.xls,.csv,.ods"
               onchange="Borg.handleFileUpload(this.files[0])">
    </div>

    <!-- Status do arquivo carregado (hidden por padrão, aparece após upload) -->
    <div id="upload-status" class="hidden mt-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-700" aria-hidden="true">check_circle</span>
                </div>
                <div>
                    <p class="text-sm font-semibold text-primary" id="upload-filename">arquivo.xlsx</p>
                    <p class="text-xs text-on-surface-variant" id="upload-info">15 linhas · 6 colunas · Aba: Plan1</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-slate-50
                               rounded-lg transition-colors border border-slate-200 min-h-[36px]
                               flex items-center gap-1"
                        onclick="Borg.showDataPreview()"
                        aria-label="Visualizar dados carregados">
                    <span class="material-symbols-outlined text-sm" aria-hidden="true">visibility</span>
                    Preview
                </button>
                <button class="px-3 py-1.5 text-xs font-medium text-error hover:bg-red-50
                               rounded-lg transition-colors min-h-[36px]
                               flex items-center gap-1"
                        onclick="Borg.clearUpload()"
                        aria-label="Remover arquivo carregado">
                    <span class="material-symbols-outlined text-sm" aria-hidden="true">close</span>
                    Remover
                </button>
            </div>
        </div>
    </div>
</div>
Variante B — Dropzone compacto dentro do topbar ou filter bar
HTML

<div class="flex items-center gap-2">
    <button class="px-3 py-2 text-surface-tint border border-slate-200 rounded-lg text-sm font-medium
                   hover:bg-slate-50 active:scale-95 transition-all min-h-[44px]
                   flex items-center gap-2"
            onclick="document.getElementById('file-input-compact').click()">
        <span class="material-symbols-outlined text-sm" aria-hidden="true">upload_file</span>
        <span id="compact-upload-label">Carregar planilha</span>
    </button>
    <input type="file" id="file-input-compact" class="hidden"
           accept=".xlsx,.xls,.csv,.ods"
           onchange="Borg.handleFileUpload(this.files[0])">
</div>
Estados do dropzone
HTML

<!-- Estado: DRAG OVER (arquivo sendo arrastado sobre) -->
<!-- Adicionar via JS: classes 'border-surface-tint bg-surface-container-low scale-[1.01]' -->

<!-- Estado: PROCESSANDO -->
<div class="flex flex-col items-center justify-center py-8">
    <div class="w-10 h-10 border-3 border-surface-tint border-t-transparent rounded-[9999px] animate-spin mb-4"></div>
    <p class="text-sm font-medium text-on-surface-variant">Processando planilha...</p>
</div>

<!-- Estado: ERRO -->
<div class="flex flex-col items-center justify-center py-8">
    <div class="w-14 h-14 bg-red-50 rounded-[9999px] flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-3xl text-error" aria-hidden="true">error_outline</span>
    </div>
    <p class="text-sm font-semibold text-error mb-1">Erro ao processar arquivo</p>
    <p class="text-xs text-on-surface-variant mb-4">[MENSAGEM DE ERRO ESPECÍFICA]</p>
    <button class="px-4 py-2 text-surface-tint text-sm font-medium hover:bg-slate-50
                   rounded-lg transition-colors" onclick="Borg.resetDropzone()">
        Tentar novamente
    </button>
</div>
COMPONENTE: DATA PREVIEW (modal com prévia dos dados)
HTML

<!-- Aberto via Borg.showDataPreview() no modal existente -->
<!-- Conteúdo inserido no #modal-body -->

<div>
    <!-- Seletor de aba (se múltiplas abas no Excel) -->
    <div class="flex gap-2 mb-4" id="sheet-selector">
        <!-- Populado via JS -->
    </div>

    <!-- Tabela de preview (primeiras 10 linhas) -->
    <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-left border-collapse" id="preview-table">
            <thead class="bg-surface-container-low">
                <!-- Headers populados via JS -->
            </thead>
            <tbody class="text-xs tabular-nums divide-y divide-slate-100">
                <!-- Primeiras 10 linhas populadas via JS -->
            </tbody>
        </table>
    </div>

    <!-- Info -->
    <div class="flex justify-between items-center mt-3 text-xs text-on-surface-variant">
        <span id="preview-info">Mostrando 10 de 150 linhas</span>
        <span id="preview-columns">Colunas detectadas: 6</span>
    </div>

    <!-- Mapeamento de colunas (se necessário) -->
    <div id="column-mapping" class="mt-4 pt-4 border-t border-slate-200">
        <h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3">Mapeamento de Colunas</h4>
        <div class="grid grid-cols-2 gap-3" id="mapping-grid">
            <!-- Populado via JS: cada campo esperado com select das colunas da planilha -->
        </div>
    </div>

    <!-- Botão confirmar -->
    <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
        <button class="px-4 py-2 text-on-surface-variant text-sm font-medium hover:bg-slate-50
                       rounded-lg transition-colors min-h-[44px]"
                onclick="Borg.closeModal()">
            Cancelar
        </button>
        <button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium
                       hover:bg-[#3d4d6d] active:scale-95 transition-all min-h-[44px]
                       flex items-center gap-2"
                onclick="Borg.confirmDataLoad()">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">check</span>
            Confirmar e carregar dados
        </button>
    </div>
</div>
COMPONENTE: MAPEAMENTO DE COLUNA (item individual)
HTML

<div class="flex items-center gap-2">
    <label class="text-xs font-medium text-on-surface-variant min-w-[120px]" for="map-[CAMPO]">
        [NOME DO CAMPO ESPERADO]
    </label>
    <select id="map-[CAMPO]"
            class="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs
                   focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20
                   bg-white cursor-pointer">
        <option value="">— Selecionar coluna —</option>
        <!-- Options populadas via JS com nomes das colunas da planilha -->
    </select>
    <span class="text-xs text-green-700 hidden" id="map-status-[CAMPO]">✓</span>
</div>
JAVASCRIPT DE UPLOAD (adicionar ao namespace Borg)
Este código deve ser adicionado DENTRO do namespace Borg existente na SKILL.md,
na seção de PUBLIC API e no corpo do IIFE.

JavaScript

// ========== DATA UPLOAD ==========

// Configuração da estrutura esperada da planilha
// CUSTOMIZAR POR DASHBOARD — este é o template
var dataSchema = {
    // Nome descritivo do que a planilha deve conter
    description: 'Planilha de dados do dashboard',

    // Colunas esperadas (chave interna → config)
    columns: {
        // Exemplo para dashboard de obra:
        // 'nome':     { label: 'Nome / Item',     type: 'text',    required: true  },
        // 'orcado':   { label: 'Valor Orçado',    type: 'number',  required: true  },
        // 'realizado':{ label: 'Valor Realizado',  type: 'number',  required: true  },
        // 'periodo':  { label: 'Período',          type: 'text',    required: false },
        // 'status':   { label: 'Status',           type: 'text',    required: false }
    },

    // Aba padrão (0 = primeira aba)
    defaultSheet: 0,

    // Linha onde começam os dados (0 = primeira linha é header)
    headerRow: 0
};

// Estado do upload
var uploadState = {
    rawData: null,          // Dados brutos da planilha
    parsedData: null,       // Dados parseados e validados
    fileName: '',
    sheetNames: [],
    activeSheet: 0,
    columnMapping: {},      // mapeamento coluna_planilha → campo_esperado
    isLoaded: false
};

// Handler principal de upload
function handleFileUpload(file) {
    if (!file) return;

    // Validar tamanho
    if (file.size > 10 * 1024 * 1024) {
        showToast('Arquivo muito grande. Máximo 10MB.', 'error');
        return;
    }

    // Validar extensão
    var validExts = ['.xlsx', '.xls', '.csv', '.ods'];
    var ext = '.' + file.name.split('.').pop().toLowerCase();
    if (validExts.indexOf(ext) === -1) {
        showToast('Formato não suportado. Use .xlsx, .xls, .csv ou .ods', 'error');
        return;
    }

    uploadState.fileName = file.name;
    showDropzoneState('processing');

    var reader = new FileReader();

    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);

            if (ext === '.csv') {
                // Parser CSV nativo
                var text = new TextDecoder('utf-8').decode(data);
                uploadState.rawData = parseCSV(text);
                uploadState.sheetNames = ['CSV'];
            } else {
                // Parser XLSX via SheetJS
                if (typeof XLSX === 'undefined') {
                    showToast('Biblioteca SheetJS não carregada. Verifique a conexão.', 'error');
                    showDropzoneState('error');
                    return;
                }
                var workbook = XLSX.read(data, { type: 'array' });
                uploadState.sheetNames = workbook.SheetNames;
                uploadState.rawData = {};

                workbook.SheetNames.forEach(function(name) {
                    uploadState.rawData[name] = XLSX.utils.sheet_to_json(
                        workbook.Sheets[name],
                        { header: 1, defval: '' }
                    );
                });
            }

            uploadState.activeSheet = 0;
            showDropzoneState('success');
            autoMapColumns();
            showToast('Planilha carregada: ' + file.name, 'success');

        } catch (error) {
            console.error('[Borg] Erro ao processar arquivo:', error);
            showToast('Erro ao processar arquivo. Verifique o formato.', 'error');
            showDropzoneState('error');
        }
    };

    reader.onerror = function() {
        showToast('Erro ao ler arquivo.', 'error');
        showDropzoneState('error');
    };

    reader.readAsArrayBuffer(file);
}

// Parser CSV nativo
function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function(line) { return line.trim() !== ''; });
    var separator = detectCSVSeparator(text);

    return lines.map(function(line) {
        return parseCSVLine(line, separator);
    });
}

function detectCSVSeparator(text) {
    var firstLine = text.split(/\r?\n/)[0];
    var semicolons = (firstLine.match(/;/g) || []).length;
    var commas = (firstLine.match(/,/g) || []).length;
    var tabs = (firstLine.match(/\t/g) || []).length;

    if (tabs > commas && tabs > semicolons) return '\t';
    if (semicolons > commas) return ';';
    return ',';
}

function parseCSVLine(line, separator) {
    var result = [];
    var current = '';
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Obter dados da aba ativa
function getActiveSheetData() {
    if (!uploadState.rawData) return [];
    if (Array.isArray(uploadState.rawData)) return uploadState.rawData; // CSV
    var sheetName = uploadState.sheetNames[uploadState.activeSheet];
    return uploadState.rawData[sheetName] || [];
}

// Auto-mapeamento de colunas
function autoMapColumns() {
    var sheetData = getActiveSheetData();
    if (sheetData.length === 0) return;

    var headers = sheetData[dataSchema.headerRow] || [];
    uploadState.columnMapping = {};

    Object.keys(dataSchema.columns).forEach(function(fieldKey) {
        var fieldConfig = dataSchema.columns[fieldKey];
        var label = fieldConfig.label.toLowerCase();

        // Tentar match exato ou parcial com headers da planilha
        headers.forEach(function(header, index) {
            var headerLower = String(header).toLowerCase().trim();
            if (headerLower === label ||
                headerLower.includes(label) ||
                label.includes(headerLower)) {
                uploadState.columnMapping[fieldKey] = index;
            }
        });
    });
}

// Validar dados contra schema
function validateData() {
    var sheetData = getActiveSheetData();
    if (sheetData.length <= 1) {
        return { valid: false, errors: ['Planilha vazia ou sem dados (apenas header)'] };
    }

    var errors = [];
    var dataRows = sheetData.slice(dataSchema.headerRow + 1);

    // Verificar colunas obrigatórias mapeadas
    Object.keys(dataSchema.columns).forEach(function(fieldKey) {
        var fieldConfig = dataSchema.columns[fieldKey];
        if (fieldConfig.required && uploadState.columnMapping[fieldKey] === undefined) {
            errors.push('Coluna obrigatória não mapeada: ' + fieldConfig.label);
        }
    });

    // Verificar tipos de dados
    if (errors.length === 0) {
        dataRows.forEach(function(row, rowIndex) {
            Object.keys(dataSchema.columns).forEach(function(fieldKey) {
                var colIndex = uploadState.columnMapping[fieldKey];
                if (colIndex === undefined) return;

                var value = row[colIndex];
                var fieldConfig = dataSchema.columns[fieldKey];

                if (fieldConfig.required && (value === '' || value === null || value === undefined)) {
                    errors.push('Linha ' + (rowIndex + 2) + ': campo "' + fieldConfig.label + '" vazio');
                }

                if (fieldConfig.type === 'number' && value !== '' && value !== null) {
                    var num = parseFloat(String(value).replace(/[R$%\s.]/g, '').replace(',', '.'));
                    if (isNaN(num)) {
                        errors.push('Linha ' + (rowIndex + 2) + ': "' + fieldConfig.label + '" não é número válido');
                    }
                }
            });
        });
    }

    return {
        valid: errors.length === 0,
        errors: errors.slice(0, 10) // Mostrar no máximo 10 erros
    };
}

// Extrair dados parseados e limpos
function extractData() {
    var sheetData = getActiveSheetData();
    var dataRows = sheetData.slice(dataSchema.headerRow + 1);

    return dataRows.map(function(row) {
        var item = {};
        Object.keys(dataSchema.columns).forEach(function(fieldKey) {
            var colIndex = uploadState.columnMapping[fieldKey];
            if (colIndex === undefined) { item[fieldKey] = null; return; }

            var value = row[colIndex];
            var fieldConfig = dataSchema.columns[fieldKey];

            if (fieldConfig.type === 'number') {
                var num = parseFloat(String(value).replace(/[R$%\s.]/g, '').replace(',', '.'));
                item[fieldKey] = isNaN(num) ? 0 : num;
            } else {
                item[fieldKey] = String(value || '').trim();
            }
        });
        return item;
    }).filter(function(item) {
        // Remover linhas completamente vazias
        return Object.values(item).some(function(v) {
            return v !== null && v !== '' && v !== 0;
        });
    });
}

// Confirmar carregamento de dados
function confirmDataLoad() {
    var validation = validateData();

    if (!validation.valid) {
        var errorMsg = 'Erros encontrados:\n' + validation.errors.join('\n');
        showToast('Dados inválidos. Verifique a planilha.', 'error');
        console.warn('[Borg] Validação falhou:', validation.errors);
        return;
    }

    uploadState.parsedData = extractData();
    uploadState.isLoaded = true;

    closeModal();
    showToast(uploadState.parsedData.length + ' registros carregados com sucesso', 'success');

    // Disparar evento para o dashboard reagir
    document.dispatchEvent(new CustomEvent('borg:dataLoaded', {
        detail: {
            data: uploadState.parsedData,
            fileName: uploadState.fileName,
            rowCount: uploadState.parsedData.length
        }
    }));
}

// Mostrar preview dos dados no modal
function showDataPreview() {
    var sheetData = getActiveSheetData();
    if (!sheetData || sheetData.length === 0) {
        showToast('Nenhum dado para visualizar', 'warning');
        return;
    }

    var headers = sheetData[dataSchema.headerRow] || [];
    var dataRows = sheetData.slice(dataSchema.headerRow + 1, dataSchema.headerRow + 11);
    var totalRows = sheetData.length - dataSchema.headerRow - 1;

    // Montar HTML do preview
    var html = '<div>';

    // Seletor de abas (se múltiplas)
    if (uploadState.sheetNames.length > 1) {
        html += '<div class="flex gap-2 mb-4">';
        uploadState.sheetNames.forEach(function(name, i) {
            var active = i === uploadState.activeSheet;
            html += '<button class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' +
                (active ? 'bg-surface-tint text-white' : 'text-on-surface-variant hover:bg-slate-50 border border-slate-200') +
                '" onclick="Borg.switchSheet(' + i + ')">' + name + '</button>';
        });
        html += '</div>';
    }

    // Tabela
    html += '<div class="overflow-x-auto border border-slate-200 rounded-lg"><table class="w-full text-left border-collapse">';
    html += '<thead class="bg-surface-container-low"><tr>';
    headers.forEach(function(h, i) {
        html += '<th class="px-3 py-2 text-[10px] font-bold text-outline uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">' +
            String(h || 'Col ' + (i + 1)) + '</th>';
    });
    html += '</tr></thead><tbody class="text-xs divide-y divide-slate-100">';

    dataRows.forEach(function(row) {
        html += '<tr class="hover:bg-slate-50">';
        headers.forEach(function(_, i) {
            html += '<td class="px-3 py-1.5 whitespace-nowrap">' + String(row[i] || '') + '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table></div>';

    // Info
    html += '<div class="flex justify-between items-center mt-3 text-xs text-on-surface-variant">' +
        '<span>Mostrando ' + Math.min(10, totalRows) + ' de ' + totalRows + ' linhas</span>' +
        '<span>' + headers.length + ' colunas detectadas</span></div>';

    // Mapeamento
    html += '<div class="mt-4 pt-4 border-t border-slate-200">' +
        '<h4 class="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">' +
        '<span class="material-symbols-outlined text-sm">sync_alt</span>Mapeamento de Colunas</h4>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">';

    Object.keys(dataSchema.columns).forEach(function(fieldKey) {
        var fieldConfig = dataSchema.columns[fieldKey];
        var mapped = uploadState.columnMapping[fieldKey];
        html += '<div class="flex items-center gap-2">' +
            '<label class="text-xs font-medium text-on-surface-variant min-w-[120px]">' +
            fieldConfig.label + (fieldConfig.required ? ' *' : '') + '</label>' +
            '<select class="flex-1 px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white cursor-pointer ' +
            'focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20" ' +
            'onchange="Borg.updateColumnMapping(\'' + fieldKey + '\', this.value)">' +
            '<option value="">— Selecionar —</option>';

        headers.forEach(function(h, i) {
            var selected = mapped === i ? ' selected' : '';
            html += '<option value="' + i + '"' + selected + '>' + String(h || 'Col ' + (i + 1)) + '</option>';
        });

        html += '</select></div>';
    });

    html += '</div></div>';

    // Botões
    html += '<div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">' +
        '<button class="px-4 py-2 text-on-surface-variant text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors min-h-[44px]" ' +
        'onclick="Borg.closeModal()">Cancelar</button>' +
        '<button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium hover:bg-[#3d4d6d] ' +
        'active:scale-95 transition-all min-h-[44px] flex items-center gap-2" ' +
        'onclick="Borg.confirmDataLoad()">' +
        '<span class="material-symbols-outlined text-sm">check</span>Confirmar e carregar</button></div>';

    html += '</div>';

    var modalTitle = document.getElementById('modal-title');
    var modalBody = document.getElementById('modal-body');
    if (modalTitle) modalTitle.textContent = 'Preview — ' + uploadState.fileName;
    if (modalBody) modalBody.innerHTML = html;
    openModal();
}

// Atualizar mapeamento de coluna
function updateColumnMapping(fieldKey, colIndex) {
    if (colIndex === '') {
        delete uploadState.columnMapping[fieldKey];
    } else {
        uploadState.columnMapping[fieldKey] = parseInt(colIndex);
    }
}

// Trocar aba ativa
function switchSheet(index) {
    uploadState.activeSheet = index;
    autoMapColumns();
    showDataPreview();
}

// Limpar upload
function clearUpload() {
    uploadState.rawData = null;
    uploadState.parsedData = null;
    uploadState.fileName = '';
    uploadState.sheetNames = [];
    uploadState.columnMapping = {};
    uploadState.isLoaded = false;

    showDropzoneState('default');

    var fileInput = document.getElementById('file-input') || document.getElementById('file-input-compact');
    if (fileInput) fileInput.value = '';

    document.dispatchEvent(new CustomEvent('borg:dataCleared'));
    showToast('Dados removidos', 'info');
}

// Controlar estados visuais do dropzone
function showDropzoneState(stateType) {
    var dropzone = document.getElementById('dropzone');
    var status = document.getElementById('upload-status');
    var compactLabel = document.getElementById('compact-upload-label');

    if (stateType === 'success') {
        if (dropzone) dropzone.classList.add('hidden');
        if (status) {
            status.classList.remove('hidden');
            var fnEl = document.getElementById('upload-filename');
            var infoEl = document.getElementById('upload-info');
            if (fnEl) fnEl.textContent = uploadState.fileName;

            var sheetData = getActiveSheetData();
            var rowCount = sheetData.length > 0 ? sheetData.length - 1 : 0;
            var colCount = sheetData.length > 0 ? (sheetData[0] || []).length : 0;
            var sheetName = uploadState.sheetNames[uploadState.activeSheet] || '';
            if (infoEl) infoEl.textContent = rowCount + ' linhas · ' + colCount + ' colunas · Aba: ' + sheetName;
        }
        if (compactLabel) compactLabel.textContent = uploadState.fileName;
    }

    if (stateType === 'default') {
        if (dropzone) dropzone.classList.remove('hidden');
        if (status) status.classList.add('hidden');
        if (compactLabel) compactLabel.textContent = 'Carregar planilha';
    }

    if (stateType === 'processing') {
        if (compactLabel) compactLabel.textContent = 'Processando...';
    }

    if (stateType === 'error') {
        if (compactLabel) compactLabel.textContent = 'Carregar planilha';
    }
}

// Gerar e baixar template CSV
function downloadTemplate() {
    var headers = [];
    var exampleRow = [];

    Object.keys(dataSchema.columns).forEach(function(key) {
        var col = dataSchema.columns[key];
        headers.push(col.label);
        if (col.type === 'number') exampleRow.push('0');
        else exampleRow.push('Exemplo');
    });

    var csv = '\uFEFF' + headers.join(';') + '\n' + exampleRow.join(';') + '\n';
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo_dados.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Modelo de planilha baixado', 'success');
}

// Drag and drop handlers
function initDragDrop() {
    var dropzone = document.getElementById('dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover'].forEach(function(evt) {
        dropzone.addEventListener(evt, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('border-surface-tint', 'bg-surface-container-low', 'scale-[1.01]');
        });
    });

    ['dragleave', 'drop'].forEach(function(evt) {
        dropzone.addEventListener(evt, function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('border-surface-tint', 'bg-surface-container-low', 'scale-[1.01]');
        });
    });

    dropzone.addEventListener('drop', function(e) {
        var files = e.dataTransfer.files;
        if (files.length > 0) handleFileUpload(files[0]);
    });

    // Keyboard: Enter/Space abre file picker
    dropzone.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-input').click();
        }
    });
}
ATUALIZAÇÃO REATIVA DO DASHBOARD
Quando os dados são carregados via upload, o dashboard deve reagir automaticamente.

Pattern de atualização
JavaScript

// No código específico do dashboard, ouvir o evento:
document.addEventListener('borg:dataLoaded', function(e) {
    var data = e.detail.data;       // Array de objetos com os campos mapeados
    var rowCount = e.detail.rowCount;

    // 1. Atualizar KPIs
    updateKPIs(data);

    // 2. Atualizar gráficos
    updateCharts(data);

    // 3. Atualizar tabelas
    updateTables(data);
});

// Quando dados são removidos:
document.addEventListener('borg:dataCleared', function() {
    // Voltar para dados placeholder ou empty state
    resetToPlaceholder();
});

// ===== Exemplo de implementação =====

function updateKPIs(data) {
    // Calcular totais
    var totalOrcado = data.reduce(function(sum, row) { return sum + (row.orcado || 0); }, 0);
    var totalRealizado = data.reduce(function(sum, row) { return sum + (row.realizado || 0); }, 0);
    var avanco = totalOrcado > 0 ? (totalRealizado / totalOrcado * 100) : 0;

    // Atualizar elementos no DOM
    var kpiTotal = document.querySelector('[data-kpi="total-orcado"]');
    if (kpiTotal) {
        kpiTotal.dataset.target = totalOrcado;
        kpiTotal.dataset.animated = '';
        Borg.animateValue(kpiTotal, totalOrcado);
    }

    // ... repetir para outros KPIs
}

function updateCharts(data) {
    // Preparar dados para o gráfico
    var categories = data.map(function(row) { return row.nome; });
    var values = data.map(function(row) { return row.realizado; });

    // Destruir e recriar chart com novos dados
    Borg.createChart('chart-barras', {
        chart: { type: 'bar', height: 280 },
        series: [{ name: 'Realizado', data: values }],
        xaxis: { categories: categories }
    });
}

function updateTables(data) {
    var tbody = document.querySelector('#table-principal tbody');
    if (!tbody) return;

    // Limpar linhas existentes (exceto total)
    var totalRow = tbody.querySelector('.table-total-row');
    tbody.innerHTML = '';

    // Inserir novas linhas
    data.forEach(function(row, i) {
        var tr = document.createElement('tr');
        tr.className = (i % 2 === 0 ? '' : 'bg-slate-50/50') + ' hover:bg-slate-50 transition-colors';
        tr.innerHTML =
            '<td class="px-6 py-3 font-medium text-primary">' + (row.nome || '') + '</td>' +
            '<td class="px-6 py-3 text-right tabular-nums">' + Borg.formatBRL(row.orcado) + '</td>' +
            '<td class="px-6 py-3 text-right tabular-nums">' + Borg.formatBRL(row.realizado) + '</td>';
        tbody.appendChild(tr);
    });

    // Re-calcular e adicionar total
    if (totalRow) {
        // Atualizar valores do total
        tbody.appendChild(totalRow);
    }

    // Re-inicializar paginação
    if (Borg.state.tables['table-principal']) {
        Borg.state.tables['table-principal'].currentPage = 1;
        Borg.initPagination('table-principal', 10);
    }
}
ESTRUTURA DA PLANILHA (documentação para o usuário)
Cada dashboard deve documentar a estrutura de planilha esperada.
A IA deve gerar esta documentação como comentário HTML ou como um
bloco informativo visível no dropzone.

Exemplo de documentação
HTML

<!-- No dropzone ou como tooltip/info: -->
<div class="text-xs text-on-surface-variant mt-3">
    <p class="font-bold mb-1">Estrutura esperada da planilha:</p>
    <table class="w-full text-left">
        <tr><td class="pr-4 font-medium">Coluna A:</td><td>Nome / Item (texto)</td></tr>
        <tr><td class="pr-4 font-medium">Coluna B:</td><td>Valor Orçado (número)</td></tr>
        <tr><td class="pr-4 font-medium">Coluna C:</td><td>Valor Realizado (número)</td></tr>
        <tr><td class="pr-4 font-medium">Coluna D:</td><td>Período (texto, opcional)</td></tr>
        <tr><td class="pr-4 font-medium">Coluna E:</td><td>Status (texto, opcional)</td></tr>
    </table>
</div>
Como a IA deve configurar o dataSchema
JavaScript

// A IA DEVE customizar o dataSchema para cada dashboard.
// Exemplo para dashboard de medição de obra:

var dataSchema = {
    description: 'Planilha de medição por torre/bloco',
    columns: {
        'torre':      { label: 'Torre/Bloco',      type: 'text',   required: true  },
        'previsto':   { label: 'Avanço Previsto %', type: 'number', required: true  },
        'realizado':  { label: 'Avanço Realizado %',type: 'number', required: true  },
        'orcado':     { label: 'Custo Orçado',      type: 'number', required: false },
        'executado':  { label: 'Custo Executado',   type: 'number', required: false },
        'responsavel':{ label: 'Responsável',       type: 'text',   required: false }
    },
    defaultSheet: 0,
    headerRow: 0
};
PERGUNTAS ADICIONAIS PARA UPLOAD
Quando o dashboard precisar de upload, perguntar ao usuário:

#	Pergunta
1	A planilha já existe ou precisa definir a estrutura?
2	Quais colunas a planilha tem? (nome, tipo de dado)
3	Quais colunas são obrigatórias?
4	A planilha tem múltiplas abas? Se sim, qual usar?
5	A primeira linha é header?
6	Os números usam vírgula ou ponto como decimal?
7	O upload substitui dados existentes ou adiciona?
REGRAS DO UPLOAD
FIXO
SheetJS via CDN para .xlsx/.xls/.ods
Parser CSV nativo (sem dependência)
Validação de tamanho (máx 10MB) e formato
Dropzone com drag-and-drop e estados visuais
Preview com primeiras 10 linhas antes de confirmar
Mapeamento de colunas (auto + manual)
Evento borg:dataLoaded para atualização reativa
Template CSV para download
Feedback via toast em todas as ações
LIVRE
Estrutura da planilha (dataSchema) por dashboard
Posição do dropzone (seção ou topbar)
Variante do dropzone (A: grande ou B: compacto)
Quais KPIs/gráficos/tabelas atualizam
Lógica de cálculo dos KPIs
Se o upload é obrigatório ou opcional
PROIBIDO
Proibido	Motivo
html2pdf.js, jsPDF	Fora do escopo (usar reports.md para PDF)
Upload sem validação	Dados inválidos quebram o dashboard
Upload sem preview	Usuário deve confirmar antes de aplicar
Upload sem feedback (toast)	Usuário precisa saber o que aconteceu
Aceitar arquivos > 10MB	Performance do navegador
Aceitar formatos não-planilha	Segurança e UX
Processar sem mapeamento de colunas	Colunas podem ter nomes diferentes
CHECKLIST DO UPLOAD (12 ITENS)
#	Item
1	CDN do SheetJS incluído no head?
2	Dropzone com role="button" + tabindex="0" + aria-label?
3	Input file com accept=".xlsx,.xls,.csv,.ods"?
4	Validação de tamanho (10MB) e formato antes de processar?
5	Drag-and-drop funcional com feedback visual?
6	Preview com primeiras 10 linhas antes de confirmar?
7	Mapeamento de colunas (auto + ajuste manual)?
8	Validação de dados (required, type) antes de aplicar?
9	Evento borg:dataLoaded disparado ao confirmar?
10	Botão "Baixar modelo" gerando CSV template?
11	Botão "Remover" limpando dados e voltando ao dropzone?
12	Toast de feedback em upload, erro, remoção e confirmação?
QUALQUER item NÃO atendido deve ser CORRIGIDO antes de entregar.