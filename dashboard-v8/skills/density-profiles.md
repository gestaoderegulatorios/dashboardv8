# 📐 BORGONOVI V8 — PERFIS DE DENSIDADE

> **Nota V8**: Conteúdo independente de arquitetura — aplica-se igualmente a V7 e V8.

> Três perfis calibrados para diferentes públicos. A densidade errada transforma um bom dashboard em ruim.
> Consultar este arquivo na ETAPA 2 (Planejamento) para escolher o perfil antes de montar.

---

## POR QUE ISSO IMPORTA

> Um CEO olha o dashboard por 15 segundos enquanto toma café.
> Um gerente olha por 3 minutos durante o 1:1.
> Um analista de operações passa o dia todo nele.
>
> **Mesmos dados, densidades completamente diferentes.** Dashboards genéricos perdem todos três.

---

## MATRIZ DE DECISÃO (perguntar ao usuário)

| Sinal | Perfil sugerido |
|-------|-----------------|
| "Para diretoria / C-Level / board" | **EXECUTIVO** |
| "Reunião semanal / gerência / 1:1" | **GERENCIAL** |
| "Time de operações / analista / cockpit" | **OPERACIONAL** |
| "Tela grande / war room / TV" | **OPERACIONAL** com ampliação |
| "Mobile / acesso em campo" | **EXECUTIVO** (sempre) |
| Dúvida | **GERENCIAL** (default seguro) |

---

## PERFIL 1 — EXECUTIVO

> **Público**: C-Level, board, diretoria
> **Tempo de atenção**: 10–30 segundos por view
> **Princípio**: "Tudo que importa, uma olhada"

### Características

- **Máximo 4 KPIs por view** (3 se houver Hero)
- **KPI Hero OBRIGATÓRIO** — o número que define o sucesso
- **Gráficos grandes, até 2 por view**
- **Tipografia ampliada**: KPI values em `text-3xl` a `text-5xl`
- **Espaçamento generoso**: `gap-8` entre seções, `p-8` em cards
- **Sem tabelas densas** — resumos agregados apenas
- **Cores: máximo 3 cores de dado** — excesso distrai
- **Variação temporal sempre visível** (vs. período anterior)

### Tokens ajustados

```html
<!-- KPI card executivo -->
<div class="bg-white p-8 rounded-xl border border-slate-200 flex flex-col justify-between shadow-sm
            col-span-12 sm:col-span-6 lg:col-span-3 card-lift">
    <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">[LABEL]</span>
    <div class="flex items-end justify-between">
        <span class="text-4xl font-extrabold tracking-tight text-primary"
              data-animate-value data-target="[NUMERO]" data-prefix="R$ " data-suffix="M">
            [VALOR]
        </span>
        <span class="inline-flex items-center gap-0.5 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-[9999px]">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">trending_up</span>
            +[X]%
        </span>
    </div>
    <p class="text-xs text-on-surface-variant mt-3">vs [PERÍODO ANTERIOR]</p>
</div>
```

### Layout padrão

```
┌──────────────────────────────────────┐
│  HERO KPI (col-span-6)   │  KPI      │
│  large, com spark        │  (col-3)  │
│                          │  KPI      │
│                          │  (col-3)  │
├──────────────────────────────────────┤
│  Gráfico principal (col-span-8)  │ KPI│
│  altura 400px                    │    │
│                                  │ KPI│
├──────────────────────────────────────┤
│  Resumo por categoria (col-span-12)  │
│  (3–5 sub-cards horizontais)         │
└──────────────────────────────────────┘
```

---

## PERFIL 2 — GERENCIAL

> **Público**: Gerentes, coordenadores, reuniões de time
> **Tempo de atenção**: 2–5 minutos por view
> **Princípio**: "Olhar rápido + capacidade de drill-down"

### Características

- **5–8 KPIs por view** (pode ter Hero se fizer sentido)
- **Gráficos médios, 2–4 por view**
- **Tabela com top N** (top 10 clientes, top 5 produtos) — com sort e search
- **Tipografia padrão**: KPI values em `text-2xl`
- **Espaçamento equilibrado**: `gap-6`, `p-5`
- **Filtros essenciais** (período + 1–2 dimensões)
- **Variação temporal + comparação com meta**
- **Drawers de detalhe** em itens da tabela

### Tokens padrão

Este é o **perfil default da SKILL.md**. Usar os templates como estão.

### Layout padrão

```
┌──────────────────────────────────────┐
│  KPI x4 em linha (col-span-3 cada)   │
├──────────────────────────────────────┤
│  Filter Bar (col-span-12)            │
├──────────────────────────────────────┤
│  Gráfico A (col-6)  │  Gráfico B (6) │
├──────────────────────────────────────┤
│  Tabela Top N (col-span-12)          │
│  com busca, sort, paginação          │
├──────────────────────────────────────┤
│  Sub-cards por categoria (col-12)    │
└──────────────────────────────────────┘
```

---

## PERFIL 3 — OPERACIONAL

> **Público**: Analistas, NOC, suporte, chão de fábrica
> **Tempo de atenção**: 4+ horas de monitoramento contínuo
> **Princípio**: "Densidade máxima, informação por cm²"

### Características

- **10–16 KPIs por view** (sem Hero — tudo é prioridade)
- **Gráficos pequenos, até 6 por view** (sparklines e mini-charts)
- **Tabelas densas** (linhas sem padding extra, tipografia `text-xs`)
- **Tipografia compacta**: KPI values em `text-xl`
- **Espaçamento apertado**: `gap-3`, `p-3`
- **Auto-refresh obrigatório** (30s–2min)
- **Pulse dots "ao vivo"** em métricas em tempo real
- **Alertas laterais sempre visíveis** (coluna dedicada)
- **Filtros rápidos** (chips, não forms expansivos)
- **Dark mode como opção forte** (fadiga visual em monitoramento prolongado)

### Tokens ajustados

```html
<!-- KPI card operacional -->
<div class="bg-white p-3 rounded-lg border border-slate-200 shadow-sm
            col-span-6 sm:col-span-4 lg:col-span-2">
    <div class="flex items-start justify-between mb-1">
        <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide truncate">[LABEL]</span>
        <span class="pulse-dot"></span>
    </div>
    <div class="flex items-baseline gap-2">
        <span class="text-xl font-extrabold tracking-tight text-primary tabular-nums"
              data-animate-value data-target="[NUMERO]">
            [VALOR]
        </span>
        <span class="text-[10px] font-bold text-green-700">+[X]%</span>
    </div>
    <div id="spark-[ID]" class="w-full h-6 mt-1"></div>
</div>
```

### Layout padrão

```
┌─────────────────────────────────────────────────┐
│  KPI compacto × 12 (col-span-2 cada)  │         │
│  em 2 linhas                          │ ALERTAS │
├───────────────────────────────────────┤ (col-2) │
│  Chart A   │ Chart B   │ Chart C      │         │
│  (col-3)   │ (col-3)   │ (col-4)      │         │
├───────────────────────────────────────┤         │
│  Tabela densa scroll infinito (10)    │         │
│  40+ linhas visíveis sem scroll       │         │
└─────────────────────────────────────────────────┘
```

### CSS extra para densidade operacional

```css
/* Quando .dashboard-dense no body */
.dashboard-dense .card { padding: 0.75rem; }
.dashboard-dense table th,
.dashboard-dense table td { padding: 0.5rem 0.75rem; }
.dashboard-dense .text-sm { font-size: 0.75rem; }
.dashboard-dense .gap-6 { gap: 0.75rem; }
.dashboard-dense h2 { font-size: 0.75rem; }
```

---

## COMPARAÇÃO LADO A LADO

| Aspecto | Executivo | Gerencial | Operacional |
|---------|-----------|-----------|-------------|
| KPIs/view | 3–4 | 5–8 | 10–16 |
| Hero KPI | Sim (obrigatório) | Opcional | Não |
| Gráficos/view | 1–2 | 2–4 | 4–6 |
| Altura gráficos | 400px | 280px | 180px |
| Tipografia base | `text-sm` | `text-sm` | `text-xs` |
| KPI value | `text-4xl` a `text-5xl` | `text-2xl` | `text-xl` |
| Padding card | `p-8` | `p-5` | `p-3` |
| Gap grid | `gap-8` | `gap-6` | `gap-3` |
| Tabelas | Resumo agregado | Top N + search | Densa + scroll |
| Auto-refresh | Opcional | Opcional | Obrigatório |
| Dark mode | Opcional | Opcional | Fortemente recomendado |
| Filtros | Mínimos | Filter bar | Chips rápidos |
| Alertas | Integrados | Opcional coluna | Coluna fixa |

---

## REGRAS INQUEBRÁVEIS

1. **Nunca misturar perfis na mesma view** — confunde hierarquia visual
2. **Dashboards diferentes no mesmo projeto PODEM ter perfis diferentes**, mas mantenha coerência por público
3. **Mobile sempre cai para EXECUTIVO**, independente do perfil escolhido (col-span-12 para tudo, KPIs stack)
4. **Se o usuário não souber escolher, assumir GERENCIAL** e anunciar claramente: "Estou usando perfil gerencial. Me avise se quiser executivo (menos denso) ou operacional (mais denso)."

---

## COMO USAR

Na ETAPA 1, após descobrir o público-alvo, anunciar o perfil escolhido:

> "Identifiquei que este dashboard é para [público]. Vou usar o perfil **[PERFIL]** — isso significa [resumo em 1 linha]. Pode ser?"

Na ETAPA 3, aplicar os tokens do perfil **globalmente** no arquivo — não misturar padding/gap de perfis diferentes.
