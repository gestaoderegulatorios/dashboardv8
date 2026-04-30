# charts-v8.md - Padrões de ApexCharts para Borgonovi Dashboard V8

Este documento descreve os padrões de criação de gráficos na versão 8 (V8) do Borgonovi Dashboard. Tudo abaixo está em pt-BR. Inclui a configuração global, paleta de cores, formas de criar gráficos com mountChart, lifecycle, exemplos por tipo de gráfico, formatação de valores, fullscreen delegado, tema escuro e antipadrões.

## CONFIGURAÇÃO GLOBAL (getChartDefaults)
Mostrar a saída da função getChartDefaults() da V8 (não o objeto borgChartDefaults da V7).
```javascript
import { mountChart, getChartDefaults, getCSSVar, tooltipBRL, tooltipPercent, tooltipInteger } from '../domain/chart.js';

// getChartDefaults() retorna um objeto NEW a cada chamada (lazy init):
// - fontFamily: 'Inter, sans-serif'
// - toolbar: { show: false }
// - background: 'transparent'
// - animations: { enabled: true, easing: 'easeinout', speed: 800, dynamicAnimation: { enabled: true, speed: 400 } }
// - theme: { mode: isDark ? 'dark' : 'light' }  ← AUTO-DETECTA modo escuro
// - colors: a partir de CSS vars (--chart-categorical-1 through 6)
// - grid: borderColor a partir de --chart-grid CSS var, strokeDashArray: 4
// - xaxis labels: 11px, fontWeight 700, colors a partir de --chart-axis-label
// - yaxis labels: 11px, fontWeight 500, formatter: número pt-BR
// - tooltip: tema auto (escuro/claro), estilo 12px Inter
// - legend: 11px, fontWeight 500, cores a partir de --chart-legend
// - dataLabels: { enabled: false }
// - stroke: { curve: 'smooth', width: 2 }
// - states: hover darken 0.9, active darken 0.85
```

## PALETA DE CORES
### CATEGÓRICA (padrão para a maioria dos gráficos)
- Lida com as variáveis CSS: --chart-categorical-1 até --chart-categorical-6
- Valores de fallback (caso a variável não exista):
- #4c5e86, #0a1f44, #b37c59, #ba1a1a, #7687b2, #585e70

### Sequencial (para heatmaps, treemaps)
getSequentialPalette(): #d9e2ff → #0a1f44 (do claro para o azul escuro)

### Divergente (para gaps/waterfall)
getDivergentPalette(): #ba1a1a (vermelho) → #e0e3e5 (neutro) → #2e7d32 (verde)

### Cores de Gauge (getGaugeColor)
- v < 40: --chart-status-bad (#ba1a1a)
- v < 70: --chart-status-warn (#b37c59)
- v >= 70: --chart-status-good (#2e7d32)

## COMO CRIAR UM GRÁFICO (mountChart)
```javascript
import { mountChart, buildXxxOptions } from '../domain/chart.js';

// Dentro de mount():
function renderCharts() {
  const container = host.querySelector('#my-chart');
  if (container) {
    charts.myChart = mountChart(container, {
      chart: { type: 'bar', height: 320 },
      series: [{ name: 'Nome', data: [...] }],
      xaxis: { categories: [...] },
      // ... opções específicas (as defaults já são aplicadas via deepMerge)
    });
  }
}

// No unmount:
function destroyAllCharts() {
  Object.keys(charts).forEach(k => { try { charts[k]?.destroy(); } catch {} delete charts[k]; });
}
```

### ChartHandle API
mountChart() retorna: `{ instance, update(opts), updateSeries(series), resize(), destroy() }`

## LIFECYCLE OBRIGATÓRIO
1. mountChart() cria chart + ResizeObserver
2. o chart é salvo em registry (getChartConfig) para fullscreen
3. update() / updateSeries() para re-render sem destroy
4. destroy() no unmount da view — SEMPRE

## TIPOS DE GRÁFICO COM EXEMPLOS
Para cada tipo, mostre o builder V8 + uso:

### Bar Chart (buildAvancoBarOptions)
```javascript
import { mountChart, buildAvancoBarOptions } from '../domain/chart.js';
charts.bar = mountChart(container, buildAvancoBarOptions(obras));
```

### Donut (buildComposicaoDonutOptions)
```javascript
import { mountChart, buildComposicaoDonutOptions } from '../domain/chart.js';
charts.donut = mountChart(container, buildComposicaoDonutOptions(composicao));
```

### Area (buildReceitaAreaOptions)
```javascript
import { mountChart, buildReceitaAreaOptions } from '../domain/chart.js';
charts.area = mountChart(container, buildReceitaAreaOptions(meses, receitaMensal));
```

### Gauge/RadialBar (buildGaugeOptions)
```javascript
import { mountChart, buildGaugeOptions } from '../domain/chart.js';
charts.gauge = mountChart(container, buildGaugeOptions(percent, 'Label'));
```

### Sparkline (buildSparklineOptions)
```javascript
import { mountChart, buildSparklineOptions } from '../domain/chart.js';
charts.spark = mountChart(container, buildSparklineOptions(data, '#2e7d32', 'area'));
```

### Waterfall (opções personalizadas)
```javascript
import { mountChart } from '../domain/chart.js';
charts.waterfall = mountChart(container, {
  chart: { type: 'bar' },
  plotOptions: { bar: { columnWidth: '80%' } },
  dataLabels: { enabled: false },
  series: [{ name: 'Deslocamento', data: [...] }],
  dataCurrency: true // formatação BRL na yaxis
});
```

### Heatmap (opções personalizadas)
```javascript
import { mountChart, getSequentialPalette } from '../domain/chart.js';
charts.heatmap = mountChart(container, {
  chart: { type: 'heatmap', height: 320 },
  dataLabels: { enabled: false },
  colors: getSequentialPalette(),
  // demais opções conforme getChartDefaults() são aplicadas via deepMerge
});
```

### Treemap (opções personalizadas)
```javascript
import { mountChart } from '../domain/chart.js';
charts.treemap = mountChart(container, {
  chart: { type: 'treemap', height: 320 },
  series: [{ data: [...] }],
  dataLabels: { enabled: true }
});
```

## FORMATAÇÃO DE VALORES
- `tooltipBRL(val)` → R$ 87.300.000
- `tooltipPercent(val)` → 53,5%
- `tooltipInteger(val)` → 14
- `dataCurrency: true` em options do gráfico → formatter do yaxis usa BRL

## FULLSCREEN (DELEGADO)
- Botão com atributo data-fullscreen:
  ```html
  <button data-fullscreen="chart-id" data-title="Título" aria-label="Maximizar">...</button>
  ```
- O handler delega ao main.js para openChartFullscreen(); nenhum onclick precisa.

## DARK MODE
- Gráficos reagem automaticamente a mudanças de tema:
- getChartDefaults() lê CSS vars e atualiza as cores na próxima montagem
- evento `v8:theme-change` → controller.remount() → destroy + re-montar todos os gráficos
- NÃO é necessário alternar manualmente entre claro/escuro

## ANTI-PADRÕES (PROIBIDO)
- Borg.createChart() (V7) não deve ser usado
- borgChartDefaults como const não deve ser usado; usar getChartDefaults()
- Criar gráfico sem salvar a handle pode causar vazamento de memória
- Esquecer de destroy() no unmount
- Usar cores hex fixas no código
- Usar onclick para fullscreen (use data-fullscreen)

## NÃO FAZER
- Não referenciar padrões V7 no charts.md
- Não usar inline onclick
- Não copiar charts.md da V7 sem adaptações
- Não exceder ~400 linhas
- Não escrever em inglês

## CONTEXTO
- Fonte V8: src/domain/chart.js
- Builders: buildAvancoBarOptions, buildComposicaoDonutOptions, buildReceitaAreaOptions, buildGaugeOptions, buildSparklineOptions
- Helpers: getCSSVar, getChartDefaults, getSequentialPalette, getDivergentPalette, getGaugeColor, tooltipBRL, tooltipPercent, tooltipInteger
- V8 usa `mountChart(container, options)` com deepMerge de getChartDefaults()
```
