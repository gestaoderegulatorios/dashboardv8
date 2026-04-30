"""
Gera XLSX sinteticos a partir do mock atual do dashboard V8.

Simula como a equipe da construtora preencheria as planilhas:
3 variacoes de cabecalho por setor (testa o mapeamento do ETL).

Saida:
    ../dados_raw/financeiro/<obra>.xlsx
    ../dados_raw/planejamento/<obra>.xlsx
    ../dados_raw/compras/<obra>.xlsx
    ../dados_raw/dim_obras.csv

Reproducibilidade: random.seed(42) -> mesma saida sempre.
"""

import random
import unicodedata
from pathlib import Path

import pandas as pd

random.seed(42)

# --- Pastas ---
ROOT = Path(__file__).resolve().parent.parent
DADOS_RAW = ROOT / "dados_raw"

# --- Espelho do mock V8 (dashboard-v8/src/model/mock.js) ---
# 14 obras, paridade exata com o mock para A/B perfeito.
OBRAS = [
    {"nome": "Torre A",               "tipo": "Edificio",       "status": "Em progresso", "avanco": 68, "orcado": 12000000, "executado":  8500000, "gap": -3.5, "atrasoDias": 2},
    {"nome": "Torre B",               "tipo": "Loteamento",     "status": "Atencao",      "avanco": 43, "orcado":  9800000, "executado":  4120000, "gap": -7.4, "atrasoDias": 1},
    {"nome": "Torre C",               "tipo": "Comercial",      "status": "Pendente",     "avanco": 31, "orcado":  6700000, "executado":  3100000, "gap": -2.9, "atrasoDias": 0},
    {"nome": "Torre D",               "tipo": "Infraestrutura", "status": "Concluida",    "avanco": 55, "orcado": 15200000, "executado":  8600000, "gap":  2.1, "atrasoDias": 0},
    {"nome": "Residencial Parque",    "tipo": "Loteamento",     "status": "Em progresso", "avanco": 72, "orcado":  8400000, "executado":  6048000, "gap":  1.2, "atrasoDias": 0},
    {"nome": "Jardim Europa",         "tipo": "Loteamento",     "status": "Atencao",      "avanco": 38, "orcado":  5600000, "executado":  2128000, "gap": -5.1, "atrasoDias": 3},
    {"nome": "Horizon Hills",         "tipo": "Loteamento",     "status": "Em progresso", "avanco": 64, "orcado":  7200000, "executado":  4608000, "gap":  0.8, "atrasoDias": 0},
    {"nome": "Ed Central",            "tipo": "Comercial",      "status": "Planejado",    "avanco":  0, "orcado":  4500000, "executado":        0, "gap":  0.0, "atrasoDias": 0},
    {"nome": "Torre E",               "tipo": "Edificio",       "status": "Em progresso", "avanco": 82, "orcado": 14500000, "executado": 11890000, "gap":  1.5, "atrasoDias": 0},
    {"nome": "Torre F",               "tipo": "Edificio",       "status": "Em progresso", "avanco": 57, "orcado": 11300000, "executado":  6441000, "gap": -4.2, "atrasoDias": 2},
    {"nome": "Loteamento Bosque",     "tipo": "Loteamento",     "status": "Atencao",      "avanco": 29, "orcado":  6200000, "executado":  1798000, "gap": -8.1, "atrasoDias": 5},
    {"nome": "Galpao Logistico",      "tipo": "Comercial",      "status": "Em progresso", "avanco": 91, "orcado":  8900000, "executado":  8100000, "gap":  3.7, "atrasoDias": 0},
    {"nome": "Ponte Viaria",          "tipo": "Infraestrutura", "status": "Atencao",      "avanco": 46, "orcado": 18700000, "executado":  8602000, "gap": -6.3, "atrasoDias": 4},
    {"nome": "Estacao de Tratamento", "tipo": "Infraestrutura", "status": "Em progresso", "avanco": 73, "orcado":  5100000, "executado":  3723000, "gap":  0.4, "atrasoDias": 0},
]

# --- Variacoes de cabecalho (simula equipe diferente preenchendo) ---
# 3 variantes por setor, cicladas pelo indice da obra.

HEADERS_FINANCEIRO = [
    {"data": "Dt Lancamento", "valor": "Valor R$", "centro_custo": "Centro de Custo", "categoria": "Categoria", "descricao": "Descricao"},
    {"data": "Data",          "valor": "Vlr",      "centro_custo": "CC",              "categoria": "Cat.",      "descricao": "Historico"},
    {"data": "Data Lanc.",    "valor": "Valor",    "centro_custo": "C.Custo",         "categoria": "Categoria", "descricao": "Descricao"},
]

HEADERS_PLANEJAMENTO = [
    {"etapa": "Etapa",     "concluido": "% Concluido",   "peso": "Peso (%)", "inicio": "Inicio Previsto", "fim": "Fim Previsto"},
    {"etapa": "Atividade", "concluido": "% Conc.",       "peso": "Peso",     "inicio": "Inicio",          "fim": "Termino"},
    {"etapa": "Fase",      "concluido": "Concluido (%)", "peso": "Peso (%)", "inicio": "Data Inicio",     "fim": "Data Fim"},
]

HEADERS_COMPRAS = [
    {"data": "Data Pedido", "fornecedor": "Fornecedor", "item": "Item",      "qtd": "Qtd",        "valor_unit": "Valor Unit",  "total": "Total"},
    {"data": "Dt Pedido",   "fornecedor": "Forn.",      "item": "Material",  "qtd": "Quantidade", "valor_unit": "Vlr Unit",    "total": "Vlr Total"},
    {"data": "Data",        "fornecedor": "Fornecedor", "item": "Descricao", "qtd": "Qtd.",       "valor_unit": "Preco Unit.", "total": "Total R$"},
]

# --- Dimensoes auxiliares ---
CENTROS_CUSTO = ["Material", "Mao de Obra", "Equipamentos", "Servicos Terceirizados", "Administrativo"]
CATEGORIAS    = ["Concreto", "Aco", "Alvenaria", "Acabamento", "Instalacoes", "Estrutura", "Fundacao"]
FORNECEDORES  = ["Construrama", "Leroy Merlin", "Telhanorte", "Casa Show", "MaterFer", "Amanco", "Tigre", "Votorantim", "Gerdau", "Eternit"]
ITENS         = ["Cimento CP-II", "Aco CA-50", "Tijolo ceramico", "Tinta acrilica", "Tubo PVC 100mm", "Telha ceramica", "Brita 1", "Areia media", "Cabo eletrico 4mm", "Argamassa colante"]

ETAPAS_PADRAO = [
    ("Fundacao",    15),
    ("Estrutura",   25),
    ("Alvenaria",   20),
    ("Cobertura",   10),
    ("Instalacoes", 15),
    ("Acabamento",  10),
    ("Entrega",      5),
]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def safe_filename(nome: str) -> str:
    """Remove acentos e caracteres especiais. Converte para snake_case."""
    s = unicodedata.normalize("NFKD", nome).encode("ASCII", "ignore").decode()
    return s.lower().replace(" ", "_").replace(".", "").replace("-", "_")


def distribuir_valor(total: float, n: int) -> list:
    """Distribui um total em n parcelas com variacao, somando exatamente 'total'."""
    if total <= 0 or n <= 0:
        return []
    base = total / n
    valores = [base * random.uniform(0.5, 1.5) for _ in range(n)]
    soma = sum(valores)
    fator = total / soma
    return [round(v * fator, 2) for v in valores]


def random_date(ano: int = 2025) -> str:
    """Data aleatoria em 'ano' no formato ISO (YYYY-MM-DD)."""
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)
    return f"{ano}-{mes:02d}-{dia:02d}"


# ─── Geradores ───────────────────────────────────────────────────────────────

def gerar_financeiro(obra: dict, idx: int) -> pd.DataFrame:
    headers = HEADERS_FINANCEIRO[idx % len(HEADERS_FINANCEIRO)]
    n_lanc = random.randint(15, 25)
    valores = distribuir_valor(obra["executado"], n_lanc)

    rows = []
    for i, valor in enumerate(valores):
        rows.append({
            headers["data"]:         random_date(),
            headers["valor"]:        valor,
            headers["centro_custo"]: random.choice(CENTROS_CUSTO),
            headers["categoria"]:    random.choice(CATEGORIAS),
            headers["descricao"]:    f"Lancamento {i+1:03d}",
        })

    # Caso especial: obra com executado=0 (Ed Central) — gera 1 linha vazia.
    if not rows:
        rows.append({
            headers["data"]:         "",
            headers["valor"]:        0,
            headers["centro_custo"]: "",
            headers["categoria"]:    "",
            headers["descricao"]:    "(sem lancamentos)",
        })

    return pd.DataFrame(rows)


def gerar_planejamento(obra: dict, idx: int) -> pd.DataFrame:
    headers = HEADERS_PLANEJAMENTO[idx % len(HEADERS_PLANEJAMENTO)]
    avanco_obra = obra["avanco"]

    rows = []
    for i, (etapa, peso) in enumerate(ETAPAS_PADRAO):
        if avanco_obra >= 100:
            conc = 100
        elif avanco_obra == 0:
            conc = 0
        else:
            # Etapas iniciais mais avancadas, finais menos.
            fator = 1.0 + (3 - i) * 0.1
            conc = max(0, min(100, round(avanco_obra * fator)))
        rows.append({
            headers["etapa"]:     etapa,
            headers["concluido"]: conc,
            headers["peso"]:      peso,
            headers["inicio"]:    f"2025-{min((i+1)*2, 12):02d}-01",
            headers["fim"]:       f"2025-{min((i+1)*2 + 2, 12):02d}-28",
        })
    return pd.DataFrame(rows)


def gerar_compras(obra: dict, idx: int) -> pd.DataFrame:
    headers = HEADERS_COMPRAS[idx % len(HEADERS_COMPRAS)]
    n_pedidos = random.randint(8, 18)

    rows = []
    for _ in range(n_pedidos):
        qtd = random.randint(10, 200)
        valor_unit = round(random.uniform(15, 850), 2)
        total = round(qtd * valor_unit, 2)
        rows.append({
            headers["data"]:       random_date(),
            headers["fornecedor"]: random.choice(FORNECEDORES),
            headers["item"]:       random.choice(ITENS),
            headers["qtd"]:        qtd,
            headers["valor_unit"]: valor_unit,
            headers["total"]:      total,
        })
    return pd.DataFrame(rows)


# ─── Main ────────────────────────────────────────────────────────────────────

def main():
    # Cria pastas (idempotente)
    for setor in ("financeiro", "planejamento", "compras"):
        (DADOS_RAW / setor).mkdir(parents=True, exist_ok=True)

    print()
    print(">> Gerando XLSX sinteticos...")
    print(f"   Saida: {DADOS_RAW}")
    print()

    for idx, obra in enumerate(OBRAS):
        nome_arq = safe_filename(obra["nome"])

        df_fin  = gerar_financeiro(obra, idx)
        df_plan = gerar_planejamento(obra, idx)
        df_comp = gerar_compras(obra, idx)

        df_fin.to_excel(DADOS_RAW / "financeiro"   / f"{nome_arq}.xlsx", index=False)
        df_plan.to_excel(DADOS_RAW / "planejamento" / f"{nome_arq}.xlsx", index=False)
        df_comp.to_excel(DADOS_RAW / "compras"     / f"{nome_arq}.xlsx", index=False)

        print(f"   [OK] {obra['nome']:25s}  fin={len(df_fin):3d}  plan={len(df_plan):2d}  comp={len(df_comp):3d}")

    # dim_obras.csv (master data)
    dim_obras = pd.DataFrame(OBRAS)[["nome", "tipo", "status", "orcado"]]
    dim_obras.to_csv(DADOS_RAW / "dim_obras.csv", index=False, encoding="utf-8-sig")

    print()
    print(f">> Pronto! {len(OBRAS) * 3} XLSX + dim_obras.csv gerados.")
    print(">> Proximo passo: rodar o ETL (sera criado em E3).")
    print()


if __name__ == "__main__":
    main()
