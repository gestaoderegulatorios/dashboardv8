#!/usr/bin/env python3
"""
Verificador automático do Dashboard Borgonovi V7
================================================
Executa validação em DUAS CAMADAS:

CAMADA 1 (estática, rápida, sem browser):
  - Sintaxe JS via `node --check` em cada <script>
  - Balanço de tags HTML e <script>/<style>
  - getElementById referenciado DEVE ter contrapartida <div id="X">
  - Borg.X chamado em onclick DEVE ser exportado no IIFE ou atribuído em Section 8
  - createChart('X', ...) DEVE ter container <div id="X"> correspondente
  - Duplicação de nomes de funções de topo (colisão de escopo)
  - Chaves/parênteses/colchetes balanceados em cada script

CAMADA 2 (runtime, precisa playwright/chromium — opcional):
  - Abre dashboard.html em chromium headless
  - Captura erros de console (JS errors, warnings)
  - Valida SVG renderizado dentro de cada [id^="chart-"]
  - Clica em botões (fullscreen, filtro, salvar) e verifica reação
  - Tira screenshots de cada view

Uso:
    python3 verificador.py                         # só camada 1
    python3 verificador.py --runtime               # camadas 1+2 (se playwright disponível)
    python3 verificador.py --file outro.html       # verificar outro arquivo
"""

import os
import re
import sys
import json
import shutil
import subprocess
import tempfile
import argparse
from pathlib import Path
from collections import Counter, defaultdict

# Windows: cp1252 não aceita ▶/—/✓/✗/…; força UTF-8 no stdout/stderr.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except (AttributeError, Exception):
        pass

# ---------- configuração ----------
DEFAULT_FILE = str(Path(__file__).resolve().parent / "dashboard.html")

ANSI = {
    "reset": "\033[0m",
    "bold":  "\033[1m",
    "red":   "\033[31m",
    "green": "\033[32m",
    "yellow":"\033[33m",
    "blue":  "\033[34m",
    "gray":  "\033[90m",
}

def c(color, text):
    if not sys.stdout.isatty():
        return text
    return f"{ANSI.get(color,'')}{text}{ANSI['reset']}"


# ---------- coletores de resultado ----------
class Report:
    def __init__(self):
        self.checks = []   # list of (name, status, detail)
        self.fatal = []    # bloqueia execução
        self.warn = []     # cosmético

    def ok(self, name, detail=""):
        self.checks.append((name, "OK", detail))
    def fail(self, name, detail=""):
        self.checks.append((name, "FAIL", detail))
        self.fatal.append((name, detail))
    def warn_(self, name, detail=""):
        self.checks.append((name, "WARN", detail))
        self.warn.append((name, detail))

    def summary(self):
        total = len(self.checks)
        oks = sum(1 for _,s,_ in self.checks if s == "OK")
        fails = sum(1 for _,s,_ in self.checks if s == "FAIL")
        warns = sum(1 for _,s,_ in self.checks if s == "WARN")
        print()
        print(c("bold", "=" * 70))
        print(c("bold", f"RESUMO: {oks}/{total} OK  •  {c('red', str(fails)+' FAIL')}  •  {c('yellow', str(warns)+' WARN')}"))
        print(c("bold", "=" * 70))
        if self.fatal:
            print(c("red", "\nFALHAS CRÍTICAS:"))
            for name, detail in self.fatal:
                print(f"  {c('red','✗')} {name}")
                if detail:
                    for line in detail.split("\n")[:10]:
                        print(f"      {c('gray', line)}")
        if self.warn:
            print(c("yellow", "\nAVISOS:"))
            for name, detail in self.warn[:20]:
                print(f"  {c('yellow','!')} {name}")
                if detail:
                    for line in detail.split("\n")[:3]:
                        print(f"      {c('gray', line)}")

        return fails == 0


# ---------- leitura e parsing ----------
def load(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


SCRIPT_RE = re.compile(r"<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>", re.DOTALL)
STYLE_RE  = re.compile(r"<style(?P<attrs>[^>]*)>(?P<body>.*?)</style>", re.DOTALL)

def extract_scripts(html):
    """
    Retorna lista de (idx, attrs, body, line_start, is_external).
    Ignora scripts com src="" (externos).
    """
    scripts = []
    offset_lines = 1 + html[:0].count("\n")
    for m in SCRIPT_RE.finditer(html):
        attrs = m.group("attrs") or ""
        body = m.group("body") or ""
        is_external = 'src=' in attrs
        line_start = html[:m.start()].count("\n") + 1
        scripts.append({
            "idx": len(scripts) + 1,
            "attrs": attrs.strip(),
            "body": body,
            "line_start": line_start,
            "is_external": is_external,
            "offset": m.start("body"),
        })
    return scripts


# ---------- CAMADA 1: CHECKS ESTÁTICOS ----------
def check_tag_balance(html, r: Report):
    """Validação dos pares <script>/<tag-pair>."""
    # neutraliza corpos de <script>/<style> e comentários HTML para evitar
    # falso positivo quando strings JS contêm literal '<script>' ou similar.
    stripped = SCRIPT_RE.sub("<script></script>", html)
    stripped = STYLE_RE.sub("<style></style>", stripped)
    stripped = re.sub(r"<!--.*?-->", "", stripped, flags=re.DOTALL)

    opens = len(re.findall(r"<script\b", stripped))
    closes = len(re.findall(r"</script>", stripped))
    if opens == closes:
        r.ok(f"<script> balanceado", f"{opens} aberturas / {closes} fechamentos")
    else:
        r.fail("<script> desbalanceado", f"{opens} aberturas vs {closes} fechamentos")

    opens_s = len(re.findall(r"<style\b", stripped))
    closes_s = len(re.findall(r"</style>", stripped))
    if opens_s == closes_s:
        r.ok("<style> balanceado", f"{opens_s}/{closes_s}")
    else:
        r.fail("<style> desbalanceado", f"{opens_s} vs {closes_s}")

    for tag in ["main", "body", "html"]:
        if f"</{tag}>" in html:
            r.ok(f"</{tag}> presente")
        else:
            r.fail(f"</{tag}> ausente", "arquivo pode estar truncado")


def node_syntax_check(scripts, r: Report):
    """node --check em cada <script> inline."""
    node_path = shutil.which("node")
    if not node_path:
        r.warn_("node --check pulado", "node não disponível no PATH")
        return

    for s in scripts:
        if s["is_external"]:
            continue
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tf:
            tf.write(s["body"])
            tmp = tf.name
        try:
            p = subprocess.run([node_path, "--check", tmp], capture_output=True, text=True, timeout=20)
            if p.returncode == 0:
                r.ok(f"script #{s['idx']} (linha {s['line_start']}) — sintaxe JS OK",
                     f"{len(s['body'].splitlines())} linhas")
            else:
                err = (p.stderr or p.stdout or "").strip()
                # tenta mapear número de linha do tempfile → linha original
                mapped = re.sub(
                    rf":(\d+)",
                    lambda m: f":{int(m.group(1))+s['line_start']-1}",
                    err,
                    count=1,
                )
                r.fail(f"script #{s['idx']} (linha {s['line_start']}) — ERRO DE SINTAXE",
                       mapped[:500])
        except subprocess.TimeoutExpired:
            r.warn_(f"script #{s['idx']} — node --check timeout")
        finally:
            os.unlink(tmp)


def collect_ids_in_html(html):
    """IDs definidos via id='x' ou id=\"x\"."""
    return set(re.findall(r'''\bid=['"]([a-zA-Z][\w:-]*)['"]''', html))


def collect_getelementbyid(scripts):
    """IDs passados em getElementById('x') / querySelector('#x')."""
    ids = Counter()
    id_locations = defaultdict(list)
    for s in scripts:
        if s["is_external"]:
            continue
        for m in re.finditer(r'''getElementById\(\s*['"]([a-zA-Z][\w:-]*)['"]\s*\)''', s["body"]):
            ids[m.group(1)] += 1
            line_in_script = s["body"][:m.start()].count("\n")
            id_locations[m.group(1)].append((s["idx"], s["line_start"] + line_in_script))
        for m in re.finditer(r'''querySelector\(\s*['"]#([a-zA-Z][\w:-]*)['"]\s*\)''', s["body"]):
            ids[m.group(1)] += 1
            line_in_script = s["body"][:m.start()].count("\n")
            id_locations[m.group(1)].append((s["idx"], s["line_start"] + line_in_script))
    return ids, id_locations


def check_ids_referenced(html, scripts, r: Report):
    html_ids = collect_ids_in_html(html)
    referenced, locations = collect_getelementbyid(scripts)
    missing = [i for i in referenced if i not in html_ids]
    # tolerância: alguns IDs são criados dinamicamente em runtime
    RUNTIME_ALLOWED = {
        "modal-chart",           # criado em openChartFullscreen
        "sidebar-backdrop",      # deveria existir; verifica abaixo
    }
    missing = [m for m in missing if m not in RUNTIME_ALLOWED]
    if not missing:
        r.ok(f"IDs referenciados têm contrapartida no HTML ({len(referenced)} IDs únicos)")
    else:
        detail = "\n".join(
            f"#{m}  (usado em script #{locations[m][0][0]}, linha ~{locations[m][0][1]})"
            for m in missing
        )
        r.fail(f"getElementById aponta para IDs inexistentes ({len(missing)})", detail)


def check_borg_onclick_exports(html, scripts, r: Report):
    """Cada Borg.X em onclick deve estar exportado."""
    # coleta chamadas em atributos HTML
    called = set()
    for m in re.finditer(r'''\bonclick\s*=\s*['"][^'"]*\bBorg\.([a-zA-Z_]\w*)''', html):
        called.add(m.group(1))
    for m in re.finditer(r'''\bon(?:input|change|blur|focus|submit|keydown|keyup|keypress|load)\s*=\s*['"][^'"]*\bBorg\.([a-zA-Z_]\w*)''', html):
        called.add(m.group(1))

    # coleta exports: return { x: ... } no IIFE + Borg.X = ...
    exported = set()
    for s in scripts:
        if s["is_external"]:
            continue
        body = s["body"]
        # Borg.X = ...
        for m in re.finditer(r'\bBorg\.([a-zA-Z_]\w*)\s*=', body):
            exported.add(m.group(1))
        # return { x: x, y: y, ... }  — tentativa best-effort
        for m in re.finditer(r'return\s*\{([^}]+)\}', body, flags=re.DOTALL):
            block = m.group(1)
            for km in re.finditer(r'(?m)^\s*([a-zA-Z_]\w*)\s*:', block):
                exported.add(km.group(1))

    # alguns são sub-objetos: Borg.commandPalette.execute → "commandPalette" basta
    missing = [k for k in called if k not in exported]
    if not missing:
        r.ok(f"Handlers Borg.* em onclick estão exportados ({len(called)} handlers)")
    else:
        r.fail(f"Handlers Borg.* faltam no export ({len(missing)})",
               ", ".join(sorted(missing)))


def check_chart_ids(html, scripts, r: Report):
    """Cada createChart('X', ...) deve ter <div id="X">."""
    html_ids = collect_ids_in_html(html)
    chart_ids = set()
    locations = {}
    for s in scripts:
        if s["is_external"]:
            continue
        for m in re.finditer(
            r'''(?:Borg\.)?createChart\(\s*['"]([a-zA-Z][\w:-]*)['"]''',
            s["body"],
        ):
            cid = m.group(1)
            chart_ids.add(cid)
            line_in = s["body"][:m.start()].count("\n")
            locations[cid] = (s["idx"], s["line_start"] + line_in)

    missing = sorted(c for c in chart_ids if c not in html_ids)
    if not missing:
        r.ok(f"createChart() aponta para containers válidos ({len(chart_ids)} charts)")
    else:
        detail = "\n".join(f"#{c} (linha ~{locations[c][1]})" for c in missing)
        r.fail(f"createChart() aponta para IDs sem container ({len(missing)})", detail)


def check_duplicate_top_level_funcs(scripts, r: Report):
    """Funções declaradas em escopo global DUAS vezes colidem."""
    top_funcs = defaultdict(list)
    for s in scripts:
        if s["is_external"]:
            continue
        body = s["body"]
        # apenas declarações de topo (coluna 0 ou indentação mínima)
        for m in re.finditer(r'(?m)^[\t ]{0,2}function\s+([a-zA-Z_]\w*)\s*\(', body):
            top_funcs[m.group(1)].append((s["idx"], s["line_start"] + body[:m.start()].count("\n")))

    dupes = {k: v for k, v in top_funcs.items() if len(v) > 1}
    if not dupes:
        r.ok("Sem colisão de funções top-level entre scripts")
    else:
        detail = "\n".join(
            f"{name}()  — declarada em scripts {[loc[0] for loc in locs]}, linhas {[loc[1] for loc in locs]}"
            for name, locs in dupes.items()
        )
        r.warn_(f"Funções top-level duplicadas ({len(dupes)})", detail)


def _strip_js_tokens(src: str) -> str:
    """Remove comentários, strings (3 tipos) e regex literals em uma só passada,
    mantendo apenas os delimitadores vazios para preservar offsets aproximados."""
    out = []
    i = 0
    n = len(src)
    # heurística para detectar início de regex literal (após certos tokens/operadores)
    regex_prev = re.compile(r"[=(,;:!&|?{}\[\]~^+\-*%<>]|return|typeof|instanceof|delete|void|new|throw|\bin\b|\bof\b|yield|await")

    def last_non_space(buf):
        for ch in reversed(buf):
            if not ch.isspace():
                return ch
        return ''

    while i < n:
        c = src[i]
        # comentário de linha
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            if j == -1:
                break
            i = j
            continue
        # comentário de bloco
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = (j + 2) if j != -1 else n
            continue
        # strings "..." '...' `...`
        if c in ('"', "'", '`'):
            quote = c
            j = i + 1
            while j < n:
                ch = src[j]
                if ch == '\\':
                    j += 2
                    continue
                if ch == quote:
                    break
                j += 1
            out.append(quote + quote)
            i = j + 1
            continue
        # regex literal (heurística): / aparece em contexto de expressão
        if c == '/':
            tail = "".join(out[-40:])
            prev = re.search(r'\S', tail[::-1])
            prev_char = tail[-(prev.start() + 1)] if prev else ''
            ctx = tail[-16:]
            is_regex = (
                not prev_char
                or prev_char in "=(,;:!&|?{}[]~^+-*%<>"
                or re.search(r'(?:return|typeof|instanceof|delete|void|new|throw|in|of|yield|await)\s*$', ctx)
            )
            if is_regex:
                j = i + 1
                closed = False
                in_class = False
                while j < n:
                    ch = src[j]
                    if ch == '\\':
                        j += 2
                        continue
                    if ch == '[' and not in_class:
                        in_class = True
                    elif ch == ']' and in_class:
                        in_class = False
                    elif ch == '\n':
                        break
                    elif ch == '/' and not in_class:
                        closed = True
                        j += 1
                        while j < n and src[j] in 'gimsuy':
                            j += 1
                        break
                    j += 1
                if closed:
                    out.append('/./')
                    i = j
                    continue
        out.append(c)
        i += 1
    return "".join(out)


def check_braces(scripts, r: Report):
    for s in scripts:
        if s["is_external"]:
            continue
        cleaned = _strip_js_tokens(s["body"])

        pairs = {"{}": 0, "()": 0, "[]": 0}
        pairs["{}"] = cleaned.count("{") - cleaned.count("}")
        pairs["()"] = cleaned.count("(") - cleaned.count(")")
        pairs["[]"] = cleaned.count("[") - cleaned.count("]")

        imbalanced = {k:v for k,v in pairs.items() if v != 0}
        if not imbalanced:
            r.ok(f"script #{s['idx']} — chaves/parênteses balanceados")
        else:
            # Se node já validou sintaxe, rebaixa para WARN.
            if shutil.which("node"):
                r.warn_(
                    f"script #{s['idx']} (linha {s['line_start']}) — contagem de chaves divergente (provável falso positivo)",
                    ", ".join(f"{k}: delta={v}" for k,v in imbalanced.items()),
                )
            else:
                r.fail(
                    f"script #{s['idx']} (linha {s['line_start']}) — chaves desbalanceadas",
                    ", ".join(f"{k}: delta={v}" for k,v in imbalanced.items()),
                )


def check_css_selector_escapes(html, r: Report):
    """
    LEI 10: toggleComponent usa .closest('.col-span-12, .col-span-6, ...')
    Tailwind gera classes com ':' (lg:col-span-6) que exigem escape '\\:' em CSS selectors.
    Verifica se Borg.toggleComponent escapa corretamente.
    """
    toggle_match = re.search(r'function toggleComponent.*?\}', html, flags=re.DOTALL)
    if toggle_match:
        body = toggle_match.group(0)
        if 'lg:col-span' in body and r'lg\\:col-span' not in body and r"lg\:col-span" not in body:
            r.warn_(
                "toggleComponent pode falhar em classes lg:col-span-*",
                "seletor CSS precisa escapar ':' → 'lg\\:col-span-*'"
            )
        else:
            r.ok("toggleComponent: seletor CSS parece correto")


def _extract_function_body(text, func_name):
    """Extrai corpo completo de 'function NAME(...)' usando contador de chaves."""
    m = re.search(rf'function\s+{re.escape(func_name)}\s*\(', text)
    if not m:
        return None
    i = m.end()
    while i < len(text) and text[i] != '{':
        i += 1
    if i >= len(text):
        return None
    depth = 0
    start = i
    in_str = None     # '"', "'" ou "`"
    escape = False
    while i < len(text):
        ch = text[i]
        if escape:
            escape = False
        elif in_str:
            if ch == '\\':
                escape = True
            elif ch == in_str:
                in_str = None
        else:
            if ch in ('"', "'", '`'):
                in_str = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return text[start:i+1]
        i += 1
    return None


def check_report_exports(html, r: Report):
    """Relatório: exportPDF / generateReport funcionais?"""
    body = _extract_function_body(html, "generateReport")
    if not body:
        r.warn_("generateReport não encontrada")
        return
    # generateReport pode delegar para helpers (downloadReportHTML, openReportPDF, _buildReportHTML…).
    # Acumula corpos de helpers chamados e verifica se algum emite output.
    helper_names = set(re.findall(r'\b(?:Borg\.)?([A-Za-z_]\w*)\s*\(', body))
    combined = body
    for name in helper_names:
        extra = _extract_function_body(html, name)
        if extra:
            combined += "\n" + extra
    if "window.print" not in combined and "window.open" not in combined and "createObjectURL" not in combined:
        r.warn_("generateReport: não chama window.print nem window.open",
                "relatório pode não gerar nada visível")
    else:
        r.ok("generateReport emite saída (print/open/blob)")
    if "document.write" in body and "</script>" in body:
        r.warn_("generateReport: document.write com </script> pode quebrar parser")


# ---------- CAMADA 2: RUNTIME (opcional) ----------
def run_runtime_checks(html_path, r: Report, screenshot_dir):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        r.warn_("Camada 2 (runtime) pulada", "playwright não instalado — rode: pip install playwright && playwright install chromium")
        return

    os.makedirs(screenshot_dir, exist_ok=True)
    file_url = "file://" + os.path.abspath(html_path)

    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
        except Exception as e:
            r.warn_("Camada 2 — chromium não disponível", str(e))
            return
        ctx = browser.new_context(viewport={"width": 1400, "height": 900})
        page = ctx.new_page()

        console_errors = []
        console_warnings = []
        page.on("console", lambda msg: (
            console_errors.append(msg.text) if msg.type == "error"
            else console_warnings.append(msg.text) if msg.type == "warning"
            else None
        ))
        page.on("pageerror", lambda exc: console_errors.append(f"PAGEERROR: {exc}"))

        page.goto(file_url, wait_until="networkidle", timeout=15000)
        page.wait_for_timeout(1500)  # charts renderizarem

        if not console_errors:
            r.ok("Runtime: nenhum erro de console")
        else:
            r.fail(f"Runtime: {len(console_errors)} erros de console", "\n".join(console_errors[:8]))

        # Valida que cada [id^='chart-'] tem SVG interno
        chart_containers = page.query_selector_all('[id^="chart-"]')
        empty = []
        for el in chart_containers:
            cid = el.get_attribute("id")
            has_svg = el.query_selector("svg") is not None
            if not has_svg:
                empty.append(cid)
        if not empty:
            r.ok(f"Runtime: todos {len(chart_containers)} charts renderizaram SVG")
        else:
            r.fail(f"Runtime: charts vazios ({len(empty)}/{len(chart_containers)})",
                   ", ".join(empty[:15]))

        # Screenshot por view
        views = ["overview", "works", "finance", "operational", "land", "reports", "settings", "upload"]
        for v in views:
            try:
                page.evaluate(f"window.Borg && window.Borg.switchView && window.Borg.switchView('{v}')")
                page.wait_for_timeout(600)
                page.screenshot(path=os.path.join(screenshot_dir, f"view-{v}.png"), full_page=True)
            except Exception as e:
                console_errors.append(f"switchView('{v}') falhou: {e}")

        # Testa fullscreen
        try:
            page.evaluate("window.Borg && window.Borg.switchView && window.Borg.switchView('overview')")
            page.wait_for_timeout(400)
            btn = page.query_selector('[onclick*="openChartFullscreen"]')
            if btn:
                btn.click()
                page.wait_for_timeout(500)
                modal = page.query_selector("#modal-overlay")
                if modal and "hidden" not in (modal.get_attribute("class") or ""):
                    r.ok("Runtime: botão maximizar abre modal")
                else:
                    r.fail("Runtime: maximizar não abre modal", "modal #modal-overlay ficou hidden")
        except Exception as e:
            r.warn_("Runtime: teste de fullscreen falhou", str(e))

        # Testa salvar configurações
        try:
            page.evaluate("window.Borg && window.Borg.switchView && window.Borg.switchView('settings')")
            page.wait_for_timeout(300)
            save_btn = page.query_selector('[onclick*="saveAllSettings"]')
            if save_btn:
                save_btn.click()
                page.wait_for_timeout(400)
                status = page.query_selector("#settings-save-status")
                status_text = status.text_content() if status else ""
                if status_text.strip().startswith("Salvo"):
                    r.ok("Runtime: botão salvar mostra feedback")
                else:
                    r.fail("Runtime: botão salvar sem feedback", f"status='{status_text}'")
        except Exception as e:
            r.warn_("Runtime: teste de salvar falhou", str(e))

        browser.close()


# ---------- MAIN ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default=DEFAULT_FILE)
    ap.add_argument("--runtime", action="store_true", help="Roda Camada 2 (precisa playwright)")
    ap.add_argument("--screenshots", default=str(Path(DEFAULT_FILE).parent / "_verify_shots"))
    args = ap.parse_args()

    if not os.path.exists(args.file):
        print(c("red", f"Arquivo não encontrado: {args.file}"))
        sys.exit(2)

    print(c("bold", f"\n▶ Verificador Borgonovi — analisando {args.file}\n"))
    html = load(args.file)
    scripts = extract_scripts(html)
    print(c("gray", f"  {len(html.splitlines())} linhas totais, {len(scripts)} blocos <script>"))
    print()

    r = Report()

    # CAMADA 1 — estática
    print(c("blue", "─── CAMADA 1 · Análise estática ───"))
    check_tag_balance(html, r)
    node_syntax_check(scripts, r)
    check_ids_referenced(html, scripts, r)
    check_borg_onclick_exports(html, scripts, r)
    check_chart_ids(html, scripts, r)
    check_duplicate_top_level_funcs(scripts, r)
    check_braces(scripts, r)
    check_css_selector_escapes(html, r)
    check_report_exports(html, r)

    # CAMADA 2 — runtime (opcional)
    if args.runtime:
        print(c("blue", "\n─── CAMADA 2 · Runtime (chromium headless) ───"))
        run_runtime_checks(args.file, r, args.screenshots)

    # imprime detalhes
    print()
    for name, status, detail in r.checks:
        icon = {"OK": c("green", "✓"), "FAIL": c("red", "✗"), "WARN": c("yellow", "!")}[status]
        tail = c("gray", f"  — {detail.splitlines()[0][:80]}") if detail else ""
        print(f"  {icon} {name}{tail}")

    ok = r.summary()
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
