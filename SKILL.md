---
name: borgonovi-dashboard-design-system-v7
description: Design system padrão diamante para dashboards HTML de BI e visualização de dados. Use SEMPRE que o usuário pedir dashboard, painel, BI, KPIs, visualização de métricas, relatório visual interativo, tela executiva, cockpit gerencial, analytics, monitor operacional, indicadores, gráficos com tabela, ou qualquer interface combinando números + gráficos + filtros — mesmo sem usar a palavra "dashboard" explicitamente. Inclui paleta Material 3, Tailwind config, ApexCharts com lazy loading e registry, Material Symbols, sidebar multi-view, KPIs animados, filtros globais com chips, tabelas com sort/busca/paginação/export CSV/fullscreen, drawers master-detail com focus trap, modais, tabs, empty/loading/error states, toast notifications, command palette Cmd+K, dark mode opcional, reveal on scroll, ripple effects, export PDF, mock data pt-BR realistas, três perfis de densidade (executivo/gerencial/operacional), storytelling de dados por domínio, acessibilidade WCAG AA, responsividade 4 breakpoints, print styles e keyboard shortcuts. Arquivo HTML único autocontido, pronto para abrir no navegador.
---

# 🧠 BORGONOVI DASHBOARD DESIGN SYSTEM — V7

---

## ❗ REGRAS ABSOLUTAS (LER PRIMEIRO)

1. Este design system deve ser REPLICADO, nunca interpretado
2. QUANDO houver dúvida → seguir o código-exemplo da seção
3. QUANDO não houver exemplo → PERGUNTAR antes de inventar
4. TODO dashboard gerado é um ÚNICO arquivo HTML autocontido
5. TODAS as views/páginas ficam DENTRO do mesmo arquivo
6. A quantidade de views, nomes e conteúdos são LIVRES por dashboard
7. O design, cores, tipografia e mecânica são FIXOS
8. ACESSIBILIDADE não é opcional — é obrigatória em cada componente
9. PERFORMANCE importa — lazy loading e chart lifecycle são obrigatórios
10. STORYTELLING — a ordem dos componentes conta uma história de dados

## ⚖️ LEIS INVARIANTES (NÃO NEGOCIÁVEIS)

> Estas regras são LEI, não sugestões. Cada dashboard gerado DEVE obedecer TODAS.

### LEI 1 — Sidebar Tooltip ao Colapsar
Toda `nav-item` no sidebar DEVE ter atributo `data-tooltip="Nome da View"`. Quando o sidebar estiver colapsado, ao passar o mouse sobre o ícone, DEVE aparecer tooltip com o nome da view via CSS `::after` com `content: attr(data-tooltip)`.

### LEI 2 — Quebra de Texto no Sidebar
O nome da construtora/empreendimento no sidebar NUNCA pode ter `whitespace-nowrap`. DEVE usar `break-words` ou `break-all` para que nomes longos quebrem automaticamente quando o sidebar está colapsado.

### LEI 3 — Dark Mode Completo
O toggle de dark mode DEVE funcionar visualmente. O CSS DEVE conter um bloco `.dark` com overrides para TODOS os tokens de cor: backgrounds, texts, borders, inputs, shadows, alertas. SEM esse bloco, o toggle é inútil.

### LEI 4 — Página de Relatórios SEMPRE Presente
TODO dashboard DEVE ter uma view `reports` com nav item no sidebar. É OBRIGATÓRIO. A view deve conter cards para 6 tipos de relatório (conforme reports.md) + lista de relatórios recentes + função `Borg.generateReport()`.

### LEI 5 — Botão Maximizar em TODO Gráfico
TODO container de gráfico (exceto sparklines) DEVE ter um botão `fullscreen` no canto superior direito. O botão DEVE chamar `Borg.openChartFullscreen('chart-id','Título')`. O gráfico maximizado DEVE se ajustar ao viewport (sem scrollbar horizontal ou vertical).

### LEI 6 — Página de Configurações SEMPRE Presente
TODO dashboard DEVE ter uma view `settings` com nav item no sidebar. É OBRIGATÓRIO. A view deve conter: editar nome do usuário, nome do empreendimento, toggle de visibilidade de KPIs/gráficos/tabelas, botão "Salvar Modificações" com feedback visual. Tudo salvo em localStorage.

### LEI 7 — Filtros AUTOMÁTICOS (LEI!)
**É PROIBIDO** botão "Aplicar" ou "Limpar" em barras de filtro. TODO filtro DEVE ser automático — onChange, onInput, onSelect. Filtros são aplicados instantaneamente ao alterar qualquer campo. A função `Borg.autoFilter()` (debounced) é o padrão obrigatório.

### LEI 8 — Gráficos como Filtro (Cross-Filtering LEI!)
TODO gráfico não-sparkline DEVE ter `chart.events.click` que dispara cross-filtering. Ao clicar em qualquer segmento/barra/ponto de um gráfico, TODOS os outros gráficos, KPIs e tabelas da mesma view DEVEM ser filtrados. Clicar novamente no mesmo segmento REMOVE o filtro. A função `Borg.crossFilterClick()` é o padrão obrigatório.

### LEI 9 — Filtros de Data com Calendário
TODO campo de filtro de data DEVE usar `<input type="date">` (calendário nativo do navegador). É PROIBIDO usar `<select>` para períodos fixos. O usuário DEVE poder escolher qualquer data.

### LEI 10 — Gráficos Dentro do Container (LEI!)
TODO gráfico DEVE ser renderizado 100% dentro do seu container — sem overflow, sem scrollbar. O `Borg.createChart()` DEVE auto-detectar a altura do container via `getContainerHeight()`. A largura DEVE ser `width: '100%'`. Containers de gráficos DEVEM ter `w-full` + `h-[xxx]px` explícito. O layout de gráficos lado a lado DEVE ser visualmente equilibrado (nunca um container muito largo ao lado de um estreito).

---

## 📚 ARQUIVOS DE REFERÊNCIA (LER CONFORME NECESSIDADE)

| Arquivo | Quando ler | Conteúdo |
|---------|-----------|----------|
| [components.md](components.md) | Ao montar componentes | Templates HTML de todos os componentes: KPIs, tabelas, filtros, cards, drawers, modais, tabs, formulários, empty/loading/error states, badges, tooltips, alertas |
| [charts.md](charts.md) | Ao criar gráficos | borgChartDefaults, exemplos de barras, donut, área, linha, sparkline, gauge, heatmap, treemap, waterfall, drill-down, annotations, paletas de dados |
| [ux-guidelines.md](ux-guidelines.md) | Na etapa de planejamento | Perguntas obrigatórias, processo de criação, storytelling de dados, padrões de layout por tipo de view, UX psychology, anti-patterns, densidade informacional |
| [storytelling-patterns.md](storytelling-patterns.md) | Na etapa de planejamento | Catálogo de narrativas por domínio (financeiro, comercial, operacional, RH, marketing, saúde, logística, SaaS) |
| [density-profiles.md](density-profiles.md) | Na etapa de planejamento | 3 perfis de densidade — Executivo, Gerencial, Operacional — com tokens específicos |
| [animations.md](animations.md) | Ao adicionar polimento | Motion tokens, easing curves, reveal on scroll, ripple, card tilt, command palette, dark mode |
| [mock-data-pt-br.md](mock-data-pt-br.md) | Ao usar dados placeholder | Faixas realistas por setor, nomes pt-BR, empresas fictícias, séries temporais plausíveis |
| [accessibility.md](accessibility.md) | Na etapa de revisão | ARIA por componente, skip navigation, focus trap, contraste WCAG AA, landmarks, tabelas acessíveis, reduced motion |
| [data_upload.md](data_upload.md) | Quando dashboard precisar aceitar planilhas | Dropzone, parser XLSX/CSV, mapeamento de colunas, atualização reativa, template de planilha |
| [reports.md](reports.md) | Quando pedirem relatório PDF | HTML dedicado para impressão, layout A4, capa, cabeçalho/rodapé, storytelling narrativo |


### Regra de leitura:

```
SEMPRE ler: Esta SKILL.md (core)
ANTES de codificar:
   1. ux-guidelines.md (perguntas + planejamento)
   2. density-profiles.md (escolher perfil)
   3. storytelling-patterns.md (ordem narrativa das views)
DURANTE codificação:
   - components.md + charts.md (templates)
   - animations.md (polimento visual)
   - mock-data-pt-br.md (dados placeholder)
ANTES de entregar: accessibility.md (revisão WCAG)
```

---

## 🛠️ STACK TÉCNICA

### CDNs obrigatórios (incluir TODOS no head)

```html
<!-- Preconnect para performance -->
<link rel="preconnect" href="https://cdn.tailwindcss.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net">

<!-- Tailwind CSS com plugins -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<!-- Fonte Inter -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">

<!-- ApexCharts -->
<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
```
```html
<!-- SheetJS para upload de planilhas (incluir APENAS se dashboard tem upload) -->
<!-- <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script> -->
```

### Regras de tecnologia

| Permitido | Proibido |
|-----------|----------|
| Tailwind CSS | React, Vue, Angular |
| ApexCharts (gráficos complexos) | Chart.js, D3.js, ECharts |
| CSS/SVG puro (indicadores simples) | Qualquer outro framework JS |
| Material Symbols Outlined | Lucide, Font Awesome, Heroicons |
| Vanilla JavaScript | jQuery |
| Google Fonts (Inter) | Fontes locais |
| CSS :has() para estados | Libs externas de UI |
| CSS Container Queries | Libs de layout |
| SheetJS (upload de planilhas) | Outras libs de leitura de Excel |


### QUANDO usar CSS/SVG vs ApexCharts

| Situação | Tecnologia |
|----------|------------|
| Progress ring dentro de KPI card | CSS/SVG |
| Barra de progresso simples | CSS |
| Indicador de porcentagem | CSS |
| Sparkline dentro de KPI ou tabela | ApexCharts (sparkline: enabled) |
| Qualquer gráfico com tooltip/interação | ApexCharts |
| Gauge/radialBar, heatmap, treemap | ApexCharts |

---

## 🎨 TAILWIND CONFIG (COPIAR EXATAMENTE)

```javascript
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "on-error-container": "#93000a",
                "secondary": "#585e70",
                "surface-dim": "#d8dadc",
                "inverse-on-surface": "#eff1f3",
                "primary-fixed-dim": "#b4c6f4",
                "outline": "#75777f",
                "tertiary-container": "#391700",
                "on-surface": "#191c1e",
                "on-tertiary-container": "#b37c59",
                "on-tertiary-fixed": "#311300",
                "on-secondary-fixed": "#151b2a",
                "tertiary-fixed-dim": "#f8b992",
                "surface-container-highest": "#e0e3e5",
                "inverse-surface": "#2d3133",
                "secondary-fixed": "#dce2f7",
                "on-background": "#191c1e",
                "on-tertiary-fixed-variant": "#673c1e",
                "error": "#ba1a1a",
                "surface": "#f7f9fb",
                "on-primary-fixed": "#041a3f",
                "inverse-primary": "#b4c6f4",
                "surface-container": "#eceef0",
                "on-primary": "#ffffff",
                "tertiary": "#150500",
                "primary": "#00081e",
                "on-secondary": "#ffffff",
                "background": "#f7f9fb",
                "on-secondary-container": "#5e6476",
                "on-error": "#ffffff",
                "on-primary-container": "#7687b2",
                "surface-container-low": "#f2f4f6",
                "surface-bright": "#f7f9fb",
                "tertiary-fixed": "#ffdbc7",
                "secondary-container": "#dce2f7",
                "on-tertiary": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "surface-container-high": "#e6e8ea",
                "secondary-fixed-dim": "#c0c6da",
                "on-surface-variant": "#44464e",
                "surface-variant": "#e0e3e5",
                "on-primary-fixed-variant": "#34466d",
                "error-container": "#ffdad6",
                "on-secondary-fixed-variant": "#404757",
                "outline-variant": "#c5c6cf",
                "surface-tint": "#4c5e86",
                "primary-fixed": "#d9e2ff",
                "primary-container": "#0a1f44"
            },
            fontFamily: {
                "headline": ["Inter"],
                "body": ["Inter"],
                "label": ["Inter"]
            },
            borderRadius: {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            },
        },
    },
}
```

### ALERTA CRÍTICO BORDER-RADIUS CUSTOMIZADO

| Classe | Valor PADRÃO Tailwind | Valor NESTE SISTEMA |
|--------|------------------------|---------------------|
| rounded | 4px | 2px |
| rounded-lg | 8px | 4px |
| rounded-xl | 12px | 8px |
| rounded-full | 9999px | 12px |

Para pill shapes (badges, dots): usar `rounded-[9999px]`

---

## 🎨 TOKENS DE DESIGN

### Cores por função

| Função | Classe |
|--------|--------|
| Body bg | `bg-background` |
| Card bg | `bg-white` |
| Sidebar bg | `bg-primary-container` |
| Sidebar hover | `bg-[#162A4E]` |
| Sidebar active border | `border-surface-tint` |
| Topbar bg | `bg-white/80 backdrop-blur-md` |
| Card border | `border-slate-200` |
| Sub-card bg | `bg-surface-container-low` |
| Table total row | `bg-primary-container text-white` |
| Filter bar bg | `bg-white` |
| Modal backdrop | `bg-black/50` |
| Skeleton shimmer | `bg-slate-200` → `bg-slate-100` |
| Empty state icon bg | `bg-surface-container-low` |
| KPI Hero bg | `bg-primary-container` |

### Texto por função

| Função | Classe |
|--------|--------|
| Valor/destaque | `text-primary` (#00081E) |
| Corpo geral | `text-on-surface` (#191C1E) |
| Label/subtítulo | `text-on-surface-variant` (#44464E) |
| Terciário/th | `text-outline` (#75777F) |
| Sidebar inativo | `text-on-primary-container` (#7687B2) |
| Accent/link | `text-surface-tint` (#4C5E86) |
| Erro | `text-error` (#BA1A1A) |
| Atenção | `text-on-tertiary-container` (#B37C59) |
| Positivo | `text-green-700` |
| Timestamp | `text-slate-400` |
| Placeholder | `text-slate-400` |
| Disabled | `text-slate-300` |

### Espaçamento (sistema de 8 pontos)

| Elemento | Classe | Valor |
|----------|--------|-------|
| Content padding | `p-6` | 24px |
| Gap principal | `gap-6` | 24px |
| Gap cards | `gap-4` | 16px |
| Card padding | `p-5` | 20px |
| Seção padding | `p-6` | 24px |
| Table cell | `px-6 py-3` | 24/12px |
| Alerta padding | `p-3` | 12px |
| Filter bar padding | `p-4` | 16px |
| Modal padding | `p-6` | 24px |
| Touch target mínimo | `min-w-[44px] min-h-[44px]` | 44px |

### Cores de valores em tabelas

| Situação | Classe |
|----------|--------|
| GAP negativo | `text-error font-medium` |
| GAP neutro/zero | `text-surface-tint font-medium` |
| GAP atenção | `text-on-tertiary-container font-medium` |
| GAP positivo | `text-green-700 font-medium` |

---

## 🔤 TIPOGRAFIA

| Elemento | Classes Tailwind |
|----------|------------------|
| KPI valor | `text-2xl font-extrabold tracking-tight text-primary` |
| KPI Hero valor | `text-4xl sm:text-5xl font-extrabold tracking-tight text-white` |
| KPI label | `text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider` |
| KPI info | `text-[0.6875rem] font-bold text-surface-tint` |
| KPI sub | `text-[0.625rem] text-on-surface-variant leading-none` |
| Variação positiva | `text-[0.6875rem] font-bold text-green-700` |
| Variação negativa | `text-[0.6875rem] font-bold text-error` |
| Título seção | `text-[0.875rem] font-bold text-primary uppercase tracking-tight` |
| Data/período | `text-[0.6875rem] text-on-surface-variant uppercase font-medium` |
| Tabela th | `text-[0.6875rem] font-bold text-outline uppercase tracking-wider` |
| Tabela td | `text-sm tabular-nums` |
| Tabela grupo | `font-medium text-primary` |
| Tabela total | `text-xs font-bold text-white uppercase tracking-widest` |
| Alerta categ | `text-[10px] font-bold uppercase` + cor status |
| Alerta título | `text-[11px] font-semibold text-primary` |
| Alerta valor | `text-[10px] font-bold` + cor status |
| Alerta hora | `text-[9px] font-medium text-slate-400` |
| Topbar título | `text-xl font-bold text-primary-container` |
| Sidebar logo | `text-lg font-bold text-white tracking-tighter uppercase` |
| Gráfico título | `text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider` |
| Botão topbar | `text-sm font-medium` |
| Botão link | `text-[10px] font-bold text-surface-tint uppercase tracking-widest` |
| Filter label | `text-xs font-medium text-on-surface-variant` |
| Tab ativo | `text-sm font-semibold text-primary` |
| Tab inativo | `text-sm font-medium text-on-surface-variant` |
| Empty state título | `text-lg font-bold text-primary` |
| Empty state desc | `text-sm text-on-surface-variant` |
| Tooltip texto | `text-[11px] text-on-surface-variant leading-relaxed` |
| Paginação info | `text-xs text-on-surface-variant` |
| Modal título | `text-lg font-bold text-primary` |
| Timestamp | `text-[11px] font-medium text-slate-400` |

---

## 🦴 SKELETON TEMPLATE (PONTO DE PARTIDA)

```html
<!DOCTYPE html>
<html class="light" lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[NOME DO DASHBOARD]</title>

    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">

    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>

    <script>/* TAILWIND CONFIG */</script>
    <style type="text/tailwindcss">/* CSS CUSTOMIZADO */</style>
</head>
<body class="bg-background text-on-surface overflow-x-hidden">

    <!-- Skip Navigation -->
    <a href="#main-content"
       class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]
              focus:bg-primary-container focus:text-white focus:px-4 focus:py-2 focus:rounded-lg
              focus:shadow-lg focus:outline-none">
        Pular para conteúdo principal
    </a>

    <!-- SIDEBAR -->
    <aside id="sidebar" role="navigation" aria-label="Menu principal"
        class="sidebar-collapsed h-screen fixed left-0 top-0
               overflow-y-auto overflow-x-hidden z-50
               bg-primary-container flex flex-col py-6
               shadow-2xl shadow-slate-900/20">
        <div class="px-5 mb-10 flex items-center gap-4 overflow-hidden">
            <div class="min-w-[24px] flex-shrink-0">
                <span class="material-symbols-outlined text-white text-2xl">[ICONE]</span>
            </div>
            <div class="logo-text">
                <h1 class="text-white font-bold text-lg tracking-tighter uppercase whitespace-nowrap">[NOME]</h1>
                <p class="text-on-primary-container text-[10px] whitespace-nowrap">[SUBTITULO]</p>
            </div>
        </div>
        <nav class="flex-1 space-y-1" aria-label="Navegação do dashboard">
            <!-- Nav items (ver components.md) -->
        </nav>
        <div class="px-4 mt-auto flex items-center gap-4 pt-6 border-t border-[#162A4E] overflow-hidden">
            <div class="w-8 h-8 rounded-[9999px] bg-surface-tint flex items-center justify-center min-w-[32px] flex-shrink-0">
                <span class="material-symbols-outlined text-white text-sm">person</span>
            </div>
            <div class="nav-text">
                <p class="text-white text-xs font-medium truncate">[NOME]</p>
                <p class="text-on-primary-container text-[10px] truncate">[CARGO]</p>
            </div>
        </div>
    </aside>

    <!-- BACKDROP MOBILE -->
    <div id="sidebar-backdrop"
         class="fixed inset-0 bg-black/40 z-40 hidden lg:hidden"
         onclick="Borg.toggleSidebar()" aria-hidden="true"></div>

    <!-- TOPBAR -->
    <header id="top-bar"
        class="main-content sticky top-0 z-30 bg-white/80 backdrop-blur-md
               border-b border-slate-200 h-16 flex justify-between items-center px-6">
        <div class="flex items-center gap-4">
            <button class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600
                           min-w-[44px] min-h-[44px] flex items-center justify-center"
                    onclick="Borg.toggleSidebar()"
                    aria-label="Abrir ou fechar menu" aria-expanded="false" aria-controls="sidebar">
                <span class="material-symbols-outlined">menu</span>
            </button>
            <div class="flex items-center gap-2 text-primary-container font-bold text-xl">
                <span class="material-symbols-outlined text-primary-container">[ICONE]</span>
                <span id="page-title">[TITULO INICIAL]</span>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center gap-1.5 text-slate-400">
                <span class="material-symbols-outlined text-sm">schedule</span>
                <span id="last-update" class="text-[11px] font-medium">Atualizado em DD/MM/AAAA às HH:MM</span>
            </div>
            <div class="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
            <button class="p-2 text-slate-400 hover:text-slate-600 transition-colors relative
                           min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Notificações">
                <span class="material-symbols-outlined">notifications</span>
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-[9999px] border-2 border-white"></span>
            </button>
        </div>
    </header>

    <!-- CONTEÚDO PRINCIPAL -->
    <main id="main-content" class="main-content p-6 min-h-screen" aria-label="Conteúdo do dashboard">
        <section id="view-[nome1]" class="view-section grid grid-cols-12 gap-6"
                 role="region" aria-label="[LABEL VIEW]">
        </section>
        <section id="view-[nome2]" class="view-section hidden grid grid-cols-12 gap-6"
                 role="region" aria-label="[LABEL VIEW]">
        </section>
    </main>

    <!-- MODAL -->
    <div id="modal-overlay" class="fixed inset-0 bg-black/50 z-[90] hidden flex items-center justify-center p-6"
         role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div id="modal-content" class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center p-6 border-b border-slate-200">
                <h2 id="modal-title" class="text-lg font-bold text-primary">Título</h2>
                <button class="p-2 hover:bg-slate-100 rounded-[9999px] transition-colors
                               min-w-[44px] min-h-[44px] flex items-center justify-center"
                        onclick="Borg.closeModal()" aria-label="Fechar modal">
                    <span class="material-symbols-outlined text-slate-400">close</span>
                </button>
            </div>
            <div id="modal-body" class="p-6"></div>
        </div>
    </div>

    <!-- TOAST -->
    <div id="toast-container" class="fixed bottom-6 right-6 z-[100] space-y-3"
         aria-live="polite" aria-atomic="false"></div>

    <!-- COMMAND PALETTE (Cmd/Ctrl + K) -->
    <div id="cmd-palette-overlay"
         class="fixed inset-0 bg-black/40 z-[110] hidden items-start justify-center pt-24 px-4"
         role="dialog" aria-modal="true" aria-labelledby="cmd-palette-title"
         onclick="if(event.target===this)Borg.commandPalette.close()">
        <div id="cmd-palette-panel"
             class="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <div class="flex items-center gap-2 px-4 py-3 border-b border-slate-200">
                <span class="material-symbols-outlined text-on-surface-variant" aria-hidden="true">search</span>
                <input id="cmd-palette-input" type="text"
                       class="flex-1 bg-transparent outline-none text-sm text-primary placeholder-on-surface-variant"
                       placeholder="Buscar comandos ou views..."
                       aria-label="Buscar comandos">
                <kbd class="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded border border-slate-200">ESC</kbd>
            </div>
            <div id="cmd-palette-results" class="max-h-[50vh] overflow-y-auto"
                 role="listbox" aria-label="Comandos disponíveis"></div>
            <div class="px-4 py-2 text-[10px] text-on-surface-variant bg-surface-container-low border-t border-slate-200 flex justify-between">
                <span>↑↓ navegar · ↵ executar</span>
                <span id="cmd-palette-title" class="font-bold">Ctrl+K</span>
            </div>
        </div>
    </div>

    <script>/* JAVASCRIPT COMPLETO */</script>
</body>
</html>
```

---

## ⚙️ CSS COMPLETO

```css
/* ========== MOTION TOKENS (ver animations.md) ========== */
:root {
    --dur-instant: 100ms;
    --dur-fast: 150ms;
    --dur-base: 200ms;
    --dur-medium: 300ms;
    --dur-slow: 400ms;
    --dur-deliberate: 600ms;
    --ease-standard: cubic-bezier(0.2, 0, 0, 1);
    --ease-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
    --ease-accelerate: cubic-bezier(0.3, 0, 1, 1);
    --ease-emphasized: cubic-bezier(0.3, 0, 0, 1);
    --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    --ease-crisp: cubic-bezier(0.4, 0, 0.2, 1);
}

body { font-family: 'Inter', sans-serif; }

.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}

/* Scrollbar */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Sidebar */
#sidebar { transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.sidebar-collapsed { width: 64px; }
.sidebar-expanded { width: 240px; }

.main-content {
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-left: 64px;
}
.main-content-expanded { margin-left: 240px; }

.nav-text {
    opacity: 0; transition: opacity 0.2s ease;
    white-space: nowrap; pointer-events: none;
}
.sidebar-expanded .nav-text { opacity: 1; pointer-events: auto; }
.sidebar-expanded .logo-text { opacity: 1; }
.logo-text { opacity: 0; transition: opacity 0.2s ease; }

/* Detail Drawer */
.detail-drawer {
    max-height: 0; overflow: hidden; opacity: 0;
    margin-top: 0 !important; margin-bottom: 0 !important;
    border-color: transparent;
    transition: max-height 0.4s ease-out, margin 0.4s ease-out,
                opacity 0.4s ease-out, border-color 0.4s ease-out;
}
.detail-drawer.open {
    max-height: 800px;
    margin-top: 1.5rem !important; margin-bottom: 1.5rem !important;
    border-color: rgb(226 232 240); opacity: 1;
}

/* Animations */
.view-section { animation: viewFadeIn 0.3s ease-out; }
@keyframes viewFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}
.toast-animate { animation: slideUp 0.3s ease-out; }
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}
[data-animate-value] { animation: fadeInUp 0.5s ease-out; }

/* Skeleton shimmer */
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
.animate-shimmer {
    background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%) !important;
    background-size: 200% 100% !important;
    animation: shimmer 1.5s infinite;
}

/* Row expand */
.expand-icon { transition: transform 0.2s ease; }
.expand-icon.expanded { transform: rotate(90deg); }

/* Accessibility */
*:focus-visible {
    outline: 2px solid #4c5e86;
    outline-offset: 2px;
    border-radius: 4px;
}
.sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    .animate-shimmer { animation: none !important; }
}

/* Responsive */
@media (max-width: 1024px) {
    .sidebar-collapsed { width: 0px; overflow: hidden; }
    .main-content { margin-left: 0; }
    .sidebar-expanded { width: 240px; }
    .main-content-expanded { margin-left: 0; }
}
@media (max-width: 640px) {
    .main-content { padding: 1rem; }
    #top-bar { padding-left: 1rem; padding-right: 1rem; }
}

/* Print */
@media print {
    #sidebar, #sidebar-backdrop, #top-bar, #toast-container,
    #modal-overlay, button, input, select { display: none !important; }
    .main-content { margin-left: 0 !important; padding: 0 !important; }
    .view-section { display: grid !important; page-break-after: always; }
    .view-section:last-child { page-break-after: auto; }
    .shadow-sm, .shadow-lg { box-shadow: none !important; }
    body { background: white !important; color: black !important; font-size: 12px !important; }
    .bg-primary-container { background: #333 !important; }
    .text-white { color: white !important; }
    .bg-white { background: white !important; }
    .bg-white, section, table { page-break-inside: avoid; }
}

/* ========== CARD LIFT (hover elegante) ========== */
.card-lift {
    transition: transform var(--dur-base) var(--ease-standard),
                box-shadow var(--dur-base) var(--ease-standard);
    will-change: transform;
}
.card-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -8px rgba(15, 23, 42, 0.12),
                0 4px 12px -4px rgba(15, 23, 42, 0.08);
}

/* ========== REVEAL ON SCROLL ========== */
.reveal { opacity: 0; transform: translateY(16px); }
.reveal.revealed {
    opacity: 1; transform: translateY(0);
    transition: opacity var(--dur-slow) var(--ease-decelerate),
                transform var(--dur-slow) var(--ease-decelerate);
}
.reveal-stagger > *:nth-child(1) { transition-delay: 0ms; }
.reveal-stagger > *:nth-child(2) { transition-delay: 60ms; }
.reveal-stagger > *:nth-child(3) { transition-delay: 120ms; }
.reveal-stagger > *:nth-child(4) { transition-delay: 180ms; }
.reveal-stagger > *:nth-child(5) { transition-delay: 240ms; }
.reveal-stagger > *:nth-child(6) { transition-delay: 300ms; }
.reveal-stagger > *:nth-child(n+7) { transition-delay: 340ms; }

/* ========== RIPPLE EFFECT ========== */
.has-ripple { position: relative; overflow: hidden; }
.ripple-wave {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: currentColor; opacity: 0.18;
    transform: scale(0); animation: rippleOut var(--dur-slow) var(--ease-decelerate);
}
@keyframes rippleOut {
    to { transform: scale(4); opacity: 0; }
}

/* ========== GRADIENT TEXT (uso moderado — apenas hero/destaque) ========== */
.text-gradient-primary {
    background: linear-gradient(135deg, #00081e 0%, #4c5e86 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
}

/* ========== ANIMATED BORDER (uso restrito — destaque de KPI crítico) ========== */
.border-glow {
    position: relative; isolation: isolate;
}
.border-glow::before {
    content: ''; position: absolute; inset: -1px; border-radius: inherit;
    padding: 1px; z-index: -1;
    background: linear-gradient(120deg, rgba(76, 94, 134, 0) 0%, rgba(76, 94, 134, 0.6) 50%, rgba(76, 94, 134, 0) 100%);
    background-size: 300% 100%;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
    animation: borderSlide 3s linear infinite;
}
@keyframes borderSlide {
    0% { background-position: 300% 0; }
    100% { background-position: -300% 0; }
}

/* ========== CARD TILT (micro-interação 3D sutil) ========== */
.card-tilt {
    transition: transform var(--dur-medium) var(--ease-standard);
    transform-style: preserve-3d;
    perspective: 1000px;
}
.card-tilt:hover { transform: translateY(-2px) rotateX(1deg) rotateY(-1deg); }

/* ========== GLASS SURFACE (apenas topbar/modal overlay — NÃO em cards) ========== */
.glass-surface {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(226, 232, 240, 0.8);
}
html.dark .glass-surface {
    background: rgba(17, 26, 46, 0.7);
    border-color: rgba(148, 163, 184, 0.24);
}

/* ========== SHIMMER PRO (loading moderno) ========== */
.shimmer-pro {
    background: linear-gradient(90deg,
        rgba(226, 232, 240, 0) 0%,
        rgba(226, 232, 240, 0.6) 50%,
        rgba(226, 232, 240, 0) 100%);
    background-size: 200% 100%;
    animation: shimmerPro 1.8s var(--ease-standard) infinite;
}
@keyframes shimmerPro {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* ========== NUMBER ROLL (micro animação em KPI ao atualizar) ========== */
@keyframes numberRoll {
    0% { transform: translateY(-100%); opacity: 0; }
    60% { opacity: 1; }
    100% { transform: translateY(0); opacity: 1; }
}
.number-roll { animation: numberRoll var(--dur-medium) var(--ease-decelerate); }

/* ========== PULSE DOT (live / tempo real) ========== */
.pulse-dot {
    display: inline-block; width: 8px; height: 8px;
    border-radius: 9999px; background: #16a34a; position: relative;
    flex-shrink: 0;
}
.pulse-dot::after {
    content: ''; position: absolute; inset: 0;
    border-radius: 9999px; background: #16a34a;
    animation: pulseDot 1.8s ease-out infinite;
}
@keyframes pulseDot {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.6); opacity: 0; }
}

/* ========== COMMAND PALETTE ========== */
#cmd-palette-overlay { backdrop-filter: blur(4px); }
#cmd-palette-panel {
    animation: cmdPaletteIn var(--dur-medium) var(--ease-emphasized);
}
@keyframes cmdPaletteIn {
    from { opacity: 0; transform: translateY(-12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
.cmd-item[data-active="true"] { background: #eceef0; }

/* ========== DARK MODE SUPPORT (opt-in via .dark no html) ========== */
html.dark {
    color-scheme: dark;
}
html.dark body { background: #0b1220; color: #e2e8f0; }
html.dark .bg-background { background-color: #0b1220; }
html.dark .bg-white { background-color: #111a2e; color: #e2e8f0; }
html.dark .bg-surface-container-low { background-color: #0f172a; }
html.dark .border-slate-200 { border-color: rgba(148, 163, 184, 0.18); }
html.dark .text-primary { color: #e2e8f0; }
html.dark .text-on-surface { color: #e2e8f0; }
html.dark .text-on-surface-variant { color: #94a3b8; }
html.dark .text-outline { color: #64748b; }
html.dark .apexcharts-tooltip {
    background: #111a2e !important; color: #e2e8f0 !important;
    border-color: rgba(148,163,184,0.24) !important;
}
html.dark .apexcharts-tooltip-title {
    background: #0f172a !important;
    border-bottom-color: rgba(148,163,184,0.24) !important;
}
html.dark #top-bar { background: rgba(15, 23, 42, 0.8) !important; }

/* ========== TABULAR NUMS EM KPI ========== */
[data-animate-value], .tabular-nums { font-variant-numeric: tabular-nums; }

/* ApexCharts overrides */
.apexcharts-tooltip { border-radius: 8px !important; border: 1px solid #e5e7eb !important; }
.apexcharts-tooltip-title { background: #f2f4f6 !important; border-bottom: 1px solid #e5e7eb !important; }
```

---

## ⚙️ JAVASCRIPT COMPLETO (Namespace Borg)

```javascript
var Borg = (function() {
    'use strict';

    // ========== ESTADO CENTRALIZADO ==========
    var state = {
        activeView: '',
        sidebarOpen: false,
        charts: {},
        chartConfigs: {},
        tables: {},
        filters: {},
        modalOpen: false
    };

    // ========== UTILITIES ==========
    function deepMerge(target, source) {
        for (var key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    function debounce(fn, ms) {
        var timer;
        return function() {
            var args = arguments, context = this;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(context, args); }, ms);
        };
    }

    function formatBRL(val) {
        return val == null ? '' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatNumber(val) {
        if (val == null) return '';
        if (Math.abs(val) >= 1000000) return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
        if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'K';
        return val.toLocaleString('pt-BR');
    }

    function formatCompact(val) {
        if (val == null) return '';
        var abs = Math.abs(val);
        if (abs >= 1e9) return (val / 1e9).toFixed(1).replace('.', ',') + ' bi';
        if (abs >= 1e6) return (val / 1e6).toFixed(1).replace('.', ',') + ' mi';
        if (abs >= 1e3) return (val / 1e3).toFixed(1).replace('.', ',') + ' mil';
        return val.toLocaleString('pt-BR');
    }

    function formatPercent(val, decimals) {
        if (val == null) return '';
        decimals = decimals == null ? 1 : decimals;
        return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%';
    }

    function formatDateBR(dateStr) {
        if (!dateStr) return '';
        var d = dateStr instanceof Date ? dateStr : new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        return dd + '/' + mm + '/' + d.getFullYear();
    }

    function formatTimeAgo(dateStr) {
        if (!dateStr) return '';
        var d = dateStr instanceof Date ? dateStr : new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        var diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'agora';
        if (diff < 3600) return 'há ' + Math.floor(diff / 60) + ' min';
        if (diff < 86400) return 'há ' + Math.floor(diff / 3600) + 'h';
        if (diff < 2592000) return 'há ' + Math.floor(diff / 86400) + 'd';
        return formatDateBR(d);
    }

    function scrollToEl(selector, offset) {
        var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return;
        var y = el.getBoundingClientRect().top + window.pageYOffset - (offset || 80);
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // ========== SIDEBAR ==========
    function toggleSidebar() {
        var sidebar = document.getElementById('sidebar');
        var elements = document.querySelectorAll('.main-content');
        var backdrop = document.getElementById('sidebar-backdrop');
        var menuBtn = document.querySelector('[aria-controls="sidebar"]');
        var isMobile = window.innerWidth <= 1024;

        if (sidebar.classList.contains('sidebar-collapsed')) {
            sidebar.classList.replace('sidebar-collapsed', 'sidebar-expanded');
            elements.forEach(function(el) { el.classList.add('main-content-expanded'); });
            state.sidebarOpen = true;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
            if (isMobile && backdrop) backdrop.classList.remove('hidden');
        } else {
            sidebar.classList.replace('sidebar-expanded', 'sidebar-collapsed');
            elements.forEach(function(el) { el.classList.remove('main-content-expanded'); });
            state.sidebarOpen = false;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
            if (backdrop) backdrop.classList.add('hidden');
        }
    }

    // ========== VIEW SWITCHING ==========
    function switchView(viewName) {
        document.querySelectorAll('.detail-drawer.open').forEach(function(d) { d.classList.remove('open'); });

        var previousView = state.activeView;
        if (previousView) destroyChartsInView('view-' + previousView);

        document.querySelectorAll('.view-section').forEach(function(s) { s.classList.add('hidden'); });

        var target = document.getElementById('view-' + viewName);
        if (target) {
            target.classList.remove('hidden');
            target.style.animation = 'none';
            target.offsetHeight;
            target.style.animation = '';
        }

        state.activeView = viewName;

        document.querySelectorAll('.nav-item').forEach(function(item) {
            var isActive = item.dataset.view === viewName;
            item.classList.toggle('text-white', isActive);
            item.classList.toggle('border-l-2', isActive);
            item.classList.toggle('border-surface-tint', isActive);
            item.classList.toggle('bg-[#162A4E]', isActive);
            item.classList.toggle('text-on-primary-container', !isActive);
            if (isActive) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });

        var pageTitle = document.getElementById('page-title');
        var activeItem = document.querySelector('.nav-item[data-view="' + viewName + '"]');
        if (pageTitle && activeItem) {
            var label = activeItem.querySelector('.nav-text');
            if (label) pageTitle.textContent = label.textContent;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        initAnimatedValues(target);
        initChartsInView('view-' + viewName);

        if (window.innerWidth <= 1024 && state.sidebarOpen) toggleSidebar();
    }

    // ========== CHART LIFECYCLE ==========
    function createChart(elementId, specificOptions) {
        var container = document.getElementById(elementId);
        if (!container) { console.warn('[Borg] Container #' + elementId + ' não encontrado'); return null; }

        try {
            if (state.charts[elementId]) { state.charts[elementId].destroy(); delete state.charts[elementId]; }
            var merged = deepMerge(JSON.parse(JSON.stringify(borgChartDefaults)), specificOptions);
            var chart = new ApexCharts(container, merged);
            chart.render();
            state.charts[elementId] = chart;
            state.chartConfigs[elementId] = specificOptions;
            return chart;
        } catch (error) {
            console.error('[Borg] Erro ao criar gráfico #' + elementId + ':', error);
            container.innerHTML =
                '<div class="flex flex-col items-center justify-center h-[280px] text-center">' +
                '<span class="material-symbols-outlined text-4xl text-error mb-2">error_outline</span>' +
                '<p class="text-sm font-medium text-on-surface-variant mb-3">Erro ao carregar gráfico</p>' +
                '<button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-slate-50 rounded-lg transition-colors border border-slate-200" ' +
                'onclick="Borg.retryChart(\'' + elementId + '\')">Tentar novamente</button></div>';
            return null;
        }
    }

    function retryChart(elementId) {
        var config = state.chartConfigs[elementId];
        if (config) {
            var container = document.getElementById(elementId);
            if (container) container.innerHTML = '';
            createChart(elementId, config);
        }
    }

    function destroyChartsInView(viewId) {
        var view = document.getElementById(viewId);
        if (!view) return;
        view.querySelectorAll('[id^="chart-"], [id^="spark-"]').forEach(function(el) {
            if (state.charts[el.id]) { state.charts[el.id].destroy(); delete state.charts[el.id]; }
        });
    }

    function initChartsInView(viewId) {
        document.dispatchEvent(new CustomEvent('borg:viewActivated', { detail: { viewId: viewId } }));
    }

    function openChartFullscreen(chartId, title) {
        var config = state.chartConfigs[chartId];
        if (!config) return;
        var modalTitle = document.getElementById('modal-title');
        var modalBody = document.getElementById('modal-body');
        if (modalTitle) modalTitle.textContent = title || 'Gráfico';
        if (modalBody) {
            modalBody.innerHTML = '<div id="modal-chart" class="w-full" style="min-height:500px"></div>';
            openModal();
            setTimeout(function() {
                var fc = JSON.parse(JSON.stringify(config));
                fc.chart = fc.chart || {};
                fc.chart.height = 500;
                createChart('modal-chart', fc);
            }, 300);
        }
    }

    // ========== DRAWERS ==========
    function openDrawer(drawerId, data) {
        var drawer = document.getElementById(drawerId);
        if (!drawer) return;
        if (data) {
            Object.keys(data).forEach(function(key) {
                var el = drawer.querySelector('[data-field="' + key + '"]');
                if (el) el.textContent = data[key];
            });
        }
        drawer.classList.add('open');
        setTimeout(function() {
            drawer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            trapFocus(drawer);
        }, 100);
    }

    function closeDrawer(drawerId) {
        var el = document.getElementById(drawerId);
        if (el) { el.classList.remove('open'); releaseFocus(); }
    }

    // ========== MODAL ==========
    function openModal() {
        var overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            state.modalOpen = true;
            document.body.style.overflow = 'hidden';
            trapFocus(overlay);
        }
    }

    function closeModal() {
        var overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            state.modalOpen = false;
            document.body.style.overflow = '';
            releaseFocus();
            if (state.charts['modal-chart']) { state.charts['modal-chart'].destroy(); delete state.charts['modal-chart']; }
        }
    }

    // ========== FOCUS TRAP ==========
    var focusTrapElement = null, previousFocus = null;

    function trapFocus(element) {
        previousFocus = document.activeElement;
        focusTrapElement = element;
        var focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) focusable[0].focus();
    }

    function releaseFocus() {
        focusTrapElement = null;
        if (previousFocus) previousFocus.focus();
    }

    document.addEventListener('keydown', function(e) {
        if (!focusTrapElement) return;
        if (e.key === 'Tab') {
            var focusable = focusTrapElement.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            var first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
    });

    // ========== ANIMATED VALUES ==========
    function animateValue(el, target, duration) {
        duration = duration || 1200;
        var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
        var isDecimal = String(target).includes('.');
        var startTime = performance.now();
        function update(currentTime) {
            var progress = Math.min((currentTime - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = target * eased;
            if (isDecimal) el.textContent = prefix + current.toFixed(1) + suffix;
            else if (target >= 1000000) el.textContent = prefix + (current / 1000000).toFixed(1) + suffix;
            else el.textContent = prefix + Math.floor(current).toLocaleString('pt-BR') + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function initAnimatedValues(container) {
        var root = container || document;
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    var target = parseFloat(entry.target.dataset.target);
                    if (!isNaN(target)) animateValue(entry.target, target);
                }
            });
        }, { threshold: 0.3 });
        root.querySelectorAll('[data-animate-value]').forEach(function(el) {
            el.dataset.animated = '';
            observer.observe(el);
        });
    }

    // ========== TABLE SORT ==========
    var sortTableDebounced = debounce(function(tableId, colIndex) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var tbody = table.querySelector('tbody');
        var rows = Array.from(tbody.querySelectorAll('tr:not(.table-total-row):not(.hidden-by-filter):not(.hidden-by-page)'));
        var totalRow = tbody.querySelector('.table-total-row');
        var dir = table.dataset.sortDir === 'asc' ? 'desc' : 'asc';
        table.dataset.sortDir = dir;

        rows.sort(function(a, b) {
            var aVal = a.cells[colIndex] ? a.cells[colIndex].textContent.trim() : '';
            var bVal = b.cells[colIndex] ? b.cells[colIndex].textContent.trim() : '';
            var aNum = parseFloat(aVal.replace(/[^0-9.\-]/g, ''));
            var bNum = parseFloat(bVal.replace(/[^0-9.\-]/g, ''));
            if (!isNaN(aNum) && !isNaN(bNum)) return dir === 'asc' ? aNum - bNum : bNum - aNum;
            return dir === 'asc' ? aVal.localeCompare(bVal, 'pt-BR') : bVal.localeCompare(aVal, 'pt-BR');
        });

        rows.forEach(function(row) { tbody.appendChild(row); });
        if (totalRow) tbody.appendChild(totalRow);

        table.querySelectorAll('th').forEach(function(th) {
            var icon = th.querySelector('.sort-icon');
            if (icon) { icon.textContent = 'swap_vert'; icon.classList.add('opacity-40'); }
            th.setAttribute('aria-sort', 'none');
        });
        var activeHeader = table.querySelectorAll('th')[colIndex];
        if (activeHeader) {
            var icon = activeHeader.querySelector('.sort-icon');
            if (icon) { icon.textContent = dir === 'asc' ? 'arrow_upward' : 'arrow_downward'; icon.classList.remove('opacity-40'); }
            activeHeader.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
        }
        if (state.tables[tableId]) { state.tables[tableId].currentPage = 1; applyPagination(tableId); }
    }, 150);

    function sortTable(tableId, colIndex) { sortTableDebounced(tableId, colIndex); }

    // ========== TABLE FILTER ==========
    var filterTableDebounced = debounce(function(tableId, query) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var rows = table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)');
        var q = query.toLowerCase().trim();
        rows.forEach(function(row) {
            if (!q) { row.classList.remove('hidden-by-filter', 'hidden'); }
            else {
                if (row.textContent.toLowerCase().includes(q)) row.classList.remove('hidden-by-filter', 'hidden');
                else { row.classList.add('hidden-by-filter', 'hidden'); }
            }
        });
        if (state.tables[tableId]) { state.tables[tableId].currentPage = 1; applyPagination(tableId); }
    }, 200);

    function filterTable(tableId, query) { filterTableDebounced(tableId, query); }

    // ========== TABLE PAGINATION ==========
    function initPagination(tableId, rowsPerPage) {
        state.tables[tableId] = { currentPage: 1, rowsPerPage: rowsPerPage || 10 };
        applyPagination(tableId);
    }

    function paginateTable(tableId, direction) {
        var ts = state.tables[tableId];
        if (!ts) return;
        if (direction === 'next') ts.currentPage++;
        if (direction === 'prev') ts.currentPage--;
        applyPagination(tableId);
    }

    function applyPagination(tableId) {
        var ts = state.tables[tableId];
        if (!ts) return;
        var table = document.getElementById(tableId);
        if (!table) return;
        var allRows = Array.from(table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row):not(.hidden-by-filter)'));
        var totalRows = allRows.length;
        var totalPages = Math.max(1, Math.ceil(totalRows / ts.rowsPerPage));
        if (ts.currentPage > totalPages) ts.currentPage = totalPages;
        if (ts.currentPage < 1) ts.currentPage = 1;
        var start = (ts.currentPage - 1) * ts.rowsPerPage, end = start + ts.rowsPerPage;

        allRows.forEach(function(row, i) {
            if (i >= start && i < end) row.classList.remove('hidden-by-page', 'hidden');
            else { row.classList.add('hidden-by-page', 'hidden'); }
        });

        var infoEl = document.getElementById(tableId + '-pagination-info');
        if (infoEl) infoEl.textContent = (totalRows > 0 ? start + 1 : 0) + '-' + Math.min(end, totalRows) + ' de ' + totalRows + ' registros';
        var pageEl = document.getElementById(tableId + '-page-indicator');
        if (pageEl) pageEl.textContent = ts.currentPage + ' / ' + totalPages;

        var parent = table.closest('.bg-white');
        if (parent) {
            var prevBtn = parent.querySelector('[aria-label="Página anterior"]');
            var nextBtn = parent.querySelector('[aria-label="Próxima página"]');
            if (prevBtn) prevBtn.disabled = ts.currentPage <= 1;
            if (nextBtn) nextBtn.disabled = ts.currentPage >= totalPages;
        }
    }

    // ========== TABLE EXPORT CSV ==========
    function exportCSV(tableId, filename) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var rows = table.querySelectorAll('tr:not(.hidden-by-filter)');
        var csv = [];
        rows.forEach(function(row) {
            var cols = row.querySelectorAll('th, td');
            var rowData = [];
            cols.forEach(function(col) {
                if (col.querySelector('input[type="checkbox"]')) return;
                var text = col.textContent.replace(/swap_vert|arrow_upward|arrow_downward/g, '').trim();
                rowData.push('"' + text.replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (filename || 'dados') + '.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('CSV exportado com sucesso', 'success');
    }

    // ========== TABLE FULLSCREEN ==========
    function openTableFullscreen(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var modalTitle = document.getElementById('modal-title');
        var modalBody = document.getElementById('modal-body');
        var caption = table.querySelector('caption');
        if (modalTitle) modalTitle.textContent = caption ? caption.textContent : 'Tabela';
        if (modalBody) {
            modalBody.innerHTML = '<div class="overflow-x-auto">' + table.parentElement.innerHTML + '</div>';
            openModal();
        }
    }

    // ========== ROW EXPAND ==========
    function toggleRowExpand(triggerRow, detailId) {
        var detail = document.getElementById(detailId);
        if (!detail) return;
        var icon = triggerRow.querySelector('.expand-icon');
        var isOpen = !detail.classList.contains('hidden');
        if (isOpen) {
            detail.classList.add('hidden');
            if (icon) icon.classList.remove('expanded');
            triggerRow.setAttribute('aria-expanded', 'false');
        } else {
            detail.classList.remove('hidden');
            if (icon) icon.classList.add('expanded');
            triggerRow.setAttribute('aria-expanded', 'true');
        }
    }

    // ========== BULK ACTIONS ==========
    function toggleAllRows(tableId, checked) {
        var table = document.getElementById(tableId);
        if (!table) return;
        table.querySelectorAll('.row-check').forEach(function(cb) { cb.checked = checked; });
        updateBulkActions(tableId);
    }

    function updateBulkActions(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var checked = table.querySelectorAll('.row-check:checked');
        var bulkBar = document.getElementById(tableId + '-bulk-bar');
        var countEl = document.getElementById(tableId + '-selected-count');
        if (bulkBar) {
            if (checked.length > 0) { bulkBar.classList.remove('hidden'); if (countEl) countEl.textContent = checked.length; }
            else bulkBar.classList.add('hidden');
        }
    }

    function exportSelectedCSV(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var csv = [];
        var headerRow = [];
        table.querySelectorAll('th').forEach(function(th) {
            if (th.querySelector('input[type="checkbox"]')) return;
            headerRow.push('"' + th.textContent.replace(/swap_vert|arrow_upward|arrow_downward/g, '').trim().replace(/"/g, '""') + '"');
        });
        csv.push(headerRow.join(';'));
        table.querySelectorAll('.row-check:checked').forEach(function(cb) {
            var row = cb.closest('tr');
            var rowData = [];
            row.querySelectorAll('td').forEach(function(td) {
                if (td.querySelector('input[type="checkbox"]')) return;
                rowData.push('"' + td.textContent.trim().replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'selecionados.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        showToast(table.querySelectorAll('.row-check:checked').length + ' registros exportados', 'success');
    }

    // ========== TABS ==========
    function switchTab(tabBtn, panelId) {
        var tablist = tabBtn.closest('[role="tablist"]');
        if (!tablist) return;
        var container = tablist.parentElement;
        tablist.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.classList.remove('text-primary', 'font-semibold', 'border-surface-tint');
            btn.classList.add('text-on-surface-variant', 'font-medium', 'border-transparent');
            btn.setAttribute('aria-selected', 'false');
        });
        container.querySelectorAll('[role="tabpanel"]').forEach(function(panel) { panel.classList.add('hidden'); });
        tabBtn.classList.remove('text-on-surface-variant', 'font-medium', 'border-transparent');
        tabBtn.classList.add('text-primary', 'font-semibold', 'border-surface-tint');
        tabBtn.setAttribute('aria-selected', 'true');
        var panel = document.getElementById(panelId);
        if (panel) panel.classList.remove('hidden');
    }

    // ========== FILTERS ==========
    function applyFilters() {
        var search = document.getElementById('filter-search');
        var period = document.getElementById('filter-period');
        var category = document.getElementById('filter-category');
        state.filters = {
            search: search ? search.value : '',
            period: period ? period.value : '',
            category: category ? category.value : ''
        };
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersApplied', { detail: state.filters }));
        showToast('Filtros aplicados', 'info');
    }

    function clearFilters() {
        var search = document.getElementById('filter-search');
        var period = document.getElementById('filter-period');
        var category = document.getElementById('filter-category');
        if (search) search.value = '';
        if (period) period.selectedIndex = 2;
        if (category) category.selectedIndex = 0;
        state.filters = {};
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersCleared'));
        showToast('Filtros limpos', 'info');
    }

    function removeFilter(key) {
        delete state.filters[key];
        var el = document.getElementById('filter-' + key);
        if (el) { if (el.tagName === 'INPUT') el.value = ''; if (el.tagName === 'SELECT') el.selectedIndex = 0; }
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersApplied', { detail: state.filters }));
    }

    function updateFilterChips() {
        var container = document.getElementById('active-filters');
        if (!container) return;
        var chips = [];
        Object.keys(state.filters).forEach(function(key) {
            var val = state.filters[key];
            if (val && val !== 'Todas' && val !== '') {
                chips.push(
                    '<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-sm text-on-surface-variant rounded-[9999px] border border-slate-200">' +
                    key + ': ' + val +
                    '<button class="ml-1 hover:text-error transition-colors" onclick="Borg.removeFilter(\'' + key + '\')" aria-label="Remover filtro ' + key + '">' +
                    '<span class="material-symbols-outlined text-xs">close</span></button></span>'
                );
            }
        });
        if (chips.length > 0) { container.innerHTML = chips.join(''); container.classList.remove('hidden'); container.classList.add('flex'); }
        else { container.classList.add('hidden'); container.classList.remove('flex'); }
    }

    // ========== CROSS-FILTERING ==========
    function crossFilter(sourceChartId, targetTableId, categoryIndex, categories) {
        var table = document.getElementById(targetTableId);
        if (!table) return;
        var category = categories[categoryIndex];
        table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)').forEach(function(row) {
            var cellText = row.cells[0] ? row.cells[0].textContent.trim() : '';
            if (cellText.toLowerCase().includes(category.toLowerCase())) {
                row.classList.remove('hidden');
                row.style.background = '#f0f4ff';
            } else row.classList.add('hidden');
        });
        showToast('Filtrado por: ' + category, 'info');
    }

    function clearCrossFilter(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)').forEach(function(row) {
            row.classList.remove('hidden');
            row.style.background = '';
        });
    }

    // ========== TOAST ==========
    function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toast-container');
        if (!container) return;
        var icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
        var colors = {
            success: 'bg-green-50 text-green-700 border-green-200',
            error: 'bg-red-50 text-error border-red-200',
            info: 'bg-blue-50 text-surface-tint border-blue-200',
            warning: 'bg-amber-50 text-on-tertiary-container border-amber-200'
        };
        var toast = document.createElement('div');
        toast.className = 'toast-animate px-5 py-3 rounded-xl border ' + (colors[type] || colors.info) +
                          ' shadow-lg flex items-center gap-3 text-sm font-medium';
        toast.setAttribute('role', 'status');
        toast.innerHTML = '<span class="material-symbols-outlined text-lg" aria-hidden="true">' + (icons[type] || 'info') + '</span>' + message;
        container.appendChild(toast);
        setTimeout(function() {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ========== REVEAL ON SCROLL ==========
    function initReveal(root) {
        root = root || document;
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var targets = root.querySelectorAll('.reveal');
        if (!targets.length) return;
        if (prefersReduced) {
            targets.forEach(function(el) { el.classList.add('revealed'); });
            return;
        }
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(function(el) { observer.observe(el); });
    }

    // ========== RIPPLE EFFECT ==========
    function attachRipple(el) {
        if (!el || el.dataset.rippleAttached) return;
        el.dataset.rippleAttached = '1';
        el.classList.add('has-ripple');
        el.addEventListener('click', function(e) {
            var rect = el.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var wave = document.createElement('span');
            wave.className = 'ripple-wave';
            wave.style.width = wave.style.height = size + 'px';
            wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
            wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
            el.appendChild(wave);
            setTimeout(function() { wave.remove(); }, 600);
        });
    }

    function initRipples(root) {
        (root || document).querySelectorAll('[data-ripple]').forEach(attachRipple);
    }

    // ========== DARK MODE ==========
    function toggleDarkMode() {
        var html = document.documentElement;
        var isDark = html.classList.toggle('dark');
        html.classList.toggle('light', !isDark);
        try { localStorage.setItem('borg-theme', isDark ? 'dark' : 'light'); } catch (e) {}
        showToast('Tema ' + (isDark ? 'escuro' : 'claro') + ' ativado', 'info');
        // Re-render charts para aplicar tema
        Object.keys(state.charts).forEach(function(id) {
            var cfg = state.chartConfigs[id];
            if (cfg) {
                state.charts[id].destroy();
                delete state.charts[id];
                createChart(id, cfg);
            }
        });
    }

    function restoreTheme() {
        try {
            var saved = localStorage.getItem('borg-theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            }
        } catch (e) {}
    }

    // ========== EXPORT PDF (print-based) ==========
    function exportPDF(filename) {
        var originalTitle = document.title;
        if (filename) document.title = filename;
        showToast('Preparando PDF...', 'info');
        setTimeout(function() {
            window.print();
            document.title = originalTitle;
        }, 400);
    }

    // ========== COMMAND PALETTE (Cmd/Ctrl + K) ==========
    var commandPalette = {
        commands: [],
        activeIndex: 0,
        filtered: [],
        register: function(cmd) {
            // cmd = { id, label, hint, icon, action }
            this.commands.push(cmd);
        },
        open: function() {
            var overlay = document.getElementById('cmd-palette-overlay');
            if (!overlay) return;
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            var input = document.getElementById('cmd-palette-input');
            if (input) { input.value = ''; input.focus(); }
            this.filtered = this.commands.slice();
            this.activeIndex = 0;
            this.renderResults();
            trapFocus(overlay);
        },
        close: function() {
            var overlay = document.getElementById('cmd-palette-overlay');
            if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
            releaseFocus();
        },
        search: function(query) {
            var q = (query || '').toLowerCase().trim();
            this.filtered = q ?
                this.commands.filter(function(c) { return c.label.toLowerCase().includes(q) || (c.hint && c.hint.toLowerCase().includes(q)); }) :
                this.commands.slice();
            this.activeIndex = 0;
            this.renderResults();
        },
        renderResults: function() {
            var list = document.getElementById('cmd-palette-results');
            if (!list) return;
            if (!this.filtered.length) {
                list.innerHTML = '<div class="px-4 py-6 text-center text-sm text-on-surface-variant">Nenhum comando encontrado</div>';
                return;
            }
            var html = '';
            var self = this;
            this.filtered.forEach(function(cmd, idx) {
                html += '<button type="button" class="cmd-item w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors" data-active="' + (idx === self.activeIndex) + '" onclick="Borg.commandPalette.execute(' + idx + ')">';
                html += '<span class="material-symbols-outlined text-base text-on-surface-variant">' + (cmd.icon || 'bolt') + '</span>';
                html += '<span class="flex-1 text-sm font-medium text-primary">' + cmd.label + '</span>';
                if (cmd.hint) html += '<span class="text-xs text-on-surface-variant">' + cmd.hint + '</span>';
                html += '</button>';
            });
            list.innerHTML = html;
        },
        move: function(delta) {
            if (!this.filtered.length) return;
            this.activeIndex = (this.activeIndex + delta + this.filtered.length) % this.filtered.length;
            this.renderResults();
            var active = document.querySelector('.cmd-item[data-active="true"]');
            if (active) active.scrollIntoView({ block: 'nearest' });
        },
        execute: function(index) {
            index = index == null ? this.activeIndex : index;
            var cmd = this.filtered[index];
            if (cmd && typeof cmd.action === 'function') {
                this.close();
                setTimeout(function() { cmd.action(); }, 50);
            }
        }
    };

    // ========== KEYBOARD SHORTCUTS ==========
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + K → Command Palette
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            commandPalette.open();
            return;
        }
        // Cmd/Ctrl + D → Dark mode
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
            e.preventDefault();
            toggleDarkMode();
            return;
        }
        // Navegação dentro do command palette
        var overlay = document.getElementById('cmd-palette-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            if (e.key === 'ArrowDown') { e.preventDefault(); commandPalette.move(1); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); commandPalette.move(-1); return; }
            if (e.key === 'Enter') { e.preventDefault(); commandPalette.execute(); return; }
            if (e.key === 'Escape') { e.preventDefault(); commandPalette.close(); return; }
        }
        if (e.key === 'Escape') {
            if (state.modalOpen) { closeModal(); return; }
            var od = document.querySelector('.detail-drawer.open');
            if (od) { closeDrawer(od.id); return; }
            if (state.sidebarOpen && window.innerWidth <= 1024) { toggleSidebar(); return; }
        }
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            var navItems = document.querySelectorAll('.nav-item[data-view]');
            var index = parseInt(e.key) - 1;
            if (navItems[index]) switchView(navItems[index].dataset.view);
        }
        if (e.ctrlKey && e.key === 'f') {
            var si = document.getElementById('filter-search');
            if (si) { e.preventDefault(); si.focus(); }
        }
        if (e.key === 'Enter' || e.key === ' ') {
            var t = document.activeElement;
            if (t && t.classList.contains('nav-item')) {
                e.preventDefault();
                if (t.dataset.view) switchView(t.dataset.view);
            }
        }
    });

   

// ========== INITIALIZATION ==========
function init() {
    restoreTheme();
    initAnimatedValues();
    initReveal();
    initRipples();

    var firstView = document.querySelector('.view-section:not(.hidden)');
    if (firstView) state.activeView = firstView.id.replace('view-', '');

    // Correção: Sincronizar estado visual do sidebar no load inicial
    var sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('sidebar-expanded')) {
        document.querySelectorAll('.main-content').forEach(function(el) { 
            el.classList.add('main-content-expanded'); 
        });
        state.sidebarOpen = true;
    }

    document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
        item.addEventListener('click', function() { switchView(this.dataset.view); });
    });

    document.querySelectorAll('[id$="-pagination-info"]').forEach(function(el) {
        var tableId = el.id.replace('-pagination-info', '');
        if (document.getElementById(tableId)) initPagination(tableId, 10);
    });

    // Command Palette — comandos default
    commandPalette.register({ id: 'theme', label: 'Alternar tema claro/escuro', hint: 'Ctrl+D', icon: 'dark_mode', action: toggleDarkMode });
    commandPalette.register({ id: 'pdf', label: 'Exportar dashboard como PDF', hint: 'Ctrl+P', icon: 'picture_as_pdf', action: function() { exportPDF(); } });
    commandPalette.register({ id: 'clearfilters', label: 'Limpar todos os filtros', icon: 'filter_alt_off', action: clearFilters });
    document.querySelectorAll('.nav-item[data-view]').forEach(function(item, idx) {
        var label = item.querySelector('.nav-text');
        commandPalette.register({
            id: 'goto-' + item.dataset.view,
            label: 'Ir para: ' + (label ? label.textContent.trim() : item.dataset.view),
            hint: 'Ctrl+' + (idx + 1),
            icon: 'arrow_forward',
            action: function() { switchView(item.dataset.view); }
        });
    });

    // Hook de busca do command palette
    var cmdInput = document.getElementById('cmd-palette-input');
    if (cmdInput) {
        cmdInput.addEventListener('input', function() { commandPalette.search(this.value); });
    }

    // Atualizar timestamp "há X min" periodicamente
    document.querySelectorAll('[data-time-ago]').forEach(function(el) {
        el.textContent = formatTimeAgo(el.dataset.timeAgo);
    });

    // Inicializar drag-and-drop se dropzone existir
    if (typeof initDragDrop === 'function') initDragDrop();
}

// ========== PUBLIC API ==========
return {
    state: state,
    toggleSidebar: toggleSidebar,
    switchView: switchView,
    createChart: createChart,
    retryChart: retryChart,
    openChartFullscreen: openChartFullscreen,
    destroyChartsInView: destroyChartsInView,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openModal: openModal,
    closeModal: closeModal,
    sortTable: sortTable,
    filterTable: filterTable,
    paginateTable: paginateTable,
    initPagination: initPagination,
    exportCSV: exportCSV,
    openTableFullscreen: openTableFullscreen,
    toggleRowExpand: toggleRowExpand,
    toggleAllRows: toggleAllRows,
    updateBulkActions: updateBulkActions,
    exportSelectedCSV: exportSelectedCSV,
    switchTab: switchTab,
    applyFilters: applyFilters,
    clearFilters: clearFilters,
    removeFilter: removeFilter,
    crossFilter: crossFilter,
    clearCrossFilter: clearCrossFilter,
    showToast: showToast,
    initAnimatedValues: initAnimatedValues,
    animateValue: animateValue,
    debounce: debounce,
    formatBRL: formatBRL,
    formatNumber: formatNumber,
    formatCompact: formatCompact,
    formatPercent: formatPercent,
    formatDateBR: formatDateBR,
    formatTimeAgo: formatTimeAgo,
    scrollToEl: scrollToEl,
    deepMerge: deepMerge,
    // Polimento avançado
    initReveal: initReveal,
    attachRipple: attachRipple,
    initRipples: initRipples,
    toggleDarkMode: toggleDarkMode,
    exportPDF: exportPDF,
    commandPalette: commandPalette,
    // Upload
    handleFileUpload: typeof handleFileUpload !== 'undefined' ? handleFileUpload : null,
    showDataPreview: typeof showDataPreview !== 'undefined' ? showDataPreview : null,
    confirmDataLoad: typeof confirmDataLoad !== 'undefined' ? confirmDataLoad : null,
    clearUpload: typeof clearUpload !== 'undefined' ? clearUpload : null,
    downloadTemplate: typeof downloadTemplate !== 'undefined' ? downloadTemplate : null,
    updateColumnMapping: typeof updateColumnMapping !== 'undefined' ? updateColumnMapping : null,
    switchSheet: typeof switchSheet !== 'undefined' ? switchSheet : null,
    initDragDrop: typeof initDragDrop !== 'undefined' ? initDragDrop : null,
    // Init
    init: init
};
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Borg.init);
} else {
    Borg.init();
}
```

---

## 🚫 PROIBIDO

| Proibido | Motivo |
|----------|--------|
| Dark mode como tema padrão | Dashboard corporativo diurno |
| Glassmorphism em CARDS | Apenas topbar com backdrop-blur |
| Gradientes em cards ou sidebar | Poluição visual |
| Neon / glow / brilho | Incompatível com BI corporativo |
| Cards com fundo escuro | Exceto total row e KPI Hero |
| Sombras maiores que shadow-sm | Exceto drawer shadow-lg e modal shadow-2xl |
| Fontes decorativas | Apenas Inter |
| Animações pesadas | Performance e acessibilidade |
| Scroll horizontal em body | Apenas em tabelas com overflow-x-auto |
| Chart.js, D3.js, ECharts | Usar ApexCharts |
| Lucide, Font Awesome, Heroicons | Usar Material Symbols |
| React, Vue, Angular, jQuery | Vanilla JS |
| Cores fora da paleta Tailwind config | Consistência visual |
| `rounded-full` para pill shapes | Usar `rounded-[9999px]` |
| Arquivos separados | Tudo no mesmo HTML |
| `href="#"` em nav items | Usar data-view + click handler |
| Gráficos SEM borgChartDefaults | Consistência obrigatória |
| Tabelas SEM linha total | Sempre ter total sticky |
| Funções globais (sem namespace) | Usar `Borg.funcao()` |
| Charts sem lazy loading | Renderizar apenas na view ativa |
| Componentes sem ARIA | Acessibilidade obrigatória |
| Mais de 5 KPIs por view | Hick's Law |
| Gráficos sem `aria-label` | Acessibilidade |
| Tabelas sem `<caption>` | Acessibilidade |

---

## 📋 REGRAS DE CRIAÇÃO

### O que é FIXO (nunca muda)

- Stack técnica completa
- Tailwind config com 33 cores M3
- Border-radius custom
- Sidebar: design, cores, animação, mecânica, ARIA
- Topbar: design, backdrop-blur, título dinâmico, timestamp
- Tipografia: todos os tamanhos/pesos
- Espaçamentos (sistema de 8 pontos)
- CSS customizado completo
- JavaScript namespace Borg completo
- Skip navigation, focus trap, toast aria-live
- Lazy loading e chart lifecycle
- Se o dashboard tem upload de planilha e quais colunas espera

### O que é LIVRE (muda por dashboard)

- Quantidade e nomes das views
- Ícones dos nav items
- Conteúdo de cada view
- Quais componentes usar
- Se tem alertas, filtros, tabs
- Quantidade de KPIs (3-5), se tem Hero
- Tipos de gráficos e dados
- Nome/ícone do projeto
- Sidebar: logo, subtítulo, user info, grupos

### Layouts com/sem alertas

```
COM alertas:
  Conteúdo: col-span-12 lg:col-span-10 space-y-6
  Alertas:  col-span-12 lg:col-span-2

SEM alertas:
  Conteúdo: col-span-12 space-y-6
```

### Lazy loading de charts

```javascript
// Ouvir evento de ativação de view:
document.addEventListener('borg:viewActivated', function(e) {
    if (e.detail.viewId === 'view-financeiro') {
        Borg.createChart('chart-fin-1', { /* config */ });
    }
});
// View inicial no DOMContentLoaded:
document.addEventListener('DOMContentLoaded', function() {
    Borg.createChart('chart-overview', { /* config */ });
});
```

---

## ✅ CHECKLIST FINAL (54 ITENS)

| # | Item |
|---|------|
| 1 | HTML único autocontido? |
| 2 | `html class="light" lang="pt-BR"`? |
| 3 | CDN Tailwind com plugins forms + container-queries? |
| 4 | CDN ApexCharts incluído? |
| 5 | CDN Material Symbols incluído? |
| 6 | CDN Inter font incluído? |
| 7 | `<link rel="preconnect">` para cada CDN? |
| 8 | Tailwind config com 33 cores M3? |
| 9 | Border-radius custom (2/4/8/12px)? |
| 10 | Skip navigation link como primeiro elemento do body? |
| 11 | Sidebar `bg-primary-container`? |
| 12 | Sidebar `overflow-y-auto overflow-x-hidden`? |
| 13 | Sidebar 64px / 240px? |
| 14 | Sidebar `role="navigation"` + `aria-label`? |
| 15 | Sidebar backdrop em mobile? |
| 16 | Nav icons `flex-shrink-0`? |
| 17 | Nav items `transition-all` + `active:scale-95`? |
| 18 | Nav items com `data-view` (NÃO `href="#"`)? |
| 19 | Nav item ativo `aria-current="page"`? |
| 20 | Item ativo `text-white border-l-2 border-surface-tint bg-[#162A4E]`? |
| 21 | Topbar `bg-white/80 backdrop-blur-md`? |
| 22 | Topbar tem `id="page-title"`? |
| 23 | Indicador de última atualização no topbar? |
| 24 | Views `class="view-section"` + `id="view-[x]"` + `role="region"` + `aria-label`? |
| 25 | Apenas primeira view SEM `hidden`? |
| 26 | `Borg.switchView` funcional (nav + topbar + scroll + drawers + chart lifecycle)? |
| 27 | KPIs têm `data-animate-value` + `data-target`? |
| 28 | `initAnimatedValues` com IntersectionObserver? |
| 29 | Tabelas com `Borg.sortTable` nos headers? |
| 30 | Tabelas com `<caption>` semântico? |
| 31 | Tabelas th com `aria-sort`? |
| 32 | Tabelas com linha total sticky (`.table-total-row`)? |
| 33 | Gráficos usam `Borg.createChart` + `borgChartDefaults`? |
| 34 | Gráficos com `aria-label` descritivo no container? |
| 35 | Gráficos com lazy loading (só na view ativa)? |
| 36 | Charts registrados em `Borg.state.charts`? |
| 37 | `Borg.showToast` para feedback de ações? |
| 38 | Toast container com `aria-live="polite"`? |
| 39 | `prefers-reduced-motion` no CSS? |
| 40 | `focus-visible` outline definido? |
| 41 | Focus trap no drawer/modal? |
| 42 | Empty states para tabelas/gráficos sem dados? |
| 43 | Loading skeletons definidos? |
| 44 | `@media print` styles incluídos? |
| 45 | Responsividade testada (sidebar mobile, KPIs stack, tabela scroll)? |
| 46 | Valores monetários extensos em KPIs usam abreviação (K/M/B) ou classe `truncate`? |
| 47 | Layout inicial testado? (Sem sobreposição entre sidebar e conteúdo no load em desktop e mobile) |
| 48 | Motion tokens (`--dur-*`, `--ease-*`) presentes no CSS? |
| 49 | Command Palette HTML no body e registrado no init()? |
| 50 | Perfil de densidade declarado e tokens coerentes (executivo/gerencial/operacional)? |
| 51 | Storytelling — ordem das views segue padrão A/B/C? |
| 52 | Dados mock realistas conforme `mock-data-pt-br.md` (se aplicável)? |
| 53 | `card-lift` em cards interativos? |
| 54 | Dark mode funcional (se habilitado via Cmd+D ou botão)? |

> **QUALQUER item NÃO atendido deve ser CORRIGIDO antes de entregar.**

---

