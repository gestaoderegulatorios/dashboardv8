# Guia de Replicação — Dashboard V8

## Visão Geral
Este dashboard é um modelo replicável. Para adaptar a um novo segmento (veterinária, financeiro, logística, etc.), edite apenas 4 arquivos.

## Arquivos para Editar

### 1. `src/model/branding.js` — Identidade
- `STORAGE_PREFIX`: prefixo do localStorage (evita conflitos)
- `BRANDING_DEFAULTS`: nome da empresa, projeto, cargo padrão
- `NAV_ITEMS`: itens do menu lateral (id + label + icon)
- `VIEW_LABELS`: rótulos de cada view
- `REPORTS`: lista de relatórios disponíveis
- `REPORT_SUMMARIES`: sumários executivos por tipo
- `SIDEBAR_LOGO_ICON`: ícone Material Symbols do logo

### 2. `src/model/content.js` — Vocabulário
- `ETAPAS_OBRA`: fases do fluxo de trabalho
- `TIPOS_OBRA`: categorias de itens
- `STATUS_OBRA`: rótulos de status
- `METRIC_LABELS`: nomes dos indicadores
- `UNITS`: sufixos de unidade
- `MATERIAIS`: inventário específico
- `UPLOAD_SCHEMA`: estrutura da planilha de importação

### 3. `src/model/mock.js` — Dados
- Substitua as 8 obras mock por dados reais do novo segmento
- Mantenha o mesmo schema (campos nome, tipo, status, avanco, etc.)
- Atualize séries temporais (receitaMensal, composicaoTipo, etc.)

### 4. `src/domain/schema.js` — Medidas e Thresholds
- Ajuste `measures` para as métricas do novo segmento
- Atualize `thresholds` ( verde/amarelo/vermelho )
- Adapte `formats` se necessário

## Arquivos OPCIONAIS

### `src/styles/theme.css` — Cores da Marca
- Troque as cores em `:root` para refletir a paleta da nova marca
- 9 theme stubs ([data-theme]) para variações

## Checklist de Replicação
- [ ] branding.js atualizado com identidade do novo segmento
- [ ] content.js atualizado com vocabulário do novo vertical
- [ ] mock.js atualizado com dados reais/procedurais
- [ ] schema.js atualizado com medidas e thresholds
- [ ] theme.css ajustado (opcional — cores da marca)
- [ ] `npm test -- --run` passa (89/89)
- [ ] `npx tsc --noEmit` passa (0 erros)
- [ ] `npm run build` funciona
- [ ] Screenshots comparados com baseline

Exemplo: Construção → Clínica Veterinária
| Campo | Construção | Veterinária |
|-------|-----------|-------------|
| NAV_ITEMS | Obras, Financeiro, Operacional | Pacientes, Financeiro, Estoque |
| ETAPAS_OBRA | Fundações, Estrutura, Acabamento | Triagem, Diagnóstico, Tratamento |
| TIPOS_OBRA | Residencial, Comercial | Canino, Felino, Exótico |
| STATUS_OBRA | Em progresso, Concluída | Em tratamento, Alta |
| METRIC_LABELS | Avanço, Atraso | Recuperação, Tempo espera |
| MATERIAIS | Cimento, Aço | Vacinas, Antimicrobianos |
