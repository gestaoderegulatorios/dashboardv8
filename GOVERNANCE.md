# GOVERNANCE — V8 Flagship

Este documento define como o dashboard evolui. V7 está arquivado e congelado.

---

## 1. Linha ativa

| Linha | Estado | Localização | Propósito |
|---|---|---|---|
| **V8** | Ativo | `dashboard-v8/` | Dashboard modular flagship com ETL, temas, personas, testes |

### V7 arquivado

V7 foi congelado em 2026-05-01 e movido para `archive/v7/`. Ver `archive/v7/V7_FROZEN.md` para detalhes.

---

## 2. Quando usar V8

V8 é a **única** linha ativa. Toda feature, fix, e exploração acontece em V8.

**V8 obedece a:**
- Um arquivo por responsabilidade (`domain/`, `model/`, `ui/`, `view/`).
- Funções puras testadas para filtros e KPIs.
- Lifecycle explícito para charts (`mountChart / destroy`).
- Schema leve por entidade (não BI semantic layer).
- AA obrigatório + AAA progressivo nas áreas-chave.
- 89+ testes unitários + E2E passando.

---

## 3. Promoção V8 → Skills base

Padrões nascidos em V8 só viram skill base quando:

1. Estão estáveis em V8 por ≥1 semana sem regressão.
2. Têm pelo menos 1 teste cobrindo o comportamento.
3. Foram aplicados em ≥2 views (não é caso isolado).
4. O skill correspondente é atualizado **junto** com a promoção.

---

## 4. Tag/branch policy

| Branch | Conteúdo |
|---|---|
| `master` | V8 ativo |

Tags marcam estados publicáveis:
- `v7-final` — último commit do V7 antes de congelar (c927a94).
- `v8-paridade` — V8 com paridade funcional completa.
- `v8-ga` — V8 estável com P0-P7 completos.

---

## 5. Documento vivo

Este arquivo é atualizado a cada transição de fase do plano de evolução.

Última atualização: **P-1 (V7 sunset)** — V7 arquivado, V8 = linha única.
