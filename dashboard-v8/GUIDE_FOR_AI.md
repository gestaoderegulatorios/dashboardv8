# Para IA: Guia de Replicacao do Dashboard V8

Este guia explica, passo a passo, como replicar o sistema de dashboards para uma nova area de negocio usando apenas configuracoes.

## Arquitetura do Sistema

```
Dashboard V8
├── src/
│   ├── config/              <-- VOCE EDITA AQUI
│   │   ├── schema.js         (contrato TypeScript)
│   │   ├── validator.js      (validacao runtime)
│   │   ├── boot-adapter.js   (filtro de views)
│   │   ├── index.js          (registry verticais)
│   │   └── verticals/        <-- NOVAS VERTICAIS AQUI
│   ├── domain/               (logica pura, reutilizavel)
│   ├── model/                (dados e estado)
│   ├── ui/                   (componentes visuais)
│   ├── view/                 (paginas do dashboard)
│   └── charts/               (builders de charts)
├── main.js                   (entrypoint - vincula vertical)
└── boot.js                   (inicializacao - LEIA APENAS)
```

## Regra de Ouro

> NUNCA modifique `boot.js`, `main.js`, ou qualquer arquivo em `src/domain/`, `src/ui/`, ou `src/view/`.

## Passo 1: Criar arquivo de configuracao

Crie `src/config/verticals/{sua-area}.js`:

```javascript
// @type {import('../schema.js').VerticalConfig}
export const suaAreaConfig = {
  id: 'sua-area',
  name: 'Nome Exibido',
  icon: 'material-symbols-id',
  views: ['overview', 'works', 'relatorios'], // IDs das views que existem em src/view/
  defaultView: 'overview',
  viewConfig: [
    { id: 'overview', label: 'Visao Geral', icon: 'dashboard' },
    { id: 'works', label: 'Obras', icon: 'construction' },
    { id: 'relatorios', label: 'Relatorios', icon: 'description' },
  ],
  kpis: [
    { id: 'total', label: 'Total', format: 'integer', color: 'primary' },
  ],
  charts: [
    { id: 'chart-1', type: 'area', title: 'Evolucao', builder: 'buildReceitaAreaOptions', seriesKey: 'dados' },
  ],
  tables: [
    {
      id: 'tabela-1',
      title: 'Itens',
      columns: [
        { key: 'nome', label: 'Nome', type: 'string' },
        { key: 'valor', label: 'Valor (R$)', type: 'currency' },
      ],
    },
  ],
};

export default suaAreaConfig;
```

## Passo 2: Registrar a vertical

Edite `src/config/index.js`:

```javascript
import suaArea from './verticals/sua-area.js';

export const VERTICALS = {
  financeiro,
  rh,
  suaArea,  // <--- ADICIONE AQUI
};
```

## Passo 3: Testar

```bash
# Valide a config
npm test -- test/config.index.test.js

# Todos os testes devem passar
npm test
```

## Como funcionam as VerticalConfigs

A config define:
1. **Quais views** serao exibidas (filtro sobre as views em main.js)
2. **KPIs** que serao renderizados na overview
3. **Charts** serao renderizados com seus builders
4. **Tabelas** e suas colunas
5. **Permissoes** (quem pode acessar)

## Helpers disponiveis em src/config/

- `detectVerticalId()` — detecta `?vertical=` na URL, fallback para a primeira
- `getVertical(id)` — retorna a config completa da vertical
- `validate(config)` — retorna `{ok: true|false, errors: [...]}`
- `getDefaultView(config)` — retorna a view default da configuracao

## Exemplos prontos

- `src/config/verticals/financeiro.js` — config existente para Financeiro
- `src/config/verticals/rh.js` — config existente para RH

## Exemplo de acesso na URL

```
# Para acessar a vertical de Financeiro
https://meu-site.com/?vertical=financeiro

# Para acessar a de RH
https://meu-site.com/?vertical=rh
```

## Criando uma view nova (AVANCADO)

Se precisar de uma view que nao existe, crie em `src/view/{nome}.js`:

```javascript
// src/view/minha-view.js

export function mount(host, { store, emit, on }) {
  // Logica da view aqui
  const state = store.get();
  // Renderize usando os dados do store
}

export const minhaView = { id: 'minha-view', label: 'Minha View', icon: 'icon', mount };
```

Depois registre em main.js (ou continue usando apenas as views existentes).

## Dados pontuados: KPIs e Charts

Os dados sao puxados do `store.get().data`. Use `seriesKey` em chart configs
para mapear automaticamente os dados:

```javascript
charts: [
  { id: 'receita', type: 'area', seriesKey: 'receitaMensal' }
],
```

O boot adapter renderiza automaticamente usando os builders registrados em
`src/charts/shared/index.js`.

## Notas

- O sistema Nao depende de React, Next.js, ou qualquer framework
- As views sao funcoes puras: `(hostElement, {store, emit, on}) => void`
- Todo estado vive no Pub/Sub store (createStore)
