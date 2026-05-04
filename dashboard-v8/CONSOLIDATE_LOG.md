# F-CONSOLIDATE — Decision Log

Timeline de todas as decisões, skips e reverts durante a consolidação.

## 2026-05-02 — S1 Audit

- **Decisão:** Executar audit manual antes de qualquer refactoring
- **Resultado:** CONSOLIDATE_AUDIT.md com 7 categorias, 15+ achados
- **Key findings:** storyPatterns (dead export), content.js (órfão), rebuildPaletteCommands (duplicado), ETL maps em mock.js (layer leak), hex hardcoded em sidebar.js e table.js

## 2026-05-02 — S2a Card-base extraction — SKIP

- **Risco:** 8+ views dependem de card patterns (card-base, card-tilt, border-glow, etc.)
- **Motivo:** Extração exigiria tocar em todas as views simultaneamente; DOM poderia mudar
- **Decisão:** SKIP — benefício moderado vs risco alto de quebrar views
- **Revisitável quando:** views forem geradas por IA ou lazy-loaded

## 2026-05-02 — S2b HTML fragments — SKIP

- **Risco:** Template literal extraction altera DOM de todas as views
- **Motivo:** Mesmo racional de S2a — mudança em massa com alto risco visual
- **Decisão:** SKIP — débito documentado em WARNs do audit.cjs
- **Revisitável quando:** template engine externo for adotado

## 2026-05-02 — S2c ETL normalization layer separation — EXECUTADO

- **Mudança:** STATUS_ETL_TO_V8, TIPO_ETL_TO_V8, NOME_ETL_TO_V8, normalizeObra → mock.js → etl-normalize.js
- **Commit:** `7f51520`
- **Validação:** 89/89 ✅ | tsc 0 ✅ | build OK ✅

## 2026-05-02 — S2d Dead code removal — EXECUTADO

- **Removido:** storyPatterns export (storytelling.js + domain/index.d.ts), content.js (órfão), model/index.d.ts entries órfãs
- **Fix:** story.test.js atualizado (testava storyPatterns)
- **Commit:** `ac48c9b`
- **Validação:** 89/89 ✅ | tsc 0 ✅ | build OK ✅

## 2026-05-02 — S2e main.js split — EXECUTADO

- **Mudança:** main.js 327→30 LOC, boot.js 263 LOC (nova), rebuildPaletteCommands duplicata removida
- **Commit:** `963af7e`
- **Validação:** 89/89 ✅ | tsc 0 ✅ | build OK ✅

## 2026-05-02 — S2f Semantic CSS classes — EXECUTADO

- **Mudança:** .status-success/warning/error classes em app.css, --color-sidebar-divider token em theme.css, sidebar.js border-[#162A4E] → sidebar-divider, table.js statusBadge → semantic classes
- **Commit:** `7ab14ab`
- **Validação:** 89/89 ✅ | tsc 0 ✅ | build OK ✅

## 2026-05-02 — S3 Discipline + Audit Automation — EXECUTADO

- **Criados:** CONTRIBUTING.md (10 regras), scripts/audit.cjs (6 regras automatizadas)
- **Modificados:** package.json (audit script), .github/workflows/ci.yml (audit step), chart.js (hex comment → CSS var reference)
- **Relaxamentos pragmáticos:** view mount/template functions (WARN not FAIL), login.js/reports.js hex exceptions (WARN not FAIL), chart.js file size (WARN not FAIL)
- **Commit:** `b5f10f9`
- **Validação:** 89/89 ✅ | tsc 0 ✅ | build OK ✅ | audit 0 FAIL ✅

## 2026-05-02 — S4 Replication Proof — EXECUTADO (experiment branch)

- **Branch:** experiment/vet-vertical (NÃO merged)
- **4 arquivos editados:** branding.js, schema.js, mock.js, etl-normalize.js
- **Resultado:** Trocar vertical = 4 arquivos. 89/89 ✅ | tsc 0 ✅ | build OK ✅ | audit 0 FAIL ✅
- **Commit:** `232b330` + `86cfaa4` (REPLICATION_PROOF.md fix)
- **Revisitável:** Quando novo vertical for adotado de verdade, usar esta branch como template

## 2026-05-02 — S5 Documentação Final — EXECUTADO

- **Atualizados:** DECISIONS.md (seção F-CONSOLIDATE), README.md (F-CONSOLIDATE + ETL status + audit command)
- **Criados:** CONSOLIDATE_LOG.md (este arquivo), CONSOLIDATE_REPORT.md (relatório final)
- **Commit:** pendente
