# Templates de Componentes V8 - Borgonovi Dashboard

Este arquivo reúne os templates de componentes adaptados para o design system V8. Todos os exemplos estão em PT-BR e prontos para serem inseridos dentro de funções de montagem (mount) com os dados dinâmicos escapados via view/shared.js.

Observação rápida: cores e estilos utilizam as classes Tailwind/CSS vars do projeto (eg. bg-primary-container, text-on-surface, etc.). Componentes via data-attributes com delegação de eventos estão explicitamente destacados.

Acesse cada seção para copiar o template correspondente e adaptá-lo ao seu view/estado.

---

## ESTADOS DE COMPONENTES
- Conceito análogo ao V7, porém com classes atualizadas para o V8.
- Exemplos de estado ativo e inativo (ícones e cores podem mudar conforme tema):

```html
<!-- Ativo -->
<div class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700" title="Ativo" aria-label="Estado ativo">Ativo</div>

<!-- Inativo -->
<div class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700" title="Inativo" aria-label="Estado inativo">Inativo</div>
```

---

## NAV ITEM — Sidebar
- O V8 renderiza a barra lateral com `<a href="#" class="nav-item flex items-center gap-2 px-4 py-2 text-white rounded hover:bg-white/10 transition-colors" data-view="..." data-tooltip="..."></a>`.
- Leia as opções de NAV_ITEMS no branding.js e monte-as com `mountSidebar({ store })`.

```html
<!-- Inativo -->
<a href="#" class="nav-item flex items-center gap-2 px-4 py-2 text-white rounded hover:bg-white/10 transition-colors" data-view="dashboard" data-tooltip="Painel">Dashboard</a>

<!-- Ativo (exemplo: marcado como atual) -->
<a href="#" class="nav-item flex items-center gap-2 px-4 py-2 text-white bg-white/10 rounded hover:bg-white/8 transition-colors" data-view="dashboard" data-tooltip="Painel" aria-current="page">Dashboard</a>
```

> Dica: o read de NAV_ITEMS vem de branding.js, o que facilita manter o menu sincronizado com a configuração global.

---

## KPI HERO
- Padrão V8 vindo do kpi.js renderHero.
- Card com tilt e border-glow ativo apenas no HERO. Máx 1 por view.

```html
<div class="bg-primary-container border border-outline-variant rounded-xl shadow-sm card-tilt border-glow relative overflow-hidden h-full" role="region" aria-label="Total de Vendas" data-kpi="kpi-vendas">
  <div class="flex items-center justify-between mb-2">
    <span class="text-[0.6875rem] font-bold text-on-primary-container uppercase tracking-wider">Vendas</span>
    <span class="text-[0.6875rem] font-bold text-on-primary-container/70">Último Período</span>
  </div>
  <div class="flex items-end justify-between gap-3">
    <div>
      <span class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white block w-full truncate" data-animate-value data-target="123456" data-prefix="R$ " aria-label="Total de vendas">R$ 0</span>
      <span class="text-[0.6875rem] text-white/90 mt-1 inline-block">Milhares</span>
    </div>
    <div id="spark-vendas" class="w-28 h-10" role="img" aria-label="Sparkline"></div>
  </div>
</div>
```

---

## KPI STANDARD
- Padrão V8 do kpi.js renderStandard.

```html
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm card-lift density-pad h-full" role="region" aria-label="KPI" data-kpi="kpi-conversoes">
  <div class="flex items-center justify-between mb-2">
    <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">Conversões</span>
    <span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">insights</span>
  </div>
  <div class="flex items-end justify-between gap-2 flex-wrap">
    <span class="text-2xl font-extrabold text-primary tabular-nums shrink-0" data-animate-value data-target="75" data-suffix="%" aria-label="Taxa de conversão">0%</span>
    <span class="text-[0.6875rem] font-semibold text-on-surface-variant">Taxa mensal</span>
  </div>
</div>
```

---

## CHART CONTAINER
- Padrão V8 (overview.js) com título, fullscreen e container do gráfico.

```html
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm reveal relative" aria-label="Resumo gráfico">
  <div class="mb-2 flex items-center justify-between">
    <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">VOLUME</span>
    <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors z-10" data-fullscreen="chart-ids" data-title="Resumo de Volume" aria-label="Maximizar gráfico" title="Maximizar">
      <span class="material-symbols-outlined text-sm">fullscreen</span>
    </button>
  </div>
  <div id="chart-id" class="w-full h-[320px]" role="img" aria-label="Gráfico de exemplo"></div>
</div>
```

> Observação: fullscreen utiliza o atributo data-fullscreen delegado pelo main.js, não onclick inline.

---

## FILTER BAR
- Pattern V8 (renderFilterBar).

```html
<div class="col-span-12 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-4" aria-label="Filtros">
  <div class="flex flex-wrap items-center gap-3">
    <!-- Busca -->
    <div class="flex-1 min-w-[200px]">
      <input type="text" placeholder="Pesquisar..." class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-surface-tint" aria-label="Pesquisar">
    </div>
    <!-- Filtro dropdown -->
    <select class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" aria-label="Tipo">
      <option value="">Todos os tipos</option>
    </select>
    <!-- Dados de data -->
    <input type="date" class="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface" aria-label="Data inicial">
  </div>
  </div>
```

> Observação: nenhum botão de Aplicar; filtros disparam onChange/onInput conforme o padrão do V8.

---

## TABLE
- Tabela V8 com cabeçalhos ordenáveis, paginação, badges de status e linha de total.

```html
<div class="col-span-12 overflow-hidden rounded-xl border border-outline-variant shadow-sm" aria-label="Tabela de dados">
  <table class="min-w-full divide-y divide-outline-variant">
    <thead>
      <tr>
        <th class="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant cursor-pointer" data-sort="nome">Nome</th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant" data-sort="status">Status</th>
        <th class="px-6 py-3 text-left text-xs font-semibold text-on-surface-variant" data-sort="valor">Valor</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-outline-variant">
      <!-- Linhas geradas dinamicamente -->
      <tr>
        <td class="px-6 py-3">Exemplo A</td>
        <td class="px-6 py-3"><span class="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Ativo</span></td>
        <td class="px-6 py-3">R$ 1.234,56</td>
      </tr>
    </tbody>
  </table>
  <div class="flex items-center justify-between px-4 py-2 bg-surface-container-lowest">
    <span class="text-xs text-on-surface-variant">Mostrando 1 de 1</span>
    <nav class="text-xs">
      <button class="px-2 py-1 rounded">Anterior</button>
      <button class="px-2 py-1 rounded">Próximo</button>
    </nav>
  </div>
  <div class="bg-primary-container text-white p-2 text-xs" aria-label="Total">Total: 1 linha</div>
</div>
```

---

## DETAIL DRAWER
- Desenho de detalhamento expansível abaixo de uma linha da tabela.

```html
<tr class="detail-row">
  <td colspan="3" class="p-0">
    <div class="detail-drawer max-h-0 overflow-hidden transition-all duration-300" aria-label="Detalhes">
      Conteúdo detalhado aqui.
    </div>
  </td>
</tr>
```

---

## MODAL
- Padrão V8: `#modal-overlay` existente em index.html. Abrir via `openContentFullscreen(title, html)` no modal.js.

```html
<div id="modal-overlay" class="hidden" aria-hidden="true"></div>
<!-- Abertura via script: openContentFullscreen('Título', '<p>HTML do conteúdo</p>') -->
<button class="open-modal" data-fullscreen-title="Título" data-fullscreen-html="<p>Conteúdo do modal</p>">Abrir modal</button>
```

---

## TOAST
- Função global `showToast(message, type)` disponível; tipos: 'success', 'error', 'info'.

```js
showToast('Operação concluída com sucesso.', 'success');
```

---

## ALERT CARDS
- Cards de alerta com formato de erro/critico, etc.

```html
<div class="bg-surface-container-lowest rounded-xl border border-red-200 shadow-sm p-4 reveal" role="alert">
  <div class="flex items-center justify-between mb-2">
    <span class="text-xs font-bold text-error uppercase">Crítico</span>
    <span class="text-xs font-bold text-on-surface-variant">Agora</span>
  </div>
  <p class="text-sm font-semibold text-primary">Mensagem de erro detalhada aqui.</p>
</div>
```

---

## EMPTY STATE
- Estrutura pronta para estados sem dados.

```html
<div class="flex items-center gap-3 text-center mx-auto justify-center flex-col" style="max-width:420px">
  <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-2">
    <span class="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">inbox</span>
  </div>
  <div class="text-lg font-bold text-primary">Sem itens</div>
  <p class="text-sm text-on-surface-variant">Sua busca não retornou resultados.</p>
</div>
```

---

## STATUS BADGES (pills)
- Ícones simples com cores para o estado.

```html
<span class="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-xs font-bold bg-green-100 text-green-700">Ativo</span>
<span class="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-xs font-bold bg-amber-100 text-on-tertiary-container">Atenção</span>
<span class="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-xs font-bold bg-red-100 text-error">Crítico</span>
```

---

## TABS
- Padrão V8 com acessibilidade de role="tablist".

```html
<div class="flex border-b border-outline-variant" role="tablist">
  <button class="px-4 py-2 text-sm font-semibold text-primary border-b-2 border-surface-tint" role="tab" aria-selected="true">Aba 1</button>
  <button class="px-4 py-2 text-sm font-medium text-on-surface-variant" role="tab" aria-selected="false">Aba 2</button>
</div>
```

---

## REPORTS CARDS
- Cards de relatório com ícones, título e descrição.

```html
<div class="col-span-12 sm:col-span-6 lg:col-span-4 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm card-lift cursor-pointer reveal" role="button" tabindex="0" data-report="type-id">
  <div class="flex items-center gap-3 mb-3">
    <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center"><span class="material-symbols-outlined text-white">insights</span></div>
    <div><div class="text-sm font-bold text-primary">Título</div><div class="text-xs text-on-surface-variant">Subtítulo</div></div>
  </div>
  <p class="text-xs text-on-surface-variant">Descrição breve do relatório.</p>
</div>
```

---

## DROPZONE (Upload)
- Área de upload com estilo DnD.

```html
<div class="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-container-low cursor-pointer transition-colors" role="button" tabindex="0" aria-label="Arraste e solte">
  <div class="w-12 h-12 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-4">
    <span class="material-symbols-outlined text-2xl text-surface-tint">upload_file</span>
  </div>
  <p class="text-sm font-semibold text-primary mb-1">Arraste e solte o arquivo aqui</p>
  <p class="text-xs text-on-surface-variant mb-2">ou clique para selecionar</p>
</div>
```

---
