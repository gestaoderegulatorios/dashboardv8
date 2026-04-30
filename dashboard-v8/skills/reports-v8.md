# Relatórios V8 - Reports V8

Este documento descreve a geração de relatórios na arquitetura V8 do Borgonovi Dashboard. É a versão standalone executada a partir do dashboard, com geração de HTML independente.

## FILOSOFIA
- Dashboard ≠ Relatório. Dashboard responde "Como estamos AGORA?". Relatório responde "O que ACONTECEU, por quê, e o que FAZER?".

## STACK TÉCNICA V8
- Relatórios gerados como arquivos HTML independentes (não fazem parte do bundle do dashboard)
- Usa window.open() + document.write() para abrir uma nova janela
- CSS embedded no HTML gerado (sem dependência de Tailwind no relatório)
- CSS de impressão com @page para layout A4
- Google Fonts (Inter) carregado via CDN no HTML do relatório
- Sem dependências externas de JS no relatório

## COMO GERAR UM RELATÓRIO (V8 pattern)
O pattern de geração de relatório em V8 usa generateReport(type), que:
1. Constrói a string HTML via _buildReportHTML(type)
2. Abre a visualização via openContentFullscreen(title, htmlDaVisualização)
3. Botão de download HTML cria um Blob -> URL.createObjectURL -> download
4. Botão de PDF abre uma nova janela com o HTML e dispara window.print()

## ESTRUTURA DO RELATÓRIO HTML
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Relatório — DD/MM/AAAA</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 20mm 18mm; }
    /* Full print CSS: A4, margins, headers, page breaks */
  </style>
</head>
<body>
  <div class="print-controls">
    <button onclick="window.print()">Imprimir / Salvar PDF</button>
  </div>
  <main>
    <section class="cover"><!-- Cover page --></section>
    <section><h2>Sumário Executivo</h2>...</section>
    <section><h2>Conteúdo</h2>...</section>
    <section><h2>Conclusão</h2>...</section>
    <footer>...</footer>
  </main>
</body>
</html>
```

## SEÇÕES DO RELATÓRIO
1. Capa: empresa, título, projeto, responsável, período
2. Sumário Executivo: narrativa resumida baseada no branding (REPORT_SUMMARIES)
3. Conteúdo: KPI grid + dados de tabelas
4. Conclusão: conclusões específicas por tipo de relatório
5. Footer: empresa + timestamp de geração

## BRANDING NO RELATÓRIO
- O V8 lê branding a partir do store:
  ```javascript
  const settings = ctx.store.get().settings;
  const _s = { ...BRANDING_DEFAULTS, ...settings };
  // Usa _s.companyName, _s.username, _s.role, _s.projectName
  ```

## 6 TIPOS DE RELATÓRIO
Definidos em branding.js, array REPORTS:
1. executive — Visão geral do empreendimento
2. works — Detalhamento por obra
3. financial — DRE e fluxo de caixa
4. operational — Recursos e segurança
5. land — Vendas e infraestrutura
6. custom — Monte o seu

## VIEW DE RELATÓRIOS (V8)
- View de relatórios com 6 botões de cards (data-report="type")
- Lista de relatórios recentes com botões de download
- Clique em card → generateReport(type) → modal de visualização
- O modal possui: Baixar HTML + Abrir e Imprimir PDF

## PRINT CSS ESSENCIAL
```css
@page { size: A4 portrait; margin: 20mm 18mm; }
@media print {
  .print-controls { display: none !important; }
  .cover { page-break-after: always; }
  section { page-break-inside: avoid; }
}
```

## CHECKLIST DE RELATÓRIO
- [ ] HTML standalone funciona sem dashboard
- [ ] @page A4 com margens
- [ ] Capa com empresa + projeto + responsável
- [ ] Sumário executivo narrativo
- [ ] Tabelas com cabeçalho e dados
- [ ] KPI grid com valores formatados
- [ ] Footer com timestamp
- [ ] Botão imprimir funciona (window.print())
- [ ] Download HTML funciona (Blob + createObjectURL)
- [ ] Branding lido do store (não hardcoded)
- [ ] CSS de impressão esconde controles
