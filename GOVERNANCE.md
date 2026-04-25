# GOVERNANCE — V7 Stable + V8 Flagship

Este documento define como as duas linhas do dashboard convivem, evoluem e se fundem. É o **roteador** de decisões: quando usar V7, quando usar V8, o que pode ser promovido, e quem decide em caso de conflito.

Toda dúvida sobre arquitetura, escopo ou versão deve ser respondida com base neste arquivo.

---

## 1. Linhas em paralelo

| Linha | Estado | Localização | Propósito |
|---|---|---|---|
| **V7** | Estável (congelada) | `dashboard.html` na raiz | Baseline em uso pelo Reinaldo no dia-a-dia. Recebe apenas correções críticas. |
| **V8** | Em construção | `dashboard-v8/` (a ser criada) | Flagship modular, schema leve, personas dinâmicas, AA+AAA progressivo. |

### Regra de paridade de dados
**V7 e V8 compartilham o mesmo mock de dados.** V8 pode acrescentar visualizações, mas não pode divergir do conteúdo de V7. Isso permite comparação A/B direta. Se uma feature exige novo dado, ele é adicionado ao mock compartilhado e ambas as linhas passam a poder lê-lo.

---

## 2. Quando usar V7

- Operação diária do Reinaldo até V8 atingir paridade funcional.
- Apresentação para clientes/parceiros (estabilidade comprovada).
- Referência visual e de comportamento para guiar decisões em V8.

**V7 não recebe:**
- Features novas.
- Refatorações arquiteturais.
- Mudanças de stack.

**V7 recebe (apenas):**
- Correções de bugs críticos que impedem demonstração.
- Patches de segurança.
- Ajustes de mock data que sejam requeridos por V8 (mantendo paridade).

---

## 3. Quando usar V8

- Toda feature nova começa em V8.
- Toda exploração de design, animação, storytelling é em V8.
- Todo upgrade de stack (charts, tabela, build) é em V8.

**V8 obedece a:**
- Um arquivo por responsabilidade (`data/`, `ui/`, `charts/`, `kpi/`, `filter/`, `report/`, `state/`, `test/`, `schema/`).
- Funções puras testadas para filtros e KPIs.
- Lifecycle explícito para charts (`create / update / resize / destroy`).
- Schema leve por entidade (não BI semantic layer).
- AA obrigatório + AAA progressivo nas áreas-chave.
- Mesmo mock que V7.

---

## 4. Promoção V8 → Skills base

Padrões nascidos em V8 só viram skill base quando:

1. Estão estáveis em V8 por ≥1 semana sem regressão.
2. Têm pelo menos 1 teste cobrindo o comportamento.
3. Foram aplicados em ≥2 views (não é caso isolado).
4. O skill correspondente é atualizado **junto** com a promoção.

**Promoções são adições, não substituições.** Skills mantém seções `[V7]` e `[V8]` durante a transição. Só após sunset do V7 os prefixos são removidos.

---

## 5. Resolução de conflito

Em caso de discordância entre V7 e V8 (ex.: paleta diferente, comportamento diferente):

| Tópico | Quem ganha |
|---|---|
| Estabilidade visual / UX consolidada | V7 |
| Modularidade / arquitetura / testes | V8 |
| Comportamento de dados / contratos | V8 (e V7 alinha se possível, senão V7 fica como está) |
| Stack / dependências | V8 |
| Print layout / reports | V7 (já validado, portar como está) |

Se a regra acima não decide: **a linha estável (V7) ganha em produção, a linha experimental (V8) ganha em direção futura**.

---

## 6. Critério de sunset do V7

V7 é arquivado para `/archive/v7/` (não deletado) quando V8 atinge:

- [ ] Paridade funcional completa com V7.
- [ ] Zero dos 3 bugs históricos (KPI overflow, modal sizing, filtros).
- [ ] ≥2 semanas sem bug novo em uso real.
- [ ] AA baseline passando em axe-core sem violações.
- [ ] Pelo menos 1 view com AAA completo.
- [ ] `verificador.py` (ou sucessor) passando para V8.

Após sunset:
- Remover prefixos `[V7]` e `[V8]` dos skills.
- Tag git `v8-ga`.
- V7 fica disponível em `/archive/v7/` para auditoria histórica.

---

## 7. Tag/branch policy

| Branch | Conteúdo |
|---|---|
| `master` | V7 estável até sunset. Depois, V8. |
| `v8/dev` | V8 em construção. |
| `v8/<feature>` | Feature branches mergeadas em `v8/dev`. |

Tags marcam estados publicáveis:
- `v7-final` — último patch do V7 antes de congelar.
- `v8-alpha` — esqueleto V8 + vertical slice (Fase 2).
- `v8-paridade` — V8 com paridade funcional (Fase 3).
- `v8-ga` — V8 estável, V7 arquivado.

---

## 8. Documento vivo

Este arquivo é atualizado **a cada transição de fase** do plano em `~/.claude/plans/misty-zooming-swing.md`. Mudanças incluem:

- Atualizar checklist de sunset.
- Marcar promoções V8→skills.
- Registrar decisões arquiteturais que afetam ambas as linhas.

Última atualização: **Fase 0 concluída** (V7 com 3 bugs corrigidos, verificador 19/19).
