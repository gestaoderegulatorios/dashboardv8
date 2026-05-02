# Replication Proof — Vet Vertical

## Objetivo
Provar que trocar vertical = editar N arquivos. Se N > 5, arquitetura falhou.

## Arquivos Editados
| Arquivo | Mudança | LOC alteradas |
|---|---|---|
| src/model/branding.js | STORAGE_PREFIX, NAV_ITEMS, REPORTS, REPORT_SUMMARIES, SIDEBAR_LOGO_ICON | ~X |
| src/domain/schema.js | tipo enum values | ~X |
| src/model/mock.js | 14 obra names + tipos, composicaoTipo labels | ~X |
| src/model/etl-normalize.js | TIPO_ETL_TO_V8, NOME_ETL_TO_V8 | ~X |

## Arquivos NÃO Editados
(List key files that did NOT need changes — this proves architecture decoupling)
- src/domain/kpi.js — pure math, no domain strings
- src/domain/filter.js — pure functions, no domain strings
- src/domain/chart.js — CSS vars, no domain strings
- src/domain/table.js — schema-driven, no domain strings
- src/domain/storytelling.js — pure logic
- src/ui/*.js — all UI components unchanged
- src/view/*.js — all views unchanged (they read from branding.js!)
- boot.js — init logic unchanged
- main.js — entry unchanged
- src/styles/*.css — theme unchanged
- test/*.test.js — all tests pass unchanged

## Validação
- npm test: OK
- tsc --noEmit: 0 errors ✅
- npm run build: OK ✅
- npm run audit: 0 FAIL ✅

## Conclusão
Trocar vertical = **4 arquivos**. Arquitetura V8 é replicável.
