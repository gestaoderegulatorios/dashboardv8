
# 📦 BORGONOVI V7 — COMPONENTES

> Todos os templates HTML de componentes do design system.
> Consultar este arquivo ao montar views do dashboard.

---

## ESTADOS DE COMPONENTES (Referência universal)

> Todo componente interativo DEVE implementar os estados aplicáveis:

| Estado | Classes padrão | Quando usar |
|--------|----------------|-------------|
| **Default** | (estilos base) | Estado normal |
| **Hover** | `hover:bg-slate-50` ou `hover:bg-[#162A4E]` | Mouse sobre |
| **Active** | `active:scale-95` | Clicando |
| **Focus** | via `focus-visible` global | Teclado |
| **Disabled** | `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none` | Indisponível |
| **Loading** | Skeleton shimmer | Carregando |
| **Error** | `border-error text-error` + mensagem | Falha |
| **Empty** | Empty state component | Sem dados |

---

## NAV ITEM — Sidebar

> **LEI 1**: Todo nav-item DEVE ter `data-tooltip="Nome da View"` para tooltip ao colapsar.
> **LEI 2**: O nome da construtora/empreendimento no sidebar NUNCA usa `whitespace-nowrap` — usar `break-words`.

```html
<!-- ATIVO -->
<a class="nav-item flex items-center gap-5 px-5 py-3 text-white
border-l-2 border-surface-tint bg-[#162A4E]
active:scale-95 duration-150 transition-all cursor-pointer
min-h-[44px]"
data-view="[VIEW_ID]"
data-tooltip="[LABEL]"
role="button"
tabindex="0"
aria-current="page">
<span class="material-symbols-outlined text-[24px] flex-shrink-0" aria-hidden="true">[ICONE]</span>
<span class="nav-text">[LABEL]</span>
</a>

<!-- INATIVO -->
<a class="nav-item flex items-center gap-5 px-5 py-3 text-on-primary-container
hover:text-white hover:bg-[#162A4E]
active:scale-95 duration-150 transition-all cursor-pointer
min-h-[44px]"
data-view="[VIEW_ID]"
data-tooltip="[LABEL]"
role="button"
tabindex="0">
<span class="material-symbols-outlined text-[24px] flex-shrink-0" aria-hidden="true">[ICONE]</span>
<span class="nav-text">[LABEL]</span>
</a>
```

### Sidebar Tooltip CSS (obrigatório quando colapsado)

```css
.sidebar-collapsed .nav-item { position: relative; }
.sidebar-collapsed .nav-item:hover::after {
content: attr(data-tooltip);
position: absolute; left: calc(100% + 8px); top: 50%;
transform: translateY(-50%);
background: #1e293b; color: #f8fafc;
font-size: 12px; font-weight: 500;
padding: 4px 10px; border-radius: 6px;
white-space: nowrap; z-index: 999;
box-shadow: 0 4px 12px rgba(0,0,0,0.25);
pointer-events: none;
animation: tooltipFadeIn 150ms ease-out;
}
@keyframes tooltipFadeIn {
from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
to { opacity: 1; transform: translateY(-50%) translateX(0); }
}
```

### Separador de grupo na sidebar

```html
<div class="mx-5 my-3 border-t border-[#162A4E]"></div>
<div class="px-5 mb-2">
    <span class="nav-text text-[9px] font-bold text-on-primary-container/50 uppercase tracking-widest">
        [GRUPO]
    </span>
</div>
```

---

## KPI CARDS

### Variante A — Com ícone

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm
            col-span-12 sm:col-span-6 lg:col-span-3">
    <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
        [LABEL]
    </span>
    <div class="flex items-end justify-between">
        <span class="text-2xl font-extrabold tracking-tight text-primary"
              data-animate-value data-target="[NUMERO]" data-prefix="[R$ ]" data-suffix="[M]">
            [VALOR]
        </span>
        <span class="material-symbols-outlined text-slate-300" aria-hidden="true">[ICONE]</span>
    </div>
</div>
```

### Variante B — Com info secundária

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm
            col-span-12 sm:col-span-6 lg:col-span-3">
    <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
        [LABEL]
    </span>
    <div class="flex items-end justify-between">
        <span class="text-2xl font-extrabold tracking-tight text-primary"
              data-animate-value data-target="[NUMERO]" data-prefix="" data-suffix="">
            [VALOR]
        </span>
        <div class="text-right">
            <span class="text-[0.6875rem] font-bold text-surface-tint">[INFO]</span>
            <p class="text-[0.625rem] text-on-surface-variant leading-none">[DESC]</p>
        </div>
    </div>
</div>
```

### Variante C — Com progress ring

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm
            col-span-12 sm:col-span-6 lg:col-span-3">
    <div>
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
            [LABEL]
        </span>
        <span class="text-2xl font-extrabold tracking-tight text-primary"
              data-animate-value data-target="[NUMERO]" data-suffix="%">
            [VALOR]%
        </span>
    </div>
    <div class="relative w-12 h-12" role="img" aria-label="Progresso: [VALOR]%">
        <svg class="w-full h-full" viewBox="0 0 36 36">
            <path class="text-surface-container stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke-width="3"/>
            <path class="text-surface-tint stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke-dasharray="[VALOR], 100"
                  stroke-linecap="round" stroke-width="3"/>
        </svg>
    </div>
</div>
```

### Variante D — Metric Comparison (com variação temporal)

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm
            col-span-12 sm:col-span-6 lg:col-span-3">
    <div class="flex justify-between items-start mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
            [LABEL]
        </span>
        <!-- Variação positiva -->
        <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-[9999px]">
            <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_up</span>
            +12.3%
        </span>
        <!-- OU variação negativa -->
        <!--
        <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-error bg-red-50 px-1.5 py-0.5 rounded-[9999px]">
            <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_down</span>
            -5.1%
        </span>
        -->
        <!-- OU variação neutra -->
        <!--
        <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-on-surface-variant bg-slate-100 px-1.5 py-0.5 rounded-[9999px]">
            <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_flat</span>
            0%
        </span>
        -->
    </div>
    <div class="flex items-end justify-between">
        <div>
            <span class="text-2xl font-extrabold tracking-tight text-primary"
                  data-animate-value data-target="[NUMERO]" data-prefix="R$ " data-suffix="M">
                [VALOR]
            </span>
            <p class="text-[0.625rem] text-on-surface-variant leading-none mt-1">vs [PERÍODO ANTERIOR]</p>
        </div>
        <!-- Sparkline container (ver charts.md para config) -->
        <div id="spark-[ID]" class="w-20 h-8"></div>
    </div>
</div>
```

### KPI HERO (Von Restorff — destaque para dado mais importante)

```html
<div class="bg-primary-container p-6 rounded-xl shadow-sm col-span-12 sm:col-span-6 relative overflow-hidden flex flex-col justify-between">
    <div class="relative z-10 w-full">
        <div class="flex justify-between items-start mb-3">
            <span class="text-[0.6875rem] font-bold text-on-primary-container uppercase tracking-wider">
                [LABEL PRINCIPAL]
            </span>
            <span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-300 bg-white/10 px-2 py-0.5 rounded-[9999px] flex-shrink-0">
                <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_up</span>
                +[X]%
            </span>
        </div>
        <div class="flex items-end justify-between gap-4">
            <div class="min-w-0 flex-1"> <!-- min-w-0 essencial para o truncate funcionar no flex -->
                <span class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white truncate block w-full"
                      data-animate-value data-target="[NUMERO]" data-prefix="[PREFIX]" data-suffix="[SUFFIX]"
                      title="[VALOR COMPLETO EX: R$ 1.250.000]">
                    [VALOR ABREVIADO EX: R$ 1.2M]
                </span>
                <p class="text-[0.6875rem] text-on-primary-container mt-2 truncate">[DESCRIÇÃO CONTEXTUAL]</p>
            </div>
            <div id="spark-hero-[ID]" class="w-24 h-10 opacity-60 flex-shrink-0"></div>
        </div>
    </div>
    <div class="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-[9999px]"></div>
</div>
```

---

## FILTER BAR

> **LEI 7**: É PROIBIDO botão "Aplicar" ou "Limpar" em barras de filtro. TODO filtro DEVE ser automático (onChange, onInput). Use `Borg.autoFilter()`.
> **LEI 9**: TODO filtro de data DEVE usar `<input type="date">` — É PROIBIDO `<select>` para períodos.

```html
<div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant col-span-12">
<div class="flex flex-wrap gap-3 items-center">
<!-- Search — auto-filter on input -->
<input type="search" id="filter-search"
aria-label="Pesquisar"
placeholder="Pesquisar…"
class="flex-1 min-w-[180px] px-3 py-2 rounded-lg border border-outline-variant
bg-surface-container-lowest text-sm
focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20 transition-colors"
oninput="Borg.autoFilter()">

<!-- Date range — calendar picker, NOT select -->
<div class="flex items-center gap-2">
<label for="filter-date-start" class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">De:</label>
<input type="date" id="filter-date-start" aria-label="Data início"
class="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm"
onchange="Borg.autoFilter()">
<label for="filter-date-end" class="text-xs font-semibold text-on-surface-variant whitespace-nowrap">Até:</label>
<input type="date" id="filter-date-end" aria-label="Data fim"
class="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm"
onchange="Borg.autoFilter()">
</div>

<!-- Category — auto-filter on change -->
<select id="filter-category" aria-label="Categoria"
class="px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm"
onchange="Borg.autoFilter()">
<option>Todas</option>
<option>Categoria A</option>
<option>Categoria B</option>
</select>
</div>

<!-- Chips de filtros ativos -->
<div id="active-filters" class="hidden flex-wrap gap-2 mt-3" aria-label="Filtros ativos"></div>
</div>
```

### Chip de filtro ativo (inserido via JS)

```html
<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-sm text-on-surface-variant rounded-[9999px] border border-slate-200">
    [FILTRO]: [VALOR]
    <button class="ml-1 hover:text-error transition-colors"
            onclick="Borg.removeFilter('[KEY]')" aria-label="Remover filtro [FILTRO]">
        <span class="material-symbols-outlined text-xs">close</span>
    </button>
</span>
```

---

## SEÇÃO COM HEADER (container padrão)

```html
<section class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-12 lg:col-span-[X]">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-[0.875rem] font-bold text-primary uppercase tracking-tight flex items-center gap-2">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">[ICONE]</span>
            [TITULO]
        </h2>
        <span class="text-[0.6875rem] text-on-surface-variant uppercase font-medium">[INFO]</span>
    </div>
    <!-- Conteúdo -->
</section>
```

---

## TABS

```html
<div class="bg-white rounded-xl border border-slate-200 shadow-sm col-span-12 overflow-hidden">
    <!-- Tab Header -->
    <div class="flex border-b border-slate-200" role="tablist" aria-label="[DESCRIÇÃO]">
        <button class="tab-btn px-6 py-3 text-sm font-semibold text-primary border-b-2 border-surface-tint
                       min-h-[44px] transition-colors"
                role="tab" aria-selected="true" aria-controls="tab-panel-1" id="tab-1"
                onclick="Borg.switchTab(this, 'tab-panel-1')">
            [TAB 1]
        </button>
        <button class="tab-btn px-6 py-3 text-sm font-medium text-on-surface-variant border-b-2 border-transparent
                       hover:text-primary hover:bg-slate-50 min-h-[44px] transition-colors"
                role="tab" aria-selected="false" aria-controls="tab-panel-2" id="tab-2"
                onclick="Borg.switchTab(this, 'tab-panel-2')">
            [TAB 2]
        </button>
        <button class="tab-btn px-6 py-3 text-sm font-medium text-on-surface-variant border-b-2 border-transparent
                       hover:text-primary hover:bg-slate-50 min-h-[44px] transition-colors"
                role="tab" aria-selected="false" aria-controls="tab-panel-3" id="tab-3"
                onclick="Borg.switchTab(this, 'tab-panel-3')">
            [TAB 3]
        </button>
    </div>
    <!-- Panels -->
    <div id="tab-panel-1" class="p-6" role="tabpanel" aria-labelledby="tab-1">
        <!-- Conteúdo tab 1 -->
    </div>
    <div id="tab-panel-2" class="p-6 hidden" role="tabpanel" aria-labelledby="tab-2">
        <!-- Conteúdo tab 2 -->
    </div>
    <div id="tab-panel-3" class="p-6 hidden" role="tabpanel" aria-labelledby="tab-3">
        <!-- Conteúdo tab 3 -->
    </div>
</div>
```

---

## SUB-CARD (torre, fase, categoria)

```html
<div class="p-4 bg-surface-container-low rounded-lg
            hover:border-surface-tint border border-transparent
            transition-all cursor-pointer shadow-sm active:scale-95 min-h-[44px]"
     onclick="[ACAO]" role="button" tabindex="0">
    <div class="flex justify-between items-start mb-2">
        <span class="text-[0.6875rem] font-bold text-on-surface-variant">[NOME]</span>
        <span class="text-[0.6875rem] font-extrabold text-primary">[%]</span>
    </div>
    <div class="h-1 w-full bg-surface-container-highest rounded-[9999px] mb-3 overflow-hidden"
         role="progressbar" aria-valuenow="[VALOR]" aria-valuemin="0" aria-valuemax="100"
         aria-label="Progresso [NOME]">
        <div class="h-full bg-surface-tint transition-all duration-500" style="width: [VALOR]%"></div>
    </div>
    <div class="flex justify-between text-[10px] tabular-nums font-medium text-on-surface-variant">
        <span>[ESQ]</span>
        <span>[DIR]</span>
    </div>
</div>
```

---

## DETAIL DRAWER (expansível com focus trap)

```html
<div id="[DRAWER_ID]"
     class="detail-drawer bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden col-span-12"
     role="region" aria-label="Detalhes de [ITEM]">
    <div class="p-6">
        <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-2xl" aria-hidden="true">[ICONE]</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-primary" data-field="title">[TITULO]</h3>
                    <p class="text-xs text-on-surface-variant" data-field="subtitle">[SUB]</p>
                </div>
            </div>
            <button class="p-2 hover:bg-slate-100 rounded-[9999px] transition-colors
                           min-w-[44px] min-h-[44px] flex items-center justify-center"
                    onclick="Borg.closeDrawer('[DRAWER_ID]')" aria-label="Fechar detalhes">
                <span class="material-symbols-outlined text-slate-400">close</span>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Conteúdo do drawer -->
        </div>
    </div>
</div>
```

---

## TABELA PRINCIPAL (sort + busca + paginação + export)

```html
<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden col-span-12">
    <!-- Header com ações -->
    <div class="px-6 py-4 border-b border-surface-container flex flex-wrap justify-between items-center gap-3">
        <h2 class="text-[0.875rem] font-bold text-primary uppercase tracking-tight">[TITULO]</h2>
        <div class="flex items-center gap-3">
            <!-- Busca -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" aria-hidden="true">search</span>
                <input type="text"
                       class="pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48
                              focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20
                              placeholder:text-slate-400 transition-all"
                       placeholder="Filtrar tabela..."
                       oninput="Borg.filterTable('[TABLE_ID]', this.value)"
                       aria-label="Filtrar dados da tabela">
            </div>
            <!-- Export CSV -->
            <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-slate-50 rounded-lg transition-colors
                           min-w-[36px] min-h-[36px] flex items-center justify-center"
                    onclick="Borg.exportCSV('[TABLE_ID]', '[FILENAME]')"
                    aria-label="Exportar como CSV" title="Exportar CSV">
                <span class="material-symbols-outlined text-lg">download</span>
            </button>
            <!-- Fullscreen -->
            <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-slate-50 rounded-lg transition-colors
                           min-w-[36px] min-h-[36px] flex items-center justify-center"
                    onclick="Borg.openTableFullscreen('[TABLE_ID]')"
                    aria-label="Ver em tela cheia" title="Tela cheia">
                <span class="material-symbols-outlined text-lg">fullscreen</span>
            </button>
        </div>
    </div>

    <!-- Tabela -->
    <div class="overflow-x-auto">
        <table id="[TABLE_ID]" class="w-full text-left border-collapse" aria-label="[DESCRIÇÃO]">
            <caption class="sr-only">[DESCRIÇÃO ACESSÍVEL]</caption>
            <thead class="sticky top-0 z-10">
                <tr class="bg-surface-container-low">
                    <th class="px-6 py-3 text-[0.6875rem] font-bold text-outline uppercase tracking-wider
                              cursor-pointer hover:text-primary transition-colors select-none min-w-[44px]"
                        onclick="Borg.sortTable('[TABLE_ID]', 0)"
                        aria-sort="none" scope="col">
                        [COL]
                        <span class="material-symbols-outlined text-[14px] align-middle ml-1 opacity-40 sort-icon" aria-hidden="true">swap_vert</span>
                    </th>
                    <!-- Repetir para cada coluna -->
                </tr>
            </thead>
            <tbody class="text-sm tabular-nums divide-y divide-surface-container/30">
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-medium text-primary">[NOME]</td>
                    <td class="px-6 py-3 text-right">[VALOR]</td>
                </tr>
                <tr class="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-3 font-medium text-primary">[NOME]</td>
                    <td class="px-6 py-3 text-right">[VALOR]</td>
                </tr>
                <!-- Total (sempre último, sticky) -->
                <tr class="table-total-row bg-primary-container text-white font-bold sticky bottom-0">
                    <td class="px-6 py-4 uppercase text-xs tracking-widest">TOTAL</td>
                    <td class="px-6 py-4 text-right">[VALOR]</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Paginação -->
    <div class="px-6 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
        <span class="text-xs text-on-surface-variant" id="[TABLE_ID]-pagination-info">1-10 de 45 registros</span>
        <div class="flex items-center gap-1">
            <button class="p-1.5 rounded-lg hover:bg-slate-200 transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed
                           min-w-[36px] min-h-[36px] flex items-center justify-center"
                    onclick="Borg.paginateTable('[TABLE_ID]', 'prev')"
                    aria-label="Página anterior" disabled>
                <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span class="text-xs font-medium text-primary px-2" id="[TABLE_ID]-page-indicator">1 / 5</span>
            <button class="p-1.5 rounded-lg hover:bg-slate-200 transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed
                           min-w-[36px] min-h-[36px] flex items-center justify-center"
                    onclick="Borg.paginateTable('[TABLE_ID]', 'next')"
                    aria-label="Próxima página">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
        </div>
    </div>
</div>
```

---

## TABELA COM ROW EXPAND (Master-Detail)

```html
<!-- Linha expansível -->
<tr class="hover:bg-slate-50 transition-colors cursor-pointer"
    onclick="Borg.toggleRowExpand(this, 'row-detail-[ID]')"
    role="button" tabindex="0" aria-expanded="false">
    <td class="px-6 py-3 w-8">
        <span class="material-symbols-outlined text-on-surface-variant text-lg expand-icon transition-transform duration-200" aria-hidden="true">chevron_right</span>
    </td>
    <td class="px-6 py-3 font-medium text-primary">[NOME]</td>
    <td class="px-6 py-3 text-right tabular-nums">[VALOR]</td>
</tr>
<!-- Detalhe (hidden por padrão) -->
<tr id="row-detail-[ID]" class="hidden bg-surface-container-low">
    <td colspan="3" class="px-6 py-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sub-item 1</span>
                <p class="text-sm font-medium text-primary mt-1">[VALOR]</p>
            </div>
            <div>
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sub-item 2</span>
                <p class="text-sm font-medium text-primary mt-1">[VALOR]</p>
            </div>
            <div>
                <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sub-item 3</span>
                <p class="text-sm font-medium text-primary mt-1">[VALOR]</p>
            </div>
        </div>
    </td>
</tr>
```

---

## TABELA COM BULK ACTIONS

```html
<!-- No thead: checkbox master -->
<th class="px-6 py-3 w-10">
    <input type="checkbox"
           class="rounded border-slate-300 text-surface-tint focus:ring-surface-tint/20"
           onchange="Borg.toggleAllRows('[TABLE_ID]', this.checked)"
           aria-label="Selecionar todos">
</th>

<!-- No tbody: checkbox por linha -->
<td class="px-6 py-3 w-10">
    <input type="checkbox"
           class="row-check rounded border-slate-300 text-surface-tint focus:ring-surface-tint/20"
           onchange="Borg.updateBulkActions('[TABLE_ID]')"
           aria-label="Selecionar [NOME]">
</td>

<!-- Barra de ações (após tabela, antes de paginação) -->
<div id="[TABLE_ID]-bulk-bar"
     class="hidden px-6 py-3 bg-surface-container-low border-t border-slate-200 flex items-center justify-between">
    <span class="text-xs font-medium text-on-surface-variant">
        <span id="[TABLE_ID]-selected-count">0</span> selecionados
    </span>
    <div class="flex gap-2">
        <button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-slate-100 rounded-lg transition-colors"
                onclick="Borg.exportSelectedCSV('[TABLE_ID]')">
            Exportar selecionados
        </button>
    </div>
</div>
```

---

## GRÁFICO APEXCHARTS (container com ações)

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-12 lg:col-span-[X]">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
            [TITULO]
        </h3>
        <button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-slate-50 rounded-lg transition-colors
                       min-w-[32px] min-h-[32px] flex items-center justify-center"
                onclick="Borg.openChartFullscreen('chart-[ID]', '[TITULO]')"
                aria-label="Ver gráfico em tela cheia" title="Tela cheia">
            <span class="material-symbols-outlined text-sm">fullscreen</span>
        </button>
    </div>
    <div id="chart-[ID]" class="w-full"
         role="img" aria-label="Gráfico: [DESCRIÇÃO DO QUE MOSTRA]"></div>
    <!-- Summary footer (opcional) -->
    <div class="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
        <div class="text-center">
            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Total</span>
            <span class="text-sm font-extrabold text-primary">[VALOR]</span>
        </div>
        <div class="text-center">
            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Média</span>
            <span class="text-sm font-extrabold text-primary">[VALOR]</span>
        </div>
        <div class="text-center">
            <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Meta</span>
            <span class="text-sm font-extrabold text-green-700">[VALOR]</span>
        </div>
    </div>
</div>
```

---

## PROGRESS BAR SIMPLES (CSS puro)

```html
<div>
    <div class="flex justify-between text-[10px] mb-1">
        <span class="text-on-surface-variant">[LABEL]</span>
        <span class="font-bold">[VALOR]%</span>
    </div>
    <div class="h-1.5 w-full bg-slate-100 rounded-[9999px] overflow-hidden"
         role="progressbar" aria-valuenow="[VALOR]" aria-valuemin="0" aria-valuemax="100"
         aria-label="[LABEL]">
        <div class="h-full bg-surface-tint rounded-[9999px] transition-all duration-500"
             style="width: [VALOR]%"></div>
    </div>
</div>
```

---

## COLUNA DE ALERTAS

```html
<aside class="col-span-12 lg:col-span-2 space-y-4" aria-label="Alertas e notificações">
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 class="text-[0.75rem] font-bold text-primary uppercase tracking-tight flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-error" aria-hidden="true">warning</span>
                Alertas
            </h2>
            <span class="px-2 py-0.5 bg-error text-white text-[10px] font-bold rounded-[9999px]">[N]</span>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar"
             role="log" aria-label="Lista de alertas">
            <!-- Alerta cards -->
        </div>
    </div>
</aside>
```

### Alerta Card — Crítico

```html
<div class="p-3 bg-red-50 border-l-4 border-error rounded-r-lg" role="alert">
    <div class="flex justify-between items-start mb-1">
        <span class="text-[10px] font-bold text-error uppercase">[CATEG]</span>
        <span class="text-[9px] text-slate-400 font-medium">[HORA]</span>
    </div>
    <p class="text-[11px] font-semibold text-primary mb-1">[TITULO]</p>
    <div class="flex justify-between items-center">
        <span class="text-[10px] font-bold text-error">[VALOR]</span>
        <span class="material-symbols-outlined text-sm text-error" aria-hidden="true">error</span>
    </div>
</div>
```

### Alerta Card — Atenção

```html
<div class="p-3 bg-amber-50 border-l-4 border-on-tertiary-container rounded-r-lg" role="alert">
    <div class="flex justify-between items-start mb-1">
        <span class="text-[10px] font-bold text-on-tertiary-container uppercase">[CATEG]</span>
        <span class="text-[9px] text-slate-400 font-medium">[HORA]</span>
    </div>
    <p class="text-[11px] font-semibold text-primary mb-1">[TITULO]</p>
    <div class="flex justify-between items-center">
        <span class="text-[10px] font-bold text-on-tertiary-container">[VALOR]</span>
        <span class="material-symbols-outlined text-sm text-on-tertiary-container" aria-hidden="true">warning</span>
    </div>
</div>
```

### Alerta Card — Info

```html
<div class="p-3 bg-slate-50 border-l-4 border-surface-tint rounded-r-lg">
    <div class="flex justify-between items-start mb-1">
        <span class="text-[10px] font-bold text-surface-tint uppercase">[CATEG]</span>
        <span class="text-[9px] text-slate-400 font-medium">[HORA]</span>
    </div>
    <p class="text-[11px] font-semibold text-primary mb-1">[TITULO]</p>
    <div class="flex justify-between items-center">
        <span class="text-[10px] font-bold text-surface-tint">[VALOR]</span>
        <span class="material-symbols-outlined text-sm text-surface-tint" aria-hidden="true">info</span>
    </div>
</div>
```

---

## BADGES

### Badge de Status

```html
<!-- Positivo -->
<span class="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-[9999px] uppercase">Em Dia</span>

<!-- Atenção -->
<span class="px-2 py-1 bg-amber-50 text-on-tertiary-container text-[10px] font-bold rounded-[9999px] uppercase">Atenção</span>

<!-- Crítico -->
<span class="px-2 py-1 bg-red-50 text-error text-[10px] font-bold rounded-[9999px] uppercase">Atrasado</span>

<!-- Neutro -->
<span class="px-2 py-1 bg-slate-100 text-on-surface-variant text-[10px] font-bold rounded-[9999px] uppercase">Pendente</span>
```

### Badge de Variação Temporal

```html
<!-- Positivo -->
<span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-[9999px]">
    <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_up</span>+[X]%
</span>

<!-- Negativo -->
<span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-error bg-red-50 px-1.5 py-0.5 rounded-[9999px]">
    <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_down</span>-[X]%
</span>

<!-- Neutro -->
<span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-on-surface-variant bg-slate-100 px-1.5 py-0.5 rounded-[9999px]">
    <span class="material-symbols-outlined text-xs" aria-hidden="true">trending_flat</span>0%
</span>
```

---

## BOTÃO VER TODOS

```html
<button class="w-full py-3 text-[10px] font-bold text-surface-tint
               hover:bg-slate-50 rounded-lg transition-colors
               flex items-center justify-center gap-1
               uppercase tracking-widest mt-4 min-h-[44px]">
    Ver todos
    <span class="material-symbols-outlined text-xs" aria-hidden="true">arrow_forward</span>
</button>
```

---

## TOOLTIP INFORMATIVO (para KPIs)

```html
<div class="relative group">
    <!-- KPI card normal aqui -->
    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <!-- conteúdo do KPI -->
        <button class="absolute top-3 right-3 p-1 text-slate-300 hover:text-on-surface-variant transition-colors"
                aria-label="Informações sobre [LABEL]">
            <span class="material-symbols-outlined text-sm">info</span>
        </button>
    </div>
    <!-- Tooltip -->
    <div class="absolute top-full right-0 mt-1 w-64 p-3 bg-white rounded-lg shadow-lg border border-slate-200
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 z-20 pointer-events-none">
        <p class="text-[11px] font-semibold text-primary mb-1">[NOME DA MÉTRICA]</p>
        <p class="text-[11px] text-on-surface-variant leading-relaxed mb-2">[DEFINIÇÃO]</p>
        <p class="text-[10px] text-slate-400"><strong>Fórmula:</strong> [CÁLCULO]</p>
        <p class="text-[10px] text-slate-400"><strong>Fonte:</strong> [ORIGEM DO DADO]</p>
    </div>
</div>
```

---

## EMPTY STATE

```html
<div class="flex flex-col items-center justify-center py-16 text-center col-span-12">
    <div class="w-16 h-16 bg-surface-container-low rounded-[9999px] flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">inbox</span>
    </div>
    <h3 class="text-lg font-bold text-primary mb-2">Nenhum dado encontrado</h3>
    <p class="text-sm text-on-surface-variant max-w-xs mb-6">
        Não há registros para o filtro selecionado. Tente ajustar os critérios de busca.
    </p>
    <button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium
                   hover:bg-[#3d4d6d] active:scale-95 transition-all min-h-[44px]"
            onclick="Borg.clearFilters()">
        Limpar filtros
    </button>
</div>
```

---

## LOADING SKELETONS

### Skeleton KPI

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-12 sm:col-span-6 lg:col-span-3">
    <div class="h-3 w-24 bg-slate-200 rounded animate-shimmer mb-3"></div>
    <div class="flex items-end justify-between">
        <div class="h-8 w-28 bg-slate-200 rounded animate-shimmer"></div>
        <div class="h-6 w-6 bg-slate-200 rounded animate-shimmer"></div>
    </div>
</div>
```

### Skeleton Gráfico

```html
<div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-12 lg:col-span-6">
    <div class="h-3 w-32 bg-slate-200 rounded animate-shimmer mb-4"></div>
    <div class="h-[280px] bg-slate-100 rounded-lg animate-shimmer flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-slate-300" aria-hidden="true">bar_chart</span>
    </div>
</div>
```

### Skeleton Tabela

```html
<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden col-span-12">
    <div class="px-6 py-4 border-b border-surface-container">
        <div class="h-4 w-40 bg-slate-200 rounded animate-shimmer"></div>
    </div>
    <div class="divide-y divide-slate-100">
        <div class="px-6 py-3 flex gap-6">
            <div class="h-4 w-1/4 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
        </div>
        <div class="px-6 py-3 flex gap-6">
            <div class="h-4 w-1/4 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
        </div>
        <div class="px-6 py-3 flex gap-6">
            <div class="h-4 w-1/4 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
        </div>
        <div class="px-6 py-3 flex gap-6">
            <div class="h-4 w-1/4 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
        </div>
        <div class="px-6 py-3 flex gap-6">
            <div class="h-4 w-1/4 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
            <div class="h-4 w-1/6 bg-slate-200 rounded animate-shimmer"></div>
        </div>
    </div>
</div>
```

---

## ERROR STATE (para gráficos)

```html
<div class="flex flex-col items-center justify-center h-[280px] text-center">
    <span class="material-symbols-outlined text-4xl text-error mb-2" aria-hidden="true">error_outline</span>
    <p class="text-sm font-medium text-on-surface-variant mb-3">Erro ao carregar gráfico</p>
    <button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            onclick="Borg.retryChart('[CHART_ID]')">
        Tentar novamente
    </button>
</div>
```

---

## FORMULÁRIOS

### Input Text

```html
<div>
    <label for="[ID]" class="text-xs font-medium text-on-surface-variant mb-1 block">[LABEL]</label>
    <input type="text" id="[ID]"
           class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
                  focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20
                  disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50
                  placeholder:text-slate-400 transition-all"
           placeholder="[PLACEHOLDER]">
    <p class="hidden text-[10px] text-error mt-1 flex items-center gap-1">
        <span class="material-symbols-outlined text-xs" aria-hidden="true">error</span>
        [MENSAGEM DE ERRO]
    </p>
</div>
```

### Select

```html
<div>
    <label for="[ID]" class="text-xs font-medium text-on-surface-variant mb-1 block">[LABEL]</label>
    <select id="[ID]"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm
                   focus:border-surface-tint focus:ring-2 focus:ring-surface-tint/20
                   disabled:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50
                   bg-white cursor-pointer transition-all">
        <option value="">[PLACEHOLDER]</option>
        <option value="[VALOR]">[LABEL]</option>
    </select>
</div>
```

### Toggle Switch

```html
<label class="inline-flex items-center gap-3 cursor-pointer">
    <input type="checkbox" class="sr-only peer" id="[ID]">
    <div class="relative w-9 h-5 bg-slate-200 rounded-[9999px] peer
                peer-checked:bg-surface-tint peer-focus-visible:ring-2 peer-focus-visible:ring-surface-tint/20
                after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                after:bg-white after:rounded-[9999px] after:h-4 after:w-4
                after:transition-all peer-checked:after:translate-x-full
                transition-colors"></div>
    <span class="text-sm font-medium text-on-surface-variant">[LABEL]</span>
</label>
```

### Checkbox

```html
<label class="inline-flex items-center gap-2 cursor-pointer">
    <input type="checkbox"
           class="rounded border-slate-300 text-surface-tint
                  focus:ring-surface-tint/20 disabled:opacity-50"
           id="[ID]">
    <span class="text-sm text-on-surface-variant">[LABEL]</span>
</label>
```

### Radio

```html
<label class="inline-flex items-center gap-2 cursor-pointer">
    <input type="radio" name="[GROUP]" value="[VALOR]"
           class="border-slate-300 text-surface-tint
                  focus:ring-surface-tint/20 disabled:opacity-50"
           id="[ID]">
    <span class="text-sm text-on-surface-variant">[LABEL]</span>
</label>
```

### Botão Primário

```html
<button class="px-4 py-2 bg-surface-tint text-white rounded-lg text-sm font-medium
               hover:bg-[#3d4d6d] active:scale-95 transition-all
               disabled:opacity-50 disabled:cursor-not-allowed
               min-h-[44px] flex items-center gap-2">
    <span class="material-symbols-outlined text-sm" aria-hidden="true">[ICONE]</span>
    [LABEL]
</button>
```

### Botão Secundário

```html
<button class="px-4 py-2 text-surface-tint border border-slate-200 rounded-lg text-sm font-medium
               hover:bg-slate-50 active:scale-95 transition-all
               disabled:opacity-50 disabled:cursor-not-allowed
               min-h-[44px] flex items-center gap-2">
    <span class="material-symbols-outlined text-sm" aria-hidden="true">[ICONE]</span>
    [LABEL]
</button>
```

### Botão Ghost

```html
<button class="px-4 py-2 text-surface-tint rounded-lg text-sm font-medium
               hover:bg-slate-50 active:scale-95 transition-colors
               disabled:opacity-50 disabled:cursor-not-allowed
               min-h-[44px]">
    [LABEL]
</button>
```
```

---
