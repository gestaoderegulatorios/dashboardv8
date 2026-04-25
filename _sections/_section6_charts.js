// Construtora Horizonte - Section 6: Charts (ALL chart code)
// NOTE: This file is intended to be appended inside a script tag in dashboard.html.
// It uses Borg.createChart() to merge with borgChartDefaults (defined below) and renders
// 14 charts across 6 views with lazy loading for non-overview views.

// 1) Borg chart defaults (complete)
var borgChartDefaults = {
  chart: { fontFamily: 'Inter, sans-serif', toolbar: { show: false }, background: 'transparent', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#4c5e86', '#0a1f44', '#b37c59', '#ba1a1a', '#7687b2', '#585e70'],
  grid: { borderColor: '#e0e3e5', strokeDashArray: 4, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
  xaxis: { labels: { style: { colors: '#75777f', fontSize: '11px', fontFamily: 'Inter', fontWeight: 700 } }, axisBorder: { color: '#e5e7eb' }, axisTicks: { color: '#e5e7eb' } },
  yaxis: { labels: { style: { colors: '#75777f', fontSize: '11px', fontFamily: 'Inter', fontWeight: 500 }, formatter: function(val) { if (Math.abs(val) >= 1000000) return 'R$ ' + (val/1000000).toFixed(1) + 'M'; if (Math.abs(val) >= 1000) return 'R$ ' + (val/1000).toFixed(0) + 'K'; return val; } } },
  tooltip: { theme: 'light', style: { fontSize: '12px', fontFamily: 'Inter' }, y: { formatter: function(val) { return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : val; } } },
  legend: { fontSize: '11px', fontFamily: 'Inter', fontWeight: 500, labels: { colors: '#44464e' }, markers: { radius: 2 } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  states: { hover: { filter: { type: 'darken', value: 0.9 } }, active: { filter: { type: 'darken', value: 0.85 } } }
};

// 2) Color Palettes
var borgCategorical = ['#4c5e86', '#0a1f44', '#b37c59', '#ba1a1a', '#7687b2', '#585e70'];
var borgSequential = ['#d9e2ff', '#b4c6f4', '#7687b2', '#4c5e86', '#34466d', '#0a1f44'];
var borgDivergent = ['#ba1a1a', '#e57373', '#e0e3e5', '#81c784', '#2e7d32'];

// 3) Formatters
function tooltipBRL(val) {
  if (val == null) return '';
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function tooltipPercent(val) {
  if (val == null) return '';
  var v = Number(val);
  return v.toFixed ? v.toFixed(1) + '%' : val + '%';
}

function tooltipInteger(val) {
  if (val == null) return '';
  return Math.round(val).toLocaleString('pt-BR');
}

function yAxisBRL(val) {
  if (val == null) return '';
  var v = Number(val);
  var a = Math.abs(v);
  if (a >= 1000000) return 'R$ ' + (v/1000000).toFixed(1) + 'M';
  if (a >= 1000) return 'R$ ' + (v/1000).toFixed(0) + 'K';
  return 'R$ ' + v.toFixed(0);
}

function yAxisPercent(val) {
  if (val == null) return '';
  var v = Number(val);
  return v.toFixed(1) + '%';
}

function yAxisInteger(val) {
  if (val == null) return '';
  var v = Number(val);
  if (Math.abs(v) >= 1000) return (v/1000).toFixed(0) + 'K';
  return v.toFixed(0);
}

function getGaugeColor(value) {
  var v = Number(value);
  if (v < 40) return '#ba1a1a';
  if (v < 70) return '#b37c59';
  return '#2e7d32';
}

// 4) Mock Data (all with // MOCK DATA comments)
var receitaMensal = [6200000, 7100000, 7500000, 8200000, 8600000, 9000000, 9200000, 8800000, 9500000, 9800000, 9400000, 9400000]; // MOCK DATA
var meses12 = ['Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25','Jan/26','Fev/26','Mar/26']; // MOCK DATA
var composicaoTipo = [ {name:'Edifícios', value:58}, {name:'Loteamentos', value:27}, {name:'Comercial', value:15} ]; // MOCK DATA
var obrasData = [
  {obra:'Obra A', tipo:'Residencial', status:'Em andamento', avanco:40, orcado:5000000, utilizado:2000000, gap:3000000, atrasos:5}, // MOCK DATA
  {obra:'Obra B', tipo:'Loteamento', status:'Planejado', avanco:10, orcado:3200000, utilizado:500000, gap:2700000, atrasos:2}, // MOCK DATA
  {obra:'Obra C', tipo:'Comercial', status:'Concluída', avanco:95, orcado:4200000, utilizado:4100000, gap:-100000, atrasos:0}, // MOCK DATA
  {obra:'Obra D', tipo:'Residencial', status:'Em andamento', avanco:60, orcado:8000000, utilizado:4200000, gap:3800000, atrasos:3}, // MOCK DATA
  {obra:'Obra E', tipo:'Industrial', status:'Em planejamento', avanco:5, orcado:2600000, utilizado:1200000, gap:1400000, atrasos:1} // MOCK DATA
];
var orcadoExecutado = [4200000,11200000,11200000,18500000,16600000]; // MOCK DATA
var waterfallData = [ {label:'Receita', value:5000000}, {label:'CPV', value:-1500000}, {label:'Lucro Bruto', value:3500000}, {label:'Despesas', value:-1000000}, {label:'EBITDA', value:2500000} ]; // MOCK DATA
var receitaVsMeta = receitaMensal.map(function(v){ return v * 1.04; }); // MOCK DATA
var custosTreemap = [
  {name:'Materiais', value:4500000},
  {name:'Mão de Obra', value:3200000},
  {name:'Equipamentos', value:2100000},
  {name:'Terceiros', value:1800000},
  {name:'Administrativo', value:900000},
  {name:'Despesas Gerais', value:600000}
]; // MOCK DATA
var atividadeHeatmap = (function(){ var days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']; var arr = []; for (var d=0; d<7; d++){ var row = []; for (var h=0; h<24; h++){ row.push(Math.floor(Math.random() * 100)); } arr.push(row); } return arr; })(); // MOCK DATA
var avancoAtividade = [12,20,30,25,45,60]; // MOCK DATA
var loteamentosDonut = [ {label:'Residencial Parque', value:55}, {label:'Jardim Europa', value:30}, {label:'Horizon Hills', value:15} ]; // MOCK DATA
var investimentosDonut = [ {label:'Proj. A', value:40}, {label:'Proj. B', value:60} ]; // MOCK DATA

/* 5) Chart Render Functions (6 views, 14 charts total) */

// 5.1 Overview Charts (4 charts)
function renderOverviewCharts() {
  // chart-area-revenue (Area chart)
  var optAreaRevenue = {
    chart: { type: 'area', height: 280 },
    series: [{ name: 'Receita', data: receitaMensal }],
    xaxis: { categories: meses12 },
    tooltip: { y: { formatter: tooltipBRL } },
    yaxis: { labels: { formatter: yAxisBRL } }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-area-revenue', optAreaRevenue);

  // chart-donut-type (Donut)
  var donutTypeSeries = composicaoTipo.map(function(o){ return o.value; });
  var donutTypeLabels = composicaoTipo.map(function(o){ return o.name; });
  var optDonutType = {
    chart: { type: 'donut', height: 280 },
    series: donutTypeSeries,
    labels: donutTypeLabels,
    tooltip: { y: { formatter: tooltipInteger } }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-donut-type', optDonutType);

  // chart-gauge-annual (Radial gauge)
  var optGaugeAnnual = {
    chart: { type: 'radialBar', height: 280 },
    series: [72],
    labels: ['Meta Anual'],
    colors: [getGaugeColor(72)]
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-gauge-annual', optGaugeAnnual);

  // spark-hero-revenue (Sparkline)
  var optSparkRevenue = {
    chart: { height: 32, type: 'line', sparkline: { enabled: true }, toolbar: { show: false } },
    series: [{ name: 'Receita', data: receitaMensal }],
    stroke: { width: 2 },
    tooltip: { enabled: false }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('spark-hero-revenue', optSparkRevenue);
}

// 5.2 Works Charts (2 charts)
function renderWorksCharts() {
  // chart-works-barv (Vertical bar chart showing progress per phase)
  var optWorksBarv = {
    chart: { type: 'bar', height: 280 },
    series: [ { name: 'Previsto', data: [8, 12, 7, 9] }, { name: 'Executado', data: [6, 8, 6, 7] } ],
    xaxis: { categories: ['Fase 1','Fase 2','Fase 3','Fase 4'] },
    plotOptions: { bar: { horizontal: false } },
    dataLabels: { enabled: false }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-works-barv', optWorksBarv);

  // chart-works-line (Progress vs Target)
  var optWorksLine = {
    chart: { height: 280, type: 'line' },
    series: [ { name: 'Progresso', data: [20, 40, 60, 75] }, { name: 'Meta', data: [25, 50, 75, 90] } ],
    xaxis: { categories: ['Fase 1','Fase 2','Fase 3','Fase 4'] },
    stroke: { width: 2 }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-works-line', optWorksLine);
}

// 5.3 Finance Charts (3 charts)
function renderFinanceCharts() {
  // chart-waterfall (two-series approach for positive/negative values)
  var optWaterfall = {
    chart: { type: 'bar', height: 280 },
    series: [ { name: 'Positivo', data: [5000000, 0, 3500000, 0, 2500000] }, { name: 'Negativo', data: [0, -1500000, 0, -1000000, 0] } ],
    xaxis: { categories: ['Receita','CPV','Lucro Bruto','Despesas','EBITDA'] },
    plotOptions: { bar: { horizontal: false } },
    dataLabels: { enabled: true }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-waterfall', optWaterfall);

  // chart-line-annotation (Real vs Meta over 12 months)
  var optLineAnnotation = {
    chart: { height: 280, type: 'line' },
    series: [ { name: 'Real', data: receitaMensal }, { name: 'Meta', data: receitaVsMeta } ],
    xaxis: { categories: meses12 },
    stroke: { width: 2 }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-line-annotation', optLineAnnotation);

  // chart-treemap (costs by category)
  var optTreemap = {
    chart: { type: 'treemap', height: 280 },
    series: [ { data: custosTreemap.map(function(o){ return { x: o.name, y: o.value }; }) } ],
    colors: borgCategorical
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-treemap', optTreemap);
}

// 5.4 Operational Charts (2 charts)
function renderOperationalCharts() {
  // chart-heatmap (weekly activity heatmap)
  var days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  var heatmapSeries = [];
  for (var i = 0; i < 7; i++) {
    heatmapSeries.push({ name: days[i], data: atividadeHeatmap[i] });
  }
  var optHeatmap = {
    chart: { type: 'heatmap', height: 180 },
    series: heatmapSeries,
    plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 0 } },
    colors: ['#ebf2ff', '#d0e4ff', '#a9d0ff', '#7fb4ff']
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-heatmap', optHeatmap);

  // chart-bar-h (horizontal bars for progress of activities)
  var optBarH = {
    chart: { type: 'bar', height: 180 },
    series: [ { name: 'Avanço', data: avancoAtividade } ],
    plotOptions: { bar: { horizontal: true } },
    xaxis: { categories: ['Ativ 1','Ativ 2','Ativ 3','Ativ 4','Ativ 5','Ativ 6'] }
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-bar-h', optBarH);
}

// 5.5 Land Charts (2 charts)
function renderLandCharts() {
  // chart-donut-land
  var landDonutSeries = loteamentosDonut.map(function(o){ return o.value; });
  var landDonutLabels = loteamentosDonut.map(function(o){ return o.label; });
  var optDonutLand = {
    chart: { type: 'donut', height: 260 },
    series: landDonutSeries,
    labels: landDonutLabels
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-donut-land', optDonutLand);

  // chart-gauge-land
  var optGaugeLand = {
    chart: { type: 'radialBar', height: 200 },
    series: [64.3],
    labels: ['Infra'],
    colors: [getGaugeColor(64.3)]
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-gauge-land', optGaugeLand);
}

// 5.6 Investments (1 chart)
function renderInvestmentsCharts() {
  var investDonutSeries = investimentosDonut.map(function(i){ return i.value; });
  var investDonutLabels = investimentosDonut.map(function(i){ return i.label; });
  var optInvestDonut = {
    chart: { type: 'donut', height: 260 },
    series: investDonutSeries,
    labels: investDonutLabels
  };
  if (typeof Borg !== 'undefined' && Borg.createChart) Borg.createChart('chart-pie-invest', optInvestDonut);
}

// 6) DOMContentLoaded + lazy loading (no IIFE)
document.addEventListener('DOMContentLoaded', function() {
  renderOverviewCharts();
  // Listen for view activation to lazy-load other charts
  document.addEventListener('borg:viewActivated', function(e) {
    var id = e && e.detail && e.detail.viewId ? e.detail.viewId : '';
    switch (id) {
      case 'view-works':
        renderWorksCharts();
        break;
      case 'view-finance':
        renderFinanceCharts();
        break;
      case 'view-operational':
        renderOperationalCharts();
        break;
      case 'view-land':
        renderLandCharts();
        break;
      case 'view-investments':
        renderInvestmentsCharts();
        break;
      default:
        break;
    }
  });
});
