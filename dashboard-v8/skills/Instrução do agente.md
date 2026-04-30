# Instrução do agente - Borgonovi Dashboard V8

Este documento define as regras, o fluxo de trabalho e as convenções para a geração de dashboards V8. É o equivalente V8 do antigo V7, adaptado para uma arquitetura baseada em Vite, ES Modules e componentes reusáveis.

## REGRA ZERO: AMNÉSIA DE CÓDIGO
Até a ETAPA 1 estar 100% completa, você NÃO pode programar. É PROIBIDO:
- Gerar código (JS/CSS/HTML)
- Inferir dados, métricas ou público-alvo
- Assumir estrutura de layout ou inventar KPIs
- Prosseguir com informações ambíguas, incompletas ou contraditórias

Tudo deve vir do usuário, dos arquivos enviados e das regras nos arquivos .md relevantes.

## FLUXO PARA DASHBOARD NOVO (Don't skip steps)

### ETAPA 1: PERGUNTAR E VALIDAR
Aplique as 10 perguntas (divididas em 5 blocos) para clarificar requisitos. Em V8, as perguntas seguem o formato dos blocos:

- Bloco A — Contexto
 1) Qual é o domínio do dashboard? 2) Quem é o público-alvo? 3) Qual é a pergunta central que o dashboard deve responder?
- Bloco B — Escopo
 4) Quais KPIs são obrigatórios? 5) Quais gráficos/visuais? 6) Quais filtros devem existir?
- Bloco C — Densidade
 7) Qual o nível de densidade: executivo, gerencial ou operacional? 8) Quais restrições de tempo e atualização?
- Bloco D — Dados
 9) Os dados virão de hardcoded, arquivo ou mock? 10) Existem requisitos de formato/schema?
- Bloco E — Upload (quando aplicável)
 11) Será necessário upload de planilha? Qual formato e validação? (Se não aplicável, ignore.)

Aguarde pela resposta do usuário. Em caso de ambiguidade, NÃO PROSSIGA.

### ETAPA 2: PLANEJAR E APROVAR
Antes de apresentar o plano, leia OBRIGATORIAMENTE:
- density-profiles.md — escolher o perfil de densidade
- storytelling-patterns.md — selecionar a narrativa
- ux-guidelines.md — validar o layout

Apresente ao usuário:
- Perfil de densidade escolhido (com justificativa)
- Estrutura narrativa (ordem de view + ordem de blocks por view)
- KPI Hero definido
- Paleta de Chart a usar
- Se houver upload: posição do dropzone, dataSchema, componentes reativos

Aguarde aprovação explícita. É PROIBIDO avançar sem aprovação.

### ETAPA 3: MONTAR (V8 architecture)
Construa com a estrutura do projeto V8:
- Criar projeto com Vite (npm create vite) ou copiar dashboard-v8/ existente
- Editar 4 arquivos-chave: branding.js, content.js, mock.js, schema.js
- Criar views seguindo o contrato mount(host, ctx) → unmount
- Usar templates de components-v8.md
- Usar patterns de mountChart em charts-v8.md
- Aplicar animações de animations-v8.md para polimento
- Utilizar mock-data-pt-br.md para dados fictícios realistas
- Se houver upload: data-upload-v8.md para pattern de dropzone

IMPORTANTE: diferenças do V8 em relação ao V7:
- Não é um único arquivo HTML — é um projeto Vite
- Não usar namespace Borg.* — usar imports ES modules
- Não usar onclick inline — usar addEventListener com data-* delegation
- Não usar hex codes hardcoded no JS — usar CSS vars e Tailwind
- Não usar borgChartDefaults — usar getChartDefaults()
- Não usar Borg.createChart() — usar mountChart()
- Não inserir HTML inline no body — usar mount() para retornar template

### ETAPA 4: REVISAR (Silent audit)
Antes de mostrar o resultado, realize uma auditoria interna sem exibir ao usuário:
- Sidebar sincronizada no load?
- KPIs com valores longos são truncados e responsivos?
- Ciclo de vida dos charts configurado (mount on show, destroy on unmount)?
- Estado inicial consistente entre sidebar, topbar e main-content
- Todos os ARIA presentes (acessibilidade-v8.md)
- getChartDefaults() aplicado em todos os charts via mountChart()
- Imports ES modules usados (NÃO namespace Borg)
- Tokens de motion presentes em theme.css (--dur-*, --ease-*)
- Paleta de comandos e registro no command palette
- Prefer-reduced-motion respeitado
- Densidade coerente com o perfil declarado
- Mock data plausível (sem valores absurdos)
- Sem anti-patterns de storytelling-patterns.md
- Sem cores hex codificadas no JS
- Todas as views seguem mount(host, ctx) → unmount
- Views com ≤ 400 linhas
- npm test passa?
- npm run build funciona?

Se houver quebras, FAÇA O AJUSTE antes de entregar.

### ETAPA 5: ENTREGAR
A entrega do V8 é um PROJETO completo (não apenas HTML):
- Forneça o conjunto completo de arquivos modificados
- Se o projeto for grande, divida em partes lógicas, sem cortar funções no meio
- Inclua package.json com dependências corretas
- Garanta que npm install && npm test && npm run build passem

## FLUXO PARA RELATÓRIO PDF
Quando o usuário pedir relatório/PDF:
- Consulte reports-v8.md para stack, componentes e narrativa
- Pergunte as 8 perguntas obrigatórias do relatório
- Gere HTML standalone (separado do dashboard)
- Valide contra a checklist de 11 itens

## FLUXO PARA CORREÇÕES E AJUSTES
- Não refazer as 5 etapas — aplique correção direta
- Mantenha regras do design system
- Se a mudança afetar a estrutura (nova view/KPIs), volte à ETAPA 2
- Se for ajuste menor (cor, texto, dados), corrija e entregue
- Sempre rode a ETAPA 4 (auditoria silenciosa) antes de entregar qualquer correção

## REFERÊNCIA RÁPIDA DOS ARQUIVOS
| Arquivo | Uso | 
|---|---|
| SKILL.md | regras, tokens, stack, contrato |
| ux-guidelines.md | ETAPA 1/2 – perguntas, layouts |
| density-profiles.md | ETAPA 2 – escolher perfil |
| storytelling-patterns.md | ETAPA 2 – narrativa por domínio |
| components-v8.md | ETAPA 3 – templates V8 |
| charts-v8.md | ETAPA 3 – padrões de mountChart |
| animations-v8.md | ETAPA 3 – motion/polimento |
| mock-data-pt-br.md | ETAPA 3 – dados realistas |
| data-upload-v8.md | ETAPA 3 – dropzone upload |
| accessibility-v8.md | ETAPA 4 – ARIA/contraste |
| reports-v8.md | Relatório PDF |

## REGRAS DE ENTREGA
- ENTREGAR um projeto completo e funcional
- NUNCA usar placeholders como /* CSS AQUI */ ou <!-- JS AQUI -->
- Se for grande demais para uma resposta, divida logicamente por partes nomeadas
- Sempre pedir perguntas obrigatórias antes de codificar
- Sempre validar npm test antes de entregar
- Garantir que npm run build gere dist/ funcional

## CONTEXTO
- Este documento atualiza o fluxo de V7 para V8: projeto Vite, módulos ES, mount/unmount, store pub/sub.
- A entrega do V8 é um PROJETO com validação de test/build.

<!-- OMO_INTERNAL_INITIATOR -->
