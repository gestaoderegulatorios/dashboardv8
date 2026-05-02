"""S1 AUDIT script — inspects all XLSX and derives field provenance."""
import pandas as pd
import os, unicodedata, json

base = os.path.join(os.path.dirname(__file__), '..', 'dados_raw')

def safe_filename(nome):
    s = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode()
    return s.lower().replace(" ", "_").replace(".", "").replace("-", "_")

dim = pd.read_csv(os.path.join(base, "dim_obras.csv"))

# ── 1. Financeiro consolidation ──
MAPEAMENTOS_FIN = {
    "data": ["Dt Lancamento", "Data", "Data Lanc."],
    "valor": ["Valor R$", "Vlr", "Valor"],
    "centro_custo": ["Centro de Custo", "CC", "C.Custo"],
    "categoria": ["Categoria", "Cat."],
    "descricao_lancamento": ["Descricao", "Historico"],
}

fin_dfs = []
for fname in dim["nome"]:
    sf = safe_filename(fname)
    path = os.path.join(base, "financeiro", f"{sf}.xlsx")
    df = pd.read_excel(path, sheet_name="Sheet1")
    rename = {}
    for padrao, variantes in MAPEAMENTOS_FIN.items():
        for var in variantes:
            if var in df.columns:
                rename[var] = padrao
                break
    df = df.rename(columns=rename)
    df["obra"] = fname
    fin_dfs.append(df)

fin = pd.concat(fin_dfs, ignore_index=True)

print("=" * 70)
print("FINANCEIRO: SUM(valor) per obra vs dim_obras.orcado")
print("=" * 70)
for _, row in dim.iterrows():
    nome = row["nome"]
    orcado = row["orcado"]
    sum_val = fin[fin["obra"] == nome]["valor"].sum()
    match = "YES" if abs(sum_val - orcado) < 1 else "NO"
    print(f"  {nome:<25} orcado={orcado:>13,.0f}  sum_fin={sum_val:>13,.0f}  match={match}")

total_fin = fin["valor"].sum()
print(f"\n  TOTAL financeiro: {total_fin:,.0f}")
print(f"  TOTAL dim_obras.orcado: {dim['orcado'].sum():,.0f}")

# ── 2. Date analysis (can we derive receitaMensal?) ──
fin["data_parsed"] = pd.to_datetime(fin["data"], errors="coerce")
fin_valid = fin[fin["data_parsed"].notna()]
print(f"\n{'=' * 70}")
print(f"DATE ANALYSIS: can we derive receitaMensal from financeiro?")
print(f"{'=' * 70}")
print(f"  Rows with valid dates: {len(fin_valid)} / {len(fin)}")
if len(fin_valid) > 0:
    monthly = fin_valid.groupby(fin_valid["data_parsed"].dt.to_period("M"))["valor"].sum()
    print(f"  Months found: {len(monthly)}")
    for period, val in monthly.items():
        print(f"    {period}: R$ {val:,.0f}")
else:
    print("  NO valid dates found! receitaMensal CANNOT be derived from financeiro.")

# ── 3. Planejamento consolidation ──
MAPEAMENTOS_PLAN = {
    "etapa": ["Etapa", "Atividade", "Fase"],
    "percent_concluido": ["% Concluido", "% Conc.", "Concluido (%)"],
    "peso": ["Peso (%)", "Peso"],
    "inicio": ["Inicio Previsto", "Inicio", "Data Inicio"],
    "fim": ["Fim Previsto", "Termino", "Data Fim"],
}

plan_dfs = []
for fname in dim["nome"]:
    sf = safe_filename(fname)
    path = os.path.join(base, "planejamento", f"{sf}.xlsx")
    df = pd.read_excel(path, sheet_name="Sheet1")
    rename = {}
    for padrao, variantes in MAPEAMENTOS_PLAN.items():
        for var in variantes:
            if var in df.columns:
                rename[var] = padrao
                break
    df = df.rename(columns=rename)
    df["obra"] = fname
    df["peso"] = pd.to_numeric(df.get("peso", 0), errors="coerce").fillna(0)
    df["percent_concluido"] = pd.to_numeric(df.get("percent_concluido", 0), errors="coerce").fillna(0)
    plan_dfs.append(df)

plan = pd.concat(plan_dfs, ignore_index=True)

print(f"\n{'=' * 70}")
print(f"PLANEJAMENTO: avanco calculado vs gerar_mock_xlsx expected")
print(f"{'=' * 70}")
for _, row in dim.iterrows():
    nome = row["nome"]
    plan_obra = plan[plan["obra"] == nome]
    if len(plan_obra) > 0 and plan_obra["peso"].sum() > 0:
        avanco_calc = (plan_obra["percent_concluido"] * plan_obra["peso"]).sum() / plan_obra["peso"].sum()
    else:
        avanco_calc = 0.0
    print(f"  {nome:<25} etapas={len(plan_obra)}  avanco_calc={avanco_calc:.1f}%")

# ── 4. Compras consolidation ──
MAPEAMENTOS_COMP = {
    "data": ["Data Pedido", "Dt Pedido", "Data"],
    "fornecedor": ["Fornecedor", "Forn."],
    "item": ["Item", "Material", "Descricao"],
    "qtd": ["Qtd", "Quantidade", "Qtd."],
    "valor_unit": ["Valor Unit", "Vlr Unit", "Preco Unit."],
    "total": ["Total", "Vlr Total", "Total R$"],
}

comp_dfs = []
for fname in dim["nome"]:
    sf = safe_filename(fname)
    path = os.path.join(base, "compras", f"{sf}.xlsx")
    df = pd.read_excel(path, sheet_name="Sheet1")
    rename = {}
    for padrao, variantes in MAPEAMENTOS_COMP.items():
        for var in variantes:
            if var in df.columns:
                rename[var] = padrao
                break
    df = df.rename(columns=rename)
    df["obra"] = fname
    comp_dfs.append(df)

comp = pd.concat(comp_dfs, ignore_index=True)
comp["total_num"] = pd.to_numeric(comp.get("total", 0), errors="coerce").fillna(0)

print(f"\n{'=' * 70}")
print(f"COMPRAS: summary per obra")
print(f"{'=' * 70}")
for _, row in dim.iterrows():
    nome = row["nome"]
    comp_obra = comp[comp["obra"] == nome]
    total_compras = comp_obra["total_num"].sum()
    print(f"  {nome:<25} pedidos={len(comp_obra)}  total_compras={total_compras:>13,.0f}")

# ── 5. Unique dimensions ──
cc = sorted(fin["centro_custo"].dropna().unique().tolist())
cat = sorted(fin["categoria"].dropna().unique().tolist())
forn = sorted(comp.get("fornecedor", pd.Series()).dropna().unique().tolist())
itens = sorted(comp.get("item", pd.Series()).dropna().unique().tolist())
etapas = sorted(plan["etapa"].dropna().unique().tolist())

print(f"\n{'=' * 70}")
print(f"DIMENSIONS (unique values)")
print(f"{'=' * 70}")
print(f"  centros_custo ({len(cc)}): {cc}")
print(f"  categorias ({len(cat)}): {cat}")
print(f"  fornecedores ({len(forn)}): {forn}")
print(f"  itens ({len(itens)}): {itens}")
print(f"  etapas ({len(etapas)}): {etapas}")

# ── 6. Current snapshot.json field provenance ──
snap_path = os.path.join(os.path.dirname(__file__), "output", "snapshot.json")
if os.path.exists(snap_path):
    with open(snap_path, encoding="utf-8") as f:
        snap = json.load(f)
    print(f"\n{'=' * 70}")
    print(f"CURRENT SNAPSHOT: field provenance analysis")
    print(f"{'=' * 70}")
    print(f"  meta.fonte: {snap.get('meta', {}).get('fonte', 'N/A')}")
    print(f"  meta.total_obras: {snap.get('meta', {}).get('total_obras', 'N/A')}")
    print(f"  obras count: {len(snap.get('obras', []))}")
    print(f"  series keys: {list(snap.get('series', {}).keys())}")
    print(f"  series.meses12: {snap.get('series', {}).get('meses12', [])}")
    print(f"  series.receitaMensal: {snap.get('series', {}).get('receitaMensal', [])}")
    print(f"  series.metaAnualPercent: {snap.get('series', {}).get('metaAnualPercent', 'N/A')}")
    print(f"  series.margemSpark: {snap.get('series', {}).get('margemSpark', [])}")
    print(f"  dimensoes keys: {list(snap.get('dimensoes', {}).keys())}")

print(f"\n{'=' * 70}")
print(f"AUDIT COMPLETE")
print(f"{'=' * 70}")
