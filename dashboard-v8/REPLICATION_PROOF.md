# Replication Proof — Vet Vertical

## Objetivo
Provar que trocar vertical = editar N arquivos. Se N > 5, arquitetura falhou.

## Arquivos Editados

| Arquivo | Mudança | LOC alteradas |
|---|---|---|
| src/model/branding.js | STORAGE_PREFIX, BRANDING_DEFAULTS, NAV_ITEMS, VIEW_LABELS, REPORTS, REPORT_SUMMARIES, SIDEBAR_LOGO_ICON | ~38 |
| src/domain/schema.js | tipo enum values (Edifício→Clínica, Loteamento→Pet Shop, Comercial→Laboratório) | ~3 |
| src/model/mock.js | 14 obra names + tipos, composicaoTipo labels | ~35 |
| src/model/etl-normalize.js | TIPO_ETL_TO_V8, NOME_ETL_TO_V8 | ~20 |

**Total: 4 arquivos, ~96 LOC alteradas**

## Arquivos NÃO Editados

Prova de desacoplamento — estes arquivos NÃO precisaram de mudanças:

- `src/domain/kpi.js` — pure math, no domain strings
- `src/domain/filter.js` — pure functions, no domain strings
- `src/domain/chart.js` — CSS vars, no domain strings
- `src/domain/table.js` — schema-driven, no domain strings
- `src/domain/storytelling.js` — pure logic
- `src/domain/persona.js` — persona definitions unchanged
- `src/ui/*.js` — all UI components unchanged (sidebar, topbar, modal, etc.)
- `src/view/*.js` — all views unchanged (they read from branding.js!)
- `src/view/nav.js` — view controller reads NAV_ITEMS dynamically
- `boot.js` — init logic unchanged
- `main.js` — entry unchanged
- `src/styles/theme.css` — theme tokens unchanged
- `src/styles/app.css` — CSS unchanged
- `test/*.test.js` — all 89 tests pass unchanged
- `src/model/store.js`, `bus.js`, `settings.js`, `ui-state.js` — state layer unchanged
- `src/model/snapshot.js`, `auth.js`, `demo.js` — data layer unchanged
- `index.html` — entry HTML unchanged

## Validação

- `npm test`: 89/89 ✅
- `npx tsc --noEmit`: 0 errors ✅
- `npm run build`: OK ✅
- `npm run audit`: 0 FAIL ✅ (65 WARN — known template-debt)

## Conclusão

Trocar vertical = **4 arquivos**. Arquitetura V8 é replicável.

O experimento prova que branding como dado (F5) + schema-driven rendering + CSS vars
permitem rebrand completo sem tocar em views, UI, estilos, ou testes. O único trabalho
é editar os dados de branding e os mapeamentos ETL — zero código estrutural muda.
