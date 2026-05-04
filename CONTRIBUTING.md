# Contributing — Dashboard V8

## Regras de Ouro

### 1. Arquivo ≤ 300 LOC (warn 250)
Arquivos longos são difíceis de revisar e mantém. Se passar de 250, considerar split. Se passar de 300, obrigatório.

### 2. Função ≤ 50 LOC (warn 40)
Funções longas escondem bugs. Se passar de 40 linhas, extrair sub-função. Se passar de 50, obrigatório.

### 3. Template HTML literal ≤ 80 LOC
Templates inline longos são difíceis de manter. Extrair para `_fragments.js` ou helper.

### 4. Header docstring obrigatório
Cada arquivo começa com 3-5 linhas de comentário: o que faz, deps, contratos.

### 5. JSDoc em todo export
Cada `export function` e `export const` tem `@param` e `@returns`.

### 6. Zero hex hardcoded fora de theme.css
Exceto fallbacks em `getCSSVar('...', '#fallback')`. Usar classes semânticas ou CSS vars.

### 7. Zero Tailwind utility duplicada >3× sem extração
Se `bg-green-50 text-green-700` aparece em 3+ locais, criar classe `.status-success`.

### 8. Arquivo novo exige entrada em DECISIONS.md
Toda criação de arquivo deve ser justificada. Documentar motivo e trade-offs.

### 9. Layer separation
- `src/model/*` não importa de `src/ui/*` ou `src/view/*`
- `src/domain/*` não importa de `src/view/*`
- ETL normalization fica em `src/model/etl-normalize.js`

### 10. Cada PR/fase termina com `npm run audit` passando
O script `scripts/audit.cjs` verifica regras 1-6 automaticamente.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run audit` | Verifica regras 1-6 |
| `npm test` | 89 testes unitários |
| `npx tsc --noEmit` | Type check JSDoc |
| `npm run build` | Build de produção |

## Vertical Switch
Para trocar o vertical (construção → clínica, etc.), editar:
1. `src/model/branding.js` — identidade (nome, nav, relatórios)
2. `src/domain/schema.js` — entidade e medidas
3. `src/model/mock.js` — dados mock
4. `src/model/etl-normalize.js` — mapeamentos ETL→V8
