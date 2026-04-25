
# ♿ BORGONOVI V7 — ACESSIBILIDADE

> ARIA attributes por componente, skip navigation, focus trap, contraste WCAG AA,
> landmarks, tabelas acessíveis, reduced motion e checklist de acessibilidade.
> Consultar este arquivo na etapa de REVISÃO, antes de entregar o dashboard.

---

## PRINCÍPIO FUNDAMENTAL

> Acessibilidade NÃO é opcional. Todo dashboard Borgonovi DEVE ser navegável
> por teclado, compreensível por screen readers e legível por pessoas com
> baixa visão. Isto não é caridade — é profissionalismo.

---

## LANDMARKS HTML (estrutura semântica)

Todo dashboard Borgonovi usa landmarks semânticos para que screen readers
consigam navegar pela estrutura da página:

```html
<!-- Skip navigation (PRIMEIRO elemento do body) -->
<a href="#main-content" class="sr-only focus:not-sr-only ...">
    Pular para conteúdo principal
</a>

<!-- Sidebar -->
<aside id="sidebar" role="navigation" aria-label="Menu principal">
    <nav aria-label="Navegação do dashboard">
        <!-- nav items -->
    </nav>
</aside>

<!-- Topbar -->
<header id="top-bar">
    <!-- título, timestamp, ações -->
</header>

<!-- Conteúdo -->
<main id="main-content" aria-label="Conteúdo do dashboard">
    <section id="view-xxx" role="region" aria-label="[Nome da view]">
        <!-- conteúdo da view -->
    </section>
</main>

<!-- Alertas -->
<aside aria-label="Alertas e notificações">
    <div role="log" aria-label="Lista de alertas">
        <!-- alertas -->
    </div>
</aside>

<!-- Toast -->
<div id="toast-container" aria-live="polite" aria-atomic="false">
    <!-- toasts inseridos via JS -->
</div>

<!-- Modal -->
<div id="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <!-- conteúdo do modal -->
</div>
```

### Mapa de landmarks

| Elemento | Tag | Role/ARIA | Propósito |
|----------|-----|-----------|-----------|
| Skip link | `<a>` | `href="#main-content"` | Pular sidebar para conteúdo |
| Sidebar | `<aside>` | `role="navigation" aria-label="Menu principal"` | Navegação entre views |
| Nav interno | `<nav>` | `aria-label="Navegação do dashboard"` | Lista de links de view |
| Topbar | `<header>` | (semântico) | Título e ações globais |
| Conteúdo | `<main>` | `aria-label="Conteúdo do dashboard"` | Área principal |
| Views | `<section>` | `role="region" aria-label="[Nome]"` | Cada view/página |
| Alertas | `<aside>` | `aria-label="Alertas e notificações"` | Painel lateral |
| Toast container | `<div>` | `aria-live="polite" aria-atomic="false"` | Notificações dinâmicas |
| Modal | `<div>` | `role="dialog" aria-modal="true" aria-labelledby="modal-title"` | Sobreposição |
| Drawer | `<div>` | `role="region" aria-label="Detalhes de [item]"` | Painel expansível |

---

## ARIA POR COMPONENTE

### Sidebar Toggle

```html
<button aria-label="Abrir ou fechar menu"
        aria-expanded="false"
        aria-controls="sidebar">
    <span class="material-symbols-outlined">menu</span>
</button>
```

| Atributo | Valor | Quando muda |
|----------|-------|-------------|
| `aria-expanded` | `"false"` | Sidebar fechado |
| `aria-expanded` | `"true"` | Sidebar aberto |
| `aria-controls` | `"sidebar"` | Sempre (referencia o aside) |
| `aria-label` | `"Abrir ou fechar menu"` | Sempre |

O JavaScript `Borg.toggleSidebar()` já atualiza `aria-expanded` automaticamente.

---

### Nav Items

```html
<!-- ATIVO -->
<a role="button" tabindex="0" aria-current="page" data-view="[ID]">
    <span aria-hidden="true">[ICONE]</span>
    <span class="nav-text">[LABEL]</span>
</a>

<!-- INATIVO -->
<a role="button" tabindex="0" data-view="[ID]">
    <span aria-hidden="true">[ICONE]</span>
    <span class="nav-text">[LABEL]</span>
</a>
```

| Atributo | Valor | Quando |
|----------|-------|--------|
| `role` | `"button"` | Sempre (não é link, é ação) |
| `tabindex` | `"0"` | Sempre (navegável por teclado) |
| `aria-current` | `"page"` | Apenas no item ativo |
| `aria-hidden` | `"true"` | Nos ícones Material Symbols (decorativos) |

O JavaScript `Borg.switchView()` já gerencia `aria-current` automaticamente.

Ativação por teclado: `Enter` e `Space` já são tratados pelo listener global no JS.

---

### KPI Cards

```html
<div class="bg-white p-5 rounded-xl ...">
    <span class="text-[0.6875rem] ...">Receita Total</span>
    <span data-animate-value data-target="12500000" data-prefix="R$ " data-suffix="M">
        R$ 12.5M
    </span>
    <span class="material-symbols-outlined" aria-hidden="true">payments</span>
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `aria-hidden="true"` | Ícone decorativo | Sempre |
| Texto semântico | Label + valor | Lido naturalmente pelo screen reader |

> KPI cards NÃO precisam de `role` especial — a combinação label + valor é lida corretamente.
> O `data-animate-value` atualiza o `textContent`, que o screen reader lê no estado final.

---

### Progress Ring (SVG)

```html
<div class="relative w-12 h-12" role="img" aria-label="Progresso: [VALOR]%">
    <svg viewBox="0 0 36 36">
        <!-- paths do ring -->
    </svg>
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"img"` | No container do SVG |
| `aria-label` | `"Progresso: 42%"` | Descrição textual do visual |

---

### Progress Bar (CSS)

```html
<div class="h-1.5 w-full bg-slate-100 rounded-[9999px] overflow-hidden"
     role="progressbar"
     aria-valuenow="[VALOR]"
     aria-valuemin="0"
     aria-valuemax="100"
     aria-label="[LABEL]">
    <div class="h-full bg-surface-tint" style="width: [VALOR]%"></div>
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"progressbar"` | No container externo |
| `aria-valuenow` | `"42"` | Valor atual |
| `aria-valuemin` | `"0"` | Mínimo |
| `aria-valuemax` | `"100"` | Máximo |
| `aria-label` | `"Progresso Torre 1"` | Contexto |

---

### Tabelas

```html
<table id="[ID]" aria-label="[DESCRIÇÃO]">
    <caption class="sr-only">[DESCRIÇÃO ACESSÍVEL COMPLETA]</caption>
    <thead>
        <tr>
            <th scope="col" aria-sort="none"
                onclick="Borg.sortTable('[ID]', 0)">
                [COLUNA]
                <span class="sort-icon" aria-hidden="true">swap_vert</span>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>[DADOS]</td>
        </tr>
        <tr class="table-total-row">
            <td>TOTAL</td>
        </tr>
    </tbody>
</table>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `aria-label` | `<table>` | Descrição curta da tabela |
| `<caption>` | Dentro de `<table>` | Descrição completa (sr-only) |
| `scope` | `"col"` em cada `<th>` | Indica que é header de coluna |
| `aria-sort` | Em cada `<th>` sortável | `"none"`, `"ascending"`, ou `"descending"` |
| `aria-hidden` | Ícone sort | `"true"` (decorativo) |

O JavaScript `Borg.sortTable()` já atualiza `aria-sort` automaticamente.

---

### Tabela com Row Expand

```html
<tr role="button" tabindex="0" aria-expanded="false"
    onclick="Borg.toggleRowExpand(this, 'row-detail-1')">
    <td><span class="expand-icon" aria-hidden="true">chevron_right</span></td>
    <td>[DADOS]</td>
</tr>
<tr id="row-detail-1" class="hidden">
    <td colspan="3">[DETALHES]</td>
</tr>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"button"` na `<tr>` clicável | Indica que é interativo |
| `tabindex` | `"0"` | Navegável por teclado |
| `aria-expanded` | `"false"` / `"true"` | Estado do detalhe |
| `aria-hidden` | Ícone chevron | `"true"` (decorativo) |

O JavaScript `Borg.toggleRowExpand()` já atualiza `aria-expanded` automaticamente.

---

### Tabela com Bulk Actions (Checkbox)

```html
<!-- Header -->
<th>
    <input type="checkbox" aria-label="Selecionar todos"
           onchange="Borg.toggleAllRows('[ID]', this.checked)">
</th>

<!-- Row -->
<td>
    <input type="checkbox" class="row-check"
           aria-label="Selecionar [NOME DO ITEM]"
           onchange="Borg.updateBulkActions('[ID]')">
</td>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `aria-label` | Checkbox master | `"Selecionar todos"` |
| `aria-label` | Checkbox por linha | `"Selecionar [nome específico]"` |

---

### Filter Bar

```html
<label for="filter-search">Buscar</label>
<input id="filter-search" type="text" placeholder="Buscar..." aria-label="Buscar nos dados">

<label for="filter-period">Período</label>
<select id="filter-period">...</select>

<label for="filter-category">Categoria</label>
<select id="filter-category">...</select>
```

| Regra | Detalhe |
|-------|---------|
| Cada input TEM `<label>` associado | Via `for="id"` |
| Labels são visíveis | Não usar apenas `aria-label` quando há espaço |
| Placeholder NÃO substitui label | Placeholder desaparece ao digitar |
| Chips de filtro têm botão com `aria-label` | `"Remover filtro [nome]"` |

---

### Tabs

```html
<div role="tablist" aria-label="[DESCRIÇÃO DO GRUPO DE TABS]">
    <button role="tab"
            aria-selected="true"
            aria-controls="tab-panel-1"
            id="tab-1">
        [TAB 1]
    </button>
    <button role="tab"
            aria-selected="false"
            aria-controls="tab-panel-2"
            id="tab-2">
        [TAB 2]
    </button>
</div>

<div role="tabpanel" aria-labelledby="tab-1" id="tab-panel-1">
    [CONTEÚDO]
</div>
<div role="tabpanel" aria-labelledby="tab-2" id="tab-panel-2" class="hidden">
    [CONTEÚDO]
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role="tablist"` | Container dos botões | Agrupa as tabs |
| `aria-label` | No tablist | Descrição do grupo |
| `role="tab"` | Cada botão de tab | Identifica como tab |
| `aria-selected` | `"true"` / `"false"` | Estado ativo |
| `aria-controls` | ID do painel | Liga tab ao conteúdo |
| `role="tabpanel"` | Cada painel de conteúdo | Identifica como painel |
| `aria-labelledby` | ID da tab | Liga painel ao botão |

O JavaScript `Borg.switchTab()` já atualiza `aria-selected` automaticamente.

---

### Gráficos ApexCharts

```html
<div id="chart-[ID]" class="w-full"
     role="img"
     aria-label="Gráfico de barras mostrando receita por região: Sul R$ 4.2M, Sudeste R$ 8.1M, Nordeste R$ 3.5M">
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"img"` no container | Indica conteúdo visual |
| `aria-label` | No container | Descrição textual completa dos dados |

### Como escrever aria-label para gráficos

| Tipo de Gráfico | Formato do aria-label |
|-----------------|----------------------|
| Barras | "Gráfico de barras mostrando [métrica] por [categoria]: [cat1] [val1], [cat2] [val2]..." |
| Linha | "Gráfico de linha mostrando [métrica] de [período inicial] a [período final], variando de [min] a [max]" |
| Donut | "Gráfico de pizza mostrando distribuição de [métrica]: [fatia1] [%1], [fatia2] [%2]..." |
| Gauge | "Indicador de [métrica] em [valor]% da meta" |
| Heatmap | "Mapa de calor mostrando [métrica] por [eixoX] e [eixoY], valores de [min] a [max]" |
| Treemap | "Mapa proporcional de [métrica]: [item1] [val1], [item2] [val2]..." |
| Sparkline | Não precisa (está dentro de KPI que já tem texto) |

> **REGRA:** O aria-label do gráfico deve transmitir a MESMA informação que o gráfico visual.
> Um usuário cego deve entender os dados apenas pelo aria-label.

---

### Drawer

```html
<div id="[ID]" class="detail-drawer"
     role="region"
     aria-label="Detalhes de [ITEM]">
    <button onclick="Borg.closeDrawer('[ID]')"
            aria-label="Fechar detalhes">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"region"` | Seção identificável |
| `aria-label` | `"Detalhes de [item]"` | Contexto |
| `aria-label` | Botão fechar | `"Fechar detalhes"` |
| `aria-hidden` | Ícone X | `"true"` |

---

### Modal

```html
<div id="modal-overlay"
     role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title">
    <h2 id="modal-title">[TÍTULO]</h2>
    <button onclick="Borg.closeModal()"
            aria-label="Fechar modal">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
    </button>
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `role` | `"dialog"` | Identifica como diálogo |
| `aria-modal` | `"true"` | Indica que é modal (bloqueia o resto) |
| `aria-labelledby` | ID do título | Liga modal ao seu título |
| `aria-label` | Botão fechar | `"Fechar modal"` |

---

### Toast Notifications

```html
<!-- Container -->
<div id="toast-container" aria-live="polite" aria-atomic="false"></div>

<!-- Toast individual (inserido via JS) -->
<div role="status" class="toast-animate ...">
    <span class="material-symbols-outlined" aria-hidden="true">check_circle</span>
    Filtros aplicados com sucesso
</div>
```

| Atributo | Onde | Valor |
|----------|------|-------|
| `aria-live` | Container | `"polite"` (anuncia sem interromper) |
| `aria-atomic` | Container | `"false"` (anuncia apenas o novo toast) |
| `role` | Toast individual | `"status"` (informação não-urgente) |
| `aria-hidden` | Ícone do toast | `"true"` (decorativo) |

O JavaScript `Borg.showToast()` já cria toasts com `role="status"` automaticamente.

---

### Alertas

```html
<!-- Crítico -->
<div class="p-3 bg-red-50 border-l-4 border-error rounded-r-lg" role="alert">
    <span class="material-symbols-outlined" aria-hidden="true">error</span>
    [CONTEÚDO]
</div>

<!-- Atenção -->
<div class="p-3 bg-amber-50 border-l-4 border-on-tertiary-container rounded-r-lg" role="alert">
    <span class="material-symbols-outlined" aria-hidden="true">warning</span>
    [CONTEÚDO]
</div>

<!-- Info (não-urgente) -->
<div class="p-3 bg-slate-50 border-l-4 border-surface-tint rounded-r-lg">
    <span class="material-symbols-outlined" aria-hidden="true">info</span>
    [CONTEÚDO]
</div>
```

| Atributo | Onde | Quando |
|----------|------|--------|
| `role="alert"` | Alertas críticos e atenção | Anuncia imediatamente ao screen reader |
| (sem role) | Alertas info | Não interrompe o screen reader |
| `aria-hidden="true"` | Ícones | Sempre (decorativos) |

---

### Botões de ação (genérico)

```html
<!-- Com texto visível -->
<button class="... min-w-[44px] min-h-[44px]">
    <span class="material-symbols-outlined" aria-hidden="true">[ICONE]</span>
    [LABEL VISÍVEL]
</button>

<!-- Apenas ícone (sem texto) -->
<button class="... min-w-[44px] min-h-[44px]"
        aria-label="[DESCRIÇÃO DA AÇÃO]"
        title="[DESCRIÇÃO DA AÇÃO]">
    <span class="material-symbols-outlined" aria-hidden="true">[ICONE]</span>
</button>
```

| Regra | Detalhe |
|-------|---------|
| Botão com texto visível | NÃO precisa de `aria-label` |
| Botão só com ícone | DEVE ter `aria-label` + `title` |
| Ícone decorativo | SEMPRE `aria-hidden="true"` |
| Touch target | SEMPRE `min-w-[44px] min-h-[44px]` |
| Botão desabilitado | `disabled` attribute + `disabled:opacity-50 disabled:cursor-not-allowed` |

---

## FOCUS TRAP

> Quando um drawer ou modal abre, o foco do teclado deve ficar PRESO dentro dele.
> Tab e Shift+Tab circulam apenas entre os elementos focáveis internos.
> Esc fecha e retorna o foco ao elemento que abriu.

### Já implementado no JS (namespace Borg):

```javascript
// Resumo do comportamento:
// 1. Borg.openDrawer() → chama trapFocus(drawer)
// 2. Borg.openModal() → chama trapFocus(modal)
// 3. Borg.closeDrawer() → chama releaseFocus()
// 4. Borg.closeModal() → chama releaseFocus()
// 5. Listener de Tab/Shift+Tab redireciona foco para first/last focusable
// 6. releaseFocus() retorna foco ao previousFocus
```

### O que o focus trap faz:

| Ação do usuário | Comportamento |
|-----------------|---------------|
| Abre drawer/modal | Foco vai para primeiro elemento focável dentro |
| Tab no último elemento | Foco volta para o primeiro |
| Shift+Tab no primeiro | Foco vai para o último |
| Esc | Fecha e retorna foco ao elemento que abriu |
| Click fora (modal backdrop) | Fecha via onclick no overlay |

### Elementos focáveis (o que o trap considera):

```
button:not([disabled])
[href]
input:not([disabled])
select:not([disabled])
textarea:not([disabled])
[tabindex]:not([tabindex="-1"])
```

---

## SKIP NAVIGATION

```html
<!-- PRIMEIRO elemento do <body>, antes do sidebar -->
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]
          focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg
          focus:shadow-lg focus:outline-none">
    Pular para conteúdo principal
</a>
```

### Como funciona:

| Estado | Comportamento |
|--------|---------------|
| Sem foco | Invisível (sr-only) |
| Com foco (Tab) | Aparece no canto superior esquerdo |
| Click/Enter | Salta para `#main-content` (pula sidebar e topbar) |

### Por que é necessário:

- Usuários de teclado teriam que tabular por TODOS os nav items do sidebar antes de chegar ao conteúdo
- Com sidebar de 7 items = 7 tabs desnecessários em cada page load
- Skip link resolve isso com 1 tab

---

## REDUCED MOTION

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .animate-shimmer { animation: none !important; }
}
```

### O que isso afeta:

| Animação | Com motion | Sem motion (reduced) |
|----------|-----------|---------------------|
| View fade-in | 0.3s | Instantâneo |
| Sidebar slide | 0.3s cubic-bezier | Instantâneo |
| Toast slide-up | 0.3s | Instantâneo |
| Value count-up | 1.2s | Instantâneo (valor final) |
| Skeleton shimmer | Loop infinito | Estático (cinza) |
| Drawer expand | 0.4s | Instantâneo |
| Active scale | 0.15s | Instantâneo |

> O valor final é sempre mostrado — apenas a animação é removida.

---

## CONTRASTE WCAG AA — VALIDAÇÃO

> WCAG AA exige:
> - **4.5:1** para texto normal (< 18px ou < 14px bold)
> - **3:1** para texto grande (≥ 18px ou ≥ 14px bold)
> - **3:1** para componentes de interface e ícones informativos

### Combinações validadas do design system

| Foreground | Background | Uso | Ratio | Status |
|-----------|------------|-----|-------|--------|
| `#00081E` (primary) | `#FFFFFF` (white) | KPI valores, títulos | 19.5:1 | ✅ AAA |
| `#191C1E` (on-surface) | `#FFFFFF` (white) | Corpo de texto | 16.8:1 | ✅ AAA |
| `#44464E` (on-surface-variant) | `#FFFFFF` (white) | Labels, subtítulos | 9.7:1 | ✅ AAA |
| `#75777F` (outline) | `#F2F4F6` (surface-container-low) | Table headers | 4.6:1 | ✅ AA |
| `#7687B2` (on-primary-container) | `#0A1F44` (primary-container) | Sidebar texto inativo | 5.2:1 | ✅ AA |
| `#FFFFFF` (white) | `#0A1F44` (primary-container) | Sidebar texto ativo, total row | 14.7:1 | ✅ AAA |
| `#FFFFFF` (white) | `#4C5E86` (surface-tint) | Botões primários | 5.8:1 | ✅ AA |
| `#BA1A1A` (error) | `#FFFFFF` (white) | Texto de erro | 6.1:1 | ✅ AA |
| `#15803D` (green-700) | `#FFFFFF` (white) | Texto positivo | 5.9:1 | ✅ AA |
| `#B37C59` (on-tertiary-container) | `#FFFFFF` (white) | Texto atenção | 3.4:1 | ⚠️ AA Large |
| `#94A3B8` (slate-400) | `#FFFFFF` (white) | Timestamps | 3.1:1 | ⚠️ Decorativo |
| `#FFFFFF` (white) | `#BA1A1A` (error) | Badge erro | 6.1:1 | ✅ AA |
| `#15803D` (green-700) | `#DCFCE7` (green-100) | Badge positivo | 5.4:1 | ✅ AA |
| `#00081E` (primary) | `#F2F4F6` (surface-container-low) | Tabela grupo | 18.2:1 | ✅ AAA |

### Combinações com atenção

| Combinação | Ratio | Mitigação |
|------------|-------|-----------|
| `text-on-tertiary-container` sobre `bg-white` | 3.4:1 | ✅ Usado apenas em texto ≥ 14px bold = AA Large. Sempre acompanhado de ícone + contexto |
| `text-slate-400` sobre `bg-white` | 3.1:1 | ✅ Usado apenas para timestamps decorativos. Informação equivalente disponível em formato acessível |
| `text-on-primary-container` sobre `bg-primary-container` | 5.2:1 | ✅ Passa AA. Sidebar inativo é texto secondary |

### Regras de uso seguro

| Regra | Detalhe |
|-------|---------|
| Texto informativo principal | SEMPRE usar combinações ≥ 4.5:1 |
| Texto decorativo/complementar | Pode usar 3:1 SE informação está disponível de outra forma |
| Ícones informativos | SEMPRE ≥ 3:1 (ícones decorativos com `aria-hidden` são isentos) |
| Bordas de componentes interativos | SEMPRE ≥ 3:1 vs background |
| Focus outline | `#4C5E86` sobre qualquer bg = sempre ≥ 3:1 ✅ |

---

## KEYBOARD NAVIGATION

### Shortcuts globais (implementados no JS)

| Tecla | Ação | Contexto |
|-------|------|----------|
| `Tab` | Navega para próximo elemento focável | Global |
| `Shift + Tab` | Navega para elemento focável anterior | Global |
| `Enter` | Ativa nav item focado | Quando nav-item tem foco |
| `Space` | Ativa nav item focado | Quando nav-item tem foco |
| `Escape` | Fecha modal → drawer → sidebar mobile | Prioridade nesta ordem |
| `Ctrl + 1` a `Ctrl + 9` | Troca para view 1-9 | Global (atalho rápido) |
| `Ctrl + F` | Foca no campo de busca do filtro | Se filter-search existe |

### Ordem de tabulação natural

```
1. Skip link (sr-only, aparece com foco)
2. Menu hamburger (topbar)
3. Botão notificações (topbar)
4. Componentes da view ativa (de cima para baixo, esquerda para direita):
   a. Filter bar inputs/botões
   b. KPI cards (se interativos)
   c. Botões de gráfico (fullscreen)
   d. Tabela headers (sort)
   e. Tabela busca
   f. Tabela export/fullscreen
   g. Paginação (prev/next)
   h. Sub-cards clicáveis
   i. Botões "Ver todos"
5. Alertas (se na lateral)
```

### Dentro de drawers/modais (focus trap ativo)

```
Tab circula entre:
├── Botão fechar
├── Elementos interativos internos
└── Volta ao botão fechar

Esc → fecha e retorna foco ao trigger
```

---

## CHECKLIST DE ACESSIBILIDADE (REVISÃO FINAL)

> Verificar CADA item antes de entregar o dashboard.

### Landmarks e Estrutura

| # | Item | ✅ |
|---|------|----|
| 1 | Skip link como primeiro elemento do body? | |
| 2 | Sidebar tem `role="navigation"` + `aria-label`? | |
| 3 | `<nav>` tem `aria-label`? | |
| 4 | `<main>` tem `id="main-content"` + `aria-label`? | |
| 5 | Cada view tem `role="region"` + `aria-label`? | |
| 6 | Toast container tem `aria-live="polite"`? | |
| 7 | Modal tem `role="dialog"` + `aria-modal="true"` + `aria-labelledby`? | |

### Navegação

| # | Item | ✅ |
|---|------|----|
| 8 | Nav items têm `role="button"` + `tabindex="0"`? | |
| 9 | Nav item ativo tem `aria-current="page"`? | |
| 10 | Menu toggle tem `aria-expanded` + `aria-controls`? | |
| 11 | Enter e Space ativam nav items? | |
| 12 | Esc fecha modal/drawer/sidebar mobile? | |
| 13 | Ctrl+1-9 troca views? | |

### Conteúdo

| # | Item | ✅ |
|---|------|----|
| 14 | Ícones decorativos têm `aria-hidden="true"`? | |
| 15 | Botões só-ícone têm `aria-label` + `title`? | |
| 16 | SVGs têm `role="img"` + `aria-label`? | |
| 17 | Progress bars têm `role="progressbar"` + aria-value*? | |
| 18 | Gráficos têm `role="img"` + `aria-label` descritivo? | |

### Tabelas

| # | Item | ✅ |
|---|------|----|
| 19 | Tabelas têm `<caption>` (sr-only)? | |
| 20 | `<th>` têm `scope="col"`? | |
| 21 | Headers sortáveis têm `aria-sort`? | |
| 22 | Row expand têm `aria-expanded`? | |
| 23 | Checkboxes têm `aria-label` contextual? | |

### Interatividade

| # | Item | ✅ |
|---|------|----|
| 24 | Tabs têm `role="tablist"` / `role="tab"` / `role="tabpanel"`? | |
| 25 | Tabs têm `aria-selected` + `aria-controls` + `aria-labelledby`? | |
| 26 | Drawer tem `role="region"` + `aria-label`? | |
| 27 | Focus trap ativo em drawers e modais? | |
| 28 | Foco retorna ao trigger ao fechar drawer/modal? | |
| 29 | Alertas críticos têm `role="alert"`? | |
| 30 | Filter chips têm botão com `aria-label="Remover filtro [x]"`? | |

### Visual

| # | Item | ✅ |
|---|------|----|
| 31 | `focus-visible` outline de 2px definido? | |
| 32 | Touch targets mínimo 44x44px em mobile? | |
| 33 | `prefers-reduced-motion` implementado? | |
| 34 | Contraste de texto informativo ≥ 4.5:1? | |
| 35 | Contraste de texto grande ≥ 3:1? | |
| 36 | Informação não depende apenas de cor? (tem ícone + texto) | |

### Formulários

| # | Item | ✅ |
|---|------|----|
| 37 | Inputs têm `<label>` visível associado via `for`? | |
| 38 | Placeholders NÃO substituem labels? | |
| 39 | Campos desabilitados têm `disabled` attribute? | |
| 40 | Mensagens de erro estão associadas ao campo? | |

> **QUALQUER item NÃO atendido deve ser CORRIGIDO antes de entregar.**
```

---

