# ETL_DESIGN.md — ETL V8 Real (S2)

> Baseado em: AUDIT_REPORT.md S1
> Decisões aprovadas em: revisão do auditor

---

## 1. Decisões de Produto (A1-A5)

| # | Decisão | Detalhe |
|---|---|---|
| **A1** atrasoDias | Derivar de planejamento.fim vs hoje | Se `status ∈ {Concluida, Planejado}` → `atrasoDias = 0`. Senão: `max(0, today - max(fim_previsto onde pct < 100))` |
| **A2** margemSpark | HARDCODED com comentário MOCK | `[38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]` até XLSX ter coluna `tipo_lancamento` |
| **A3** metaAnualPercent | HARDCODED `72` com TODO | Até equipe fornecer meta via config |
| **A4** status | CSV + warning | Se `abs(gap) > 30 && status ∉ {Atencao, Pendente}` → warning |
| **A5** meses12 | Dinâmico rolling 12m | Último mês com dados → 12 meses pra trás; meses sem dados = 0 + warning |

---

## 2. Fórmulas Exatas — obras[] (14 rows)

### 2.1 `nome`
```python
nome = dim_obras_row["nome"]  # direto do CSV, sem transformação
```

### 2.2 `tipo`
```python
tipo = dim_obras_row["tipo"]  # direto do CSV
# Valores: "Edificio", "Loteamento", "Comercial", "Infraestrutura"
# NOTA: sem acento no CSV (ed_central.xlsx = "Edificio", não "Edifício")
# Normalização para V8 acontece em mock.js _hydrateFromSnapshot()
```

### 2.3 `status`
```python
status = dim_obras_row["status"]  # direto do CSV
# Valores: "Em progresso", "Atencao", "Pendente", "Concluida", "Planejado"
# NOTA: sem acento no CSV. Normalização em mock.js.

# POST-VALIDATION WARNING:
if abs(gap) > 30 and status not in ("Atencao", "Pendente"):
    warnings.append({
        "type": "status_inconsistency",
        "obra": nome,
        "status": status,
        "gap": gap,
        "msg": f"Gap {gap:+.1f}% mas status='{status}' — verificar com equipe"
    })
```

### 2.4 `orcado`
```python
orcado = float(dim_obras_row["orcado"])  # direto do CSV
# Sempre > 0 (exceto se CSV tiver erro, Pandera detecta)
```

### 2.5 `executado`
```python
fin_obra = fin_df[fin_df["obra"] == nome]
executado = float(fin_obra["valor"].sum()) if not fin_obra.empty else 0.0
# EDGE CASE ed_central: 1 row com valor=0 → executado=0.0 ✓
# ROUNDING: round(executado, 2) para evitar float drift
```

### 2.6 `avanco`
```python
plan_obra = plan_df[plan_df["obra"] == nome]
if not plan_obra.empty and plan_obra["peso"].sum() > 0:
    avanco = float(
        (plan_obra["percent_concluido"] * plan_obra["peso"]).sum()
        / plan_obra["peso"].sum()
    )
else:
    avanco = 0.0
# EDGE CASE ed_central: 7 rows, todas com pct=0 → avanco=0.0 ✓
# ROUNDING: round(avanco, 1)
```

### 2.7 `gap`
```python
if orcado > 0:
    avanco_financeiro = (executado / orcado) * 100
else:
    avanco_financeiro = 0.0  # EDGE CASE: orcado=0 (improvável, mas seguro)
gap = round(avanco - avanco_financeiro, 1)
```

### 2.8 `atrasoDias`
```python
# Regra A1 aprovada:
if status in ("Concluida", "Planejado"):
    atraso_dias = 0
else:
    # Etapas não concluídas (pct < 100)
    etapas_abertas = plan_obra[plan_obra["percent_concluido"] < 100]
    if not etapas_abertas.empty:
        # Maior data fim prevista entre etapas abertas
        fim_max = pd.to_datetime(etapas_abertas["fim"], errors="coerce").max()
        if pd.notna(fim_max):
            atraso_dias = max(0, (datetime.now() - fim_max).days)
        else:
            atraso_dias = 0  # datas inválidas → sem atraso computável
    else:
        # Todas etapas concluídas mas status ≠ Concluida → atraso 0
        atraso_dias = 0
```

---

## 3. Fórmulas Exatas — series.*

### 3.1 `meses12` (dinâmico, A5 aprovado)

```python
# 1. Parsear todas datas do financeiro
fin_all = fin_df.copy()
fin_all["data_parsed"] = pd.to_datetime(fin_all["data"], errors="coerce")
fin_valid = fin_all[fin_all["data_parsed"].notna()]

# 2. Encontrar último mês com dados
if not fin_valid.empty:
    end_month = fin_valid["data_parsed"].max().to_period("M")
else:
    # Fallback: usar data de geração do snapshot
    end_month = pd.Timestamp.now().to_period("M")

# 3. Rolling 12 meses para trás
meses_period = [end_month - i for i in range(11, -1, -1)]  # 12 meses, ordem asc

# 4. Formato pt-BR: 'Mmm/AA'
MESES_PT = {
    1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
    7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
}
meses12 = [f"{MESES_PT[p.month]}/{str(p.year)[-2:]}" for p in meses_period]
```

**Edge cases:**
- **XLSX < 12 meses de dados**: meses sem dados → `receitaMensal[i] = 0` + warning
- **XLSX > 12 meses de dados**: usa só os últimos 12 (rolling window)
- **Zero datas válidas**: fallback pra data atual, todos valores = 0

### 3.2 `receitaMensal` (derivado, era hardcoded)

```python
# GROUP BY month, SUM(valor), alinhado com meses12
monthly = fin_valid.groupby(fin_valid["data_parsed"].dt.to_period("M"))["valor"].sum()
receitaMensal = []
missing_months = []
for p in meses_period:
    if p in monthly.index:
        receitaMensal.append(round(float(monthly[p]), 0))
    else:
        receitaMensal.append(0)
        missing_months.append(str(p))

# Warnings para meses sem dados
if missing_months:
    warnings.append({
        "type": "missing_monthly_data",
        "months": missing_months,
        "msg": f"{len(missing_months)} meses sem dados financeiros — receita=0"
    })
```

**Nota**: Os valores reais (audit S1) são:
```
[5469991, 5860207, 5689261, 9513896, 4937926, 4794459,
 9741107, 6637844, 7828621, 3117478, 6818658, 7248552]
```
vs mock atual:
```
[6200000, 7100000, 7500000, 8200000, 8600000, 9000000,
 9200000, 8800000, 9500000, 9800000, 9400000, 8734281]
```
**Diferença esperada** — mock era sintético, novo é real.

### 3.3 `composicaoTipo` (já derivado, sem mudança)

```python
# Sem alteração — já funciona corretamente
plural = {
    "Edificio": "Edifícios",
    "Loteamento": "Loteamentos",
    "Comercial": "Comercial",
    "Infraestrutura": "Infraestrutura",
}
grupos = df_obras.groupby("tipo")["orcado"].sum().reset_index()
composicaoTipo = [
    {"name": plural.get(row["tipo"], row["tipo"]),
     "value": round(float(row["orcado"]) / float(total_orcado) * 100, 1)}
    for _, row in grupos.iterrows()
]
```

### 3.4 `margemSpark` (A2: HARDCODED com MOCK comment)

```python
# MOCK: XLSX não distingue receita de custo. Para derivar,
# adicionar coluna 'tipo_lancamento' (receita|despesa) nos XLSX financeiro.
margemSpark = [38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]
```

### 3.5 `metaAnualPercent` (A3: HARDCODED com TODO)

```python
# TODO: meta anual deve vir de config. Adicionar coluna meta_anual no
# dim_obras.csv (uma por obra) ou meta_anual.json (única global).
metaAnualPercent = 72
```

---

## 4. Tratamento de Casos Especiais

### 4.1 `ed_central.xlsx` (obra "Planejado", valor=0)

```python
# financeiro/ed_central.xlsx: 1 row, valor=0, data=NaN, cc=NaN, cat=NaN
# Resultado esperado:
#   executado = 0.0
#   avanco = 0.0 (planejamento tem 7 etapas todas 0%)
#   gap = 0.0
#   atrasoDias = 0 (status = "Planejado")
#   receitaMensal[month] não recebe nada (valor=0 não soma)
# NÃO é erro — obra planejada ainda não começou.
```

### 4.2 XLSX faltante por obra/setor

```python
# Se XLSX não existe para obra+setor:
#   - Obra continua no snapshot (vem do dim_obras.csv)
#   - Campos derivados daquele setor = 0 ou NULL
#   - Warning em validation_report.json
if not xlsx_path.exists():
    log.append({
        "type": "missing_xlsx",
        "obra": nome,
        "setor": setor,
        "path": str(xlsx_path),
        "msg": f"XLSX ausente — campos de {setor} ficam com valor default"
    })
```

### 4.3 Coluna inesperada no XLSX

```python
# Já tratado pelo normalize_columns existente:
desconhecidas = set(df.columns) - set(rename_map.keys())
if desconhecidas:
    log.append({
        "type": "unmapped_columns",
        "setor": setor,
        "file": xlsx_name,
        "columns": sorted(desconhecidas),
        "msg": f"Colunas não mapeadas em {xlsx_name}: {sorted(desconhecidas)}"
    })
# Colunas não mapeadas são IGNORADAS (não crasham o ETL)
```

### 4.4 Validação Pandera falha

```python
# Schema validation falha → escreve validation_report.json + CONTINUE
try:
    schema.validate(df, lazy=True)
except pa.errors.SchemaErrors as e:
    log.append({
        "type": "schema_validation_error",
        "setor": setor,
        "errors": str(e),
        "msg": "Validação Pandera falhou — dados podem estar inconsistentes"
    })
    # NÃO raise — continua processamento com dados parciais
```

---

## 5. Formato do `validation_report.json`

```json
{
  "timestamp": "2026-05-02T14:30:00",
  "summary": {
    "total_warnings": 5,
    "total_errors": 0,
    "obras_processed": 14,
    "obras_with_warnings": 2
  },
  "messages": [
    {
      "type": "status_inconsistency",
      "obra": "Torre B",
      "status": "Em progresso",
      "gap": -35.2,
      "msg": "Gap -35.2% mas status='Em progresso' — verificar com equipe"
    },
    {
      "type": "missing_monthly_data",
      "months": ["2024-01", "2024-02"],
      "msg": "2 meses sem dados financeiros — receita=0"
    },
    {
      "type": "missing_xlsx",
      "obra": "Nova Obra",
      "setor": "financeiro",
      "path": "dados_raw/financeiro/nova_obra.xlsx",
      "msg": "XLSX ausente — campos de financeiro ficam com valor default"
    },
    {
      "type": "unmapped_columns",
      "setor": "financeiro",
      "file": "torre_a.xlsx",
      "columns": ["Observacao", "NF"],
      "msg": "Colunas não mapeadas em torre_a.xlsx: ['NF', 'Observacao']"
    },
    {
      "type": "schema_validation_error",
      "setor": "compras",
      "errors": "...",
      "msg": "Validação Pandera falhou — dados podem estar inconsistentes"
    }
  ]
}
```

**Regra**: `validation_report.json` só é gerado se `len(messages) > 0`. Se tudo limpo, arquivo é deletado.

---

## 6. Edge Cases — meses12 (A5 detalhado)

### 6.1 Cenário normal: XLSX tem 12+ meses

```
XLSX datas: Jan/25 a Dez/25
end_month = Dez/25
meses12 = [Jan/25, Fev/25, ..., Dez/25]
receitaMensal = [valor_jan, valor_fev, ..., valor_dez]
```

### 6.2 Cenário: XLSX tem < 12 meses (obra nova)

```
XLSX datas: Out/25 a Dez/25 (3 meses)
end_month = Dez/25
meses12 = [Jan/25, Fev/25, ..., Set/25, Out/25, Nov/25, Dez/25]
receitaMensal = [0, 0, ..., 0, valor_out, valor_nov, valor_dez]
warnings: ["Jan/25", "Fev/25", ..., "Set/25"] → 9 meses sem dados
```

### 6.3 Cenário: XLSX tem > 12 meses (dados históricos)

```
XLSX datas: Jan/24 a Mar/26 (27 meses)
end_month = Mar/26
meses12 = [Abr/25, Mai/25, ..., Mar/26]  (últimos 12)
receitaMensal = [soma_abr25, soma_mai25, ..., soma_mar26]
```

### 6.4 Cenário: Zero datas válidas (todos NaN)

```
end_month = now.to_period("M")  # fallback
meses12 = últimos 12 meses do calendário atual
receitaMensal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
warnings: ["all_months"] → "Nenhuma data válida no financeiro"
```

---

## 7. Campos que NÃO podem ser derivados

| Campo | Motivo | Valor | Documentação |
|---|---|---|---|
| `margemSpark` | XLSX não separa receita/custo | `[38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]` | Comentário `# MOCK` em main.py |
| `metaAnualPercent` | Sem meta nos dados | `72` | Comentário `# TODO` em main.py |

**Quando equipe adicionar coluna `tipo_lancamento` (receita|despesa) nos XLSX financeiro**, `margemSpark` poderá ser derivado como:
```python
receita_mes = fin[fin["tipo_lancamento"] == "receita"].groupby(month)["valor"].sum()
despesa_mes = fin[fin["tipo_lancamento"] == "despesa"].groupby(month)["valor"].sum()
margem_pct = ((receita_mes - despesa_mes) / receita_mes * 100).tolist()
```

---

## 8. Schema snapshot.json (idêntico ao atual, meta updated)

```json
{
  "meta": {
    "versao_schema": "1.1",
    "gerado_em": "ISO-8601 timestamp",
    "total_obras": 14,
    "fonte": "etl_v8_real"
  },
  "obras": [
    {
      "nome": "string",
      "tipo": "string",
      "status": "string",
      "orcado": "number",
      "executado": "number",
      "avanco": "number",
      "gap": "number",
      "atrasoDias": "number"
    }
  ],
  "series": {
    "meses12": ["string"],
    "receitaMensal": ["number"],
    "composicaoTipo": [{"name": "string", "value": "number"}],
    "margemSpark": ["number"],
    "metaAnualPercent": "number"
  },
  "dimensoes": {
    "centros_custo": ["string"],
    "categorias": ["string"]
  }
}
```

**Única mudança**: `meta.versao_schema` → `"1.1"`, `meta.fonte` → `"etl_v8_real"`

---

## 9. Refatoração main.py (overview S3)

```python
# Estrutura proposta:
def main():
    log = []
    
    # 1. Load master data
    dim_obras, dim_obras_map = load_dim_obras()
    
    # 2. Load setores (42 XLSX)
    fin_df = load_setor("financeiro", dim_obras_map, log)
    plan_df = load_setor("planejamento", dim_obras_map, log)
    comp_df = load_setor("compras", dim_obras_map, log)  # mantido mas não usado em snapshot ainda
    
    # 3. Validate schemas (Pandera)
    validate_all(fin_df, plan_df, comp_df, log)
    
    # 4. Aggregate obras (14 rows)
    obras = aggregate_obras(dim_obras, fin_df, plan_df, log)
    
    # 5. Aggregate series (derivado de financeiro)
    series = aggregate_series(fin_df, obras, log)
    
    # 6. Build dimensoes
    dimensoes = build_dimensoes(fin_df)
    
    # 7. Write snapshot
    write_snapshot(obras, series, dimensoes, log)
```

---

**⏸️ STOP GATE S2 → S3**: Aguardar aprovação antes de implementar.
