// Construtora Horizonte - Upload handling (Section 8)
// This file augments the existing Borg IIFE by assigning upload-related callbacks
// and provides the data schema, upload state, and reactive UI wiring.

var dataSchema = {
  description: 'Planilha de medição por torre/bloco',
  columns: {
    'torre': { label: 'Torre/Bloco', type: 'text', required: true },
    'previsto': { label: 'Avanço Previsto %', type: 'number', required: true },
    'realizado': { label: 'Avanço Realizado %', type: 'number', required: true },
    'orcado': { label: 'Custo Orçado', type: 'number', required: false },
    'executado': { label: 'Custo Executado', type: 'number', required: false },
    'responsavel': { label: 'Responsável', type: 'text', required: false }
  },
  defaultSheet: 0,
  headerRow: 0
};

var uploadState = {
  rawData: null,
  parsedData: null,
  fileName: '',
  sheetNames: [],
  activeSheet: 0,
  columnMapping: {},
  isLoaded: false,
  isCSV: false
};

// Utility: ensure elements exist
function ensureElements() {
  // Elements expected by the page: #dropzone, #upload-status, #filename, #upload-info, #file-input
  return document.getElementById('dropzone') && document.getElementById('upload-status');
}

// Visual helper: update dropzone/status area
function showDropzoneState(stateType) {
  var drop = document.getElementById('dropzone');
  var status = document.getElementById('upload-status');
  var info = document.getElementById('upload-info');
  if (!drop || !status || !info) return;
  if (stateType === 'default') {
    drop.style.display = '';
    status.style.display = 'none';
    info.textContent = '';
  } else if (stateType === 'processing') {
    drop.style.display = '';
    status.style.display = '';
    status.textContent = 'Processando arquivo...';
  } else if (stateType === 'success') {
    drop.style.display = 'none';
    status.style.display = '';
    var rows = 0;
    if (uploadState.parsedData && uploadState.parsedData.length) rows = uploadState.parsedData.length;
    info.textContent = 'Arquivo carregado: ' + (uploadState.fileName || '') + ' | registros: ' + rows;
  } else if (stateType === 'error') {
    drop.style.display = 'none';
    status.style.display = '';
    info.textContent = 'Erro no upload. Verifique o formato/arquivo.';
  }
}

function ensureToast(msg, type) {
  if (typeof Borg !== 'undefined' && Borg.showToast) Borg.showToast(msg, type || 'info');
}

// 1) CSV parsing helpers
function parseCSV(text) {
  var sep = detectCSVSeparator(text);
  var lines = text.split(/\r?\n/);
  var rows = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i] == null ? '' : lines[i];
    if (line === '' && i === lines.length - 1) continue;
    rows.push(parseCSVLine(line, sep));
  }
  return rows;
}
function detectCSVSeparator(text) {
  var lines = text.split(/\r?\n/);
  var first = '';
  for (var i = 0; i < lines.length; i++) {
    if (lines[i] && lines[i].trim() !== '') { first = lines[i]; break; }
  }
  var counts = { comma: 0, semicolon: 0, tab: 0 };
  for (var j = 0; j < first.length; j++) {
    var ch = first[j];
    if (ch === ',') counts.comma++;
    else if (ch === ';') counts.semicolon++;
    else if (ch === '\t') counts.tab++;
  }
  if (counts.semicolon > counts.comma && counts.semicolon >= counts.tab) return ';';
  if (counts.tab > counts.comma && counts.tab >= counts.semicolon) return '\t';
  return ',';
}
function parseCSVLine(line, separator) {
  var sep = separator;
  var out = [];
  var cur = '';
  var inQ = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') {
      if (inQ && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (ch === sep && !inQ) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

// 2) CSV/XLSX data access
function getActiveSheetData() {
  if (uploadState.isCSV) {
    return uploadState.rawData ? uploadState.rawData.slice(1) : [];
  }
  var sName = uploadState.sheetNames[uploadState.activeSheet];
  if (!uploadState.rawData || !uploadState.rawData[sName]) return [];
  return uploadState.rawData[sName].slice(1);
}
function getHeaderLineForActiveSheet() {
  if (uploadState.isCSV) {
    return uploadState.rawData && uploadState.rawData.length > 0 ? uploadState.rawData[0] : [];
  } else {
    var sName = uploadState.sheetNames[uploadState.activeSheet];
    if (!uploadState.rawData || !uploadState.rawData[sName]) return [];
    var rows = uploadState.rawData[sName];
    return rows.length > 0 ? rows[0] : [];
  }
}
function autoMapColumns() {
  uploadState.columnMapping = {};
  var headers = getHeaderLineForActiveSheet();
  var hl = headers.map(function(v){ return (v == null ? '' : String(v)).toLowerCase(); });
  for (var key in dataSchema.columns) {
    if (!dataSchema.columns.hasOwnProperty(key)) continue;
    var label = (dataSchema.columns[key].label || key).toLowerCase();
    for (var i = 0; i < hl.length; i++) {
      if (hl[i].indexOf(label) !== -1) {
        uploadState.columnMapping[key] = i;
        break;
      }
    }
  }
}
function validateData() {
  var errors = [];
  for (var key in dataSchema.columns) {
    if (!dataSchema.columns.hasOwnProperty(key)) continue;
    if (dataSchema.columns[key].required) {
      if (!(key in uploadState.columnMapping)) {
        errors.push('Faltando mapeamento para: ' + key);
      }
    }
  }
  // Optional: type checks against first few rows
  var data = extractData();
  if (data.length > 0) {
    for (var r = 0; r < data.length; r++) {
      var row = data[r];
      for (var fk in dataSchema.columns) {
        if (!dataSchema.columns.hasOwnProperty(fk)) continue;
        var t = dataSchema.columns[fk].type;
        var val = row[fk];
        if (t === 'number' && val != null && val !== '' && isNaN(Number(val))) {
          errors.push('Coluna ' + fk + ' deve ser numérica na linha ' + (r + 1));
        }
      }
    }
  }
  return { valid: errors.length === 0, errors: errors };
}
function extractData() {
  var out = [];
  var rows = getActiveSheetData();
  var map = uploadState.columnMapping;
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r] || [];
    var obj = {};
    for (var k in dataSchema.columns) {
      if (!dataSchema.columns.hasOwnProperty(k)) continue;
      var idx = map[k];
      var type = dataSchema.columns[k].type;
      var raw = (typeof row[idx] !== 'undefined') ? row[idx] : '';
      if (type === 'number') {
        var num = (raw === '' || raw == null) ? null : Number(raw);
        obj[k] = isNaN(num) ? null : num;
      } else {
        obj[k] = (raw == null) ? '' : String(raw);
      }
    }
    var empty = true; for (var kk in obj) { if (obj[kk] !== '' && obj[kk] !== null) { empty = false; break; } }
    if (!empty) out.push(obj);
  }
  return out;
}

function confirmDataLoad() {
  var v = validateData();
  if (!v.valid) {
    var msg = 'Dados inválidos: ' + (v.errors && v.errors.length ? v.errors.join('; ') : 'Erro de validação');
    if (typeof Borg !== 'undefined' && Borg.showToast) Borg.showToast(msg, 'error');
    return;
  }
  var data = extractData();
  uploadState.parsedData = data;
  var ev = document.createEvent('Event');
  ev.initEvent('borg:dataLoaded', true, true);
  ev.detail = { data: data, rowCount: data.length };
  document.dispatchEvent(ev);
  if (typeof Borg !== 'undefined' && Borg.showToast) Borg.showToast(data.length + ' registros carregados no dashboard', 'success');
}

function showDataPreview() {
  var isCSV = uploadState.isCSV;
  var headers = [];
  if (isCSV) {
    if (uploadState.rawData && uploadState.rawData.length > 0) headers = uploadState.rawData[0];
  } else {
    var sName = uploadState.sheetNames[uploadState.activeSheet];
    if (uploadState.rawData && uploadState.rawData[sName]) {
      var rows = uploadState.rawData[sName];
      if (rows.length > 0) headers = rows[0];
    }
  }
  var rowsData = [];
  if (isCSV) {
    if (uploadState.rawData && uploadState.rawData.length > 1) rowsData = uploadState.rawData.slice(1, 11);
  } else {
    var sN = uploadState.sheetNames[uploadState.activeSheet];
    var sheet = uploadState.rawData[sN] || [];
    if (sheet.length > 1) rowsData = sheet.slice(1, 11);
  }
  var html = '';
  html += '<div class="borg-preview">';
  html += '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;font-family:monospace;">';
  html += '<thead><tr>';
  for (var c = 0; c < headers.length; c++) {
    html += '<th>' + (headers[c] != null ? String(headers[c]) : '') + '</th>';
  }
  html += '</tr></thead><tbody>';
  for (var r = 0; r < rowsData.length; r++) {
    var row = rowsData[r] || [];
    html += '<tr>';
    for (var cc = 0; cc < headers.length; cc++) {
      html += '<td>' + (row[cc] != null ? String(row[cc]) : '') + '</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  html += '</div>';
  // Mapping UI inside modal
  html += '<div class="borg-mapping" style="margin-top:12px;">';
  html += '<h4>Mapeamento de colunas</h4>';
  html += '<table border="0" cellpadding="4" cellspacing="0">';
  for (var kk in dataSchema.columns) {
    if (!dataSchema.columns.hasOwnProperty(kk)) continue;
    var label = dataSchema.columns[kk].label || kk;
    html += '<tr><td>' + label + '</td>';
    html += '<td>';
    html += '<select onchange="Borg.updateColumnMapping(\'' + kk + '\', this.value)">';
    html += '<option value="-1">Selecione a coluna</option>';
    for (var ii = 0; ii < headers.length; ii++) {
      html += '<option value="' + ii + '" ' + (uploadState.columnMapping[kk] == ii ? 'selected' : '') + '>' + (headers[ii] || ('Col ' + (ii+1))) + '</option>';
    }
    html += '</select>';
    html += '</td></tr>';
  }
  html += '</table>';
  html += '</div>';
  if (typeof Borg !== 'undefined' && Borg.openModal) {
    Borg.openModal('Pré-visualização e mapeamento', html);
  } else {
    var modalBody = document.getElementById('modal-body');
    if (modalBody) modalBody.innerHTML = html;
  }
}

Borg.handleFileUpload = function(file) {
  try {
    var name = (file && file.name) ? String(file.name) : '';
    var ext = '';
    if (name.indexOf('.') !== -1) ext = name.substr(name.lastIndexOf('.') + 1).toLowerCase();
    var size = (file && file.size) ? file.size : 0;
    if (size > 10 * 1024 * 1024) {
      showDropzoneState('error');
      if (Borg && Borg.showToast) Borg.showToast('Tamanho do arquivo excede 10MB.', 'error');
      return;
    }
    if (!file || typeof file.name !== 'string') {
      showDropzoneState('error');
      return;
    }
    var allowed = ['xlsx','xls','csv','ods'];
    if (ext && allowed.indexOf(ext) === -1) {
      showDropzoneState('error');
      Borg.showToast('Extensão de arquivo não suportada. Use XLSX/XLS/CSV/ODS.', 'error');
      return;
    }
    uploadState.fileName = name;
    showDropzoneState('processing');
    var reader = new FileReader();
    var isCSV = (ext === 'csv');
    uploadState.isCSV = isCSV;
    if (isCSV) {
      reader.onload = function(e) {
        var text = e.target.result;
        var parsed = parseCSV(text);
        uploadState.rawData = parsed; // array of rows
        uploadState.sheetNames = ['Sheet1'];
        uploadState.activeSheet = 0;
        showDropzoneState('success');
        autoMapColumns();
        ensureToast('CSV carregado com sucesso.', 'success');
      };
      reader.onerror = function() {
        showDropzoneState('error');
        if (Borg && Borg.showToast) Borg.showToast('Falha ao ler CSV.', 'error');
      };
      reader.readAsText(file);
    } else {
      reader.onload = function(e) {
        var data = e.target.result;
        try {
          var arr = new Uint8Array(data);
          var wb = XLSX.read(arr, { type: 'array' });
          var sheets = wb.SheetNames || [];
          if (!sheets.length) {
            showDropzoneState('error');
            if (Borg && Borg.showToast) Borg.showToast('Planilha vazia.', 'error');
            return;
          }
          var first = sheets[0];
          var ws = wb.Sheets[first];
          var json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          uploadState.rawData = {};
          uploadState.sheetNames = sheets;
          uploadState.activeSheet = 0;
          uploadState.rawData[first] = json;
          showDropzoneState('success');
          autoMapColumns();
          ensureToast('XLSX carregado. Planilha: ' + first, 'success');
        } catch (err) {
          showDropzoneState('error');
          if (Borg && Borg.showToast) Borg.showToast('Erro ao ler planilha: ' + String(err), 'error');
        }
      };
      reader.onerror = function() {
        showDropzoneState('error');
        if (Borg && Borg.showToast) Borg.showToast('Falha ao ler arquivo.', 'error');
      };
      reader.readAsArrayBuffer(file);
    }
  } catch (e) {
    showDropzoneState('error');
    if (Borg && Borg.showToast) Borg.showToast('Erro durante o upload.', 'error');
  }
};

Borg.showDataPreview = function() {
  showDataPreview();
};

Borg.confirmDataLoad = function() {
  confirmDataLoad();
};

Borg.clearUpload = function() {
  uploadState.rawData = null;
  uploadState.parsedData = null;
  uploadState.fileName = '';
  uploadState.sheetNames = [];
  uploadState.activeSheet = 0;
  uploadState.columnMapping = {};
  uploadState.isLoaded = false;
  uploadState.isCSV = false;
  showDropzoneState('default');
  var fi = document.getElementById('file-input');
  if (fi) try { fi.value = ''; } catch (e) {}
  if (typeof Event === 'function') {
    var ev = document.createEvent('Event'); ev.initEvent('borg:dataCleared', true, true); document.dispatchEvent(ev);
  }
  if (Borg && Borg.showToast) Borg.showToast('Upload limpo', 'info');
};

Borg.downloadTemplate = function() {
  var headers = [];
  var keys = Object.keys(dataSchema.columns);
  for (var i = 0; i < keys.length; i++) headers.push(keys[i]);
  var headerLine = headers.join(',');
  var csv = headerLine + '\r\n';
  // empty row as template
  var empty = [];
  for (var i2 = 0; i2 < headers.length; i2++) empty.push('');
  csv += empty.join(',');
  var blob = new Blob([ '\uFEFF' + csv ], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'modelo_dados.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 10. Maps and sheet switch helpers
Borg.updateColumnMapping = function(fieldKey, colIndex) {
  var idx = parseInt(colIndex, 10);
  if (isNaN(idx) || idx < 0) {
    delete uploadState.columnMapping[fieldKey];
  } else {
    uploadState.columnMapping[fieldKey] = idx;
  }
};
Borg.switchSheet = function(index) {
  if (!uploadState.sheetNames || !uploadState.sheetNames.length) return;
  var idx = parseInt(index, 10);
  if (isNaN(idx) || idx < 0 || idx >= uploadState.sheetNames.length) return;
  uploadState.activeSheet = idx;
  autoMapColumns();
  if (Borg.showToast) Borg.showToast('Planilha selecionada: ' + uploadState.sheetNames[idx], 'info');
  if (typeof Borg.showDataPreview === 'function') Borg.showDataPreview();
};

Borg.initDragDrop = function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('file-input');
  function prevent(e){ e.preventDefault(); e.stopPropagation(); }
  if (dropzone) {
    dropzone.addEventListener('dragover', function(e){ prevent(e); dropzone.classList.add('dragover'); }, false);
    dropzone.addEventListener('dragleave', function(e){ prevent(e); dropzone.classList.remove('dragover'); }, false);
    dropzone.addEventListener('drop', function(e){ prevent(e); dropzone.classList.remove('dragover'); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) Borg.handleFileUpload(f); }, false);
  }
  if (fileInput) {
    fileInput.addEventListener('change', function(e){ var f = (e.target.files && e.target.files[0]) ? e.target.files[0] : null; if (f) Borg.handleFileUpload(f); }, false);
  }
  if (dropzone) dropzone.addEventListener('click', function(){ if (fileInput) fileInput.click(); }, false);
  document.addEventListener('keydown', function(e){ if (e.keyCode === 13 || e.keyCode === 32) { if (document.activeElement === dropzone && fileInput) fileInput.click(); } }, false);
};

// 11. Init and events
document.addEventListener('DOMContentLoaded', function(){ if (typeof Borg.initDragDrop === 'function') Borg.initDragDrop(); });
document.addEventListener('borg:dataLoaded', function(e){ var data = e.detail && e.detail.data; var rows = e.detail && e.detail.rowCount; if (typeof Borg !== 'undefined' && Borg.showToast) Borg.showToast('Carregado ' + rows + ' registros', 'success'); });
document.addEventListener('borg:dataCleared', function(){ if (typeof Borg !== 'undefined' && Borg.showToast) Borg.showToast('Upload limpo; dados de demonstração ativados', 'info'); });

// End of Section 8 — upload module
