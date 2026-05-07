# Chat Prompt: Criar Nova Vertical

## Contexto

Voce esta criando uma nova vertical (area de negocio) para o Dashboard V8.
O sistema e baseado em configuracoes puras - voce NUNCA edita codigo das views ou do boot.

## Stack Tecnica

- **Build**: Vite (ES modules nativos)
- **CSS**: Tailwind CSS via PostCSS + CSS vars em theme.css
- **Charts**: ApexCharts 4.x (via npm)
- ** charts fragments**: src/charts/shared/ - reutilize builders existentes
- **Testes**: Vitest + jsdom (testes headless)

## Regras Obrigatorias

### 1. Nunca editar arquivos protegidos

```
! boot.js          (logica de boot - nao toque)
! main.js          (entrypoint - nao toque)
! src/domain/      (logica de negocio reutilizavel - nao toque)
! src/ui/          (componentes UI - nao toque)
! src/view/shared.js (utilitarios - nao toque)
```

### 2. Sempre editar arquivos da nova vertical

```
src/config/verticals/{nome-da-vertical}.js  <-- CRIAR (configuracao)
src/kpis/{nome-da-vertical}.js              <-- CRIAR (KPIs especificos)
src/charts/{nome-da-vertical}.js              <-- CRIAR (builders especificos)
```

### 3. Configuracao minima (VerticalConfig)

```javascript
/**
 * @fileoverview Vertical Config: {NOME_DA_AREA}
 * @type {import('../schema.js').VerticalConfig}
 */

/** @type {import('../schema.js').VerticalConfig} */
export const {nomeConfig} = {
  id: '{id-da-vertical}',
  name: '{Nome Exibido}',
  icon: '{material-symbols-id}',
  views: ['overview', 'works', '{view-id}'],
  defaultView: 'overview',
  viewConfig: [
    { id: 'overview', label: 'Visao Geral', icon: 'dashboard' },
    { id: 'works', label: 'Obras', icon: 'construction' },
    // Adicione suas views aqui
  ],
  kpis: [
    { id: 'kpi-1', label: 'KPI 1', format: 'integer', color: 'primary' },
    // Adicione mais KPIs
  ],
  charts: [
    { id: 'chart-1', type: 'area', title: 'Chart 1', builder: 'build{Funcao}', seriesKey: 'dadosChart1' },
    // Adicione mais charts
  ],
  tables: [
    {
      id: 'tbl-1',
      title: 'Tabela X',
      columns: [
        { key: 'nome', label: 'Nome', type: 'string' },
        { key: 'valor', label: 'Valor', type: 'currency' },
      ],
    },
  ],
};

export default {nomeConfig};
```

### 4. Registre no index

Depois de criar a vertical, registre em `src/config/index.js`:

```javascript
import suaNova from './verticals/sua-nova.js';

export const VERTICALS = {
  financeiro,
  rh,
  suaNova, // <-- adicione aqui
};
```

### 5. Valide antes de entregar

```bash
npm test -- test/config.index.test.js
```

Todos os testes devem passar antes de entregar.

## Exemplo de uso

URL para acessar a vertical:
- `https://dashboard.example.com/?vertical=sua-nova`

## Helpers recomendados

Para o schema, estao definidos os helpers:
- `getVertical('id')` — retorna a config da vertical
- `detectVerticalId()` — detecta qual vertical esta na URL
- `validate(config)` — valida se uma config esta correta

## Convenoes de nome

- id: snake-case (ex: `recursos-humanos`)
- Variavel export: camelCaseConfig (ex: `rhConfig`)
- views: use as views existentes ou crie novas em `src/view/nome-da-view.js`
