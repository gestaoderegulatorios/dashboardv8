## PRINCÍPIO FUNDAMENTAL
A acessibilidade não é opcional. Cada dashboard Borgonovi precisa ser navegável pelo teclado, compreensível por leitores de tela e legível para usuários com baixa visão.

## LANDMARKS HTML (mesma estrutura da V7)
- Link de pular navegação (primeiro elemento do body)
- `<aside>` para a barra lateral com `role="navigation"`
- `<header>` para a topbar
- `<main>` para o conteúdo com `aria-label`
- `<section>` para cada view com `role="region" aria-label="Nome da View"`

## ARIA POR COMPONENTE (Padrões V8)
### Sidebar nav items
```html
<a href="#" class="nav-item ..." data-view="id" data-tooltip="Label" role="button" tabindex="0">
  <span class="material-symbols-outlined" aria-hidden="true">icon</span>
  <span class="nav-text">Label</span>
</a>
```
Itens ativos devem receber `aria-current="page"`.

### KPI cards
```html
<div role="region" aria-label="KPI Name" data-kpi="kpi-id">
  <span aria-label="KPI Name">R$ 0</span>
</div>
```

### Chart containers
```html
<div id="chart-id" role="img" aria-label="Description of chart"></div>
```

### Tables
- `<table>` com `thead` e `tbody`
- Cabeçalhos Sortables: `<th role="columnheader" aria-sort="none/ascending/descending">`
- Paginação: `aria-label="Paginação"` no elemento de navegação
- Badges de status: use `aria-label` para o significado

### Modal
- `role="dialog" aria-modal="true" aria-labelledby="modal-title"`
- Focus trap na abertura (V8 modal.js trata disso)
- Retornar o foco ao fechar

### Command Palette
- `role="dialog" aria-modal="true"`
- `role="listbox"` para os resultados
- Teclado: ↑↓ para navegar, Enter para executar, Esc para fechar

## FOCUS MANAGEMENT (Padrões V8)
- Troca de view: o foco move-se para o elemento hospedeiro da view
- Abertura de modal: foco preso dentro do modal
- Fechamento de modal: foco retorna ao gatilho
- Collapse da sidebar: o foco permanece no botão de hambúrguer

## CONTRASTE WCAG AA
- Todas as cores de texto definidas por CSS vars com contraste suficiente
- O tema V8 define valores claro/escuro em `theme.css`
- Testes Axe-core validam o contraste automaticamente (4 casos de teste)
- Pares-chave validados: texto primário em fundo de fundo, texto em superfície em fundo de superfície, etc.

## REDUZIDO MOTION
- CSS `@media (prefers-reduced-motion: reduce)` desativa todas as animações
- `animateNumber()` verifica `prefersReduced()` e pula para o valor final
- `initReveal()` respeita a preferência de movimento reduzido

## TESTES COM V8 (axe-core)
```javascript
// test/a11y.test.js — 4 test cases usando axe-core
import { mount } from '../src/view/overview.js';
// Cada teste monta uma view real e valida WCAG AA
```

Rodar: `npm test` — inclui 4 testes a11y (85 unit + 4 a11y = 89 total)

## CHECKLIST DE ACESSIBILIDADE (V8)
- [ ] Link de pular navegação presente
- [ ] Todas as landmarks possuem `aria-label`
- [ ] Todos os elementos interativos acessíveis por teclado (tabindex, Enter/Space)
- [ ] Gráficos possuem `role="img"` e `aria-label`
- [ ] KPIs possuem `role="region"` e `aria-label`
- [ ] Tabelas com `thead`/`tbody`, cabeçalhos sortable
- [ ] Modal com trap de foco (via `modal.js`)
- [ ] Badges de status usam `aria-label` (não apenas cor)
- [ ] Contraste de cor passa WCAG AA (validado pelo axe-core)
- [ ] Movimento reduzido respeitado
- [ ] Elementos `data-animate-value` possuem `aria-label` com valor final
- [ ] Filtros de entrada possuem `aria-label`
- [ ] Itens de navegação possuem `data-tooltip` para sidebar recolhida
