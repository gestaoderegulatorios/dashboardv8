# 📖 BORGONOVI V8 — STORYTELLING PATTERNS

> **Nota V8**: Conteúdo independente de arquitetura — aplica-se igualmente a V7 e V8.

> Catálogo de narrativas prontas por domínio. A ordem dos componentes conta uma história.
> Consultar este arquivo na ETAPA 2 (Planejamento) para definir a sequência de views e blocos.

---

## PRINCÍPIO

> "Mostre-me um dashboard que abre com uma tabela de 30 colunas e eu te mostro um dashboard que ninguém lê."
>
> Toda view deve responder **uma pergunta central** na primeira rolagem.
> O resto é detalhamento progressivo.

---

## PADRÕES UNIVERSAIS DE VIEW

Toda view bem construída segue uma destas estruturas:

### Padrão A — "Pergunta → Resposta → Prova → Ação"

```
1. TÍTULO/HERO     → Qual é a pergunta?
2. KPIs            → Qual é a resposta resumida?
3. Gráfico         → Por quê? (a prova visual)
4. Tabela/detalhe  → Onde posso ir investigar?
5. CTA/Alerta      → O que fazer agora?
```

### Padrão B — "Status → Tendência → Detalhamento"

```
1. KPI Hero        → Onde estamos?
2. Gráfico linha   → Estamos melhorando ou piorando?
3. Comparativo     → Vs. meta / vs. ano anterior
4. Drill-down      → O que está puxando pra cima/baixo?
```

### Padrão C — "Macro → Meso → Micro"

```
1. Total agregado
2. Por categoria principal
3. Por subcategoria
4. Por item individual (tabela)
```

---

## NARRATIVAS POR DOMÍNIO

### 💰 FINANCEIRO / CONTROLADORIA

#### View 1: Visão Geral Financeira

```
Hero: Receita do mês (com variação vs. mês anterior)
KPIs: Despesas · Resultado · Margem · Caixa
Gráfico: Receita x Despesa (linha, 12 meses)
Tabela: Top 10 contas de despesa
Alertas: Contas a vencer / Saldo negativo
```

#### View 2: DRE (Demonstração de Resultado)

```
KPI Hero: Resultado líquido
KPIs: Receita bruta · Deduções · Receita líquida · EBITDA · Margem EBITDA
Waterfall chart: Da Receita ao Lucro Líquido
Tabela: Estrutura DRE com sort por valor e variação %
```

#### View 3: Fluxo de Caixa

```
KPIs: Entradas · Saídas · Saldo · Projeção 30d
Gráfico linha empilhada: Entradas vs Saídas diárias
Gráfico área: Saldo acumulado com linha de mínimo obrigatório
Tabela: Próximos 30 dias de movimentação
```

#### View 4: Inadimplência

```
Hero: Taxa de inadimplência (com variação)
KPIs: Valor em aberto · Nº clientes · Ticket médio em atraso · Faixa >90d
Gráfico: Aging (barras por faixa de atraso)
Tabela: Top devedores com ações (cobrar, renegociar)
```

---

### 🛒 COMERCIAL / VENDAS

#### View 1: Performance de Vendas

```
Hero: Receita do período (vs. meta, com %)
KPIs: Pedidos · Ticket médio · Conversão · Novos clientes
Gráfico: Receita diária com linha de meta acumulada
Tabela: Top 10 vendedores
```

#### View 2: Funil de Vendas

```
KPIs: Leads · Qualificados · Propostas · Fechados
Funil chart (ou barras decrescentes)
Gráfico taxa de conversão por etapa
Tabela: Pipeline com ETA e valor esperado
Alertas: Oportunidades estagnadas
```

#### View 3: Produtos

```
KPIs: SKUs ativos · Top produto · Giro médio · Ruptura
Pareto chart: 80/20 de receita por produto
Tabela: Produtos com busca, filtro por categoria
Drawer: detalhe do produto (histórico, sazonalidade, estoque)
```

#### View 4: Regional

```
KPIs por região: Receita · Crescimento · # Clientes · Margem
Gráfico: Comparativo regiões (barras)
Heatmap Brasil: Receita por estado (ApexCharts treemap como alternativa)
Tabela: Top cidades
```

---

### ⚙️ OPERACIONAL / PRODUÇÃO

#### View 1: Monitoramento em Tempo Real

```
KPIs com pulse-dot: OEE · Produção/h · Paradas · Qualidade
Gráfico tempo real: Últimas 4h de produção
Lista: Paradas ativas (duração, motivo, máquina)
Alertas: Máquinas abaixo da meta
```

#### View 2: Eficiência (OEE)

```
Gauge: OEE atual
Decomposição: Disponibilidade × Performance × Qualidade
Gráfico linha: OEE 30 dias
Tabela: OEE por linha de produção
```

#### View 3: Qualidade

```
KPIs: Taxa aprovação · Refugo · Retrabalho · PPM
Gráfico: Pareto de defeitos (top 10 causas)
Tabela: Lotes reprovados
Drill-down: Causa raiz por defeito
```

---

### 👥 RH / GENTE

#### View 1: Headcount

```
Hero: Colaboradores ativos
KPIs: Contratações · Desligamentos · Turnover · Tempo médio casa
Gráfico: Evolução 12 meses
Donut: Por departamento / senioridade
Tabela: Admissões e demissões recentes
```

#### View 2: Folha de Pagamento

```
KPIs: Folha total · Encargos · Benefícios · Custo médio por colaborador
Gráfico: Evolução folha 12 meses
Barras: Custo por área
```

#### View 3: Engajamento

```
Hero: eNPS
KPIs: Participação em pesquisas · Horas treinamento · Avaliações pendentes
Gráfico: eNPS ao longo do tempo
Tabela: Principais dores por área (análise de texto)
```

---

### 📣 MARKETING

#### View 1: Visão Geral de Marketing

```
KPIs: Leads · CAC · ROI · Receita atribuída
Gráfico: Leads por canal (barras empilhadas)
Tabela: Campanhas ativas
```

#### View 2: Funil Marketing → Vendas

```
Métricas por etapa: Visitantes → Leads → MQL → SQL → Clientes
Gráfico: Taxa de conversão entre etapas
Gráfico: Tempo médio por etapa
```

#### View 3: Campanhas Digitais

```
KPIs: Impressões · Cliques · CTR · CPC · CPL · ROAS
Tabela: Campanhas com sort por ROAS
Drill-down: Performance por criativo
```

---

### 🏥 SAÚDE

#### View 1: Atendimentos

```
Hero: Atendimentos do dia
KPIs: Taxa ocupação · Tempo médio espera · No-show · NPS
Gráfico: Atendimentos por hora (últimas 12h)
Lista: Fila atual com triagem colorida
```

#### View 2: Clínico (indicadores)

```
KPIs: Taxa de readmissão · Taxa de infecção · Óbitos evitáveis · Eventos adversos
Gráficos por especialidade
Tabela: Casos em acompanhamento
```

---

### 🚚 LOGÍSTICA

#### View 1: Operação Diária

```
Hero: Entregas do dia com % on-time
KPIs: Rotas ativas · Veículos em operação · Atrasos · Avarias
Mapa (SVG ou imagem): Rotas em andamento (opcional)
Tabela: Entregas com status e ETA
```

#### View 2: SLA

```
Gauge: SLA mês
Gráfico linha: SLA diário 30 dias
Barras: SLA por região/transportadora
Tabela: Piores SLAs da semana
```

---

### 💻 PRODUTO / SAAS

#### View 1: Crescimento

```
Hero: MRR com % crescimento
KPIs: New MRR · Expansion · Churn · Net MRR
Gráfico: MRR evolution (stacked area: new + expansion - churn)
Tabela: Top contas por MRR
```

#### View 2: Engagement

```
KPIs: DAU · WAU · MAU · Stickiness (DAU/MAU)
Gráfico: Usuários ativos 30 dias
Cohort chart: Retenção por coorte de cadastro
```

#### View 3: Saúde de Clientes

```
KPIs: NPS · Tickets abertos · Tempo resposta · Taxa resolução
Gráfico: Volume de tickets por categoria
Tabela: Clientes em risco (health score baixo)
```

---

## ESCOLHENDO O PADRÃO CERTO

| Se o usuário disse... | Padrão sugerido |
|----------------------|-----------------|
| "dashboard executivo" | A (Pergunta → Resposta → Prova) |
| "monitorar em tempo real" | B com auto-refresh |
| "analisar por..." | C (Macro → Meso → Micro) |
| "comparar períodos" | B (Status → Tendência → Detalhamento) |
| "investigar problema" | C com drill-down acentuado |

---

## ANTI-PATTERNS (erros comuns)

1. **Tabela grande como primeiro elemento** — perde o leitor em 5 segundos
2. **KPIs sem variação temporal** — um número sozinho não conta história
3. **Múltiplos gráficos competindo por atenção** — quem é o principal?
4. **Gráfico sem resposta clara** — "o que isso me diz?"
5. **Drill-down sem ponto de volta** — user perdido em profundidade
6. **Alertas sem ação** — "ok, e agora?"
7. **KPI Hero que não é o mais importante** — destruição de hierarquia
8. **Cores semânticas trocadas** (vermelho pra positivo, verde pra negativo) — desastre cognitivo

---

## REGRA DE OURO

> Se você fechar os olhos depois de ler o dashboard e conseguir resumir em UMA FRASE o que está acontecendo, a narrativa está correta.
> Se não conseguir, falta storytelling.
