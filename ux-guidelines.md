
# 🧠 BORGONOVI V7 — UX GUIDELINES

> Storytelling de dados, psicologia UX, padrões de layout, processo de criação e anti-patterns.
> Consultar este arquivo na etapa de PLANEJAMENTO, antes de codificar.

---

## PERGUNTAS OBRIGATÓRIAS (ANTES DE CRIAR QUALQUER DASHBOARD)

> **PARAR!** Antes de escrever qualquer linha de código, estas perguntas DEVEM ser feitas ao usuário.
> Se o usuário já forneceu a informação no prompt, NÃO repetir a pergunta.

| # | Pergunta | Por que importa |
|---|----------|-----------------|
| 1 | **Quantas views/páginas o dashboard terá?** | Define estrutura do sidebar e navegação |
| 2 | **Quais são os nomes e ícones de cada view?** | Define os nav items |
| 3 | **Quais são os KPIs principais? (máximo 5 por view)** | Define hierarquia visual — Hick's Law |
| 4 | **Os dados são reais ou placeholder?** | Afeta se usamos dados estáticos ou comentários |
| 5 | **Qual é o KPI mais importante? (o "herói")** | Recebe tratamento Von Restorff (destaque visual) |
| 6 | **Existem metas/targets para comparação?** | Determina se usamos metric comparison cards |
| 7 | **Qual o período dos dados? (mensal, trimestral, anual)** | Afeta gráficos temporais e filtros |
| 8 | **Quem vai consumir? (C-Level, gerente, operacional)** | Determina densidade informacional |
| 9 | **Precisa de filtros? Quais? (período, categoria, unidade)** | Define a filter bar |
| 10 | **Alguma view tem alertas/notificações?** | Define layout com coluna de alertas |

### Se o usuário NÃO responder:

- Usar **3 views** como padrão
- Usar **4 KPIs** por view como padrão
- Usar **dados placeholder** realistas em pt-BR
- Usar **layout executivo** como padrão
- Usar **filtro de período** como padrão
- **Sempre** indicar no código com `<!-- SUBSTITUIR POR DADOS REAIS -->`

---

## PROCESSO DE CRIAÇÃO (FLUXO OBRIGATÓRIO)

```
ETAPA 1: PERGUNTAR
└── Fazer as perguntas obrigatórias acima
└── Entender o contexto e os dados

ETAPA 2: PLANEJAR
└── Definir quantidade e nomes das views
└── Para cada view, escolher o PADRÃO DE LAYOUT (ver seção abaixo)
└── Definir quais componentes cada view terá
└── Seguir o STORYTELLING DE DADOS

ETAPA 3: MONTAR
└── Usar o SKELETON TEMPLATE da SKILL.md como base
└── Aplicar componentes de components.md conforme planejado
└── Aplicar gráficos de charts.md conforme planejado
└── Seguir TODOS os tokens de design da SKILL.md

ETAPA 4: REVISAR
└── Passar pelo CHECKLIST DE 45 ITENS da SKILL.md
└── Verificar acessibilidade com accessibility.md
└── Cada item NÃO atendido deve ser CORRIGIDO

ETAPA 5: ENTREGAR
└── Arquivo HTML único, funcional, testável no navegador
└── Todos os charts com lazy loading implementado
└── Dados placeholder claramente marcados
```

---

## STORYTELLING DE DADOS

> Em BI, a ordem dos componentes conta uma HISTÓRIA.
> O usuário deve entender a situação em segundos.

### Fluxo narrativo por view

```
1. RESUMO (KPIs)
   └── "Como estamos?"
   └── Números principais com variação temporal
   └── KPI Hero para o dado mais crítico

2. TENDÊNCIA (Gráficos temporais)
   └── "Para onde estamos indo?"
   └── Linhas, áreas, barras ao longo do tempo
   └── Annotations para eventos/marcos importantes

3. COMPOSIÇÃO (Gráficos de distribuição)
   └── "De onde vem?"
   └── Donuts, treemaps, barras horizontais
   └── Proporções e participação

4. DETALHAMENTO (Tabelas)
   └── "Especificamente onde?"
   └── Dados granulares com sort/busca/paginação
   └── Export CSV para análise externa

5. EXCEÇÕES (Alertas)
   └── "O que precisa de atenção?"
   └── Alertas por severidade
   └── Coluna lateral ou seção dedicada
```

### Regras de storytelling

| Regra | Justificativa |
|-------|---------------|
| KPIs SEMPRE no topo da view | Primeira coisa que o olho vê (Serial Position) |
| Gráfico de tendência ANTES de composição | Contexto temporal antes de detalhamento |
| Tabela DEPOIS de gráficos | Dados granulares após compreensão visual |
| Alertas na LATERAL ou no FINAL | Não interromper o fluxo narrativo principal |
| O KPI mais importante é VISUALMENTE DIFERENTE | Von Restorff — o diferente é memorável |
| Todo KPI tem variação temporal (↑↓) | Tendência é tão importante quanto valor absoluto |
| Todo gráfico tem título descritivo | Nunca ambiguidade |
| Dados sem contexto temporal = proibido | "R$ 1M" sem referência é inútil |

---

## PADRÕES DE LAYOUT POR TIPO DE VIEW

### VIEW EXECUTIVA (C-Level)

```
┌─────────────────────────────────────────────────────┐
│ [KPI Hero col-6] [KPI col-3] [KPI col-3]           │
├─────────────────────────────────────────────────────┤
│ [Gráfico Tendência col-8]  [Alertas col-4]         │
├─────────────────────────────────────────────────────┤
│ [Donut col-4] [Barras col-4] [Gauge Meta col-4]    │
└─────────────────────────────────────────────────────┘

Características:
- Poucos dados, alto impacto visual
- Foco em tendência e status geral
- KPI Hero comunica saúde do negócio imediatamente
- Máx componentes: 8-10
- Densidade: BAIXA (mais whitespace)
- Filtros: mínimos (só período)
```

### VIEW OPERACIONAL (Gerente)

```
┌─────────────────────────────────────────────────────┐
│ [Filter Bar col-12]                                 │
├─────────────────────────────────────────────────────┤
│ [KPI] [KPI] [KPI] [KPI] [KPI]                      │
│ col-12 sm:col-6 lg:col-span conforme quantidade     │
├─────────────────────────────────────────────────────┤
│ [Tabela Principal col-12 com sort/busca/paginação]  │
├─────────────────────────────────────────────────────┤
│ [Gráfico Suporte col-6] [Sub-cards col-6]           │
└─────────────────────────────────────────────────────┘

Características:
- Tabela dominante com ações (export, busca)
- Filtros essenciais no topo
- Dados acionáveis, drill-down disponível
- Máx componentes: 10-15
- Densidade: MÉDIA
- Filtros: período + categoria + busca
```

### VIEW ANALÍTICA (Analista)

```
┌─────────────────────────────────────────────────────┐
│ [Filter Bar col-12]                                 │
├─────────────────────────────────────────────────────┤
│ [KPI] [KPI] [KPI] [KPI]                            │
├─────────────────────────────────────────────────────┤
│ [Gráfico A col-6]         [Gráfico B col-6]        │
├─────────────────────────────────────────────────────┤
│ [Gráfico C col-6]         [Gráfico D col-6]        │
├─────────────────────────────────────────────────────┤
│ [Tabela com Tabs col-12]                            │
└─────────────────────────────────────────────────────┘

Características:
- Múltiplos gráficos comparativos
- Tabs para alternar visualizações dos mesmos dados
- Cross-filtering entre gráficos e tabelas
- Máx componentes: 12-18
- Densidade: ALTA
- Filtros: completos (período + categoria + busca + custom)
```

### VIEW DE DETALHE (Drill-down)

```
┌─────────────────────────────────────────────────────┐
│ [Breadcrumb / Voltar col-12]                        │
├─────────────────────────────────────────────────────┤
│ [KPI Hero col-12 com sparkline]                     │
├─────────────────────────────────────────────────────┤
│ [Tabs: Visão Geral | Histórico | Comparação]        │
│ [Conteúdo da tab ativa col-12]                      │
├─────────────────────────────────────────────────────┤
│ [Drawer de detalhes expansível]                     │
└─────────────────────────────────────────────────────┘

Características:
- Foco em um item/entidade específica
- Tabs para múltiplas perspectivas do mesmo dado
- Drawer para informações complementares
- Máx componentes: 6-10
- Densidade: MÉDIA
- Filtros: mínimos ou nenhum (contexto já definido)
```

---

## UX PSYCHOLOGY PARA DASHBOARDS

### Leis Cognitivas Aplicadas

| Lei | Princípio | Aplicação no Dashboard |
|-----|-----------|------------------------|
| **Hick's Law** | Mais opções = decisão mais lenta | Máx 5 KPIs por view. Máx 7 nav items sem grupo. Progressive disclosure com tabs e drawers |
| **Miller's Law** | ~7 itens na memória de trabalho | Agrupar componentes em seções de no máximo 7. Usar separadores visuais entre grupos |
| **Von Restorff** | O diferente é memorável | KPI Hero com tamanho/cor/estilo diferente dos demais. Alertas críticos com borda vermelha |
| **Serial Position** | Primeiro e último são mais lembrados | KPI mais importante PRIMEIRO. Call-to-action ou resumo no FINAL da view |
| **Fitts' Law** | Maior e mais perto = mais fácil de clicar | Botões de ação principais maiores. Touch targets mínimo 44x44px |
| **Gestalt (Proximidade)** | Elementos próximos = grupo | Gap consistente entre relacionados. Separar grupos com espaço maior |
| **Gestalt (Similaridade)** | Elementos similares = mesma função | Todos os KPIs têm mesmo estilo. Todas as tabelas têm mesmo padrão |
| **Aesthetic-Usability** | Bonito parece funcionar melhor | Consistência visual = confiança. Detalhes polidos = profissionalismo |

### Design Emocional em Dashboards

```
VISCERAL (0-3 segundos):
└── Primeira impressão: "Estamos bem" ou "Tem problema"
└── KPI Hero comunica status geral IMEDIATAMENTE
└── Cores dominantes (verde ou vermelho) definem o sentimento

BEHAVIORAL (usando o dashboard):
└── Filtros respondem rápido
└── Gráficos são interativos (hover, click, drill-down)
└── Sort, busca e paginação funcionam sem delay
└── Feedback via toast em toda ação do usuário

REFLECTIVE (após usar):
└── "Este dashboard me dá controle sobre a situação"
└── "Confio nestes dados" (timestamp de atualização)
└── "Consigo tomar decisões com isto" (export, print)
└── "Quero voltar a consultar isto" (bookmarkable, consistente)
```

### Indicadores de Confiança (OBRIGATÓRIOS em todo dashboard)

| Indicador | Implementação | Onde |
|-----------|---------------|------|
| Timestamp de dados | "Atualizado em DD/MM/AAAA às HH:MM" | Topbar (id="last-update") |
| Fonte dos dados | Tooltip no KPI ou footer da seção | Dentro de tooltip informativo |
| Status de atualização | Ícone `schedule` + texto | Topbar |
| Consistência visual | Mesma linguagem em TODA a interface | Global |

---

## DENSIDADE INFORMACIONAL POR PÚBLICO

| Público | KPIs/view | Gráficos/view | Tabelas/view | Whitespace | Filtros |
|---------|-----------|---------------|--------------|------------|---------|
| **C-Level** | 3-4 | 1-2 | 0-1 | Alto | Mínimos |
| **Gerente** | 4-5 | 2-3 | 1 | Médio | Essenciais |
| **Analista** | 4-5 | 3-4 | 1-2 | Baixo | Completos |
| **Operacional** | 3-4 | 1-2 | 1 (dominante) | Médio | Por função |

### Regras de densidade

| Regra | Valor |
|-------|-------|
| Máximo de KPIs por view | 5 |
| Máximo de gráficos por view | 4 |
| Máximo de tabelas por view | 2 |
| Máximo de tipos de gráfico diferentes na mesma view | 3 |
| Máximo de colunas visíveis em tabela | 8 (além = scroll horizontal) |
| Máximo de nav items sem agrupamento | 7 |
| Máximo de alertas visíveis sem scroll | 5-6 |
| Máximo de tabs em um card | 4 |
| Máximo de itens no filter bar | 4 (busca + 2 selects + botão) |

---

## ANTI-PATTERNS DE DASHBOARD BI

### ❌ Nunca fazer

| Anti-Pattern | Por quê | Fazer ao invés |
|--------------|---------|----------------|
| Mais de 5 KPIs na mesma view | Sobrecarga cognitiva (Hick's Law) | Agrupar em views separadas |
| Mais de 3 tipos de gráfico na mesma seção | Confusão visual | Usar tabs para alternar |
| Dados sem contexto temporal | "R$ 1M é bom ou ruim?" | Sempre variação: ↑12% vs anterior |
| Tabela com mais de 8 colunas visíveis | Scroll excessivo | Hide colunas em mobile, priorizar essenciais |
| KPI sem indicação de bom/ruim | Número sem significado | Cor (verde/vermelho) + seta (↑/↓) |
| Gráfico sem título | Ambiguidade total | SEMPRE título descritivo |
| Todos os KPIs iguais visualmente | Sem hierarquia | KPI Hero para o mais importante |
| Sidebar com mais de 7 itens sem grupo | Dificulta navegação (Miller's) | Agrupar com separadores |
| Dashboard sem filtro de período | Dados estáticos = relatório, não BI | Sempre filter bar |
| Gráficos em views ocultas renderizados | Desperdício de memória/CPU | Lazy loading obrigatório |
| Cores aleatórias para séries | Inconsistência visual | Usar paleta categórica definida |
| Tooltip sem unidade | "42" = 42 o quê? | Sempre "R$ 42K" ou "42%" |
| Múltiplas fontes tipográficas | Poluição visual | Apenas Inter |
| Bordas/sombras inconsistentes | Aparência amadora | Tokens fixos do design system |
| Excesso de animações | Distrai em vez de informar | Apenas fade-in, scale-95 e value count |
| Gráfico 3D ou com efeitos excessivos | Distorce dados | Flat, limpo, funcional |
| Legenda do gráfico longe do gráfico | Dificulta leitura | Legenda dentro ou abaixo |
| Scroll infinito sem paginação | Perda de contexto | Paginação com indicador |
| Alertas sem severidade visual | Tudo parece igual | Crítico vermelho, atenção amber, info azul |
| Dashboard que não funciona em tablet | Exclui cenário comum (reunião) | Responsividade obrigatória |
Números longos puros em KPIs (Ex: 1.250.400)	Quebra o layout responsivo (overflow)	SEMPRE abreviar para K/M/B (Ex: 1.2M) e usar a classe truncate
### ❌ Armadilhas de IA ao gerar dashboards

| Tendência da IA | Problema | Regra Borgonovi |
|-----------------|----------|-----------------|
| Criar 8+ KPIs por view | Ignora Hick's Law | Máx 5, com Hero |
| Usar cores não-padronizadas | Quebra consistência | Apenas paleta M3 do config |
| Esquecer ARIA attributes | Inacessível | Cada componente tem ARIA |
| Não implementar lazy loading | Memory leak | Obrigatório via evento |
| Colocar `href="#"` nos nav items | Comportamento inesperado | `data-view` + click handler |
| Funções no escopo global | Conflito de nomes | Namespace `Borg.` |
| Criar charts no DOMContentLoaded para todas views | Performance ruim | Apenas view ativa |
| Não usar `Borg.createChart()` | Sem error boundary | Sempre via namespace |
| Esquecer `<caption>` em tabelas | Falha WCAG | Obrigatório |
| Não destruir charts ao trocar view | Memory leak | Automático no switchView |

---

## GUIA DE SELEÇÃO DE COMPONENTES

> Use esta tabela para decidir qual componente usar em cada situação.

### Dado → Componente

| Tipo de dado | Componente recomendado | Quando |
|--------------|------------------------|--------|
| Número principal do negócio | **KPI Hero** | O dado mais importante da view |
| Métrica com meta/target | **KPI Variante D** (metric comparison) | Quando existe baseline |
| Métrica com progresso % | **KPI Variante C** (progress ring) | Percentuais de conclusão |
| Métrica simples | **KPI Variante A** (com ícone) ou **B** (com info) | Métricas de suporte |
| Evolução ao longo do tempo | **Gráfico de Linha** ou **Área** | Tendências mensais/trimestrais |
| Comparação entre categorias | **Gráfico de Barras** verticais | Até 8 categorias |
| Ranking / ordenação | **Gráfico de Barras** horizontais | Quando labels são longos |
| Proporção / participação | **Donut** | Até 6 fatias |
| Distribuição proporcional | **Treemap** | Quando há hierarquia de tamanhos |
| Padrão temporal cruzado | **Heatmap** | Dia × mês, hora × dia, etc |
| Progresso vs meta | **Gauge** (radialBar) | Uma métrica vs um target |
| Composição de variação | **Waterfall** | De onde veio lucro/prejuízo |
| Tendência inline | **Sparkline** | Dentro de KPI card ou célula de tabela |
| Dados detalhados | **Tabela** com sort/busca/paginação | Listas extensas |
| Dados com sub-detalhes | **Tabela com Row Expand** | Master-detail |
| Dados para ação em massa | **Tabela com Bulk Actions** | Seleção múltipla |
| Múltiplas perspectivas | **Tabs** | Mesmos dados, visões diferentes |
| Detalhes de um item | **Drawer** | Expandir sem sair da view |
| Visualização ampliada | **Modal** | Gráfico fullscreen |
| Exceções / problemas | **Coluna de Alertas** | Itens que precisam atenção |
| Seleção de período/filtro | **Filter Bar** | No topo da view |
| Sem dados | **Empty State** | Quando filtro retorna zero |
| Carregando | **Loading Skeleton** | Durante fetch de dados |
| Erro ao carregar | **Error State** | Falha de gráfico ou dados |
| Explicação de métrica | **Tooltip Informativo** | Hover no ícone info do KPI |

### Gráfico → Quando NÃO usar

| Gráfico | NÃO usar quando |
|---------|-----------------|
| Donut/Pie | Mais de 6 fatias (usar barras horizontais) |
| Barras verticais | Mais de 8 categorias (usar horizontais) |
| Linha | Apenas 2 pontos de dados (usar KPI com variação) |
| Heatmap | Menos de 3×3 de dados (muito simples) |
| Gauge | Mais de 1 métrica (usar múltiplos gauges ou barras) |
| Treemap | Apenas 2-3 itens (usar donut ou barras) |
| Waterfall | Dados que não representam composição aditiva |
| 3D de qualquer tipo | SEMPRE — nunca usar 3D em BI |

---

## GUIA DE RESPONSIVIDADE

### Breakpoints

| Breakpoint | Tailwind | Viewport | Sidebar | KPIs | Gráficos |
|------------|----------|----------|---------|------|----------|
| **Mobile** | (base) | < 640px | Oculta (hamburger) | 1 coluna | Height 200px |
| **Tablet** | `sm:` | 640-1023px | Oculta (hamburger) | 2 colunas | Height 240px |
| **Desktop** | `lg:` | 1024-1279px | Collapsed 64px | 3-4 colunas | Height 280px |
| **Wide** | `xl:` | ≥ 1280px | Collapsed/Expanded | 4+ colunas | Height 280px |

### Padrão de classes responsivas por componente

| Componente | Classes de coluna |
|------------|-------------------|
| KPI Card (quando 4) | `col-span-12 sm:col-span-6 lg:col-span-3` |
| KPI Card (quando 3) | `col-span-12 sm:col-span-6 lg:col-span-4` |
| KPI Card (quando 5) | `col-span-12 sm:col-span-6 lg:col-span-2` + ajuste no 5º |
| KPI Hero | `col-span-12 sm:col-span-6` |
| Gráfico (metade) | `col-span-12 lg:col-span-6` |
| Gráfico (dois terços) | `col-span-12 lg:col-span-8` |
| Gráfico (um terço) | `col-span-12 lg:col-span-4` |
| Tabela | `col-span-12` (sempre full width) |
| Filter Bar | `col-span-12` (sempre full width) |
| Alertas | `col-span-12 lg:col-span-2` |
| Conteúdo com alertas | `col-span-12 lg:col-span-10` |
| Sub-cards (grid) | Grid interno: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` ou `lg:grid-cols-4` |
| Drawer conteúdo | `grid-cols-1 md:grid-cols-3` |

### Regras mobile

| Regra | Detalhe |
|-------|---------|
| Sidebar em mobile | Overlay com backdrop (click fora fecha) |
| Tabelas em mobile | `overflow-x-auto` com scroll horizontal |
| Touch targets | Mínimo `min-w-[44px] min-h-[44px]` em tudo clicável |
| Gráficos em mobile | Reduzir height para caber sem scroll excessivo |
| Filter bar em mobile | Itens empilham verticalmente (flex-wrap) |
| Topbar em mobile | Esconder timestamp, manter menu e título |
| KPIs em mobile | 1 por linha, scroll vertical |
| Paginação em mobile | Manter simples (prev/next) |

---

## CHECKLIST DE PLANEJAMENTO (antes de codificar)

| # | Verificação |
|---|-------------|
| 1 | Perguntas obrigatórias respondidas? |
| 2 | Views definidas com nomes e ícones? |
| 3 | Padrão de layout escolhido para cada view? |
| 4 | KPI Hero identificado (qual é O dado mais importante)? |
| 5 | Storytelling seguido (KPI → Tendência → Composição → Tabela → Alertas)? |
| 6 | Densidade adequada ao público? |
| 7 | Máx 5 KPIs por view? |
| 8 | Máx 3 tipos de gráfico por view? |
| 9 | Todo KPI tem variação temporal (↑↓)? |
| 10 | Filter bar definida com filtros relevantes? |
| 11 | Tabelas têm paginação se > 10 rows? |
| 12 | Lazy loading planejado (quais charts em cada view)? |
| 13 | Anti-patterns evitados? |
| 14 | Responsividade considerada nos col-spans? |
```

---
