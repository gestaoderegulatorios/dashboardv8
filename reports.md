

# 📄 BORGONOVI V7 — RELATÓRIOS PDF

> Geração de relatórios profissionais em PDF a partir de dados de dashboards.
> HTML dedicado para impressão com CSS @page, layout A4, capa institucional,
> cabeçalho/rodapé com numeração, gráficos SVG inline, tabelas print-friendly
> e storytelling narrativo linear. Zero dependências JavaScript externas.
> Consultar este arquivo quando o usuário pedir relatório, report ou PDF.

---

## FILOSOFIA

> **Dashboard ≠ Relatório.** São complementares, nunca substitutos.

| Aspecto | Dashboard | Relatório PDF |
|---------|-----------|---------------|
| Propósito | Explorar, monitorar, interagir | Documentar, comunicar, registrar |
| Leitura | Não-linear (olho varre) | Linear (lê do início ao fim) |
| Dados | Tempo real, interativos | Snapshot de um momento, estáticos |
| Audiência | Quem opera o dia-a-dia | Quem precisa de registro formal |
| Interação | Filtros, sort, drill-down, hover | Nenhuma — é papel (digital) |
| Duração | Atualiza constantemente | Congela um ponto no tempo |
| Formato | Tela (responsivo) | Página A4 (fixo 210×297mm) |
| Texto analítico | Mínimo (dados falam) | Essencial (análise, conclusões) |

### Regra de ouro

```
Dashboard responde: "Como estamos AGORA?"
Relatório responde: "O que ACONTECEU, por quê, e o que FAZER?"
```

---

## STACK TÉCNICA

### O que usa

| Tecnologia | Uso no relatório |
|------------|------------------|
| Tailwind CSS (CDN) | Tipografia, cores, utilitários |
| Google Fonts (Inter) | Mesma fonte do dashboard |
| Material Symbols | Ícones em headers de seção |
| CSS `@page` | Tamanho, margens, cabeçalho/rodapé |
| CSS Counters | Numeração automática de páginas |
| SVG inline | Gráficos vetoriais estáticos |
| HTML `<table>` | Tabelas com thead repeat |

### O que NÃO usa

| Tecnologia | Por quê não |
|------------|-------------|
| ApexCharts | Runtime JS desnecessário para print |
| JavaScript (quase zero) | Relatório é estático |
| Sidebar/topbar/modais | Elementos de interface, não de documento |
| Animações | Não existem no papel |
| hover/active states | Não existem no papel |
| html2pdf.js / jsPDF | Rasteriza como imagem, qualidade inferior |

### CDNs do relatório (incluir no head)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">
```

---

## TAILWIND CONFIG PARA RELATÓRIO

> Usa a MESMA paleta M3 do dashboard, mas com border-radius padrão (não customizado).

```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                "primary": "#00081e",
                "primary-container": "#0a1f44",
                "on-primary-container": "#7687b2",
                "surface-tint": "#4c5e86",
                "on-surface": "#191c1e",
                "on-surface-variant": "#44464e",
                "outline": "#75777f",
                "surface-container-low": "#f2f4f6",
                "surface-container": "#eceef0",
                "error": "#ba1a1a",
                "on-tertiary-container": "#b37c59",
                "background": "#f7f9fb"
            },
            fontFamily: {
                "sans": ["Inter", "sans-serif"]
            }
        }
    }
}
```

---

## CORES PARA IMPRESSÃO

> Cores claras demais somem no papel. Cores escuras demais gastam tinta.
> Usar versões otimizadas para print.

| Função | Dashboard | Relatório (print) | Motivo |
|--------|-----------|-------------------|--------|
| Fundo de página | `bg-background` (#F7F9FB) | `bg-white` | Papel já é branco |
| Fundo de card | `bg-white` | `bg-white` sem borda | Bordas finas somem na impressão |
| Fundo de header de seção | Nenhum | `bg-surface-container-low` | Separação visual sutil |
| Fundo de total de tabela | `bg-primary-container` | `bg-primary-container` | Funciona bem impresso |
| Texto principal | `text-primary` | `text-primary` | OK — escuro o suficiente |
| Texto secundário | `text-on-surface-variant` | `text-on-surface-variant` | OK |
| Texto terciário | `text-slate-400` | `text-outline` (#75777F) | slate-400 some no papel |
| Borda de tabela | `border-slate-200` | `border-slate-300` | Mais visível impresso |
| Cor positiva | `text-green-700` | `text-green-800` | Mais legível impresso |
| Cor negativa | `text-error` | `text-error` | OK |

---

## SKELETON DO RELATÓRIO

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[NOME DO RELATÓRIO] — [DATA]</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">

    <script>/* TAILWIND CONFIG RELATÓRIO */</script>

    <style>
        /* ===== CSS DO RELATÓRIO ===== */
        /* Colar o CSS completo da seção abaixo */
    </style>
</head>
<body class="bg-white text-on-surface">

    <!-- ===== CAPA ===== -->
    <section class="cover-page">
        <!-- Template da capa -->
    </section>

    <!-- ===== SUMÁRIO EXECUTIVO ===== -->
    <section class="report-page">
        <h2 class="section-title">
            <span class="material-symbols-outlined">summarize</span>
            Sumário Executivo
        </h2>
        <!-- Conteúdo -->
    </section>

    <!-- ===== SEÇÕES DE CONTEÚDO ===== -->
    <section class="report-page">
        <h2 class="section-title">
            <span class="material-symbols-outlined">[ICONE]</span>
            [TÍTULO DA SEÇÃO]
        </h2>
        <!-- KPIs, gráficos, tabelas, análise -->
    </section>

    <!-- ===== CONCLUSÃO ===== -->
    <section class="report-page">
        <h2 class="section-title">
            <span class="material-symbols-outlined">task_alt</span>
            Conclusão e Recomendações
        </h2>
        <!-- Texto conclusivo -->
    </section>

    <!-- ===== ANEXOS (opcional) ===== -->
    <section class="report-page">
        <h2 class="section-title">
            <span class="material-symbols-outlined">attach_file</span>
            Anexos
        </h2>
        <!-- Tabelas completas, dados brutos -->
    </section>

    <!-- JavaScript mínimo (apenas print trigger) -->
    <script>
        // Auto-abrir diálogo de impressão ao carregar (opcional)
        // window.addEventListener('load', function() { window.print(); });
    </script>

</body>
</html>
```

---

## CSS COMPLETO DO RELATÓRIO

```css
/* ===== BASE ===== */
body {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #191c1e;
}

.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
}

/* ===== CONFIGURAÇÃO DE PÁGINA A4 ===== */
@page {
    size: A4 portrait;
    margin: 20mm 18mm 25mm 18mm;

    @top-center {
        content: none;
    }
    @bottom-center {
        content: none;
    }
}

/* Primeira página (capa) sem cabeçalho/rodapé */
@page :first {
    margin: 0;
}

/* ===== PAGINAÇÃO COM CSS COUNTERS ===== */
body {
    counter-reset: page-number;
}

.report-page {
    counter-increment: page-number;
    page-break-after: always;
    position: relative;
    min-height: 100%;
}

.report-page:last-child {
    page-break-after: auto;
}

/* Cabeçalho de página (dentro de cada report-page) */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e3e5;
    margin-bottom: 24px;
    font-size: 8px;
    color: #75777f;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
}

/* Rodapé de página */
.page-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 8px 18mm;
    font-size: 8px;
    color: #75777f;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #e0e3e5;
}

/* Rodapé via CSS (alternativa ao fixed) */
.report-page::after {
    content: "";
    display: block;
    height: 20px; /* espaço para o rodapé */
}

/* ===== CAPA ===== */
.cover-page {
    page-break-after: always;
    width: 210mm;
    height: 297mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #0a1f44;
    color: white;
    position: relative;
    overflow: hidden;
}

.cover-page .cover-decoration {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
}

.cover-page .cover-decoration-1 {
    top: -100px;
    right: -100px;
}

.cover-page .cover-decoration-2 {
    bottom: -150px;
    left: -100px;
    width: 400px;
    height: 400px;
}

/* ===== TÍTULOS ===== */
.section-title {
    font-size: 16px;
    font-weight: 800;
    color: #00081e;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0a1f44;
}

.section-title .material-symbols-outlined {
    font-size: 20px;
    color: #4c5e86;
}

.subsection-title {
    font-size: 13px;
    font-weight: 700;
    color: #00081e;
    margin-bottom: 12px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.subsection-title .material-symbols-outlined {
    font-size: 16px;
    color: #4c5e86;
}

/* ===== TABELAS PARA IMPRESSÃO ===== */
.report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    margin: 16px 0;
}

.report-table thead {
    /* Repete header em cada página */
    display: table-header-group;
}

.report-table th {
    background: #f2f4f6;
    color: #75777f;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    text-align: left;
}

.report-table td {
    padding: 6px 12px;
    border: 1px solid #e5e7eb;
    font-variant-numeric: tabular-nums;
}

.report-table tbody tr:nth-child(even) {
    background: #fafbfc;
}

.report-table .total-row {
    background: #0a1f44 !important;
    color: white;
    font-weight: 700;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.report-table .total-row td {
    border-color: #0a1f44;
    padding: 8px 12px;
}

/* Impedir quebra de linha no meio */
.report-table tr {
    page-break-inside: avoid;
}

/* ===== KPIs PARA RELATÓRIO ===== */
.report-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 16px 0;
}

.report-kpi {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
}

.report-kpi-label {
    font-size: 8px;
    font-weight: 700;
    color: #75777f;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
}

.report-kpi-value {
    font-size: 20px;
    font-weight: 800;
    color: #00081e;
    letter-spacing: -0.02em;
}

.report-kpi-sub {
    font-size: 9px;
    color: #44464e;
    margin-top: 2px;
}

.report-kpi-variation-up {
    font-size: 9px;
    font-weight: 700;
    color: #166534;
}

.report-kpi-variation-down {
    font-size: 9px;
    font-weight: 700;
    color: #ba1a1a;
}

/* KPI Hero para relatório */
.report-kpi-hero {
    grid-column: span 2;
    background: #0a1f44;
    color: white;
    border: none;
    padding: 16px;
}

.report-kpi-hero .report-kpi-label {
    color: #7687b2;
}

.report-kpi-hero .report-kpi-value {
    color: white;
    font-size: 28px;
}

.report-kpi-hero .report-kpi-sub {
    color: #7687b2;
}

/* ===== BLOCO DE GRÁFICO ===== */
.report-chart-block {
    margin: 16px 0;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    page-break-inside: avoid;
}

.report-chart-header {
    background: #f2f4f6;
    padding: 8px 12px;
    font-size: 9px;
    font-weight: 700;
    color: #75777f;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid #e5e7eb;
}

.report-chart-body {
    padding: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.report-chart-body svg {
    max-width: 100%;
    height: auto;
}

.report-chart-footer {
    padding: 8px 12px;
    background: #fafbfc;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-around;
    font-size: 9px;
}

.report-chart-footer .metric-label {
    color: #75777f;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.report-chart-footer .metric-value {
    color: #00081e;
    font-weight: 800;
    font-size: 12px;
}

/* ===== BLOCO DE ANÁLISE/COMENTÁRIO ===== */
.report-analysis {
    background: #f2f4f6;
    border-left: 3px solid #4c5e86;
    padding: 12px 16px;
    margin: 16px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
}

.report-analysis-title {
    font-size: 10px;
    font-weight: 700;
    color: #4c5e86;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.report-analysis-text {
    font-size: 11px;
    color: #191c1e;
    line-height: 1.7;
}

/* ===== BLOCO DE DESTAQUE/ALERTA ===== */
.report-highlight {
    padding: 12px 16px;
    border-radius: 6px;
    margin: 12px 0;
    page-break-inside: avoid;
}

.report-highlight-critical {
    background: #fef2f2;
    border-left: 3px solid #ba1a1a;
}

.report-highlight-warning {
    background: #fffbeb;
    border-left: 3px solid #b37c59;
}

.report-highlight-success {
    background: #f0fdf4;
    border-left: 3px solid #166534;
}

.report-highlight-info {
    background: #f2f4f6;
    border-left: 3px solid #4c5e86;
}

.report-highlight-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 4px;
}

.report-highlight-text {
    font-size: 11px;
    line-height: 1.6;
}

/* ===== ASSINATURA / RESPONSÁVEL ===== */
.report-signature {
    margin-top: 40px;
    padding-top: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 40px;
}

.report-signature-block {
    text-align: center;
}

.report-signature-line {
    border-top: 1px solid #191c1e;
    padding-top: 8px;
    margin-top: 40px;
}

.report-signature-name {
    font-size: 11px;
    font-weight: 700;
    color: #00081e;
}

.report-signature-role {
    font-size: 9px;
    color: #75777f;
}

/* ===== CONTROLE DE IMPRESSÃO ===== */
.page-break {
    page-break-after: always;
}

.no-break {
    page-break-inside: avoid;
}

/* Garantir que thead repete em páginas */
thead { display: table-header-group; }
tfoot { display: table-footer-group; }

/* ===== TELA (pré-visualização) ===== */
@media screen {
    body {
        background: #e5e7eb;
        padding: 20px;
    }

    .cover-page,
    .report-page {
        background: white;
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto 20px auto;
        padding: 20mm 18mm 25mm 18mm;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    }

    .cover-page {
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    /* Botão de impressão (só na tela) */
    .print-button {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0a1f44;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 100;
        transition: transform 0.15s ease;
    }

    .print-button:hover {
        transform: scale(1.05);
    }

    .print-button:active {
        transform: scale(0.95);
    }
}

/* ===== IMPRESSÃO ===== */
@media print {
    body {
        background: white;
        padding: 0;
        margin: 0;
    }

    .cover-page,
    .report-page {
        box-shadow: none;
        margin: 0;
        width: 100%;
    }

    .cover-page {
        padding: 0;
        margin: 0;
        width: 100%;
        height: 100vh;
    }

    .report-page {
        padding: 0;
    }

    .print-button {
        display: none !important;
    }

    /* Forçar cores exatas na impressão */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
}
```

---

## COMPONENTES DO RELATÓRIO

### CAPA INSTITUCIONAL

```html
<section class="cover-page">
    <div class="cover-decoration cover-decoration-1"></div>
    <div class="cover-decoration cover-decoration-2"></div>

    <div style="position: relative; z-index: 10; padding: 40px;">
        <!-- Logo / Ícone -->
        <div style="margin-bottom: 40px;">
            <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                <span class="material-symbols-outlined" style="font-size: 32px; color: white;">[ICONE_PROJETO]</span>
            </div>
        </div>

        <!-- Tipo de documento -->
        <p style="font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7687b2; margin-bottom: 16px;">
            Relatório [TIPO]
        </p>

        <!-- Título principal -->
        <h1 style="font-size: 32px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">
            [TÍTULO DO RELATÓRIO]
        </h1>

        <!-- Subtítulo -->
        <p style="font-size: 14px; color: #7687b2; margin-bottom: 48px;">
            [SUBTÍTULO OU NOME DO EMPREENDIMENTO]
        </p>

        <!-- Linha separadora -->
        <div style="width: 60px; height: 2px; background: #4c5e86; margin: 0 auto 48px auto;"></div>

        <!-- Metadados -->
        <div style="font-size: 11px; color: #7687b2; line-height: 2;">
            <p><strong style="color: white;">Período:</strong> [DATA INÍCIO] a [DATA FIM]</p>
            <p><strong style="color: white;">Emissão:</strong> [DATA DE EMISSÃO]</p>
            <p><strong style="color: white;">Responsável:</strong> [NOME DO RESPONSÁVEL]</p>
            <p><strong style="color: white;">Versão:</strong> [NÚMERO DA VERSÃO]</p>
        </div>

        <!-- Classificação (opcional) -->
        <div style="margin-top: 48px;">
            <span style="font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4c5e86; border: 1px solid #4c5e86; padding: 4px 12px; border-radius: 4px;">
                [CONFIDENCIAL / INTERNO / PÚBLICO]
            </span>
        </div>
    </div>
</section>
```

---

### CABEÇALHO DE PÁGINA (dentro de cada report-page)

```html
<div class="page-header">
    <span>[NOME DO PROJETO] — [TIPO DO RELATÓRIO]</span>
    <span>[PERÍODO]</span>
</div>
```

---

### RODAPÉ DE PÁGINA (dentro de cada report-page, no final)

```html
<div style="margin-top: auto; padding-top: 16px; border-top: 1px solid #e0e3e5; display: flex; justify-content: space-between; font-size: 8px; color: #75777f;">
    <span>[NOME DA EMPRESA] — Documento gerado em [DATA]</span>
    <span><!-- Numeração manual ou via CSS counter --></span>
</div>
```

---

### SUMÁRIO EXECUTIVO

```html
<section class="report-page">
    <div class="page-header">
        <span>[PROJETO] — Relatório [TIPO]</span>
        <span>[PERÍODO]</span>
    </div>

    <h2 class="section-title">
        <span class="material-symbols-outlined">summarize</span>
        Sumário Executivo
    </h2>

    <p style="font-size: 11px; line-height: 1.8; color: #191c1e; margin-bottom: 20px;">
        [TEXTO DO SUMÁRIO — 2 a 4 parágrafos resumindo os principais achados,
        status geral do projeto/operação, e destaques positivos e negativos.
        Este texto é ANALÍTICO, não é cópia dos dados — é a interpretação.]
    </p>

    <!-- KPIs resumo -->
    <div class="report-kpi-grid">
        <!-- KPI Hero -->
        <div class="report-kpi report-kpi-hero">
            <div class="report-kpi-label">Avanço Físico Global</div>
            <div class="report-kpi-value">42.5%</div>
            <div class="report-kpi-sub">Meta: 55.0%</div>
            <div class="report-kpi-variation-down" style="color: #fca5a5;">▼ 12.5pp abaixo da meta</div>
        </div>

        <!-- KPI normal -->
        <div class="report-kpi">
            <div class="report-kpi-label">Custo Acumulado</div>
            <div class="report-kpi-value">R$ 12.5M</div>
            <div class="report-kpi-sub">Orçado: R$ 15.0M</div>
            <div class="report-kpi-variation-up">▲ 16.7% economia</div>
        </div>

        <div class="report-kpi">
            <div class="report-kpi-label">Desvio de Prazo</div>
            <div class="report-kpi-value">+18 dias</div>
            <div class="report-kpi-sub">Previsão: Mar/2025</div>
            <div class="report-kpi-variation-down">▼ Atraso</div>
        </div>
    </div>

    <!-- Destaque principal -->
    <div class="report-highlight report-highlight-critical">
        <div class="report-highlight-title" style="color: #ba1a1a;">
            ⚠ Ponto de Atenção Principal
        </div>
        <div class="report-highlight-text">
            [DESCRIÇÃO DO PRINCIPAL PROBLEMA OU RISCO IDENTIFICADO NO PERÍODO]
        </div>
    </div>

    <div class="report-highlight report-highlight-success">
        <div class="report-highlight-title" style="color: #166534;">
            ✓ Destaque Positivo
        </div>
        <div class="report-highlight-text">
            [DESCRIÇÃO DO PRINCIPAL AVANÇO OU CONQUISTA DO PERÍODO]
        </div>
    </div>
</section>
```

---

### SEÇÃO DE CONTEÚDO (template genérico)

```html
<section class="report-page">
    <div class="page-header">
        <span>[PROJETO] — Relatório [TIPO]</span>
        <span>[PERÍODO]</span>
    </div>

    <h2 class="section-title">
        <span class="material-symbols-outlined">[ICONE]</span>
        [TÍTULO DA SEÇÃO]
    </h2>

    <!-- Texto introdutório -->
    <p style="font-size: 11px; line-height: 1.8; color: #191c1e; margin-bottom: 16px;">
        [TEXTO ANALÍTICO SOBRE ESTA SEÇÃO — contextualizar os dados que serão apresentados]
    </p>

    <!-- KPIs da seção (opcional) -->
    <div class="report-kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="report-kpi">
            <div class="report-kpi-label">[LABEL]</div>
            <div class="report-kpi-value">[VALOR]</div>
            <div class="report-kpi-sub">[CONTEXTO]</div>
        </div>
        <!-- mais KPIs -->
    </div>

    <!-- Gráfico OU tabela -->

    <!-- Bloco de análise -->
    <div class="report-analysis">
        <div class="report-analysis-title">
            <span class="material-symbols-outlined" style="font-size: 14px;">analytics</span>
            Análise
        </div>
        <div class="report-analysis-text">
            [INTERPRETAÇÃO DOS DADOS APRESENTADOS — O que os números significam,
            tendências observadas, causas prováveis, impactos esperados]
        </div>
    </div>
</section>
```

---

### TABELA DE RELATÓRIO

```html
<table class="report-table">
    <thead>
        <tr>
            <th>[COL 1]</th>
            <th>[COL 2]</th>
            <th style="text-align: right;">[COL 3]</th>
            <th style="text-align: right;">[COL 4]</th>
            <th style="text-align: right;">[COL 5]</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td style="font-weight: 600; color: #00081e;">[NOME]</td>
            <td>[DADOS]</td>
            <td style="text-align: right;">[VALOR]</td>
            <td style="text-align: right;">[VALOR]</td>
            <td style="text-align: right; color: #166534; font-weight: 600;">[GAP +]</td>
        </tr>
        <tr>
            <td style="font-weight: 600; color: #00081e;">[NOME]</td>
            <td>[DADOS]</td>
            <td style="text-align: right;">[VALOR]</td>
            <td style="text-align: right;">[VALOR]</td>
            <td style="text-align: right; color: #ba1a1a; font-weight: 600;">[GAP -]</td>
        </tr>
        <tr class="total-row">
            <td colspan="2">TOTAL</td>
            <td style="text-align: right;">[TOTAL]</td>
            <td style="text-align: right;">[TOTAL]</td>
            <td style="text-align: right;">[TOTAL]</td>
        </tr>
    </tbody>
</table>
```

---

### BLOCO DE ANÁLISE / COMENTÁRIO

```html
<div class="report-analysis">
    <div class="report-analysis-title">
        <span class="material-symbols-outlined" style="font-size: 14px;">analytics</span>
        Análise
    </div>
    <div class="report-analysis-text">
        [TEXTO ANALÍTICO — Interpretação, contexto, causa-raiz, tendência, recomendação.
        Este é o valor agregado do relatório — o que não existe no dashboard.]
    </div>
</div>
```

---

### BLOCO DE DESTAQUE / ALERTA

```html
<!-- Crítico -->
<div class="report-highlight report-highlight-critical">
    <div class="report-highlight-title" style="color: #ba1a1a;">⚠ [TÍTULO]</div>
    <div class="report-highlight-text">[DESCRIÇÃO DO PROBLEMA]</div>
</div>

<!-- Atenção -->
<div class="report-highlight report-highlight-warning">
    <div class="report-highlight-title" style="color: #b37c59;">⚡ [TÍTULO]</div>
    <div class="report-highlight-text">[DESCRIÇÃO]</div>
</div>

<!-- Positivo -->
<div class="report-highlight report-highlight-success">
    <div class="report-highlight-title" style="color: #166534;">✓ [TÍTULO]</div>
    <div class="report-highlight-text">[DESCRIÇÃO]</div>
</div>

<!-- Informativo -->
<div class="report-highlight report-highlight-info">
    <div class="report-highlight-title" style="color: #4c5e86;">ℹ [TÍTULO]</div>
    <div class="report-highlight-text">[DESCRIÇÃO]</div>
</div>
```

---

### ASSINATURA / RESPONSÁVEIS

```html
<div class="report-signature">
    <div class="report-signature-block">
        <div class="report-signature-line">
            <div class="report-signature-name">[NOME COMPLETO]</div>
            <div class="report-signature-role">[CARGO / FUNÇÃO]</div>
        </div>
    </div>
    <div class="report-signature-block">
        <div class="report-signature-line">
            <div class="report-signature-name">[NOME COMPLETO]</div>
            <div class="report-signature-role">[CARGO / FUNÇÃO]</div>
        </div>
    </div>
</div>
```

---

### BOTÃO DE IMPRESSÃO (aparece só na tela)

```html
<button class="print-button" onclick="window.print()">
    <span class="material-symbols-outlined">print</span>
    Imprimir / Salvar PDF
</button>
```

---

## GRÁFICOS NO RELATÓRIO

### Abordagem: SVG para simples, Tabela para complexos

| Complexidade do gráfico | Abordagem no relatório | Motivo |
|--------------------------|------------------------|--------|
| Barras simples (até 6) | SVG inline | Vetorial, leve, perfeito na impressão |
| Donut / Pie | SVG inline | Funciona bem como SVG |
| Linha simples (até 10 pontos) | SVG inline | Curvas com `<polyline>` |
| Heatmap | Tabela com cores de fundo | SVG seria muito complexo |
| Treemap | Tabela ordenada por valor | SVG seria muito complexo |
| Qualquer gráfico > 10 séries | Tabela de dados formatada | Mais legível no papel |
| Gauge | SVG semicírculo | Simples de fazer |

### SVG — Barras Verticais (exemplo)

```html
<div class="report-chart-block">
    <div class="report-chart-header">Receita por Região</div>
    <div class="report-chart-body">
        <svg viewBox="0 0 400 200" style="width: 100%; max-width: 500px;">
            <!-- Grid lines -->
            <line x1="50" y1="20" x2="50" y2="170" stroke="#e5e7eb" stroke-width="1"/>
            <line x1="50" y1="170" x2="380" y2="170" stroke="#e5e7eb" stroke-width="1"/>
            <line x1="50" y1="120" x2="380" y2="120" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>
            <line x1="50" y1="70" x2="380" y2="70" stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="4"/>

            <!-- Y-axis labels -->
            <text x="45" y="173" text-anchor="end" font-size="8" fill="#75777f" font-family="Inter">0</text>
            <text x="45" y="123" text-anchor="end" font-size="8" fill="#75777f" font-family="Inter">R$ 5M</text>
            <text x="45" y="73" text-anchor="end" font-size="8" fill="#75777f" font-family="Inter">R$ 10M</text>

            <!-- Bars -->
            <rect x="70" y="90" width="45" height="80" fill="#4c5e86" rx="3"/>
            <rect x="135" y="50" width="45" height="120" fill="#0a1f44" rx="3"/>
            <rect x="200" y="110" width="45" height="60" fill="#b37c59" rx="3"/>
            <rect x="265" y="130" width="45" height="40" fill="#7687b2" rx="3"/>
            <rect x="330" y="100" width="45" height="70" fill="#585e70" rx="3"/>

            <!-- X-axis labels -->
            <text x="92" y="185" text-anchor="middle" font-size="8" fill="#44464e" font-family="Inter">Sul</text>
            <text x="157" y="185" text-anchor="middle" font-size="8" fill="#44464e" font-family="Inter">Sudeste</text>
            <text x="222" y="185" text-anchor="middle" font-size="8" fill="#44464e" font-family="Inter">Nordeste</text>
            <text x="287" y="185" text-anchor="middle" font-size="8" fill="#44464e" font-family="Inter">Norte</text>
            <text x="352" y="185" text-anchor="middle" font-size="8" fill="#44464e" font-family="Inter">C-Oeste</text>

            <!-- Value labels -->
            <text x="92" y="85" text-anchor="middle" font-size="8" font-weight="700" fill="#00081e" font-family="Inter">R$ 8M</text>
            <text x="157" y="45" text-anchor="middle" font-size="8" font-weight="700" fill="#00081e" font-family="Inter">R$ 12M</text>
            <text x="222" y="105" text-anchor="middle" font-size="8" font-weight="700" fill="#00081e" font-family="Inter">R$ 6M</text>
            <text x="287" y="125" text-anchor="middle" font-size="8" font-weight="700" fill="#00081e" font-family="Inter">R$ 4M</text>
            <text x="352" y="95" text-anchor="middle" font-size="8" font-weight="700" fill="#00081e" font-family="Inter">R$ 7M</text>
        </svg>
    </div>
    <div class="report-chart-footer">
        <div style="text-align: center;">
            <div class="metric-label">Total</div>
            <div class="metric-value">R$ 37M</div>
        </div>
        <div style="text-align: center;">
            <div class="metric-label">Média</div>
            <div class="metric-value">R$ 7.4M</div>
        </div>
        <div style="text-align: center;">
            <div class="metric-label">Meta</div>
            <div class="metric-value">R$ 40M</div>
        </div>
    </div>
</div>
```

### SVG — Donut (exemplo)

```html
<div class="report-chart-block">
    <div class="report-chart-header">Distribuição de Custos</div>
    <div class="report-chart-body">
        <svg viewBox="0 0 200 200" style="width: 180px;">
            <!-- Donut slices (stroke-dasharray: [portion, remainder] of circumference 251.33) -->
            <circle cx="100" cy="100" r="40" fill="none" stroke="#4c5e86" stroke-width="25"
                    stroke-dasharray="100.53 150.80" stroke-dashoffset="62.83"
                    transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="#0a1f44" stroke-width="25"
                    stroke-dasharray="75.40 175.93" stroke-dashoffset="-37.70"
                    transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="#b37c59" stroke-width="25"
                    stroke-dasharray="50.27 201.06" stroke-dashoffset="-113.10"
                    transform="rotate(-90 100 100)"/>
            <circle cx="100" cy="100" r="40" fill="none" stroke="#7687b2" stroke-width="25"
                    stroke-dasharray="25.13 226.19" stroke-dashoffset="-163.36"
                    transform="rotate(-90 100 100)"/>
            <!-- Center text -->
            <text x="100" y="96" text-anchor="middle" font-size="9" fill="#75777f" font-family="Inter" font-weight="600">Total</text>
            <text x="100" y="112" text-anchor="middle" font-size="16" fill="#00081e" font-family="Inter" font-weight="800">R$ 12.5M</text>
        </svg>

        <!-- Legend (ao lado do donut) -->
        <div style="margin-left: 24px; font-size: 10px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <div style="width: 10px; height: 10px; background: #4c5e86; border-radius: 2px;"></div>
                <span>Materiais — 40% (R$ 5.0M)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <div style="width: 10px; height: 10px; background: #0a1f44; border-radius: 2px;"></div>
                <span>Mão de Obra — 30% (R$ 3.8M)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                <div style="width: 10px; height: 10px; background: #b37c59; border-radius: 2px;"></div>
                <span>Equipamentos — 20% (R$ 2.5M)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 10px; height: 10px; background: #7687b2; border-radius: 2px;"></div>
                <span>Outros — 10% (R$ 1.2M)</span>
            </div>
        </div>
    </div>
</div>
```

### Alternativa: Tabela como gráfico (para dados complexos)

```html
<div class="report-chart-block">
    <div class="report-chart-header">Avanço Físico por Torre (Quando gráfico SVG seria muito complexo)</div>
    <div style="padding: 12px;">
        <table class="report-table" style="margin: 0;">
            <thead>
                <tr>
                    <th>Torre</th>
                    <th style="text-align: right;">Previsto</th>
                    <th style="text-align: right;">Realizado</th>
                    <th style="text-align: right;">Desvio</th>
                    <th style="width: 40%;">Progresso</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="font-weight: 600;">Torre 1</td>
                    <td style="text-align: right;">55.0%</td>
                    <td style="text-align: right;">42.5%</td>
                    <td style="text-align: right; color: #ba1a1a; font-weight: 600;">-12.5pp</td>
                    <td>
                        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: #4c5e86; height: 100%; width: 42.5%; border-radius: 4px;"></div>
                        </div>
                    </td>
                </tr>
                <!-- mais linhas -->
            </tbody>
        </table>
    </div>
</div>
```

---

## STORYTELLING DO RELATÓRIO

> A ordem do relatório é LINEAR e NARRATIVA — diferente do dashboard.

```
1. CAPA
   └── Identificação institucional, período, responsável

2. SUMÁRIO EXECUTIVO (1 página)
   └── Visão geral em 2-4 parágrafos
   └── KPIs principais (com Hero)
   └── 1 destaque positivo + 1 ponto de atenção

3. SEÇÕES TEMÁTICAS (1-3 páginas cada)
   └── Cada seção segue o padrão:
       ├── Título + ícone
       ├── Texto introdutório (contexto)
       ├── KPIs da seção
       ├── Gráfico ou tabela (dados visuais)
       ├── Bloco de análise (interpretação)
       └── Destaques/alertas (se houver)

4. CONCLUSÃO E RECOMENDAÇÕES (1 página)
   └── Resumo dos achados
   └── Ações recomendadas com responsável e prazo
   └── Prognóstico para próximo período

5. ANEXOS (opcional)
   └── Tabelas detalhadas
   └── Dados brutos
   └── Memória de cálculo

6. ASSINATURAS (se necessário)
   └── Responsável pela elaboração
   └── Responsável pela aprovação
```

### Regras de storytelling para relatórios

| Regra | Justificativa |
|-------|---------------|
| Sumário executivo SEMPRE na primeira página após capa | Decisor lê só esta página |
| Cada seção cabe em 1-3 páginas | Evitar seções que cruzam muitas páginas |
| Todo dado numérico tem análise textual | Relatório ≠ planilha — precisa de interpretação |
| Destaques positivos E negativos | Balancear — não ser só problemas |
| Conclusão tem ações com responsável e prazo | Relatório sem ação = desperdício |
| Tabelas grandes vão para Anexos | Corpo do relatório tem tabelas resumidas |

---

## PROCESSO DE CONVERSÃO: DASHBOARD → RELATÓRIO

> Quando o usuário pedir "gerar relatório PDF" de um dashboard existente:

```
1. IDENTIFICAR DADOS
   └── Quais KPIs do dashboard entram no relatório?
   └── Quais gráficos são relevantes?
   └── Quais tabelas devem ser incluídas?

2. REORGANIZAR PARA NARRATIVA LINEAR
   └── Dashboard: não-linear, exploratório
   └── Relatório: linear, narrativo
   └── Agrupar por tema, não por view

3. ADICIONAR TEXTO ANALÍTICO
   └── Cada seção precisa de interpretação escrita
   └── O que os dados significam?
   └── Quais são as causas?
   └── O que fazer a seguir?

4. SIMPLIFICAR VISUALIZAÇÕES
   └── Gráficos interativos → SVG estático ou tabela
   └── 5 KPIs animados → 4 KPIs estáticos com variação
   └── Tabelas com 50 linhas → Tabela resumida + anexo

5. ADICIONAR ELEMENTOS EXCLUSIVOS DO RELATÓRIO
   └── Capa institucional
   └── Sumário executivo
   └── Blocos de análise
   └── Conclusão com recomendações
   └── Assinaturas (se necessário)

6. GERAR HTML SEPARADO
   └── Arquivo HTML independente do dashboard
   └── Otimizado para Ctrl+P → Salvar como PDF
```

---

## PERGUNTAS OBRIGATÓRIAS PARA RELATÓRIO

> Quando o usuário pedir relatório, perguntar (se não informado):

| # | Pergunta |
|---|----------|
| 1 | **Qual o tipo do relatório?** (Mensal, Semanal, Executivo, Técnico, de Progresso) |
| 2 | **Qual o período coberto?** (Data início e fim) |
| 3 | **Quem é o público?** (Diretoria, cliente, fiscal, equipe interna) |
| 4 | **Quais seções/temas incluir?** (Financeiro, físico, qualidade, segurança, etc.) |
| 5 | **Precisa de capa institucional?** (Nome da empresa, logo, classificação) |
| 6 | **Precisa de assinatura?** (Quem elabora, quem aprova) |
| 7 | **Os dados vêm do dashboard existente ou são novos?** |
| 8 | **Precisa de textos analíticos ou apenas dados?** |

---

## REGRAS DO RELATÓRIO

### FIXO (nunca muda)

- Arquivo HTML separado do dashboard
- Layout A4 portrait
- CSS `@page` com margens
- Mesma paleta M3 e fonte Inter
- Capa institucional
- Cabeçalho em cada página
- Tabelas com `thead` repeat
- `page-break-inside: avoid` em componentes
- `-webkit-print-color-adjust: exact`
- Pré-visualização em tela com simulação A4
- Botão "Imprimir" só aparece na tela

### LIVRE (muda por relatório)

- Quantidade e nomes das seções
- Quais KPIs incluir
- Gráficos como SVG ou como tabela
- Quantidade de páginas
- Se tem assinatura
- Se tem anexos
- Textos analíticos (conteúdo)
- Classificação (Confidencial, Interno, Público)

### PROIBIDO em relatórios

| Proibido | Motivo |
|----------|--------|
| ApexCharts runtime | JS desnecessário, SVG é suficiente |
| Sidebar, topbar, modais | Elementos de interface |
| Animações, hover, transitions | Não existem no papel |
| Backgrounds escuros em áreas grandes | Gasta tinta, dificulta leitura |
| Fontes menores que 8px | Ilegível impresso |
| Tabelas sem borda | Perdem estrutura no papel |
| Gráficos sem legenda textual | No papel precisa ser autoexplicativo |
| Seções sem texto analítico | Relatório sem análise = planilha |
| Mais de 8 colunas em tabela | Não cabe no A4 portrait |
| Cores que dependem de transparência | Impressora não suporta |

---

## CHECKLIST DO RELATÓRIO (18 ITENS)

| # | Item |
|---|------|
| 1 | HTML separado do dashboard? |
| 2 | `@page` com size A4 e margens definidas? |
| 3 | Capa institucional com título, período, responsável? |
| 4 | Cabeçalho em cada `report-page`? |
| 5 | `-webkit-print-color-adjust: exact` no `@media print`? |
| 6 | `thead` com `display: table-header-group` para repetir? |
| 7 | `page-break-inside: avoid` em componentes? |
| 8 | `page-break-after: always` entre seções? |
| 9 | Sumário executivo na primeira página após capa? |
| 10 | KPIs com variação temporal (▲▼)? |
| 11 | Todo gráfico tem legenda textual autoexplicativa? |
| 12 | Todo dado numérico tem bloco de análise? |
| 13 | Conclusão com recomendações, responsável e prazo? |
| 14 | Tabelas com `total-row` destacado? |
| 15 | Tabelas com no máximo 8 colunas? |
| 16 | Fonte mínima 8px em qualquer texto? |
| 17 | Botão "Imprimir" visível apenas em `@media screen`? |
| 18 | Pré-visualização em tela simula layout A4 com sombra? |

> **QUALQUER item NÃO atendido deve ser CORRIGIDO antes de entregar.**
```

---

