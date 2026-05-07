"""
Pipeline ETL V8.

Le XLSX de ../dados_raw/, padroniza, valida, e gera snapshot.json
que o dashboard V8 consome.

Saida:
    output/snapshot.json
    output/validation_report.json (apenas se houver erros/avisos)

Pre-requisitos:
1. .venv criado (rode: python -m venv .venv && .venv/Scripts/pip install -r requirements.txt)
2. dados_raw/ populado com XLSX (para mock: scripts/dev/gerar_xlsx.bat)
3. dados_raw/dim_obras.csv presente (master data)
"""

import json
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd

# Pandera mudou de pandera para pandera.pandas em versoes recentes.
# Suporta ambos.
try:
    import pandera.pandas as pa
    from pandera.pandas import Column, Check
except ImportError:
    import pandera as pa
    from pandera import Column, Check

# ─── Pastas ──────────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DADOS_RAW = ROOT / "dados_raw"
OUTPUT = HERE / "output"
CONFIG = HERE / "config"

OUTPUT.mkdir(parents=True, exist_ok=True)
CONFIG.mkdir(parents=True, exist_ok=True)


# ─── Mapeamentos de cabecalho (variantes -> nome padronizado) ───────────────
MAPEAMENTOS = {
    "financeiro": {
        "data":                 ["Dt Lancamento", "Data", "Data Lanc."],
        "valor":                ["Valor R$", "Vlr", "Valor"],
        "centro_custo":         ["Centro de Custo", "CC", "C.Custo"],
        "categoria":            ["Categoria", "Cat."],
        "descricao_lancamento": ["Descricao", "Historico"],
    },
    "planejamento": {
        "etapa":             ["Etapa", "Atividade", "Fase"],
        "percent_concluido": ["% Concluido", "% Conc.", "Concluido (%)"],
        "peso":              ["Peso (%)", "Peso"],
        "inicio":            ["Inicio Previsto", "Inicio", "Data Inicio"],
        "fim":               ["Fim Previsto", "Termino", "Data Fim"],
    },
    "compras": {
        "data":       ["Data Pedido", "Dt Pedido", "Data"],
        "fornecedor": ["Fornecedor", "Forn."],
        "item":       ["Item", "Material", "Descricao"],
        "qtd":        ["Qtd", "Quantidade", "Qtd."],
        "valor_unit": ["Valor Unit", "Vlr Unit", "Preco Unit."],
        "total":      ["Total", "Vlr Total", "Total R$"],
    },
}

# Salva mapeamentos como JSON (documentacao + edicao manual no futuro)
with open(CONFIG / "mapeamentos.json", "w", encoding="utf-8") as f:
    json.dump(MAPEAMENTOS, f, ensure_ascii=False, indent=2)


# ─── Schemas Pandera (validacao por tipo) ───────────────────────────────────
# Pandera moderno difere `str` (string[python]) de `object` (numpy default).
# Como o pandas le XLSX para object por padrao, usamos `object` em colunas
# textuais para evitar falso positivo. Validamos conteudo via Check.
SCHEMA_FINANCEIRO = pa.DataFrameSchema({
    "data":                 Column(pa.DateTime, nullable=True),
    "valor":                Column(float, Check.greater_than_or_equal_to(0)),
    "centro_custo":         Column(object, nullable=True),
    "categoria":            Column(object, nullable=True),
    "descricao_lancamento": Column(object, nullable=True),
    "obra":                 Column(object),
    "arquivo_origem":       Column(object),
})

SCHEMA_PLANEJAMENTO = pa.DataFrameSchema({
    "etapa":             Column(object),
    "percent_concluido": Column(float, Check.in_range(0, 100)),
    "peso":              Column(float, Check.in_range(0, 100)),
    "inicio":            Column(pa.DateTime, nullable=True),
    "fim":               Column(pa.DateTime, nullable=True),
    "obra":              Column(object),
    "arquivo_origem":    Column(object),
})

SCHEMA_COMPRAS = pa.DataFrameSchema({
    "data":           Column(pa.DateTime, nullable=True),
    "fornecedor":     Column(object, nullable=True),
    "item":           Column(object, nullable=True),
    "qtd":            Column(float, Check.greater_than_or_equal_to(0)),
    "valor_unit":     Column(float, Check.greater_than_or_equal_to(0)),
    "total":          Column(float, Check.greater_than_or_equal_to(0)),
    "obra":           Column(object),
    "arquivo_origem": Column(object),
})


# ─── Series temporais ─────────────────────────────────────────────────────
# meses12 e receitaMensal agora derivados dinamicamente do financeiro (A5).
# Abaixo, apenas campos que NAO podem ser derivados dos XLSX:

# TODO: meta anual deve vir de config. Adicionar coluna meta_anual no
# dim_obras.csv (uma por obra) ou meta_anual.json (única global).
META_ANUAL_PERCENT = 72

# MOCK: XLSX não distingue receita de custo. Para derivar,
# adicionar coluna 'tipo_lancamento' (receita|despesa) nos XLSX financeiro.
MARGEM_SPARK = [38, 40, 39, 42, 41, 43, 42, 40, 44, 43, 41, 40]

# Meses pt-BR para formatação dinâmica (A5)
MESES_PT = {
    1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
    7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
}


# ─── Helpers ─────────────────────────────────────────────────────────────────

def safe_filename(nome: str) -> str:
    """Converte 'Torre A' -> 'torre_a' (sem acento, snake_case)."""
    s = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode()
    return s.lower().replace(" ", "_").replace(".", "").replace("-", "_")


def normalize_columns(df: pd.DataFrame, setor: str, log: list) -> pd.DataFrame:
    """Renomeia colunas conforme MAPEAMENTOS[setor]."""
    mapa_setor = MAPEAMENTOS[setor]
    rename_map = {}
    for padrao, variantes in mapa_setor.items():
        for var in variantes:
            if var in df.columns:
                rename_map[var] = padrao
                break

    desconhecidas = set(df.columns) - set(rename_map.keys())
    if desconhecidas:
        log.append(f"[AVISO] {setor}: cabecalhos nao mapeados: {sorted(desconhecidas)}")

    return df.rename(columns=rename_map)


def parse_types(df: pd.DataFrame) -> pd.DataFrame:
    """Converte data -> datetime, numerico -> float, texto -> object.

    Pandera moderno e estrito quanto a `object` vs `string[python]`. Como o
    pandas pode retornar qualquer um dos dois ao ler XLSX, normalizamos todas
    colunas textuais para `object`.
    """
    df = df.copy()
    for col in ("data", "inicio", "fim"):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    for col in ("valor", "percent_concluido", "peso", "qtd", "valor_unit", "total"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(float)
    # Texto -> object (forca dtype consistente para validacao Pandera)
    text_cols = ("centro_custo", "categoria", "descricao_lancamento",
                 "etapa", "fornecedor", "item",
                 "obra", "arquivo_origem")
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].astype(object)
    return df


def carregar_setor(setor: str, dim_obras_map: dict, log: list) -> pd.DataFrame:
    """Le todos XLSX de dados_raw/{setor}/, padroniza e concatena."""
    pasta = DADOS_RAW / setor
    if not pasta.exists():
        log.append(f"[ERRO] Pasta nao existe: {pasta}")
        return pd.DataFrame()

    dfs = []
    for xlsx in sorted(pasta.glob("*.xlsx")):
        try:
            df = pd.read_excel(xlsx)
            df = normalize_columns(df, setor, log)
            df = parse_types(df)
            # Adiciona obra/arquivo_origem como object (Pandera estrito)
            df["obra"] = pd.Series([dim_obras_map.get(xlsx.stem, xlsx.stem)] * len(df), dtype=object)
            df["arquivo_origem"] = pd.Series([xlsx.name] * len(df), dtype=object)
            dfs.append(df)
        except Exception as e:
            log.append(f"[ERRO] Falha ao ler {xlsx.name}: {e}")

    return pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()


def calcular_kpis_obra(nome_obra, fin_df, plan_df, dim_row, log=None):
    """Deriva campos calculados (executado, avanco, gap, atrasoDias) a partir dos dados setoriais.
    A1: atrasoDias derivado de planejamento.fim vs hoje (com regras da design).
    Optional: grava warnings em log para A4.
    """
    fin_obra  = fin_df[fin_df["obra"] == nome_obra]   if not fin_df.empty   else pd.DataFrame()
    plan_obra = plan_df[plan_df["obra"] == nome_obra] if not plan_df.empty  else pd.DataFrame()

    executado = float(fin_obra["valor"].sum()) if not fin_obra.empty else 0.0

    if not plan_obra.empty and plan_obra["peso"].sum() > 0:
        avanco = float(
            (plan_obra["percent_concluido"] * plan_obra["peso"]).sum()
            / plan_obra["peso"].sum()
        )
    else:
        avanco = 0.0

    orcado = float(dim_row["orcado"])
    avanco_financeiro = (executado / orcado * 100) if orcado > 0 else 0.0
    gap = round(avanco - avanco_financeiro, 1)

    # A1: atrasoDias derivado de datas de fim das etapas abertas
    atraso_dias = 0
    status = dim_row["status"]
    if status not in ("Concluida", "Planejado"):
        if not plan_obra.empty:
            etapas_abertas = plan_obra[plan_obra["percent_concluido"] < 100]
            if not etapas_abertas.empty:
                fim_max = pd.to_datetime(etapas_abertas["fim"], errors="coerce").max()
                if pd.notna(fim_max):
                    atraso_dias = max(0, (datetime.now() - fim_max).days)
                else:
                    atraso_dias = 0
            else:
                atraso_dias = 0
        else:
            atraso_dias = 0

    # A4: warning de inconsistência de status (quando gap > 30% em negativo)
    if log is not None:
        if abs(gap) > 30 and status not in ("Atencao", "Pendente"):
            log.append({
                "type": "status_inconsistency",
                "obra": nome_obra,
                "status": status,
                "gap": gap,
                "msg": f"Gap {gap:+.1f}% mas status='{status}' — verificar com equipe"
            })

    return {
        "nome":       nome_obra,
        "tipo":       dim_row["tipo"],
        "status":     status,
        "orcado":     orcado,
        "executado":  round(executado, 2),
        "avanco":     round(avanco, 1),
        "gap":        gap,
        "atrasoDias": atraso_dias,
    }


def calcular_composicao_tipo(obras_calculadas):
    """Calcula % de orcado por tipo de obra. Mapa pluralizado para UI."""
    df = pd.DataFrame(obras_calculadas)
    if df.empty:
        return []
    total = df["orcado"].sum()
    if total == 0:
        return []

    plural = {
        "Edificio": "Edifícios",
        "Loteamento": "Loteamentos",
        "Comercial": "Comercial",
        "Infraestrutura": "Infraestrutura",
    }
    grupos = df.groupby("tipo")["orcado"].sum().reset_index()
    return [
        {"name": plural.get(row["tipo"], row["tipo"]),
         "value": round(float(row["orcado"]) / float(total) * 100, 1)}
        for _, row in grupos.iterrows()
    ]


def derive_series(fin_df_local, log_acc: list):
    """Deriva meses12 e receitaMensal dinamicamente do financeiro (A5).

    Regra: ultimo mes com dados → end_month; rolling 12 meses para tras.
    Meses sem dados → receita=0 + warning.
    Formato: 'Mmm/AA' pt-BR (Jan/26, Fev/26, ...).
    """
    if fin_df_local is None or fin_df_local.empty:
        end_month = pd.Timestamp.now().to_period("M")
        meses_period = [end_month - i for i in range(11, -1, -1)]
        meses12 = [f"{MESES_PT[p.month]}/{str(p.year)[-2:]}" for p in meses_period]
        receitaMensal = [0 for _ in range(12)]
        log_acc.append({
            "type": "no_valid_financial_dates",
            "obra": "all",
            "msg": "Nenhuma data valida no financeiro",
        })
        return meses12, receitaMensal

    fin_all = fin_df_local.copy()
    fin_all["data_parsed"] = pd.to_datetime(fin_all["data"], errors="coerce")
    fin_valid = fin_all[fin_all["data_parsed"].notna()]

    if not fin_valid.empty:
        end_month = fin_valid["data_parsed"].max().to_period("M")
    else:
        end_month = pd.Timestamp.now().to_period("M")

    meses_period = [end_month - i for i in range(11, -1, -1)]
    meses12 = [f"{MESES_PT[p.month]}/{str(p.year)[-2:]}" for p in meses_period]
    monthly = fin_valid.groupby(fin_valid["data_parsed"].dt.to_period("M"))["valor"].sum()

    receitaMensal = []
    missing_months = []
    for p in meses_period:
        if p in monthly.index:
            receitaMensal.append(round(float(monthly[p]), 0))
        else:
            receitaMensal.append(0)
            missing_months.append(str(p))

    if missing_months:
        log_acc.append({
            "type": "missing_monthly_data",
            "months": missing_months,
            "msg": f"{len(missing_months)} meses sem dados financeiros — receita=0"
        })

    return meses12, receitaMensal


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    print()
    print(">> Pipeline ETL V8 Real")
    print(f" Origem: {DADOS_RAW}")
    print(f" Destino: {OUTPUT / 'snapshot.json'}")
    print()

    log = []

    # 1. Master data
    dim_path = DADOS_RAW / "dim_obras.csv"
    if not dim_path.exists():
        print(f"[ERRO] Master data nao encontrado: {dim_path}")
        print(">> Rode primeiro: scripts/dev/gerar_xlsx.bat (para mock) ou coloque XLSX reais em dados_raw/")
        return 1

    dim_obras = pd.read_csv(dim_path)
    print(f"[1/5] dim_obras.csv carregado: {len(dim_obras)} obras")

    # Mapping filename_stem -> nome_oficial (Torre_A -> Torre A)
    dim_obras["filename"] = dim_obras["nome"].apply(safe_filename)
    dim_obras_map = dict(zip(dim_obras["filename"], dim_obras["nome"]))

    # 2. Carrega setores
    print("[2/5] Carregando XLSX setoriais...")
    fin_df  = carregar_setor("financeiro",   dim_obras_map, log)
    plan_df = carregar_setor("planejamento", dim_obras_map, log)
    comp_df = carregar_setor("compras",      dim_obras_map, log)
    print(f"      financeiro:   {len(fin_df):4d} linhas")
    print(f"      planejamento: {len(plan_df):4d} linhas")
    print(f"      compras:      {len(comp_df):4d} linhas")

    # 3. Validacao Pandera
    print("[3/5] Validando schemas...")
    try:
        if not fin_df.empty:
            SCHEMA_FINANCEIRO.validate(fin_df, lazy=True)
        if not plan_df.empty:
            SCHEMA_PLANEJAMENTO.validate(plan_df, lazy=True)
        if not comp_df.empty:
            SCHEMA_COMPRAS.validate(comp_df, lazy=True)
        print("      [OK] Validacao passou")
    except pa.errors.SchemaErrors as e:
        log.append(f"[ERRO] Validacao Pandera falhou: {e}")
        print("      [ERRO] Validacao falhou. Veja validation_report.json")

    # 4. KPIs por obra
    print("[4/5] Calculando KPIs por obra...")
    obras_calculadas = []
    for _, dim_row in dim_obras.iterrows():
        nome = dim_row["nome"]
        kpis = calcular_kpis_obra(nome, fin_df, plan_df, dim_row, log)
        obras_calculadas.append(kpis)
        print(f"      [OK] {nome:25s} executado={kpis['executado']:>13,.0f}  avanco={kpis['avanco']:5.1f}%  gap={kpis['gap']:+5.1f}")

    # 5. Derive dynamic series (meses12 & receitaMensal) a partir do financeiro (A5)
    meses12, receitaMensal = derive_series(fin_df, log)

    # 5b. Snapshot
    print("[5/5] Gerando snapshot.json...")

    centros_custo = sorted(fin_df["centro_custo"].dropna().unique().tolist()) if not fin_df.empty else []
    categorias    = sorted(fin_df["categoria"].dropna().unique().tolist())    if not fin_df.empty else []

    snapshot = {
        "meta": {
            "versao_schema": "1.1",
            "gerado_em":     datetime.now().isoformat(timespec="seconds"),
            "total_obras":   len(obras_calculadas),
            "fonte":         "etl_v8_real",
        },
        "obras": obras_calculadas,
        "series": {
            "meses12":          meses12,
            "receitaMensal":    receitaMensal,
            "composicaoTipo":   calcular_composicao_tipo(obras_calculadas),
            "margemSpark":      MARGEM_SPARK,
            "metaAnualPercent": META_ANUAL_PERCENT,
        },
        "dimensoes": {
            "centros_custo": centros_custo,
            "categorias":    categorias,
        },
    }

    snapshot_path = OUTPUT / "snapshot.json"
    with open(snapshot_path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2, default=str)

    if log:
        # Separate structured messages from legacy string messages
        structured_msgs = []
        obras_with_warnings = set()
        total_warnings = 0
        total_errors = 0
        for msg in log:
            if isinstance(msg, dict):
                structured_msgs.append(msg)
                if msg.get("type") == "status_inconsistency":
                    obras_with_warnings.add(msg.get("obra", ""))
                total_warnings += 1
            else:
                # Legacy string messages (from carregar_setor etc.)
                structured_msgs.append({"type": "legacy", "msg": str(msg)})
                if "[ERRO]" in str(msg):
                    total_errors += 1
                else:
                    total_warnings += 1

        report = {
            "timestamp": datetime.now().isoformat(timespec="seconds"),
            "summary": {
                "total_warnings": total_warnings,
                "total_errors": total_errors,
                "obras_processed": len(obras_calculadas),
                "obras_with_warnings": len(obras_with_warnings),
            },
            "messages": structured_msgs,
        }
        with open(OUTPUT / "validation_report.json", "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\n>> {total_warnings} avisos, {total_errors} erros em validation_report.json")
    else:
        # Apaga relatorio antigo se nao houver nada para reportar
        old = OUTPUT / "validation_report.json"
        if old.exists():
            old.unlink()

    tamanho_kb = snapshot_path.stat().st_size / 1024
    print()
    print(f">> Pronto! snapshot.json gerado")
    print(f"   Caminho: {snapshot_path}")
    print(f"   Tamanho: {tamanho_kb:.1f} KB")
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
