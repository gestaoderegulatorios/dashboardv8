# SCHEMA — Pipeline ETL V8

> Documento de referência para o pipeline ETL do dashboard V8.
> Versão 1.0 — gerado a partir do mock atual (`dashboard-v8/src/model/mock.js`).

---

## 1. Visão Geral

Este pipeline:
1. Lê arquivos XLSX de uma pasta local (`dados_raw/`).
2. Padroniza cabeçalhos (cada setor preenche diferente).
3. Valida tipos e regras (Pandera).
4. Gera um único `snapshot.json` consolidado.
5. O dashboard V8 consome esse JSON (não mais o mock interno).

**Estratégia:** validamos com dados sintéticos primeiro (fases E1–E4) e só depois plugamos dados reais. Quando os dados reais chegarem, só os XLSX trocam — o pipeline já está testado.

---

## 2. Estrutura de Pastas

```
SkillDashboardHTML/
├── dados_raw/                # Entrada — XLSX da equipe (NÃO vai pro git)
│   ├── financeiro/           # Lançamentos de custos
│   │   ├── torre_a.xlsx
│   │   └── torre_b.xlsx
│   ├── planejamento/         # Etapas e % avanço
│   │   ├── torre_a.xlsx
│   │   └── torre_b.xlsx
│   ├── compras/              # Pedidos
│   │   ├── torre_a.xlsx
│   │   └── torre_b.xlsx
│   └── dim_obras.csv         # Master data (cadastro de obras)
│
├── etl_v8/                   # Pipeline ETL (este diretório)
│   ├── SCHEMA.md             # Este documento
│ ├── main.py # ETL completo
│ ├── requirements.txt
│ ├── config/ # Mapeamentos de cabecalho
│ ├── scripts/
│ │   ├── dev/ # Ferramentas de desenvolvimento
│ │   │   ├── gerar_mock_xlsx.py # Gerador de dados sinteticos
│ │   │   └── gerar_xlsx.bat # Double-click para gerar XLSX mock
│   └── output/               # snapshot.json (gerado, NÃO vai pro git)
│
└── dashboard-v8/
    └── public/
        └── data/
            └── snapshot.json  # Copiado do output/ (E5)
```

**Regra de ouro:** uma obra = um arquivo XLSX por setor. Nome do arquivo = identificador da obra. Não há coluna "Obra" dentro do XLSX — o nome da obra é inferido do nome do arquivo.

---

## 3. Entidades do Domínio

### 3.1 Obra (raiz)

| Campo | Tipo | Origem |
|---|---|---|
| `nome` | string | Nome do arquivo (sem extensão) |
| `tipo` | enum | `dim_obras.csv` — Edifício \| Loteamento \| Comercial \| Infraestrutura |
| `status` | enum | `dim_obras.csv` — Em progresso \| Atenção \| Pendente \| Concluída \| Planejado |
| `orcado` | number (R$) | `dim_obras.csv` |
| `executado` | number (R$) | Soma de `valor` em `financeiro/{obra}.xlsx` |
| `avanco` | number (0–100) | Soma ponderada de `planejamento/{obra}.xlsx` (`% concluído × peso`) |
| `gap` | number | Calculado: `avanco - (executado / orcado × 100)` |
| `atrasoDias` | number | Calculado a partir das datas de planejamento |

### 3.2 Lançamento Financeiro — `financeiro/{obra}.xlsx`

| Campo padrão | Tipo | Variantes de cabeçalho aceitas |
|---|---|---|
| `data` | date | "Dt Lançamento", "Data", "Data Lanç." |
| `valor` | number (R$) | "Valor R$", "Vlr", "Valor" |
| `centro_custo` | string | "Centro de Custo", "CC", "C.Custo" |
| `categoria` | string | "Categoria", "Cat." |
| `descricao` | string | "Descrição", "Histórico" |

### 3.3 Etapa de Planejamento — `planejamento/{obra}.xlsx`

| Campo padrão | Tipo | Variantes |
|---|---|---|
| `etapa` | string | "Etapa", "Atividade", "Fase" |
| `percent_concluido` | number (0–100) | "% Concluído", "% Conc.", "Concluído (%)" |
| `peso` | number (%) | "Peso (%)", "Peso" |
| `inicio` | date | "Início Previsto", "Início", "Data Início" |
| `fim` | date | "Fim Previsto", "Término", "Data Fim" |

### 3.4 Pedido de Compra — `compras/{obra}.xlsx`

| Campo padrão | Tipo | Variantes |
|---|---|---|
| `data` | date | "Data Pedido", "Dt Pedido", "Data" |
| `fornecedor` | string | "Fornecedor", "Forn." |
| `item` | string | "Item", "Material", "Descrição" |
| `qtd` | number | "Qtd", "Quantidade", "Qtd." |
| `valor_unit` | number (R$) | "Valor Unit", "Vlr Unit", "Preço Unit." |
| `total` | number (R$) | "Total", "Vlr Total", "Total R$" |

---

## 4. Output — `snapshot.json`

Estrutura final que o dashboard V8 consome:

```json
{
  "meta": {
    "versao_schema": "1.0",
    "gerado_em": "2026-04-29T16:00:00",
    "total_obras": 14,
    "fonte": "etl_v8"
  },
  "obras": [
    {
      "nome": "Torre A",
      "tipo": "Edifício",
      "status": "Em progresso",
      "orcado": 12000000,
      "executado": 8500000,
      "avanco": 68,
      "gap": -3.5,
      "atrasoDias": 2
    }
  ],
  "series": {
    "meses12": ["Abr/25", "Mai/25", "..."],
    "receitaMensal": [6200000, 7100000, "..."],
    "composicaoTipo": [
      { "name": "Edifícios", "value": 58 }
    ]
  },
  "dimensoes": {
    "centros_custo": ["Material", "Mão de Obra", "..."],
    "categorias": ["Concreto", "Aço", "..."]
  }
}
```

**Decisão arquitetural:** KPIs (totais, médias, agregações) **NÃO** entram no JSON. O dashboard recalcula em runtime para suportar filtros dinâmicos sem precisar regerar o snapshot.

---

## 5. Erros que o ETL Detecta

| Erro | Detecção | Ação |
|---|---|---|
| XLSX corrompido | `pd.read_excel` falha | Pula arquivo, registra em `validation_report.json` |
| Coluna não mapeada | Compara cabeçalho com variantes | Aviso em log (não falha) |
| Valor negativo onde não pode | Schema Pandera | Falha, com linha + coluna + motivo |
| Data inválida | Parse explícito | Falha, com linha + coluna |
| Obra em XLSX mas não em `dim_obras.csv` | Cross-check | Aviso (obra "órfã") |
| Obra em `dim_obras.csv` mas sem XLSX | Cross-check | Aviso (obra sem dados do mês) |

---

## 6. Versionamento do Schema

Sempre que um campo for adicionado, removido ou renomeado, atualize `meta.versao_schema` no JSON e documente aqui:

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | 2026-04-29 | Versão inicial — paridade com `dashboard-v8/src/model/mock.js` |

---

## 7. Como Estender Quando os Dados Reais Chegarem

Quando substituir os XLSX sintéticos por planilhas reais da equipe:

1. **Verificar cabeçalhos.** Comparar com a tabela "Variantes" da Seção 3. Se a equipe usar um nome novo (ex.: "Vlr Total Líquido"), adicionar ao mapa de variantes em `etl_v8/config/mapeamentos.json`.
2. **Rodar ETL.** Mensagens de erro do Pandera apontam exatamente o que está fora do schema.
3. **Não mexer no dashboard.** Se o snapshot.json mantém o schema documentado aqui, o V8 não percebe diferença.

Esta é a regra de proteção: **mudanças no formato dos XLSX → mudanças apenas em `etl_v8/`**, nunca no dashboard.
