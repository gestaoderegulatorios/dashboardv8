
# 📊 BORGONOVI V7 — APEXCHARTS

> Configuração global, paletas de dados e exemplos de todos os tipos de gráficos.
> Consultar este arquivo ao criar gráficos no dashboard.

---

## CONFIGURAÇÃO GLOBAL (borgChartDefaults)

> Já incluída no JavaScript da SKILL.md dentro do namespace Borg.
> Todo gráfico DEVE ser criado via `Borg.createChart()` que aplica estes defaults automaticamente.

```javascript
var borgChartDefaults = {
    chart: {
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        background: 'transparent',
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    colors: ['#4c5e86', '#0a1f44', '#b37c59', '#ba1a1a', '#7687b2', '#585e70'],
    grid: {
        borderColor: '#e0e3e5',
        strokeDashArray: 4,
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    xaxis: {
        labels: { style: { colors: '#75777f', fontSize: '11px', fontFamily: 'Inter', fontWeight: 700 } },
        axisBorder: { color: '#e5e7eb' },
        axisTicks: { color: '#e5e7eb' }
    },
    yaxis: {
        labels: {
            style: { colors: '#75777f', fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 },
            formatter: function(val) {
                if (Math.abs(val) >= 1000000) return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
                if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'K';
                return val;
            }
        }
    },
    tooltip: {
        theme: 'light',
        style: { fontSize: '12px', fontFamily: 'Inter' },
        y: {
            formatter: function(val) {
                return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : val;
            }
        }
    },
    legend: {
        fontSize: '11px', fontFamily: 'Inter', fontWeight: 500,
        labels: { colors: '#44464e' },
        markers: { radius: 2 }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    states: {
        hover: { filter: { type: 'darken', value: 0.9 } },
        active: { filter: { type: 'darken', value: 0.85 } }
    }
};
```

---

## PALETAS DE DADOS

### Paleta Categórica (padrão — séries distintas)

Para gráficos com múltiplas séries, donuts, treemaps.

```javascript
var borgCategorical = ['#4c5e86', '#0a1f44', '#b37c59', '#ba1a1a', '#7687b2', '#585e70'];
// É a mesma do borgChartDefaults.colors — aplicada automaticamente
```

### Paleta Sequencial (1 cor, intensidades crescentes)

Para heatmaps, escalas de intensidade, gradientes de uma métrica.

```javascript
var borgSequential = ['#d9e2ff', '#b4c6f4', '#7687b2', '#4c5e86', '#34466d', '#0a1f44'];
```

### Paleta Divergente (negativo → neutro → positivo)

Para GAP, variação, desempenho vs meta.

```javascript
var borgDivergent = ['#ba1a1a', '#e57373', '#e0e3e5', '#81c784', '#2e7d32'];
// vermelho forte → vermelho claro → neutro → verde claro → verde forte
```

### Quando usar cada paleta

| Tipo de Gráfico | Paleta | Observação |
|-----------------|--------|------------|
| Barras comparativas (2 séries) | Categórica (primeiras 2 cores) | Orçado vs Executado |
| Donut / Pie | Categórica | Até 6 fatias |
| Heatmap | Sequencial | 6 níveis de intensidade |
| Linha previsto vs realizado | Categórica (1ª e 2ª) + dashArray | Previsto tracejado |
| Gauge / RadialBar | Divergente | Vermelho < 50% < Verde |
| Treemap | Categórica | 1 cor por categoria |
| Barras com GAP +/- | Divergente (extremos) | Negativo vermelho, positivo verde |
| Waterfall | Divergente (extremos) | Aumento verde, diminuição vermelho |
| Sparkline | Categórica (1ª cor) | Cor única |

---

## TOOLTIP FORMATTERS REUTILIZÁVEIS

```javascript
// Moeda BRL
function tooltipBRL(val) {
    return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : val;
}

// Percentual
function tooltipPercent(val) {
    return val != null ? val.toFixed(1) + '%' : val;
}

// Número inteiro
function tooltipInteger(val) {
    return val != null ? Math.round(val).toLocaleString('pt-BR') : val;
}

// Y-axis formatters
function yAxisBRL(val) {
    if (Math.abs(val) >= 1000000) return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'K';
    return 'R$ ' + val;
}

function yAxisPercent(val) {
    return val + '%';
}

function yAxisInteger(val) {
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(0) + 'K';
    return val;
}
```

### Como aplicar tooltip/yaxis customizado

```javascript
Borg.createChart('chart-exemplo', {
    chart: { type: 'bar', height: 280 },
    series: [{ name: 'Avanço', data: [42.5, 38.0, 22.1] }],
    xaxis: { categories: ['A', 'B', 'C'] },
    // Override do tooltip padrão (BRL) para percentual:
    tooltip: {
        y: { formatter: tooltipPercent }
    },
    // Override do yaxis padrão (BRL) para percentual:
    yaxis: {
        labels: {
            style: { colors: '#75777f', fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 },
            formatter: yAxisPercent
        }
    }
});
```

---

## EXEMPLOS DE GRÁFICOS

### Gráfico de Barras Verticais

```javascript
Borg.createChart('chart-barras', {
    chart: { type: 'bar', height: 280 },
    series: [{
        name: 'Orçado',
        data: [4200000, 11200000, 11200000, 18500000, 16600000]
    }, {
        name: 'Executado',
        data: [1550000, 3360000, 2912000, 6105000, 2075000]
    }],
    plotOptions: {
        bar: { borderRadius: 4, columnWidth: '60%' }
    },
    xaxis: {
        categories: ['Implantação', 'Torres 1-4', 'Torres 5-8', 'Mão de Obra', 'Geral']
    }
});
```

---

### Gráfico de Barras Horizontais

```javascript
Borg.createChart('chart-hbar', {
    chart: { type: 'bar', height: 280 },
    series: [{
        name: 'Avanço',
        data: [42.5, 38.0, 22.1, 15.4, 31.2, 45.0, 28.9, 12.0]
    }],
    plotOptions: {
        bar: { horizontal: true, borderRadius: 4, barHeight: '60%' }
    },
    xaxis: { max: 100 },
    yaxis: {
        labels: { style: { colors: '#44464e', fontSize: '11px', fontWeight: 600 } }
    },
    labels: ['Torre 1', 'Torre 2', 'Torre 3', 'Torre 4', 'Torre 5', 'Torre 6', 'Torre 7', 'Torre 8'],
    tooltip: { y: { formatter: tooltipPercent } }
});
```

---

### Gráfico Donut

```javascript
Borg.createChart('chart-donut', {
    chart: { type: 'donut', height: 280 },
    series: [42.5, 38.0, 22.1, 15.4],
    labels: ['Torre 1', 'Torre 2', 'Torre 3', 'Torre 4'],
    plotOptions: {
        pie: {
            donut: {
                size: '70%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: 'Média',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#00081e',
                        formatter: function() { return '29.5%'; }
                    }
                }
            }
        }
    },
    tooltip: { y: { formatter: tooltipPercent } }
});
```

---

### Gráfico de Área

```javascript
Borg.createChart('chart-area', {
    chart: { type: 'area', height: 280 },
    series: [{
        name: 'Avanço Físico',
        data: [12, 18, 22, 25, 28, 33]
    }],
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 100]
        }
    },
    xaxis: { categories: ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'] },
    tooltip: { y: { formatter: tooltipPercent } }
});
```

---

### Gráfico de Linha

```javascript
Borg.createChart('chart-line', {
    chart: { type: 'line', height: 280 },
    series: [
        { name: 'Previsto', data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] },
        { name: 'Realizado', data: [8, 15, 22, 28, 33, null, null, null, null, null] }
    ],
    stroke: { width: [2, 3], dashArray: [4, 0] },
    xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']
    },
    tooltip: { y: { formatter: tooltipPercent } }
});
```

---

### Gráfico de Linha com Annotations

```javascript
Borg.createChart('chart-line-annotations', {
    chart: { type: 'line', height: 280 },
    series: [{
        name: 'Receita',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 86, 95]
    }],
    xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']
    },
    annotations: {
        xaxis: [{
            x: 'Mai',
            borderColor: '#ba1a1a',
            strokeDashArray: 0,
            label: {
                text: 'Início Fase 2',
                style: {
                    color: '#fff',
                    background: '#ba1a1a',
                    fontSize: '10px',
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    padding: { left: 5, right: 5, top: 2, bottom: 2 }
                }
            }
        }],
        yaxis: [{
            y: 75,
            borderColor: '#2e7d32',
            strokeDashArray: 4,
            label: {
                text: 'Meta',
                style: {
                    color: '#fff',
                    background: '#2e7d32',
                    fontSize: '10px',
                    fontFamily: 'Inter',
                    fontWeight: 700
                }
            }
        }]
    }
});
```

---

### Sparkline (para dentro de KPI card ou célula de tabela)

```javascript
Borg.createChart('spark-[ID]', {
    chart: {
        type: 'line',
        height: 32,
        width: 80,
        sparkline: { enabled: true }
    },
    series: [{ data: [12, 14, 8, 16, 12, 19, 22] }],
    stroke: { width: 2, curve: 'smooth' },
    colors: ['#4c5e86'],
    tooltip: { enabled: false }
});
```

### Sparkline para KPI Hero (maior, com opacidade)

```javascript
Borg.createChart('spark-hero-[ID]', {
    chart: {
        type: 'area',
        height: 40,
        width: 96,
        sparkline: { enabled: true }
    },
    series: [{ data: [22, 25, 28, 24, 30, 35, 42] }],
    stroke: { width: 2, curve: 'smooth' },
    fill: {
        type: 'gradient',
        gradient: { opacityFrom: 0.4, opacityTo: 0.05 }
    },
    colors: ['#b4c6f4'],
    tooltip: { enabled: false }
});
```

---

### Gauge / RadialBar (indicador de meta)

```javascript
Borg.createChart('chart-gauge', {
    chart: { type: 'radialBar', height: 280 },
    series: [72],
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: { size: '65%' },
            track: {
                background: '#e0e3e5',
                strokeWidth: '100%'
            },
            dataLabels: {
                name: {
                    fontSize: '12px',
                    color: '#44464e',
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    offsetY: -10
                },
                value: {
                    fontSize: '28px',
                    color: '#00081e',
                    fontFamily: 'Inter',
                    fontWeight: 800,
                    offsetY: 5,
                    formatter: function(val) { return val + '%'; }
                }
            }
        }
    },
    labels: ['Meta Atingida'],
    colors: ['#4c5e86']
});
```

### Gauge com cor dinâmica (vermelho/amarelo/verde conforme valor)

```javascript
function getGaugeColor(value) {
    if (value < 40) return '#ba1a1a';      // error
    if (value < 70) return '#b37c59';      // warning
    return '#2e7d32';                       // success
}

var gaugeValue = 72;
Borg.createChart('chart-gauge-dynamic', {
    chart: { type: 'radialBar', height: 280 },
    series: [gaugeValue],
    plotOptions: {
        radialBar: {
            startAngle: -135,
            endAngle: 135,
            hollow: { size: '65%' },
            track: { background: '#e0e3e5', strokeWidth: '100%' },
            dataLabels: {
                name: { fontSize: '12px', color: '#44464e', fontFamily: 'Inter', fontWeight: 700, offsetY: -10 },
                value: { fontSize: '28px', color: '#00081e', fontFamily: 'Inter', fontWeight: 800, offsetY: 5,
                         formatter: function(val) { return val + '%'; } }
            }
        }
    },
    labels: ['Meta'],
    colors: [getGaugeColor(gaugeValue)]
});
```

---

### Heatmap

```javascript
Borg.createChart('chart-heatmap', {
    chart: { type: 'heatmap', height: 280 },
    series: [
        {
            name: 'Jan',
            data: [
                { x: 'Seg', y: 10 },
                { x: 'Ter', y: 20 },
                { x: 'Qua', y: 30 },
                { x: 'Qui', y: 15 },
                { x: 'Sex', y: 25 }
            ]
        },
        {
            name: 'Fev',
            data: [
                { x: 'Seg', y: 22 },
                { x: 'Ter', y: 15 },
                { x: 'Qua', y: 35 },
                { x: 'Qui', y: 18 },
                { x: 'Sex', y: 28 }
            ]
        },
        {
            name: 'Mar',
            data: [
                { x: 'Seg', y: 30 },
                { x: 'Ter', y: 25 },
                { x: 'Qua', y: 12 },
                { x: 'Qui', y: 38 },
                { x: 'Sex', y: 20 }
            ]
        }
    ],
    plotOptions: {
        heatmap: {
            radius: 4,
            colorScale: {
                ranges: [
                    { from: 0, to: 15, color: '#d9e2ff', name: 'Baixo' },
                    { from: 16, to: 25, color: '#7687b2', name: 'Médio' },
                    { from: 26, to: 40, color: '#0a1f44', name: 'Alto' }
                ]
            }
        }
    },
    dataLabels: {
        enabled: true,
        style: { fontSize: '10px', fontFamily: 'Inter' }
    },
    tooltip: { y: { formatter: tooltipInteger } }
});
```

---

### Treemap

```javascript
Borg.createChart('chart-treemap', {
    chart: { type: 'treemap', height: 280 },
    series: [{
        data: [
            { x: 'Materiais', y: 4500000 },
            { x: 'Mão de Obra', y: 3200000 },
            { x: 'Equipamentos', y: 2100000 },
            { x: 'Terceiros', y: 1800000 },
            { x: 'Administrativo', y: 900000 }
        ]
    }],
    plotOptions: {
        treemap: {
            distributed: true,
            enableShades: false
        }
    },
    colors: ['#4c5e86', '#0a1f44', '#b37c59', '#7687b2', '#585e70'],
    tooltip: { y: { formatter: tooltipBRL } }
});
```

---

### Waterfall (simulado com bar + cores condicionais)

```javascript
Borg.createChart('chart-waterfall', {
    chart: { type: 'bar', height: 280 },
    series: [{
        name: 'Variação',
        data: [
            { x: 'Receita', y: 5000000, fillColor: '#2e7d32' },
            { x: 'Custos Fixos', y: -1500000, fillColor: '#ba1a1a' },
            { x: 'Custos Var.', y: -800000, fillColor: '#ba1a1a' },
            { x: 'Impostos', y: -600000, fillColor: '#ba1a1a' },
            { x: 'Lucro', y: 2100000, fillColor: '#4c5e86' }
        ]
    }],
    plotOptions: {
        bar: {
            borderRadius: 4,
            columnWidth: '50%',
            colors: {
                ranges: [
                    { from: -9999999, to: 0, color: '#ba1a1a' },
                    { from: 0, to: 9999999, color: '#2e7d32' }
                ]
            }
        }
    },
    dataLabels: {
        enabled: true,
        formatter: function(val) {
            if (Math.abs(val) >= 1000000) return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
            return 'R$ ' + (val / 1000).toFixed(0) + 'K';
        },
        style: { fontSize: '10px', fontFamily: 'Inter', fontWeight: 700 }
    }
});
```

---

### Gráfico com Drill-down (click abre drawer)

```javascript
var drilldownCategories = ['Região Sul', 'Região SE', 'Região NE', 'Região N', 'Região CO'];

Borg.createChart('chart-drilldown', {
    chart: {
        type: 'bar',
        height: 280,
        events: {
            dataPointSelection: function(event, chartContext, config) {
                var category = drilldownCategories[config.dataPointIndex];
                Borg.openDrawer('drilldown-drawer', {
                    title: category,
                    subtitle: 'Detalhamento por estado'
                });
            }
        }
    },
    series: [{
        name: 'Vendas',
        data: [4200, 8100, 3500, 2100, 2900]
    }],
    xaxis: { categories: ['Sul', 'Sudeste', 'Nordeste', 'Norte', 'Centro-Oeste'] },
    plotOptions: {
        bar: { borderRadius: 4, columnWidth: '60%' }
    },
    tooltip: { y: { formatter: tooltipBRL } }
});
```

---

### Gráfico com Cross-filtering (click filtra tabela)

```javascript
var crossFilterCategories = ['Materiais', 'Mão de Obra', 'Equipamentos', 'Terceiros', 'Admin'];

Borg.createChart('chart-cross', {
    chart: {
        type: 'donut',
        height: 280,
        events: {
            dataPointSelection: function(event, chartContext, config) {
                Borg.crossFilter(
                    'chart-cross',           // source chart
                    'table-detalhamento',    // target table
                    config.dataPointIndex,   // which segment clicked
                    crossFilterCategories    // category labels
                );
            }
        }
    },
    series: [4500000, 3200000, 2100000, 1800000, 900000],
    labels: crossFilterCategories,
    plotOptions: {
        pie: { donut: { size: '70%' } }
    },
    tooltip: { y: { formatter: tooltipBRL } }
});

// Botão para limpar o cross-filter:
// <button onclick="Borg.clearCrossFilter('table-detalhamento')">Limpar filtro</button>
```

---

## CONTAINER HTML PADRÃO PARA GRÁFICOS

> Usar sempre este template ao inserir um gráfico na view.
> **LEI 5**: TODO gráfico (exceto sparklines) DEVE ter botão fullscreen.
> **LEI 8**: TODO gráfico não-sparkline DEVE ter `chart.events.click` para cross-filtering.
> **LEI 10**: TODO container de gráfico DEVE ter `w-full` + altura explícita (`h-[xxx]px`), e o chart DEVE se ajustar ao container sem overflow.

```html
<div class="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm col-span-12 lg:col-span-[X] reveal relative">
<div class="flex justify-between items-center mb-2">
<span class="text-[0.6875rem] font-bold text-on-surface-variant uppercase tracking-wider">
[TITULO]
</span>
<button class="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-low
rounded-lg transition-colors z-10"
onclick="Borg.openChartFullscreen('chart-[ID]', '[TITULO]')"
aria-label="Maximizar gráfico" title="Maximizar">
<span class="material-symbols-outlined text-sm">fullscreen</span>
</button>
</div>
<div id="chart-[ID]" class="w-full h-[280px]"
role="img" aria-label="Gráfico: [DESCRIÇÃO]"></div>
</div>
```

---

## LAZY LOADING — COMO IMPLEMENTAR

> Charts NÃO devem ser criados no DOMContentLoaded para todas as views.
> Criar apenas os da view ativa. As demais views criam ao serem ativadas.

```javascript
// ===== PATTERN DE LAZY LOADING =====

// 1. View inicial (já visível no carregamento):
document.addEventListener('DOMContentLoaded', function() {
    // Charts da primeira view
    Borg.createChart('chart-overview-1', { /* config */ });
    Borg.createChart('chart-overview-2', { /* config */ });
    // Sparklines da primeira view
    Borg.createChart('spark-kpi-1', { /* sparkline config */ });
});

// 2. Views subsequentes (renderizam ao ativar):
document.addEventListener('borg:viewActivated', function(e) {
    var viewId = e.detail.viewId;

    if (viewId === 'view-financeiro') {
        Borg.createChart('chart-fin-barras', { /* config */ });
        Borg.createChart('chart-fin-donut', { /* config */ });
    }

    if (viewId === 'view-operacional') {
        Borg.createChart('chart-ops-line', { /* config */ });
        Borg.createChart('chart-ops-hbar', { /* config */ });
    }

    if (viewId === 'view-analitico') {
        Borg.createChart('chart-ana-heatmap', { /* config */ });
        Borg.createChart('chart-ana-treemap', { /* config */ });
        Borg.createChart('chart-ana-gauge', { /* config */ });
    }
});
```

> **IMPORTANTE:** `Borg.switchView()` automaticamente:
> 1. Destrói charts da view anterior (`destroyChartsInView`)
> 2. Dispara evento `borg:viewActivated` para a nova view
> 3. Isso previne memory leaks e garante performance

---

## REGRAS DE GRÁFICOS

| Regra | Detalhe |
|-------|---------|
| Sempre usar `Borg.createChart()` | Nunca `new ApexCharts()` diretamente |
| Sempre borgChartDefaults | Aplicado automaticamente pelo `createChart` |
| Container com `role="img"` e `aria-label` | Acessibilidade obrigatória |
| Botão fullscreen no header | **LEI 5** — obrigatório em TODO gráfico não-sparkline |
| Lazy loading | Criar charts apenas na view ativa |
| Destruição ao sair da view | Automático via `switchView` |
| Tooltip com unidade | Nunca "42" — sempre "R$ 42K" ou "42%" |
| Título descritivo | Nunca gráfico sem título |
| Altura via container CSS | **LEI 10** — `createChart` auto-detecta via `getContainerHeight()` |
| Container com `w-full h-[xxx]px` | **LEI 10** — obrigatório para que chart se ajuste |
| Cross-filtering via click | **LEI 8** — `chart.events.click` obrigatório em todo gráfico não-sparkline |
| Máximo 6 cores por gráfico | Paleta categórica tem 6 cores |
| Fullscreen sem scrollbar | **LEI 10** — chart maximizado DEVE caber no viewport |

### Cross-Filtering Pattern (LEI 8 — obrigatório)

```javascript
// Função auxiliar global (adicionar antes do Borg IIFE)
var _crossFilterState = { active: false, source: '', value: '' };

function crossFilterClick(chartId, config, opts) {
if (!opts || opts.seriesIndex == null) return;
var label = '';
if (opts.w && opts.w.globals && opts.w.globals.categoryLabels) {
label = opts.w.globals.categoryLabels[opts.dataPointIndex];
} else if (opts.w && opts.w.globals && opts.w.globals.labels) {
label = opts.w.globals.labels[opts.seriesIndex];
}
if (!label) return;
if (_crossFilterState.active && _crossFilterState.value === label) {
_crossFilterState = { active: false, source: '', value: '' };
document.dispatchEvent(new CustomEvent('borg:crossFilterClear'));
Borg.showToast('Filtro removido', 'info');
} else {
_crossFilterState = { active: true, source: chartId, value: label };
document.dispatchEvent(new CustomEvent('borg:crossFilterApplied', { detail: { source: chartId, label: label } }));
Borg.showToast('Filtrado por: ' + label, 'info');
}
}

function crossFilterEvent(chartId) {
return { click: function(event, chartContext, opts) { crossFilterClick(chartId, chartContext, opts); } };
}

// Usar em cada createChart (exceto sparklines):
Borg.createChart('chart-xxx', {
chart: { type: 'bar', height: 280, events: crossFilterEvent('chart-xxx') },
// ... resto da config
});
```
| Override de formatters quando necessário | Usar tooltipPercent, yAxisPercent, etc. |
| Summary footer opcional | 2-3 métricas resumo abaixo do gráfico |
```

---
