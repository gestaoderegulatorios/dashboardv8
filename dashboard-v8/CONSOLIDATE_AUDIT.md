# CONSOLIDATE_AUDIT.md — F-CONSOLIDATE S1

> Gerado em: 2026-05-02
> Branch: f-consolidate-auto
> Commit base: bad3766 (ETL_REAL)

---

## 1. Dead Code (lista priorizada por impacto)

### 1a. Imports não-usados

| Arquivo | Linha | Import | Status |
|---|---|---|---|
| main.js | 42 | `initReveal` | Usado ✅ |
| main.js | 43 | `initRipple` | Usado ✅ |

Nenhum import não-usado encontrado em main.js. Pendente verificação nos outros arquivos — aguardando explore agent.

### 1b. Exports nunca importados

| Arquivo | Export | Importado por | Status |
|---|---|---|---|
| src/model/bus.js | `on`, `emit` | main.js, sidebar.js | Usado ✅ |
| src/model/store.js | `createStore` | main.js | Usado ✅ |
| src/model/content.js | — | — | ⚠️ Verificar se alguém importa |

### 1c. Arquivos órfãos

| Arquivo | Reachable from main.js? | Status |
|---|---|---|
| src/model/content.js | Não importado por ninguém | ⚠️ Possível órfão |
| src/model/auth.js | main.js, login.js, sidebar.js | ✅ Reachable |
| Todos os demais | ✅ Reachable via main.js ou views | ✅ |

### 1d. Funções/constantes declaradas mas não chamadas

Pendente resultado do explore agent (bg_7fe557a9).

---

## 2. Duplicação (count + file:line)

### 2a. CSS Tokens em theme.css — mesmo valor em nomes diferentes

| Valor | V1 (name:line) | V2 (name:line) | V3 (name:line) | Resolução |
|---|---|---|---|---|
| `#f7f9fb` | `--color-background:43` | `--color-surface:45` | — | SKIP: semântica diferente (Material Design) |
| `#191c1e` | `--color-on-background:44` | `--color-on-surface:46` | — | SKIP: semântica diferente (MD3) |
| `#4c5e86` | `--color-surface-tint:62` | `--chart-sequential-4:84` | `--effect-text-gradient-from:120` | SKIP: domínios diferentes (surface/chart/effect) |
| `#ba1a1a` | `--color-error:38` | `--chart-status-bad:92` | — | SKIP: error vs chart — podem divergir no futuro |
| `#0a1f44` | `--color-primary-container:13` | `--chart-datalabel:99` | — | SKIP: container vs datalabel — domínios diferentes |

**Decisão conservadora**: todos os valores duplicados em theme.css são **intencionais** (Material Design 3 define tokens separados para categorias diferentes). SKIP — não extrair.

### 2b. Tailwind utility classes repetidas >3× (candidatas a extração)

| Classe | Count (views) | Extração proposta | Decisão |
|---|---|---|---|
| `col-span-12` | ~20+ | `.grid-full` | SKIP: é layout primitivo, não semântico |
| `bg-surface-container-lowest` | ~15+ | `.card-bg` | Ver S2a — card-base |
| `border border-outline-variant` | ~15+ | `.card-border` | Ver S2a — card-base |
| `shadow-sm` | ~12+ | `.card-shadow` | Ver S2a — card-base |
| `rounded-xl` | ~12+ | `.card-round` | Ver S2a — card-base |
| `bg-green-50 text-green-700` | 5 | `.status-success` | Ver S2f |
| `bg-amber-50 text-on-tertiary-container` | 4 | `.status-warning` | Ver S2f |
| `bg-red-50 text-error` | 3 | `.status-error` | Ver S2f |

### 2c. Padrões HTML repetidos (KPI card, chart card, table toolbar)

| Padrão | Views onde aparece | Count |
|---|---|---|
| KPI card (`<div class="card-base ...">...</div>`) | overview, works, finance, operational, land | ~30+ |
| Chart card com header + fullscreen btn | overview, works, finance, operational, land, reports | ~15+ |
| Table toolbar (search + filter + actions) | works, operational, finance | 3 |
| Status badge (pill span com bg-color) | table, finance, operational | ~8 |

---

## 3. Tamanho (arquivo|LOC|excede em quanto)

| Arquivo | LOC | Limite (300) | Excede | Strategy |
|---|---|---|---|---|
| main.js | 327 | 300 | +27 | S2e: split boot logic |
| src/domain/chart.js | 287 | 300 | — | OK (abaixo do limite) |
| src/view/works.js | 243 | 300 | — | OK |
| src/view/reports.js | 235 | 300 | — | OK |
| src/view/land.js | 221 | 300 | — | OK |
| src/view/finance.js | 213 | 300 | — | OK |
| src/view/settings.js | 209 | 300 | — | OK |
| src/domain/table.js | 206 | 300 | — | OK |
| src/view/operational.js | 201 | 300 | — | OK |
| src/view/upload.js | 200 | 300 | — | OK |
| src/view/overview.js | 192 | 300 | — | OK |

**Apenas 1 arquivo excede 300 LOC**: `main.js` (327 → +27).

### 3b. Funções >50 LOC

| Arquivo | Linha | Função | LOC aprox | Decisão |
|---|---|---|---|---|
| main.js | ~50-200 | `boot()` (implícita) | ~200 | S2e: extrair boot.js |
| src/view/reports.js | ~40-120 | `mount()` | ~80 | SKIP: template inline longo |
| src/view/land.js | ~30-100 | `mount()` | ~70 | SKIP: template inline longo |
| src/view/settings.js | ~30-100 | `mount()` | ~70 | SKIP: template inline longo |
| src/view/finance.js | ~30-100 | `mount()` | ~70 | SKIP: template inline longo |
| src/view/operational.js | ~30-90 | `mount()` | ~60 | SKIP: template inline longo |

**Nota**: Views com mount() >50 LOC são majoritariamente template HTML inline. A extração pra _fragments.js (S2b) reduziria isso, mas é trabalho extenso. Decisão conservadora: SKIP onde split não é óbvio.

### 3c. Template literals HTML >80 LOC

| Arquivo | Linhas | LOC | Decisão |
|---|---|---|---|
| src/view/reports.js | ~40-160 | ~80+ | SKIP: template complexo com múltiplas seções |
| src/view/land.js | ~30-100 | ~70 | OK (abaixo de 80) |

---

## 4. Hardcoded (file:line:value)

### 4a. Tailwind color classes hardcoded

| File:Line | Pattern | Count total | Decisão |
|---|---|---|---|
| src/domain/table.js:62 | `bg-green-50 text-green-700` | 2 (table.js:62,64) | S2f: criar `.status-success` |
| src/domain/table.js:63 | `bg-amber-50 text-on-tertiary-container` | 1 | S2f: criar `.status-warning` |
| src/domain/kpi.js:94 | `text-green-700` | 1 | S2f: usar `.status-success-text` |
| src/view/shared.js:24 | `bg-green-50 text-green-700 border-green-200` | 1 | S2f: usar `.status-success` |
| src/view/shared.js:25 | `bg-red-50 text-error border-red-200` | 1 | S2f: usar `.status-error` |
| src/view/operational.js:57-59 | `bg-red-50`, `bg-amber-50`, `bg-green-50` | 3 | S2f: status classes |
| src/view/finance.js:123 | `bg-green-50 text-green-700`, `bg-amber-50` | 1 | S2f: status classes |
| src/view/works.js:67 | `text-green-700` | 1 | S2f: `.status-success-text` |
| src/view/works.js:123 | `bg-green-700` | 1 | S2f: cor de barra |
| src/view/land.js:58 | `bg-amber-50` | 1 | S2f: status classes |
| src/view/land.js:87 | `text-green-700` | 1 | S2f: `.status-success-text` |
| src/ui/topbar.js:37 | `bg-amber-400 text-slate-900` | 1 | Manter: DEMO badge específico |
| src/view/reports.js:142 | `bg-amber-50 border-amber-200` | 1 | S2f: `.callout-warning` |
| src/view/upload.js:101 | `hover:bg-red-50` | 1 | Manter: hover state raro |

### 4b. Hex colors hardcoded (exceto getCSSVar fallbacks)

| File:Line | Valor | Contexto | Decisão |
|---|---|---|---|
| src/ui/sidebar.js:51 | `#162A4E` | Divider border | S2f: criar `--color-sidebar-divider` token |
| src/ui/sidebar.js:64 | `#162A4E` | User section border | Mesmo token |
| src/view/reports.js:49-74 | ~20 hex values | Print stylesheet inline | SKIP: CSS de impressão é isolado, não afeta tema |
| src/ui/login.js:29-47 | ~10 hex values | Inline styles com fallbacks | SKIP: login usa CSS vars com fallbacks hex |

**Nota**: `reports.js` hex values são CSS de impressão (stylesheet inline para PDF/HTML export). Não participam do sistema de temas. Login.js usa CSS vars com fallbacks hex — padrão aceitável.

---

## 5. Layer Leak (file:line:violation)

### 5a. src/model/* importando ui ou view

| Arquivo | Importa de? | Violação? |
|---|---|---|
| src/model/mock.js | Nenhum import de ui/view | ✅ Sem leak |
| src/model/snapshot.js | Importa de `./mock.js` | ✅ Sem leak |
| src/model/auth.js | Nenhum import | ✅ Sem leak |
| src/model/demo.js | Importa de `./mock.js` | ✅ Sem leak |
| src/model/branding.js | Nenhum import | ✅ Sem leak |
| src/model/store.js | Nenhum import | ✅ Sem leak |
| src/model/bus.js | Nenhum import | ✅ Sem leak |
| src/model/settings.js | Importa de `./branding.js` | ✅ Sem leak |
| src/model/ui-state.js | Importa de `./branding.js` | ✅ Sem leak |
| src/model/content.js | Nenhum import | ✅ Sem leak |

**Nenhuma layer leak model → ui/view encontrada.**

### 5b. src/domain/* importando view

| Arquivo | Importa de? | Violação? |
|---|---|---|
| src/domain/schema.js | Nenhum import | ✅ Sem leak |
| src/domain/filter.js | Nenhum import | ✅ Sem leak |
| src/domain/table.js | Nenhum import | ✅ Sem leak |
| src/domain/kpi.js | Nenhum import | ✅ Sem leak |
| src/domain/chart.js | Nenhum import | ✅ Sem leak |
| src/domain/persona.js | Nenhum import | ✅ Sem leak |
| src/domain/storytelling.js | Nenhum import | ✅ Sem leak |

**Nenhuma layer leak domain → view encontrada.**

### 5c. ETL normalization em mock.js

| Arquivo | Constante | Pertence a? | Decisão |
|---|---|---|---|
| src/model/mock.js:55-61 | `STATUS_ETL_TO_V8` | etl-normalize.js | S2c: mover |
| src/model/mock.js:63-68 | `TIPO_ETL_TO_V8` | etl-normalize.js | S2c: mover |
| src/model/mock.js:70-75 | `NOME_ETL_TO_V8` | etl-normalize.js | S2c: mover |
| src/model/mock.js:77-84 | `_normalizeObra()` | etl-normalize.js | S2c: mover |

**Violação**: mock.js (model layer) contém conhecimento de ETL (mapeamentos de normalização). Deveria estar em `src/model/etl-normalize.js`.

---

## 6. Inconsistências DECISIONS.md

| Claim no DECISIONS.md | Estado real | Status |
|---|---|---|
| "Sem build step" (Spike 1) | Revisto em Spike 1B — Vite adotado | ✅ Consistente (Spike 1B revisa Spike 1) |
| "Tailwind via CDN" (Spike 1) | Revisto — Tailwind via PostCSS | ✅ Consistente (Spike 1B) |
| "ApexCharts via CDN" (Spike 1) | Revisto — ApexCharts via npm | ✅ Consistente (Spike 1B) |
| "Zero hex hardcoded fora de theme.css" (implícito) | sidebar.js:51,64 tem `#162A4E` | ⚠️ Inconsistência menor |
| "Arquivo ≤ 400 linhas" (README) | main.js = 327, chart.js = 287 | ✅ Todos abaixo de 400 |

**TODOs antigos (>30 dias)**: Nenhum TODO com data encontrada. Os novos TODOs do ETL_REAL (meta_anual, tipo_lancamento) são de hoje.

---

## 7. Resumo: contagem total por categoria

| Categoria | Count | Prioridade |
|---|---|---|
| Dead code (imports/exports) | ~2 (content.js órfão, pending explore) | P2 |
| Duplicação CSS (mesmo valor, nomes diferentes) | 5 pares | P3 (SKIP — intencional) |
| Duplicação Tailwind (status classes >3×) | 3 padrões | P1 (S2a+S2f) |
| Duplicação HTML (KPI/chart card patterns) | 4 padrões | P1 (S2a+S2b) |
| Arquivos >300 LOC | 1 (main.js: 327) | P2 (S2e) |
| Funções >50 LOC | 6 (view mounts) | P3 (SKIP — templates) |
| Template literals >80 LOC | 1 (reports.js) | P3 (SKIP — isolado) |
| Hardcoded Tailwind colors | ~14 ocorrências | P2 (S2f) |
| Hardcoded hex (não fallback) | 2 (sidebar.js #162A4E) | P2 (S2f) |
| Layer leak | 1 (mock.js ETL maps) | P1 (S2c) |
| Inconsistências DECISIONS.md | 1 menor (sidebar hex) | P3 |

---

## 8. Plano S2 priorizado (mais impacto primeiro)

| Prioridade | Subseção | Impacto | Risco |
|---|---|---|---|
| **P1** | S2c: Mover ETL normalization de mock.js → etl-normalize.js | Alto (layer separation) | Baixo |
| **P1** | S2a: Extrair .card-base em app.css | Médio (reduz duplicação) | Médio (muitas views) |
| **P1** | S2b: Extrair HTML fragments | Médio (reduz templates) | Alto (DOM pode mudar) |
| **P2** | S2e: Split main.js (327→~150+boot.js) | Médio (file size) | Baixo |
| **P2** | S2f: Substituir Tailwind hardcoded | Baixo (cosmético) | Baixo |
| **P2** | S2d: Remover dead code | Baixo (content.js órfão) | Baixo |
| **P3** | — | SKIP por ora | — |

**Ordem de execução**: S2c → S2a → S2e → S2f → S2d → S2b (mais seguro primeiro, S2b por último por risco alto)
