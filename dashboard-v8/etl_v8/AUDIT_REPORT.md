# AUDIT_REPORT.md — ETL V8 S1

> Gerado em: 2026-05-02
> Objetivo: Documentar proveniência de cada campo do snapshot.json e validar se 43 fontes XLSX/CSV cobrem tudo.

---

## 1. Snapshot Field Provenance (estado atual)

### obras[] (14 rows)

| Campo | Source Atual | Detalhe | Status |
|---|---|---|---|
| `nome` | CSV | `dim_obras.csv` coluna `nome` | ✅ Derivado de CSV |
| `tipo` | CSV | `dim_obras.csv` coluna `tipo` (sem acento: "Edificio" vs "Edifício") | ✅ Derivado de CSV |
| `status` | CSV | `dim_obras.csv` coluna `status` (sem acento: "Atencao" vs "Atenção") | ✅ Derivado de CSV |
| `orcado` | CSV | `dim_obras.csv` coluna `orcado` | ✅ Derivado de CSV |
| `executado` | CALCULATED | `SUM(financeiro[obra].valor)` — soma de todos lançamentos financeiros da obra | ✅ Derivado de XLSX |
| `avanco` | CALCULATED | `SUM(planejamento[obra].percent_concluido × peso) / SUM(peso)` | ✅ Derivado de XLSX |
| `gap` | CALCULATED | `avanco - (executado / orcado × 100)` | ✅ Derivado de CSV+XLSX |
| `atrasoDias` | CALCULATED | `abs(int(gap))` se gap < -3, senão 0 | ⚠️ Fórmula fraca — ver Ambiguidades |

### series.*

| Campo | Source Atual | Detalhe | Status |
|---|---|---|---|
| `meses12` | HARDCODED | `['Abr/25', 'Mai/25', ..., 'Mar/26']` fixo em main.py linha 114 | ❌ Não deriva de XLSX |
| `receitaMensal` | HARDCODED | `[6200000, 7100000, ..., 8734281]` fixo em main.py linha 115 | ❌ Não deriva de XLSX |
| `composicaoTipo` | CALCULATED | Agrupa obras por tipo, % do orcado total | ✅ Derivado de dados |
| `margemSpark` | HARDCODED | `[38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]` fixo | ❌ Não deriva de XLSX |
| `metaAnualPercent` | HARDCODED | `72` fixo em main.py linha 116 | ❌ Não deriva de XLSX |

### dimensoes.*

| Campo | Source Atual | Detalhe | Status |
|---|---|---|---|
| `centros_custo` | DERIVED | `sorted(fin_df["centro_custo"].dropna().unique())` | ✅ Derivado de XLSX |
| `categorias` | DERIVED | `sorted(fin_df["categoria"].dropna().unique())` | ✅ Derivado de XLSX |

---

## 2. XLSX Structure Per Category

### compras/{obra}.xlsx (14 arquivos, 178 rows total)

| Coluna normalizada | Variantes de cabeçalho | Type | Value Range |
|---|---|---|---|
| `data` | "Data Pedido", "Dt Pedido", "Data" | string (date ISO) | 2025-01 a 2025-12 |
| `fornecedor` | "Fornecedor", "Forn." | string | 10 únicos: Amanco, Casa Show, Construrama, Eternit, Gerdau, Leroy Merlin, MaterFer, Telhanorte, Tigre, Votorantim |
| `item` | "Item", "Material", "Descricao" | string | 10 únicos: Aco CA-50, Areia media, Argamassa colante, etc. |
| `qtd` | "Qtd", "Quantidade", "Qtd." | int64 | 10-200 |
| `valor_unit` | "Valor Unit", "Vlr Unit", "Preco Unit." | float64 | 15-850 |
| `total` | "Total", "Vlr Total", "Total R$" | float64 | 1,786-152,669 |

- **Sheet name**: sempre `Sheet1`
- **1 sheet por arquivo** (não multi-sheet)

### financeiro/{obra}.xlsx (14 arquivos, 258 rows total)

| Coluna normalizada | Variantes de cabeçalho | Type | Value Range |
|---|---|---|---|
| `data` | "Dt Lancamento", "Data", "Data Lanc." | string (date ISO) | 2025-01 a 2025-12 |
| `valor` | "Valor R$", "Vlr", "Valor" | float64 | 0-670,991 |
| `centro_custo` | "Centro de Custo", "CC", "C.Custo" | string | 5 únicos: Administrativo, Equipamentos, Mao de Obra, Material, Servicos Terceirizados |
| `categoria` | "Categoria", "Cat." | string | 7 únicos: Acabamento, Aco, Alvenaria, Concreto, Estrutura, Fundacao, Instalacoes |
| `descricao_lancamento` | "Descricao", "Historico" | string | texto livre |

- **CASO ESPECIAL**: `ed_central.xlsx` tem 1 row com valor=0 (obra "Planejado", sem lançamentos)
- **SUM(valor) por obra = executado** (verificado: coincide com gerar_mock_xlsx.py)
- **257/258 rows com datas válidas** → GROUP BY mês possível!

### planejamento/{obra}.xlsx (14 arquivos, 98 rows total = 7 etapas × 14 obras)

| Coluna normalizada | Variantes de cabeçalho | Type | Value Range |
|---|---|---|---|
| `etapa` | "Etapa", "Atividade", "Fase" | string | 7 únicos: Fundacao, Estrutura, Alvenaria, Cobertura, Instalacoes, Acabamento, Entrega |
| `percent_concluido` | "% Concluido", "% Conc.", "Concluido (%)" | int64 | 0-100 |
| `peso` | "Peso (%)", "Peso" | int64 | 5-25 |
| `inicio` | "Inicio Previsto", "Inicio", "Data Inicio" | string (date) | 2025-02 a 2025-12 |
| `fim` | "Fim Previsto", "Termino", "Data Fim" | string (date) | 2025-04 a 2026-01 |

- **Sempre 7 rows por obra** (mesmas 7 etapas, pesos fixos: 15+25+20+10+15+10+5=100)
- **avanco calculado** = SUM(pct×peso)/SUM(peso) → coincide com mock original

### dim_obras.csv (1 arquivo, 14 rows + header)

| Coluna | Type | Value Range |
|---|---|---|
| `nome` | string | 14 obras (sem acento) |
| `tipo` | string | 4 valores: Edificio, Loteamento, Comercial, Infraestrutura |
| `status` | string | 5 valores: Em progresso, Atencao, Pendente, Concluida, Planejado |
| `orcado` | int64 | 4,500,000 - 18,700,000 |

---

## 3. Presence Matrix (14 obras × 3 categorias = 42 XLSX)

| Obra | compras | financeiro | planejamento |
|---|---|---|---|
| Ed Central | ✅ | ✅ | ✅ |
| Estacao de Tratamento | ✅ | ✅ | ✅ |
| Galpao Logistico | ✅ | ✅ | ✅ |
| Horizon Hills | ✅ | ✅ | ✅ |
| Jardim Europa | ✅ | ✅ | ✅ |
| Loteamento Bosque | ✅ | ✅ | ✅ |
| Ponte Viaria | ✅ | ✅ | ✅ |
| Residencial Parque | ✅ | ✅ | ✅ |
| Torre A | ✅ | ✅ | ✅ |
| Torre B | ✅ | ✅ | ✅ |
| Torre C | ✅ | ✅ | ✅ |
| Torre D | ✅ | ✅ | ✅ |
| Torre E | ✅ | ✅ | ✅ |
| Torre F | ✅ | ✅ | ✅ |

**Resultado: 42/42 presentes. 0 faltantes. 0 órfãos.**

---

## 4. Financeiro Validation: executado vs orcado

| Obra | orcado (CSV) | executado (SUM fin) | % executado |
|---|---|---|---|
| Torre A | 12,000,000 | 8,500,000 | 70.8% |
| Torre B | 9,800,000 | 4,120,000 | 42.0% |
| Torre C | 6,700,000 | 3,100,000 | 46.3% |
| Torre D | 15,200,000 | 8,600,000 | 56.6% |
| Residencial Parque | 8,400,000 | 6,048,000 | 72.0% |
| Jardim Europa | 5,600,000 | 2,128,000 | 38.0% |
| Horizon Hills | 7,200,000 | 4,608,000 | 64.0% |
| Ed Central | 4,500,000 | 0 | 0.0% |
| Torre E | 14,500,000 | 11,890,000 | 82.0% |
| Torre F | 11,300,000 | 6,441,000 | 57.0% |
| Loteamento Bosque | 6,200,000 | 1,798,000 | 29.0% |
| Galpao Logistico | 8,900,000 | 8,100,000 | 91.0% |
| Ponte Viaria | 18,700,000 | 8,602,000 | 46.0% |
| Estacao de Tratamento | 5,100,000 | 3,723,000 | 73.0% |
| **TOTAL** | **134,100,000** | **77,658,000** | **57.9%** |

**Conclusão**: `SUM(financeiro.valor)` por obra = `executado` (valores coincidem com gerar_mock_xlsx.py). `orcado` vem de dim_obras.csv e é maior — representa o orçamento total, não o realizado.

---

## 5. Date Analysis: Can receitaMensal be derived?

**SIM.** 257/258 rows do financeiro têm datas válidas.

Agrupamento mensal real (GROUP BY mês):

| Mês | Receita (SUM financeiro.valor) |
|---|---|
| 2025-01 | 5,469,991 |
| 2025-02 | 5,860,207 |
| 2025-03 | 5,689,261 |
| 2025-04 | 9,513,896 |
| 2025-05 | 4,937,926 |
| 2025-06 | 4,794,459 |
| 2025-07 | 9,741,107 |
| 2025-08 | 6,637,844 |
| 2025-09 | 7,828,621 |
| 2025-10 | 3,117,478 |
| 2025-11 | 6,818,658 |
| 2025-12 | 7,248,552 |

**12 meses encontrados.** Os valores diferem do hardcoded atual (`[6200000, 7100000, ...]`). Isso é correto — o hardcoded era mock, os novos derivam dos XLSX reais.

**Conclusão**: `receitaMensal` PODE e DEVE ser derivado do financeiro por mês. `meses12` PODE ser derivado dinamicamente.

---

## 6. Proposed Field Mapping (XLSX col → snapshot field)

### obras[] (14 rows)

| snapshot field | Fórmula | Source |
|---|---|---|
| `nome` | `dim_obras.nome` | CSV |
| `tipo` | `dim_obras.tipo` | CSV |
| `status` | `dim_obras.status` | CSV |
| `orcado` | `dim_obras.orcado` | CSV |
| `executado` | `SUM(financeiro[obra].valor)` | XLSX financeiro |
| `avanco` | `SUM(planejamento[obra].pct × peso) / SUM(peso)` | XLSX planejamento |
| `gap` | `avanco - (executado / orcado × 100)` | Calculado |
| `atrasoDias` | Ver Ambiguidades abaixo | TBD |

### series.*

| snapshot field | Fórmula | Source |
|---|---|---|
| `meses12` | Últimos 12 meses com dados, formato `Mmm/AA` | XLSX financeiro datas |
| `receitaMensal` | `GROUP BY month(financeiro.data), SUM(valor)`, últimos 12 meses | XLSX financeiro |
| `composicaoTipo` | `GROUP BY tipo, SUM(orcado) / TOTAL × 100` | CSV + XLSX |
| `margemSpark` | Ver Ambiguidades abaixo | TBD |
| `metaAnualPercent` | Ver Ambiguidades abaixo | TBD |

---

## 7. Ambiguidades (requerem decisão de produto)

### A1. `atrasoDias` — fórmula atual é fraca

**Atual**: `abs(int(gap))` se gap < -3, senão 0. Isso é uma aproximação grosseira.

**Opções**:
1. **Manter fórmula atual** — simples mas imprecisa
2. **Derivar de planejamento datas** — calcular `MAX(0, hoje - fim_previsto)` por etapa, pegar o maior atraso da obra
3. **Derivar de financeiro vs planejado** — comparar executado real vs previsto por etapa

**Recomendação**: Opção 2 — usa as datas `inicio`/`fim` do planejamento que já existem nos XLSX.

### A2. `margemSpark` — sem dados de custo/receita separados

**Problema**: O financeiro XLSX tem `valor` e `categoria`, mas não distingue receita de custo. A margem bruta seria `(receita - custo) / receita`, mas não temos essa separação.

**Opções**:
1. **Usar `categoria` como proxy** — categorias como "Concreto", "Aco" = custo; inferir receita como total
2. **Manter hardcoded** — `[38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]` até ter dados reais
3. **Calcular como `(orcado_total - executado_total) / orcado_total × 100` por mês** — proxy de margem

**Recomendação**: Opção 3 — melhor que hardcoded, mas é aproximação. Documentar como proxy.

### A3. `metaAnualPercent` — sem meta definida nos XLSX

**Problema**: Nenhum XLSX contém a meta anual. É um target de negócio.

**Opções**:
1. **Manter hardcoded** — `72` até a equipe fornecer a meta
2. **Calcular como `% do orcado executado`** — `SUM(executado) / SUM(orcado) × 100` = 57.9%
3. **Adicionar coluna `meta_anual` no dim_obras.csv** — mais correto, requer input da equipe

**Recomendação**: Opção 1 — manter `72` hardcoded com comentário explícito. Quando a equipe fornecer a meta real, adicionar ao CSV.

### A4. `status` — vem do CSV ou deveria derivar do planejamento?

**Problema**: O `status` no dim_obras.csv é estático ("Em progresso", "Atencao", etc.). Poderia ser derivado dinamicamente do avanço real.

**Opções**:
1. **Manter do CSV** — status é informado pela equipe, não calculado
2. **Derivar do avanco** — ex: avanco >= 95% → "Concluída", avanco < 30% → "Pendente"
3. **Combinar** — CSV como base, override se dados indicam inconsistência

**Recomendação**: Opção 1 — manter do CSV. Status é decisão humana, não cálculo automático. Mas adicionar warning se status do CSV contradiz dados (ex: status="Concluída" mas avanco=40%).

### A5. `meses12` dinâmico vs hardcoded

**Problema**: Atualmente hardcoded como `['Abr/25', ..., 'Mar/26']`. Com datas reais nos XLSX, pode ser dinâmico.

**Opções**:
1. **Dinâmico** — últimos 12 meses com dados, formato `Mmm/AA`
2. **Hardcoded** — manter os mesmos 12 meses fixos

**Recomendação**: Opção 1 — dinâmico. Evita drift quando novos meses entram. Mas se XLSX não tiver dados de um mês, preencher com 0.

---

## 8. Campos que NÃO podem ser derivados dos XLSX

| Campo | Motivo | Proposta |
|---|---|---|
| `metaAnualPercent` | Sem meta no XLSX/CSV | Manter hardcoded `72` com documentação |
| `heroSpark` (derivado em mock.js) | Deriva de `receitaMensal.map(v => Math.round(v/1000))` | Automático se receitaMensal for real |
| `margemSpark` | Sem separação receita/custo | Proxy: `(orcado-executado)/orcado × 100` por mês |

---

## 9. Resumo do Audit

| Categoria | Total Fields | Derivados de XLSX/CSV | Hardcoded | Status |
|---|---|---|---|---|
| `obras[]` (8 campos) | 8 | 7 (nome, tipo, status, orcado, executado, avanco, gap) | 0 | ⚠️ `atrasoDias` precisa de fórmula melhor |
| `series.*` (5 campos) | 5 | 2 (composicaoTipo, receitaMensal¹) | 3 (meses12², margemSpark, metaAnualPercent) | ❌ 3 campos hardcoded |
| `dimensoes.*` (2 campos) | 2 | 2 (centros_custo, categorias) | 0 | ✅ |
| **TOTAL** | **15** | **11** | **3** | ❌ 3 campos precisam de decisão |

¹ `receitaMensal` PODE ser derivado — dados existem nos XLSX
² `meses12` PODE ser derivado — datas existem nos XLSX

**Ação necessária**: Decidir sobre 5 ambiguidades (A1-A5) antes de S2.
