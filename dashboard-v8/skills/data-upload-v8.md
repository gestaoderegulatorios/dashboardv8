# Data upload - Borgonovi Dashboard V8

Este documento descreve o fluxo de upload de dados para o Borgonovi Dashboard V8, adaptado do V7 para a arquitetura V8.

## FILOSOFIA (mesmo que V7)
O dashboard pode funcionar em DOIS modos:
- Dados fixos — IA gera mock.js com dados fixos
- Modo upload — dashboard tem dropzone e o usuário carrega uma planilha

## STACK TÉCNICA V8
- SheetJS via npm (não CDN) — dependência opcional
- Análise de CSV: JavaScript nativo (sem dependência)
- Visão de upload V8: src/view/upload.js (217 linhas)
- Dropzone com drag-and-drop + input de arquivo
- Tipos de arquivo aceitos: .csv, .xlsx, .xls, .ods

## DROPZONE COMPONENT (V8 pattern)
From upload.js:
```html
<div class="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-container-low cursor-pointer transition-colors" role="button" tabindex="0" aria-label="Área de upload">
  <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-4">
    <span class="material-symbols-outlined text-2xl text-surface-tint">upload_file</span>
  </div>
  <p class="text-sm font-semibold text-primary mb-1">Arraste e solte o arquivo aqui</p>
  <p class="text-xs text-on-surface-variant mb-2">ou clique para selecionar</p>
  <div class="flex gap-3 mt-2">
    <button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium hover:bg-surface-tint-hover transition-colors">Selecionar arquivo</button>
    <button class="px-4 py-2 text-surface-tint border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors">Baixar modelo</button>
  </div>
  <input type="file" class="hidden" accept=".csv,.xlsx,.xls,.ods">
</div>
```

## DATA SCHEMA (V8)
Expected spreadsheet columns (from upload.js template):
| Coluna | Tipo | Obrigatório |
|---|---|---|
| Torre/Bloco | Texto | Sim |
| Avanço Previsto % | Número | Sim |
| Avanço Realizado % | Número | Sim |
| Custo Orçado | Número | Opcional |
| Custo Executado | Número | Opcional |
| Responsável | Texto | Opcional |

Para outras verticais, adapte UPLOAD_SCHEMA em content.js.

## UPLOAD STATUS UI (V8)
Após o arquivo ser carregado:
```html
<div class="col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm p-5">
  <span class="text-xs font-bold text-on-surface-variant uppercase">Arquivo:</span>
  <span class="text-sm font-medium text-primary">filename.xlsx</span>
  <button>Visualizar dados</button>
  <button>Remover</button>
  <button>Confirmar carregamento</button>
</div>
```

## EMPTY STATE (V8)
```html
<div class="flex items-center gap-3 text-center mx-auto justify-center flex-col">
  <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center">
    <span class="material-symbols-outlined text-3xl text-on-surface-variant">cloud_upload</span>
  </div>
  <div class="text-lg font-bold text-primary">Nenhum dado importado</div>
  <p class="text-sm text-on-surface-variant">Insira uma planilha para começar</p>
</div>
```

## EVENT HANDLING (V8 pattern)
V8 upload.js usa addEventListener (NÃO inline onclick):
- dragover → realçar a dropzone
- dragleave → remover realce
- drop → processar arquivo
- change do input de arquivo → processar arquivo
- Teclado: Enter/Space na dropzone aciona o input de arquivo

## INTEGRAÇÃO COM STORE
Após upload com sucesso:
```javascript
store.set((s) => ({ data: { ...s.data, obras: parsedData } }));
```
Isso dispara os subscribers → KPIs, gráficos e tabelas são re-renderizados automaticamente.

## CHECKLIST DE UPLOAD
- [ ] Dropzone com drag-and-drop funcional
- [ ] Aceita .csv, .xlsx, .xls, .ods
- [ ] Input de arquivo oculto, acionado pelo botão/dropzone
- [ ] Status mostra o nome do arquivo carregado
- [ ] Botão Visualizar dados
- [ ] Botão Remover (limpa upload)
- [ ] Botão Confirmar carregamento
- [ ] Estado vazio quando não houver dados
- [ ] Botão Baixar modelo (CSV template)
- [ ] Acessível por teclado (Enter/Space na dropzone)
- [ ] aria-label em todos os elementos interativos
- [ ] Notificações tipo toast para feedback

## NOTAS IMPORTANTES
- NÃO copie o conteúdo de data_upload.md do V7 palavra por palavra
- NÃO faça referência a CDN para SheetJS (V8 usa npm)
- NÃO use manipuladores inline onclick
- Não exceda cerca de 200 linhas
- Não escreva em Inglês

## CONTEXTO
- Visão de upload V8: src/view/upload.js (217 linhas)
- Fluxo de dados via store (store.set → subscribers). 
