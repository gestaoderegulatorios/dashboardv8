# SKILL V8: Borgonovi Dashboard Design System (dashboard-v8)

Este arquivo é a referência primária para que a AI gere dashboards V8. Leia-o antes de qualquer outro skill relacionado.

## Seção: REGRAS ABSOLUTAS
- Este design system deve ser REPLICADO, nunca interpretado.
- Quando houver dúvida, siga o código-exemplo dos arquivos de skill.
- Quando não houver exemplo, pergunte antes de inventar.
- Cada dashboard é um PROJETO V8 (npm-based, Vite, ES modules) — NÃO é apenas um HTML único.
- Views são MÓDULOS ISOLADOS em `src/view/` — cada uma com `mount(host, ctx) → unmount`.
- A quantidade de views, nomes e conteúdos é LIVRE por dashboard.
- O design, cores, tipografia e mecânicas são FIXOS.
- ACESSIBILIDADE é mandatório — testes axe-core em todo projeto.
- PERFORMANCE importa — ciclo de vida dos charts (mountChart/destroy) é obrigatório.
- STORYTELLING — a ordem dos componentes conta uma história de dados.

## Seção: LEIS INVARIANTES (V8)
- LEI 1: Sidebar Tooltip — `data-tooltip` em itens de navegação (como V7).
- LEI 2: Quebra de texto na Sidebar — `break-words`.
- LEI 3: Dark Mode Completo — via variáveis CSS em classe `.dark` no `html`. Zero `!important`.
- LEI 4: Relatórios view sempre presente.
- LEI 5: Botão de fullscreen em cada gráfico — usa atributo `data-fullscreen="chart-id"` + handler delegada.
- LEI 6: View de Configurações sempre presente.
- LEI 7: Auto-filtros — sem botão de aplicação. onChange/onInput/onSelect. Debounced via store.subscribe.
- LEI 8: Cross-Filtering — clique no gráfico filtra todos os componentes. Usa `store.set()` para propagar.
- LEI 9: Filtros de data com `<input type="date">`.
- LEI 10: Gráficos dentro do container — `mountChart()` detecta altura automaticamente. Container deve ter `w-full` + `h-[xxx]px`.

- LEI 11: Contrato de montagem/unmount — cada view EXPORTA `mount(host, ctx) → unmount`. `unmount` deve destruir gráficos e cancelar subscrições.
- LEI 12: Zero hexades codificadas — todas as cores via CSS vars (`var(--color-*)`) ou classes semânticas do Tailwind. Nenhum `bg-[#xxx]`, `stroke="#xxx"`, nem `text-[#xxx]` em JS.
- LEI 13: View ≤ 400 linhas — cada view file deve ter ≤ 400 linhas. Lógica comum deve ir para `src/domain/` ou `src/view/shared.js`.
- LEI 14: Máx. 5 KPIs por view — exceto perfil operacional (10–16). KPI Hero conta como 1.
- LEI 15: Card-tilt + border-glow — no máximo 1 KPI Hero por view pode usar `card-tilt`; no máximo 1 pode usar `border-glow`. Nunca em KPIs padrões.
- LEI 16: Store = única fonte de estado — todo estado via `store.get()` / `store.set()` / `store.subscribe()`. LocalStorage é apenas camada de persistência.

## Seção: STACK TÉCNICA V8
| Permitido | Proibido |
|---|---|
| Vite (bundler + dev server) | React, Vue, Angular, Svelte |
| ES Modules (import/export) | IIFE, var Borg = (function(){})() |
| ApexCharts via npm | Chart.js, D3.js, ECharts, CDN ApexCharts |
| Tailwind CSS via PostCSS | Tailwind CDN |
| CSS Custom Properties (vars) | Hardcoded hex em JS |
| Material Symbols Outlined | Lucide, Font Awesome, Heroicons |
| Inter font (Google Fonts) | Fontes locais |
| SheetJS (npm, optional) | XLSX CDN |
| axe-core (testing) | Testes manuais apenas |
| Vitest + jsdom | Jest, Mocha |

## Seção: TAILWIND CONFIG (V8)
| Pontos-chave |
- Tailwind configurado para trabalhar com classes semânticas e CSS vars. Principais pontos:
- `darkMode: "class"` para alternância via `.dark` no root.
- Cores referenciadas por variáveis: `colors: { primary: 'var(--color-primary)', ... }`.
- Border radii customizados: `rounded`=2px, `rounded-lg`=4px, `rounded-xl`=8px, `rounded-full`=12px.
- Fonte base: Inter.

## Seção: DESIGN TOKENS
### Cores por função (usando classes Tailwind semânticas)
| Função | Classe Tailwind |
|---|---|
| Fundo do corpo | `bg-background` |
| Fundo do cartão | `bg-surface-container-lowest` |
| Fundo da Sidebar | `bg-primary-container` |
| Hover da Sidebar | `hover:bg-white/10` |
| Topbar | `bg-surface/80 backdrop-blur-md` |
| Fundo do KPI Hero | `bg-primary-container` |
| etc. |

### Texto por função
| Função | Classe |
|---|---|
| Valor/destaque | `text-primary` |
| Corpo geral | `text-on-surface` |
| Label/subtítulo | `text-on-surface-variant` |
| etc. |

### Espaçamento (8 pontos)
- 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, ...

### Tipografia
- Inter como fonte padrão; cores definidas por CSS vars.

## Seção: PROJETO V8 — ESTRUTURA DE ARQUIVOS (detalhes)
```
dashboard-v8/
├── index.html           # Entry (~62 lines)
├── main.js              # Boot: store, views, subscribers
├── tailwind.config.js   # Tailwind (CSS vars)
├── vite.config.js       # Vite bundler
├── package.json         # sideEffects: false
├── src/
│   ├── styles/
│   │   ├── theme.css    # CSS vars (:root + .dark + theme stubs)
│   │   └── app.css      # Tailwind + CSS custom
│   ├── domain/          # Lógica pura (chart.js, filter.js, kpi.js, schema.js, etc.)
│   ├── model/           # Dados + estado (branding.js, mock.js, store.js, bus.js, etc.)
│   ├── ui/              # Componentes UI (sidebar.js, topbar.js, dark-mode.js, etc.)
│   └── view/            # Views (overview.js, works.js, finance.js, etc.)
├── test/                # Vitest + axe-core
└── public/              # Assets estáticos
```

## Seção: CONTRATO DE VIEW (THE V8 LAW)
Cada view deve seguir exatamente o padrão abaixo:
```js
import { VIEW_LABELS } from '../model/branding.js';
// ... outros imports

export function mount(host, ctx) {
  const charts = {};
  let unsubscribe = null;

  function template() { return `<section>...</section>`; }

  function destroyAllCharts() {
    Object.keys(charts).forEach(k => { try { charts[k]?.destroy(); } catch {} delete charts[k]; });
  }

  function renderAll() {
    destroyAllCharts();
    host.innerHTML = template();
    // render KPIs, mount charts, init animations
  }

  renderAll();

  unsubscribe = ctx.store.subscribe((s) => {
    // re-render quando o estado relevante mudar
  });

  return function unmount() {
    if (unsubscribe) { try { unsubscribe(); } catch {} }
    destroyAllCharts();
  };
}

export const myView = { id: 'my-view', ...VIEW_LABELS.myView, mount };
```

## Seção: TROCAR VERTICAL = 4 ARQUIVOS
Para replicar para um novo segmento, edite apenas:
1. `src/model/branding.js` — Identidade (NAV_ITEMS, BRANDING_DEFAULTS, VIEW_LABELS, etc.)
2. `src/model/content.js` — Vocabulário de domínio (ETAPAS, TIPOS, STATUS, METRIC_LABELS, etc.)
3. `src/model/mock.js` — Dados (obra → clientes/produtos)
4. `src/domain/schema.js` — Medidas, thresholds, formats

Opcional: `src/styles/theme.css` — Cores da marca

## Seção: ARQUIVOS DE REFERÊNCIA
- components-v8.md — Templates V8: KPIs, tabelas, filtros, cards, drawers, modais
- charts-v8.md — getChartDefaults(), mountChart(), paletas, exemplos
- animations-v8.md — tokens de motion, reveal, ripple, card-tilt, dark mode
- ux-guidelines.md — Perguntas obrigatórias, storytelling, padrões UX
- storytelling-patterns.md — Narrativas por domínio
- density-profiles.md — 3 perfis — Executivo, Gerencial, Operacional
- mock-data-pt-br.md — Dados placeholder realistas
- accessibility-v8.md — WCAG, axe-core, montagem de padrões
- reports-v8.md — Relatórios HTML standalone para impressão
- data-upload-v8.md — Upload de planilhas: dropzone, parser, validação

### Regra de leitura:
```
SEMPRE ler: Esta SKILL.md (core)
ANTES de codificar:
  1. ux-guidelines.md (planejamento)
  2. density-profiles.md (perfil)
  3. storytelling-patterns.md (narrativa)
DURANTE codificação:
  - components-v8.md + charts-v8.md (templates V8)
  - animations-v8.md (polimento)
  - mock-data-pt-br.md (dados)
ANTES de entregar: accessibility-v8.md (revisão WCAG)
```

## Seção: CSS COMPLETO (V8)
- Tokens de motion e animação no :root
- Transições do sidebar
- Animação de fade-in de views
- Reveal on scroll
- Card tilt, borda glow
- Efeito ripple
- Dark mode via `.dark` (sem `!important`)
- Reduced motion
- Breakpoints responsivos
- Estilos de impressão

## Seção: KEY V8 MODULES (referência, não código completo)
- `src/model/store.js` — createStore (pub/sub, ~32 linhas)
- `src/model/bus.js` — Event bus (on/emit)
- `src/model/branding.js` — Branding data (7 exports)
- `src/model/content.js` — Vocabulário de domínio (8 exports)
- `src/domain/chart.js` — mountChart, getChartDefaults, getCSSVar, paletas
- `src/domain/kpi.js` — KPIDescriptor, computeKPI, renderKPI
- `src/domain/filter.js` — filtros puros + renderBar
- `src/domain/table.js` — computeView, toggleSort, clampPage, renderTable
- `src/domain/schema.js` — Medidas, thresholds, formats
- `src/ui/sidebar.js` — mountSidebar, toggleSidebar
- `src/ui/topbar.js` — mountTopbar
- `src/ui/dark-mode.js` — isDarkMode, toggleDarkMode, initDarkMode
- `src/ui/animate.js` — animateNumber, initAnimatedValues
- `src/ui/reveal.js` — IntersectionObserver reveal
- `src/ui/command-palette.js` — Cmd+K palette
- `src/ui/modal.js` — Fullscreen chart modal
- `src/view/nav.js` — createViewController (mount/unmount/switch/remount)

## Seção: TROCAR VERTICAL = 4 ARQUIVOS (Resumo)
- Você altera apenas os quatro arquivos de modelo para criar um novo segmento: branding.js, content.js, mock.js, schema.js.

## Seção: ARQUIVOS DE REFERÊNCIA (Resumo)
- listados acima para consulta durante o desenvolvimento.

## Seção: CSS E STRUTURA VISUAL (Resumo rápido)
- Cores via CSS vars; sem hex hardcoded.
- Dark mode ativado pela classe `.dark` no root.
- Componentes com transições suaves; view: fade-in.

Esta SKILL.md serve como o documento central para orientar a replicação de dashboards V8. Use os demais arquivos de skill como guias de implementação detalhada.
