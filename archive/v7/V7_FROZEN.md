# V7 — FROZEN

**Data de congelamento**: 2026-05-01
**Commit final**: c927a94 (`V7 final: 3 critical bugs fixed`)

## Estado

V7 está **congelado** (frozen). Isso significa:

- ❌ Sem fixes (mesmo bugs)
- ❌ Sem features novas
- ❌ Sem refatorações
- ❌ Sem suporte

## O que existe aqui

| Arquivo | Descrição |
|---|---|
| `dashboard.html` | Dashboard V7 completo (~3199 linhas, autocontido) |
| `verificador.py` | Script de verificação de 10 leis V7 |
| `skills/` | 11 arquivos SKILL.md V7 (leis invariantes do dashboard) |

## Por que congelou

V8 atingiu paridade funcional completa com V7:
- 89/89 testes unitários ✅
- 23/23 E2E testes Playwright ✅
- Build de produção ✅
- Deploy em https://dashboard-borgonovi.pages.dev ✅
- ETL integration com snapshot.json ✅
- Sistema de temas CSS vars ✅
- Skills V8 (12 leis) ✅

## Como acessar

```bash
git checkout v7-final -- archive/v7/
```

## Migração

Se você precisa de algo do V7 que não está no V8:
1. Verifique se V8 já tem a feature em `dashboard-v8/`
2. Se não, crie issue com label `from-v7`
3. Implemente em V8 seguindo skills V8 (não copie código V7)
