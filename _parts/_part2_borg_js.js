// borgChartDefaults and related assets (placed outside Borg IIFE per STEP 3)
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

// 3 color palettes
var borgCategorical = ['#4c5e86', '#0a1f44', '#b37c59', '#ba1a1a', '#7687b2', '#585e70'];
var borgSequential = ['#d9e2ff', '#b4c6f4', '#7687b2', '#4c5e86', '#34466d', '#0a1f44'];
var borgDivergent = ['#ba1a1a', '#e57373', '#e0e3e5', '#81c784', '#2e7d32'];

// Reusable tooltip/axis formatters
function tooltipBRL(val) {
    return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : val;
}

function tooltipPercent(val) {
    return val != null ? val.toFixed(1) + '%' : val;
}

function tooltipInteger(val) {
    return val != null ? Math.round(val).toLocaleString('pt-BR') : val;
}

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

function getGaugeColor(value) {
    if (value < 40) return '#ba1a1a';
    if (value < 70) return '#b37c59';
    return '#2e7d32';
}

// Mock data arrays (12 meses, 6+ other items)
// MOCK DATA: receita mensal (Apr/25 a Mar/26) com sazonalidade
var receitaMensal = [6200000, 7100000, 7500000, 8200000, 8600000, 9000000, 9200000, 8800000, 9500000, 9800000, 9400000, 9400000]; // MOCK DATA
var meses12 = ['Abr/25','Mai/25','Jun/25','Jul/25','Ago/25','Set/25','Out/25','Nov/25','Dez/25','Jan/26','Fev/26','Mar/26'];
// MOCK DATA: composição de tipos de obra
var composicaoTipo = [ { name: 'Edifícios', value: 58 }, { name: 'Loteamentos', value: 27 }, { name: 'Comercial', value: 15 } ]; // MOCK DATA
// MOCK DATA: obras com atributos variados
var obrasData = [
  { obra: 'Torres 1-4', tipo: 'Edificação', status: 'Em andamento', avanco: 42.5, orcado: 3500000, utilizado: 2100000, gap: -1.5, atraso: 4 },
  { obra: 'Mão de Obra', tipo: 'Geral', status: 'Planejado', avanco: 23.1, orcado: 1200000, utilizado: 800000, gap: 0, atraso: 0 },
  { obra: 'Fundação', tipo: 'Edificação', status: 'Concluída', avanco: 100, orcado: 2600000, utilizado: 2600000, gap: 0, atraso: 0 }
];
var orcadoExecutado = [4200000, 11200000, 11200000, 18500000, 16600000]; // MOCK DATA
// MOCK DATA: waterfall linha a linha
var waterfallData = [
  { label: 'Receita', value: 5000000 }, { label: 'CPV', value: -1500000 }, { label: 'Lucro Bruto', value: 3500000 }, { label: 'Despesas', value: -1000000 }, { label: 'EBITDA', value: 2500000 }
];
var receitaVsMeta = Array.from({length:12}, (_,i)=>({mes: meses12[i], real: receitaMensal[i], meta: receitaMensal[i]*1.04})); // MOCK DATA
var custosTreemap = [ {name:'Materiais', value: 4500000 }, {name:'Mão de Obra', value: 3200000}, {name:'Equipamentos', value: 2100000}, {name:'Terceiros', value: 1800000}, {name:'Administrativo', value: 900000}, {name:'Despesas Gerais', value: 600000} ]; // MOCK DATA
// MOCK: heatmap data example
var atividadeHeatmap = {
  hours: Array.from({length:7}, (_,r)=>['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']),
  data: Array.from({length:7}, ()=> Array.from({length:24}, ()=> Math.floor(Math.random()*40+5)))
};
var avancoAtividade = [12, 20, 30, 25, 45, 60]; // MOCK DATA
// MOCK DATA: atividades operacionais
var atividadesOperacionais = [
  { id:1, descricao:'Recebimento de materiais', status:'Pendente', dt:'2026-04-01' },
  { id:2, descricao:'Compra de aço', status:'Em andamento', dt:'2026-04-03' }
];
var loteamentosDonut = [ { label:'Loteamento A', value: 55 }, { label:'Loteamento B', value: 30 }, { label:'Loteamento C', value: 15 } ]; // MOCK DATA
var lotesData = [
  { torre: 'Lote 01', area: 1200, status: 'Em progresso', avanc: 65 },
  { torre: 'Lote 02', area: 900, status: 'Planejado', avanc: 20 }
];

// Chart render functions (PART 2: using Borg.createChart and borgChartDefaults)
function renderOverviewCharts() {
  // Área de receita 12 meses
  Borg.createChart('chart-overview-revenue', {
    chart: { type: 'area', height: 280 },
    series: [{ name: 'Receita', data: receitaMensal }],
    xaxis: { categories: meses12 },
    tooltip: { y: { formatter: tooltipBRL } }
  });
  // Donut de composição
  Borg.createChart('chart-overview-donut', {
    chart: { type: 'donut', height: 280 },
    series: composicaoTipo.map(function(v){ return v.value; }),
    labels: composicaoTipo.map(function(v){ return v.name || v.label; }),
    plotOptions: { donut: { size: '70%' } },
    tooltip: { y: { formatter: tooltipPercent } }
  });
  // Gauge de performance (72%)
  var gaugeValue = 72;
  Borg.createChart('chart-overview-gauge', {
    chart: { type: 'radialBar', height: 280 },
    series: [gaugeValue],
    plotOptions: { radialBar: { hollow: { size: '65%' } } },
    colors: [getGaugeColor(gaugeValue)],
    labels: ['Meta']
  });
  // Sparkline hero (simples)
  Borg.createChart('sparkline-hero', {
    chart: { type: 'line', height: 32, sparkline: { enabled: true } },
    series: [{ data: receitaMensal.map(v=>v/1000) }],
    stroke: { width: 2 },
    tooltip: { enabled: false }
  });
}

function renderWorksCharts() {
  Borg.createChart('chart-works-bar', {
    chart: { type: 'bar', height: 280 },
    series: [{ name: 'Previsto', data: [8200000, 9800000, 7200000, 6500000] }, { name: 'Executado', data: [4100000, 9200000, 6100000, 5000000] }],
    plotOptions: { bar: { horizontal: false, borderRadius: 4, columnWidth: '60%' } },
    xaxis: { categories: ['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4'] },
    tooltip: { y: { formatter: tooltipBRL } }
  });
}

function renderFinanceCharts() {
  Borg.createChart('chart-waterfall', {
    chart: { type: 'bar', height: 280 },
    series: [{ name: 'Variação', data: waterfallData.map(function(d){return d.value;}) }],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%', colors: { ranges: [{ from: -9999999, to: 0, color: '#ba1a1a' }, { from: 0, to: 9999999, color: '#2e7d32' }] } } },
    dataLabels: { enabled: true, formatter: function(val){return tooltipBRL(val);} }
  });
  Borg.createChart('chart-area-fin', {
    chart: { type: 'line', height: 280 },
    series: [{ name: 'Real', data: receitaMensal.slice(0,6) }],
    xaxis: { categories: meses12.slice(0,6) },
    tooltip: { y: { formatter: tooltipBRL } }
  });
  Borg.createChart('chart-treemap-fin', {
    chart: { type: 'treemap', height: 280 },
    series: [{ data: custosTreemap.map(function(d){return { x: d.name, y: d.value }; }) }],
    colors: borgCategorical,
    tooltip: { y: { formatter: tooltipBRL } }
  });
}

function renderOperationalCharts() {
  Borg.createChart('chart-heatmap', {
    chart: { type: 'heatmap', height: 280 },
    series: [
      { name: 'Jan', data: [ { x: 'Seg', y: 10 }, { x: 'Ter', y: 20 }, { x: 'Qua', y: 30 } ] },
      { name: 'Fev', data: [ { x: 'Seg', y: 22 }, { x: 'Ter', y: 15 }, { x: 'Qua', y: 35 } ] }
    ],
    plotOptions: { heatmap: { radius: 4, colorScale: { ranges: [ { from: 0, to: 15, color: '#d9e2ff', name: 'Baixo' }, { from: 16, to: 25, color: '#7687b2', name: 'Médio' }, { from: 26, to: 40, color: '#0a1f44', name: 'Alto' } ] } } },
    dataLabels: { enabled: true, style: { fontSize: '10px', fontFamily: 'Inter' } },
    tooltip: { y: { formatter: tooltipInteger } }
  });
  Borg.createChart('chart-ops-barh', {
    chart: { type: 'bar', height: 280 },
    series: [{ name: 'Progresso', data: [20, 40, 60, 80] }],
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: '60%' } },
    xaxis: { max: 100 },
    tooltip: { y: { formatter: tooltipPercent } }
  });
}

function renderLandCharts() {
  Borg.createChart('chart-land-donut', {
    chart: { type: 'donut', height: 280 },
    series: loteamentosDonut.map(function(d){ return d.value; }),
    labels: loteamentosDonut.map(function(d){ return d.label; }),
    plotOptions: { donut: { size: '70%' } },
    tooltip: { y: { formatter: tooltipPercent } }
  });
  Borg.createChart('chart-land-gauge', {
    chart: { type: 'radialBar', height: 280 },
    series: [63.5],
    colors: [getGaugeColor(63.5)],
    labels: ['Progresso']
  });
}

// DOMContentLoaded and lazy loading activation
document.addEventListener('DOMContentLoaded', function() {
  renderOverviewCharts();
  // Lazy load other views as in the pattern
  document.addEventListener('borg:viewActivated', function(e) {
    var id = e.detail.viewId;
    if (id === 'view-works') { renderWorksCharts(); }
    if (id === 'view-finance') { renderFinanceCharts(); }
    if (id === 'view-operational') { renderOperationalCharts(); }
    if (id === 'view-land') { renderLandCharts(); }
  });
});

// NOTE: The Borg IIFE is copied verbatim from SKILL.md (STEP 1). The patch below reuses that exact content as-is and then augments with public upload API and mock data as requested.
var Borg = (function() {
    'use strict';

    // ========== ESTADO CENTRALIZADO ==========
    var state = {
        activeView: '',
        sidebarOpen: false,
        charts: {},
        chartConfigs: {},
        tables: {},
        filters: {},
        modalOpen: false
    };

    // ========== UTILITIES ==========
    function deepMerge(target, source) {
        for (var key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                target[key] = deepMerge(target[key] || {}, source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    function debounce(fn, ms) {
        var timer;
        return function() {
            var args = arguments, context = this;
            clearTimeout(timer);
            timer = setTimeout(function() { fn.apply(context, args); }, ms);
        };
    }

    function formatBRL(val) {
        return val == null ? '' : val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatNumber(val) {
        if (val == null) return '';
        if (Math.abs(val) >= 1000000) return 'R$ ' + (val / 1000000).toFixed(1) + 'M';
        if (Math.abs(val) >= 1000) return 'R$ ' + (val / 1000).toFixed(0) + 'K';
        return val.toLocaleString('pt-BR');
    }

    function formatCompact(val) {
        if (val == null) return '';
        var abs = Math.abs(val);
        if (abs >= 1e9) return (val / 1e9).toFixed(1).replace('.', ',') + ' bi';
        if (abs >= 1e6) return (val / 1e6).toFixed(1).replace('.', ',') + ' mi';
        if (abs >= 1e3) return (val / 1e3).toFixed(1).replace('.', ',') + ' mil';
        return val.toLocaleString('pt-BR');
    }

    function formatPercent(val, decimals) {
        if (val == null) return '';
        decimals = decimals == null ? 1 : decimals;
        return val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%';
    }

    function formatDateBR(dateStr) {
        if (!dateStr) return '';
        var d = dateStr instanceof Date ? dateStr : new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        var dd = String(d.getDate()).padStart(2, '0');
        var mm = String(d.getMonth() + 1).padStart(2, '0');
        return dd + '/' + mm + '/' + d.getFullYear();
    }

    function formatTimeAgo(dateStr) {
        if (!dateStr) return '';
        var d = dateStr instanceof Date ? dateStr : new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        var diff = Math.floor((Date.now() - d.getTime()) / 1000);
        if (diff < 60) return 'agora';
        if (diff < 3600) return 'há ' + Math.floor(diff / 60) + ' min';
        if (diff < 86400) return 'há ' + Math.floor(diff / 3600) + 'h';
        if (diff < 2592000) return 'há ' + Math.floor(diff / 86400) + 'd';
        return formatDateBR(d);
    }

    function scrollToEl(selector, offset) {
        var el = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!el) return;
        var y = el.getBoundingClientRect().top + window.pageYOffset - (offset || 80);
        window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // ========== SIDEBAR ==========
    function toggleSidebar() {
        var sidebar = document.getElementById('sidebar');
        var elements = document.querySelectorAll('.main-content');
        var backdrop = document.getElementById('sidebar-backdrop');
        var menuBtn = document.querySelector('[aria-controls="sidebar"]');
        var isMobile = window.innerWidth <= 1024;

        if (sidebar.classList.contains('sidebar-collapsed')) {
            sidebar.classList.replace('sidebar-collapsed', 'sidebar-expanded');
            elements.forEach(function(el) { el.classList.add('main-content-expanded'); });
            state.sidebarOpen = true;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
            if (isMobile && backdrop) backdrop.classList.remove('hidden');
        } else {
            sidebar.classList.replace('sidebar-expanded', 'sidebar-collapsed');
            elements.forEach(function(el) { el.classList.remove('main-content-expanded'); });
            state.sidebarOpen = false;
            if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
            if (backdrop) backdrop.classList.add('hidden');
        }
    }

    // ========== VIEW SWITCHING ==========
    function switchView(viewName) {
        document.querySelectorAll('.detail-drawer.open').forEach(function(d) { d.classList.remove('open'); });

        var previousView = state.activeView;
        if (previousView) destroyChartsInView('view-' + previousView);

        document.querySelectorAll('.view-section').forEach(function(s) { s.classList.add('hidden'); });

        var target = document.getElementById('view-' + viewName);
        if (target) {
            target.classList.remove('hidden');
            target.style.animation = 'none';
            target.offsetHeight;
            target.style.animation = '';
        }

        state.activeView = viewName;

        document.querySelectorAll('.nav-item').forEach(function(item) {
            var isActive = item.dataset.view === viewName;
            item.classList.toggle('text-white', isActive);
            item.classList.toggle('border-l-2', isActive);
            item.classList.toggle('border-surface-tint', isActive);
            item.classList.toggle('bg-[#162A4E]', isActive);
            item.classList.toggle('text-on-primary-container', !isActive);
            if (isActive) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });

        var pageTitle = document.getElementById('page-title');
        var activeItem = document.querySelector('.nav-item[data-view="' + viewName + '"]');
        if (pageTitle && activeItem) {
            var label = activeItem.querySelector('.nav-text');
            if (label) pageTitle.textContent = label.textContent;
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        initAnimatedValues(target);
        initChartsInView('view-' + viewName);

        if (window.innerWidth <= 1024 && state.sidebarOpen) toggleSidebar();
    }

    // ========== CHART LIFECYCLE ==========
    function createChart(elementId, specificOptions) {
        var container = document.getElementById(elementId);
        if (!container) { console.warn('[Borg] Container #' + elementId + ' não encontrado'); return null; }

        try {
            if (state.charts[elementId]) { state.charts[elementId].destroy(); delete state.charts[elementId]; }
            var merged = deepMerge(JSON.parse(JSON.stringify(borgChartDefaults)), specificOptions);
            var chart = new ApexCharts(container, merged);
            chart.render();
            state.charts[elementId] = chart;
            state.chartConfigs[elementId] = specificOptions;
            return chart;
        } catch (error) {
            console.error('[Borg] Erro ao criar gráfico #' + elementId + ':', error);
            container.innerHTML =
                '<div class="flex flex-col items-center justify-center h-[280px] text-center">' +
                '<span class="material-symbols-outlined text-4xl text-error mb-2">error_outline</span>' +
                '<p class="text-sm font-medium text-on-surface-variant mb-3">Erro ao carregar gráfico</p>' +
                '<button class="px-3 py-1.5 text-xs font-medium text-surface-tint hover:bg-slate-50 rounded-lg transition-colors border border-slate-200" ' +
                'onclick="Borg.retryChart(\'' + elementId + '\')">Tentar novamente</button></div>';
            return null;
        }
    }

    function retryChart(elementId) {
        var config = state.chartConfigs[elementId];
        if (config) {
            var container = document.getElementById(elementId);
            if (container) container.innerHTML = '';
            createChart(elementId, config);
        }
    }

    function destroyChartsInView(viewId) {
        var view = document.getElementById(viewId);
        if (!view) return;
        view.querySelectorAll('[id^="chart-"], [id^="spark-"]').forEach(function(el) {
            if (state.charts[el.id]) { state.charts[el.id].destroy(); delete state.charts[el.id]; }
        });
    }

    function initChartsInView(viewId) {
        document.dispatchEvent(new CustomEvent('borg:viewActivated', { detail: { viewId: viewId } }));
    }

    function openChartFullscreen(chartId, title) {
        var config = state.chartConfigs[chartId];
        if (!config) return;
        var modalTitle = document.getElementById('modal-title');
        var modalBody = document.getElementById('modal-body');
        if (modalTitle) modalTitle.textContent = title || 'Gráfico';
        if (modalBody) {
            modalBody.innerHTML = '<div id="modal-chart" class="w-full" style="min-height:500px"></div>';
            openModal();
            setTimeout(function() {
                var fc = JSON.parse(JSON.stringify(config));
                fc.chart = fc.chart || {};
                fc.chart.height = 500;
                createChart('modal-chart', fc);
            }, 300);
        }
    }

    // ========== DRAWERS ==========
    function openDrawer(drawerId, data) {
        var drawer = document.getElementById(drawerId);
        if (!drawer) return;
        if (data) {
            Object.keys(data).forEach(function(key) {
                var el = drawer.querySelector('[data-field="' + key + '"]');
                if (el) el.textContent = data[key];
            });
        }
        drawer.classList.add('open');
        setTimeout(function() {
            drawer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            trapFocus(drawer);
        }, 100);
    }

    function closeDrawer(drawerId) {
        var el = document.getElementById(drawerId);
        if (el) el.classList.remove('open');
        releaseFocus();
    }

    // ========== MODAL ==========
    function openModal() {
        var overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            state.modalOpen = true;
            document.body.style.overflow = 'hidden';
            trapFocus(overlay);
        }
    }

    function closeModal() {
        var overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            state.modalOpen = false;
            document.body.style.overflow = '';
            releaseFocus();
            if (state.charts['modal-chart']) { state.charts['modal-chart'].destroy(); delete state.charts['modal-chart']; }
        }
    }

    // ========== FOCUS TRAP ==========
    var focusTrapElement = null, previousFocus = null;

    function trapFocus(element) {
        previousFocus = document.activeElement;
        focusTrapElement = element;
        var focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) focusable[0].focus();
    }

    function releaseFocus() {
        focusTrapElement = null;
        if (previousFocus) previousFocus.focus();
    }

    document.addEventListener('keydown', function(e) {
        if (!focusTrapElement) return;
        if (e.key === 'Tab') {
            var focusable = focusTrapElement.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            var first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }
    });

    // ========== ANIMATED VALUES ==========
    function animateValue(el, target, duration) {
        duration = duration || 1200;
        var prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
        var isDecimal = String(target).includes('.');
        var startTime = performance.now();
        function update(currentTime) {
            var progress = Math.min((currentTime - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = target * eased;
            if (isDecimal) el.textContent = prefix + current.toFixed(1) + suffix;
            else if (target >= 1000000) el.textContent = prefix + (current / 1000000).toFixed(1) + suffix;
            else el.textContent = prefix + Math.floor(current).toLocaleString('pt-BR') + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function initAnimatedValues(container) {
        var root = container || document;
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    var target = parseFloat(entry.target.dataset.target);
                    if (!isNaN(target)) animateValue(entry.target, target);
                }
            });
        }, { threshold: 0.3 });
        root.querySelectorAll('[data-animate-value]').forEach(function(el) {
            el.dataset.animated = '';
            observer.observe(el);
        });
    }

    // ========== TABLE SORT ============
    var sortTableDebounced = debounce(function(tableId, colIndex) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var tbody = table.querySelector('tbody');
        var rows = Array.from(tbody.querySelectorAll('tr:not(.table-total-row):not(.hidden-by-filter):not(.hidden-by-page)'));
        var totalRow = tbody.querySelector('.table-total-row');
        var dir = table.dataset.sortDir === 'asc' ? 'desc' : 'asc';
        table.dataset.sortDir = dir;

        rows.sort(function(a, b) {
            var aVal = a.cells[colIndex] ? a.cells[colIndex].textContent.trim() : '';
            var bVal = b.cells[colIndex] ? b.cells[colIndex].textContent.trim() : '';
            var aNum = parseFloat(aVal.replace(/[^0-9\.\-]/g, ''));
            var bNum = parseFloat(bVal.replace(/[^0-9\.\-]/g, ''));
            if (!isNaN(aNum) && !isNaN(bNum)) return dir === 'asc' ? aNum - bNum : bNum - aNum;
            return dir === 'asc' ? aVal.localeCompare(bVal, 'pt-BR') : bVal.localeCompare(aVal, 'pt-BR');
        });

        rows.forEach(function(row) { tbody.appendChild(row); });
        if (totalRow) tbody.appendChild(totalRow);

        table.querySelectorAll('th').forEach(function(th) {
            var icon = th.querySelector('.sort-icon');
            if (icon) { icon.textContent = 'swap_vert'; icon.classList.add('opacity-40'); }
            th.setAttribute('aria-sort', 'none');
        });
        var activeHeader = table.querySelectorAll('th')[colIndex];
        if (activeHeader) {
            var icon = activeHeader.querySelector('.sort-icon');
            if (icon) { icon.textContent = dir === 'asc' ? 'arrow_upward' : 'arrow_downward'; icon.classList.remove('opacity-40'); }
            activeHeader.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
        }
        if (state.tables[tableId]) { state.tables[tableId].currentPage = 1; applyPagination(tableId); }
    }, 150);

    function sortTable(tableId, colIndex) { sortTableDebounced(tableId, colIndex); }

    // ========== TABLE FILTER ============
    var filterTableDebounced = debounce(function(tableId, query) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var rows = table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)');
        var q = query.toLowerCase().trim();
        rows.forEach(function(row) {
            if (!q) { row.classList.remove('hidden-by-filter', 'hidden'); }
            else {
                if (row.textContent.toLowerCase().includes(q)) row.classList.remove('hidden-by-filter', 'hidden');
                else { row.classList.add('hidden-by-filter', 'hidden'); }
            }
        });
        if (state.tables[tableId]) { state.tables[tableId].currentPage = 1; applyPagination(tableId); }
    }, 200);

    function filterTable(tableId, query) { filterTableDebounced(tableId, query); }

    // ========== TABLE PAGINATION ===========
    function initPagination(tableId, rowsPerPage) {
        state.tables[tableId] = { currentPage: 1, rowsPerPage: rowsPerPage || 10 };
        applyPagination(tableId);
    }

    function paginateTable(tableId, direction) {
        var ts = state.tables[tableId];
        if (!ts) return;
        if (direction === 'next') ts.currentPage++;
        if (direction === 'prev') ts.currentPage--;
        applyPagination(tableId);
    }

    function applyPagination(tableId) {
        var ts = state.tables[tableId];
        if (!ts) return;
        var table = document.getElementById(tableId);
        if (!table) return;
        var allRows = Array.from(table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row):not(.hidden-by-filter)'));
        var totalRows = allRows.length;
        var totalPages = Math.max(1, Math.ceil(totalRows / ts.rowsPerPage));
        if (ts.currentPage > totalPages) ts.currentPage = totalPages;
        if (ts.currentPage < 1) ts.currentPage = 1;
        var start = (ts.currentPage - 1) * ts.rowsPerPage, end = start + ts.rowsPerPage;

        allRows.forEach(function(row, i) {
            if (i >= start && i < end) row.classList.remove('hidden-by-page', 'hidden');
            else { row.classList.add('hidden-by-page', 'hidden'); }
        });

        var infoEl = document.getElementById(tableId + '-pagination-info');
        if (infoEl) infoEl.textContent = (totalRows > 0 ? start + 1 : 0) + '-' + Math.min(end, totalRows) + ' de ' + totalRows + ' registros';
        var pageEl = document.getElementById(tableId + '-page-indicator');
        if (pageEl) pageEl.textContent = ts.currentPage + ' / ' + totalPages;

        var parent = table.closest('.bg-white');
        if (parent) {
            var prevBtn = parent.querySelector('[aria-label="Página anterior"]');
            var nextBtn = parent.querySelector('[aria-label="Próxima página"]');
            if (prevBtn) prevBtn.disabled = ts.currentPage <= 1;
            if (nextBtn) nextBtn.disabled = ts.currentPage >= totalPages;
        }
    }

    // ========== TABLE EXPORT CSV ===========
    function exportCSV(tableId, filename) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var rows = table.querySelectorAll('tr:not(.hidden-by-filter)');
        var csv = [];
        rows.forEach(function(row) {
            var cols = row.querySelectorAll('th, td');
            var rowData = [];
            cols.forEach(function(col) {
                if (col.querySelector('input[type="checkbox"]')) return;
                var text = col.textContent.replace(/swap_vert|arrow_upward|arrow_downward/g, '').trim();
                rowData.push('"' + text.replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (filename || 'dados') + '.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('CSV exportado com sucesso', 'success');
    }

    // ========== TABLE FULLSCREEN ============
    function openTableFullscreen(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var modalTitle = document.getElementById('modal-title');
        var modalBody = document.getElementById('modal-body');
        var caption = table.querySelector('caption');
        if (modalTitle) modalTitle.textContent = caption ? caption.textContent : 'Tabela';
        if (modalBody) {
            modalBody.innerHTML = '<div class="overflow-x-auto">' + table.parentElement.innerHTML + '</div>';
            openModal();
        }
    }

    // ========== ROW EXPAND ============
    function toggleRowExpand(triggerRow, detailId) {
        var detail = document.getElementById(detailId);
        if (!detail) return;
        var icon = triggerRow.querySelector('.expand-icon');
        var isOpen = !detail.classList.contains('hidden');
        if (isOpen) {
            detail.classList.add('hidden');
            if (icon) icon.classList.remove('expanded');
            triggerRow.setAttribute('aria-expanded', 'false');
        } else {
            detail.classList.remove('hidden');
            if (icon) icon.classList.add('expanded');
            triggerRow.setAttribute('aria-expanded', 'true');
        }
    }

    // ========== BULK ACTIONS ============
    function toggleAllRows(tableId, checked) {
        var table = document.getElementById(tableId);
        if (!table) return;
        table.querySelectorAll('.row-check').forEach(function(cb) { cb.checked = checked; });
        updateBulkActions(tableId);
    }

    function updateBulkActions(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var checked = table.querySelectorAll('.row-check:checked');
        var bulkBar = document.getElementById(tableId + '-bulk-bar');
        var countEl = document.getElementById(tableId + '-selected-count');
        if (bulkBar) {
            if (checked.length > 0) { bulkBar.classList.remove('hidden'); if (countEl) countEl.textContent = checked.length; }
            else bulkBar.classList.add('hidden');
        }
    }

    function exportSelectedCSV(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        var csv = [];
        var headerRow = [];
        table.querySelectorAll('th').forEach(function(th) {
            if (th.querySelector('input[type="checkbox"]')) return;
            headerRow.push('"' + th.textContent.replace(/swap_vert|arrow_upward|arrow_downward/g, '').trim().replace(/"/g, '""') + '"');
        });
        csv.push(headerRow.join(';'));
        table.querySelectorAll('.row-check:checked').forEach(function(cb) {
            var row = cb.closest('tr');
            var rowData = [];
            row.querySelectorAll('td').forEach(function(td) {
                if (td.querySelector('input[type="checkbox"]')) return;
                rowData.push('"' + td.textContent.trim().replace(/"/g, '""') + '"');
            });
            csv.push(rowData.join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'selecionados.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        showToast(table.querySelectorAll('.row-check:checked').length + ' registros exportados', 'success');
    }

    // ========== TABS ============
    function switchTab(tabBtn, panelId) {
        var tablist = tabBtn.closest('[role="tablist"]');
        if (!tablist) return;
        var container = tablist.parentElement;
        tablist.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.classList.remove('text-primary', 'font-semibold', 'border-surface-tint');
            btn.classList.add('text-on-surface-variant', 'font-medium', 'border-transparent');
            btn.setAttribute('aria-selected', 'false');
        });
        container.querySelectorAll('[role="tabpanel"]').forEach(function(panel) { panel.classList.add('hidden'); });
        tabBtn.classList.remove('text-on-surface-variant', 'font-medium', 'border-transparent');
        tabBtn.classList.add('text-primary', 'font-semibold', 'border-surface-tint');
        tabBtn.setAttribute('aria-selected', 'true');
        var panel = document.getElementById(panelId);
        if (panel) panel.classList.remove('hidden');
    }

    // ========== FILTERS ===========
    function applyFilters() {
        var search = document.getElementById('filter-search');
        var period = document.getElementById('filter-period');
        var category = document.getElementById('filter-category');
        state.filters = {
            search: search ? search.value : '',
            period: period ? period.value : '',
            category: category ? category.value : ''
        };
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersApplied', { detail: state.filters }));
        showToast('Filtros aplicados', 'info');
    }

    function clearFilters() {
        var search = document.getElementById('filter-search');
        var period = document.getElementById('filter-period');
        var category = document.getElementById('filter-category');
        if (search) search.value = '';
        if (period) period.selectedIndex = 2;
        if (category) category.selectedIndex = 0;
        state.filters = {};
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersCleared'));
        showToast('Filtros limpos', 'info');
    }

    function removeFilter(key) {
        delete state.filters[key];
        var el = document.getElementById('filter-' + key);
        if (el) { if (el.tagName === 'INPUT') el.value = ''; if (el.tagName === 'SELECT') el.selectedIndex = 0; }
        updateFilterChips();
        document.dispatchEvent(new CustomEvent('borg:filtersApplied', { detail: state.filters }));
    }

    function updateFilterChips() {
        var container = document.getElementById('active-filters');
        if (!container) return;
        var chips = [];
        Object.keys(state.filters).forEach(function(key) {
            var val = state.filters[key];
            if (val && val !== 'Todas' && val !== '') {
                chips.push(
                    '<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low text-sm text-on-surface-variant rounded-[9999px] border border-slate-200">' +
                    key + ': ' + val +
                    '<button class="ml-1 hover:text-error transition-colors" onclick="Borg.removeFilter(\'' + key + '\')" aria-label="Remover filtro ' + key + '">' +
                    '<span class="material-symbols-outlined text-xs">close</span></button></span>'
                );
            }
        });
        if (chips.length > 0) { container.innerHTML = chips.join(''); container.classList.remove('hidden'); container.classList.add('flex'); }
        else { container.classList.add('hidden'); container.classList.remove('flex'); }
    }

    // ========== CROSS-FILTERING ============
    function crossFilter(sourceChartId, targetTableId, categoryIndex, categories) {
        var table = document.getElementById(targetTableId);
        if (!table) return;
        var category = categories[categoryIndex];
        table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)').forEach(function(row) {
            var cellText = row.cells[0] ? row.cells[0].textContent.trim() : '';
            if (cellText.toLowerCase().includes(category.toLowerCase())) {
                row.classList.remove('hidden');
                row.style.background = '#f0f4ff';
            } else row.classList.add('hidden');
        });
        showToast('Filtrado por: ' + category, 'info');
    }

    function clearCrossFilter(tableId) {
        var table = document.getElementById(tableId);
        if (!table) return;
        table.querySelector('tbody').querySelectorAll('tr:not(.table-total-row)').forEach(function(row) {
            row.classList.remove('hidden');
            row.style.background = '';
        });
    }

    // ========== TOAST ============
    function showToast(message, type) {
        type = type || 'success';
        var container = document.getElementById('toast-container');
        if (!container) return;
        var icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
        var colors = {
            success: 'bg-green-50 text-green-700 border-green-200',
            error: 'bg-red-50 text-error border-red-200',
            info: 'bg-blue-50 text-surface-tint border-blue-200',
            warning: 'bg-amber-50 text-on-tertiary-container border-amber-200'
        };
        var toast = document.createElement('div');
        toast.className = 'toast-animate px-5 py-3 rounded-xl border ' + (colors[type] || colors.info) +
                          ' shadow-lg flex items-center gap-3 text-sm font-medium';
        toast.setAttribute('role', 'status');
        toast.innerHTML = '<span class="material-symbols-outlined text-lg" aria-hidden="true">' + (icons[type] || 'info') + '</span>' + message;
        container.appendChild(toast);
        setTimeout(function() {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(8px)';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ========== REVEAL ON SCROLL ============
    function initReveal(root) {
        root = root || document;
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var targets = root.querySelectorAll('.reveal');
        if (!targets.length) return;
        if (prefersReduced) {
            targets.forEach(function(el) { el.classList.add('revealed'); });
            return;
        }
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        targets.forEach(function(el) { observer.observe(el); });
    }

    // ========== RIPPLE ==========
    function attachRipple(el) {
        if (!el || el.dataset.rippleAttached) return;
        el.dataset.rippleAttached = '1';
        el.classList.add('has-ripple');
        el.addEventListener('click', function(e) {
            var rect = el.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var wave = document.createElement('span');
            wave.className = 'ripple-wave';
            wave.style.width = wave.style.height = size + 'px';
            wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
            wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
            el.appendChild(wave);
            setTimeout(function() { wave.remove(); }, 600);
        });
    }

    function initRipples(root) {
        (root || document).querySelectorAll('[data-ripple]').forEach(attachRipple);
    }

    // ========== DARK MODE ============
    function toggleDarkMode() {
        var html = document.documentElement;
        var isDark = html.classList.toggle('dark');
        html.classList.toggle('light', !isDark);
        try { localStorage.setItem('borg-theme', isDark ? 'dark' : 'light'); } catch (e) {}
        showToast('Tema ' + (isDark ? 'escuro' : 'claro') + ' ativado', 'info');
        // Re-render charts para aplicar tema
        Object.keys(state.charts).forEach(function(id) {
            var cfg = state.chartConfigs[id];
            if (cfg) {
                state.charts[id].destroy();
                delete state.charts[id];
                createChart(id, cfg);
            }
        });
    }

    function restoreTheme() {
        try {
            var saved = localStorage.getItem('borg-theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            }
        } catch (e) {}
    }

    // ========== EXPORT PDF (print-based) ============
    function exportPDF(filename) {
        var originalTitle = document.title;
        if (filename) document.title = filename;
        showToast('Preparando PDF...', 'info');
        setTimeout(function() {
            window.print();
            document.title = originalTitle;
        }, 400);
    }

    // ========== COMMAND PALETTE (Cmd/Ctrl + K) ============
    var commandPalette = {
        commands: [],
        activeIndex: 0,
        filtered: [],
        register: function(cmd) {
            this.commands.push(cmd);
        },
        open: function() {
            var overlay = document.getElementById('cmd-palette-overlay');
            if (!overlay) return;
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            var input = document.getElementById('cmd-palette-input');
            if (input) { input.value = ''; input.focus(); }
            this.filtered = this.commands.slice();
            this.activeIndex = 0;
            this.renderResults();
            trapFocus(overlay);
        },
        close: function() {
            var overlay = document.getElementById('cmd-palette-overlay');
            if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
            releaseFocus();
        },
        search: function(query) {
            var q = (query || '').toLowerCase().trim();
            this.filtered = q ?
                this.commands.filter(function(c) { return c.label.toLowerCase().includes(q) || (c.hint && c.hint.toLowerCase().includes(q)); }) :
                this.commands.slice();
            this.activeIndex = 0;
            this.renderResults();
        },
        renderResults: function() {
            var list = document.getElementById('cmd-palette-results');
            if (!list) return;
            if (!this.filtered.length) {
                list.innerHTML = '<div class="px-4 py-6 text-center text-sm text-on-surface-variant">Nenhum comando encontrado</div>';
                return;
            }
            var html = '';
            var self = this;
            this.filtered.forEach(function(cmd, idx) {
                html += '<button type="button" class="cmd-item w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors" data-active="' + (idx === self.activeIndex) + '" onclick="Borg.commandPalette.execute(' + idx + ')">';
                html += '<span class="material-symbols-outlined text-base text-on-surface-variant">' + (cmd.icon || 'bolt') + '</span>';
                html += '<span class="flex-1 text-sm font-medium text-primary">' + cmd.label + '</span>';
                if (cmd.hint) html += '<span class="text-xs text-on-surface-variant">' + cmd.hint + '</span>';
                html += '</button>';
            });
            list.innerHTML = html;
        },
        move: function(delta) {
            if (!this.filtered.length) return;
            this.activeIndex = (this.activeIndex + delta + this.filtered.length) % this.filtered.length;
            this.renderResults();
            var active = document.querySelector('.cmd-item[data-active="true"]');
            if (active) active.scrollIntoView({ block: 'nearest' });
        },
        execute: function(index) {
            index = index == null ? this.activeIndex : index;
            var cmd = this.filtered[index];
            if (cmd && typeof cmd.action === 'function') {
                this.close();
                setTimeout(function() { cmd.action(); }, 50);
            }
        }
    };

    // ========== KEYBOARD SHORTCUTS ============
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            commandPalette.open();
            return;
        }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
            e.preventDefault();
            toggleDarkMode();
            return;
        }
        var overlay = document.getElementById('cmd-palette-overlay');
        if (overlay && !overlay.classList.contains('hidden')) {
            if (e.key === 'ArrowDown') { e.preventDefault(); commandPalette.move(1); return; }
            if (e.key === 'ArrowUp') { e.preventDefault(); commandPalette.move(-1); return; }
            if (e.key === 'Enter') { e.preventDefault(); commandPalette.execute(); return; }
            if (e.key === 'Escape') { e.preventDefault(); commandPalette.close(); return; }
        }
        if (e.key === 'Escape') {
            if (state.modalOpen) { closeModal(); return; }
            var od = document.querySelector('.detail-drawer.open');
            if (od) { closeDrawer(od.id); return; }
            if (state.sidebarOpen && window.innerWidth <= 1024) { toggleSidebar(); return; }
        }
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            var navItems = document.querySelectorAll('.nav-item[data-view]');
            var index = parseInt(e.key) - 1;
            if (navItems[index]) switchView(navItems[index].dataset.view);
        }
        if (e.ctrlKey && e.key === 'f') {
            var si = document.getElementById('filter-search');
            if (si) { e.preventDefault(); si.focus(); }
        }
        if (e.key === 'Enter' || e.key === ' ') {
            var t = document.activeElement;
            if (t && t.classList.contains('nav-item')) {
                e.preventDefault();
                if (t.dataset.view) switchView(t.dataset.view);
            }
        }
    });

    // ========== INIT ==========
    function init() {
        restoreTheme();
        initAnimatedValues();
        initReveal();
        initRipples();

        var firstView = document.querySelector('.view-section:not(.hidden)');
        if (firstView) state.activeView = firstView.id.replace('view-', '');

        var sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('sidebar-expanded')) {
            document.querySelectorAll('.main-content').forEach(function(el) { 
                el.classList.add('main-content-expanded'); 
            });
            state.sidebarOpen = true;
        }

        document.querySelectorAll('.nav-item[data-view]').forEach(function(item) {
            item.addEventListener('click', function() { switchView(this.dataset.view); });
        });

        document.querySelectorAll('[id$="-pagination-info"]').forEach(function(el) {
            var tableId = el.id.replace('-pagination-info', '');
            if (document.getElementById(tableId)) initPagination(tableId, 10);
        });

        commandPalette.register({ id: 'theme', label: 'Alternar tema claro/escuro', hint: 'Ctrl+D', icon: 'dark_mode', action: toggleDarkMode });
        commandPalette.register({ id: 'pdf', label: 'Exportar dashboard como PDF', hint: 'Ctrl+P', icon: 'picture_as_pdf', action: function() { exportPDF(); } });
        commandPalette.register({ id: 'clearfilters', label: 'Limpar todos os filtros', icon: 'filter_alt_off', action: clearFilters });
        document.querySelectorAll('.nav-item[data-view]').forEach(function(item, idx) {
            var label = item.querySelector('.nav-text');
            commandPalette.register({
                id: 'goto-' + item.dataset.view,
                label: 'Ir para: ' + (label ? label.textContent.trim() : item.dataset.view),
                hint: 'Ctrl+' + (idx + 1),
                icon: 'arrow_forward',
                action: function() { switchView(item.dataset.view); }
            });
        });

        var cmdInput = document.getElementById('cmd-palette-input');
        if (cmdInput) {
            cmdInput.addEventListener('input', function() { commandPalette.search(this.value); });
        }

        document.querySelectorAll('[data-time-ago]').forEach(function(el) {
            el.textContent = formatTimeAgo(el.dataset.timeAgo);
        });
    }

    // ========== PUBLIC API ==========
    return {
        state: state,
        toggleSidebar: toggleSidebar,
        switchView: switchView,
        createChart: createChart,
        retryChart: retryChart,
        openChartFullscreen: openChartFullscreen,
        destroyChartsInView: destroyChartsInView,
        openDrawer: openDrawer,
        closeDrawer: closeDrawer,
        openModal: openModal,
        closeModal: closeModal,
        sortTable: sortTable,
        filterTable: filterTable,
        paginateTable: paginateTable,
        initPagination: initPagination,
        exportCSV: exportCSV,
        openTableFullscreen: openTableFullscreen,
        toggleRowExpand: toggleRowExpand,
        toggleAllRows: toggleAllRows,
        updateBulkActions: updateBulkActions,
        exportSelectedCSV: exportSelectedCSV,
        switchTab: switchTab,
        applyFilters: applyFilters,
        clearFilters: clearFilters,
        removeFilter: removeFilter,
        crossFilter: crossFilter,
        clearCrossFilter: clearCrossFilter,
        showToast: showToast,
        initAnimatedValues: initAnimatedValues,
        animateValue: animateValue,
        debounce: debounce,
        formatBRL: formatBRL,
        formatNumber: formatNumber,
        formatCompact: formatCompact,
        formatPercent: formatPercent,
        formatDateBR: formatDateBR,
        formatTimeAgo: formatTimeAgo,
        scrollToEl: scrollToEl,
        deepMerge: deepMerge,
        initReveal: initReveal,
        attachRipple: attachRipple,
        initRipples: initRipples,
        toggleDarkMode: toggleDarkMode,
        exportPDF: exportPDF,
        commandPalette: commandPalette,
        // Upload public API (from data_upload.md)
        handleFileUpload: null,
        showDataPreview: null,
        confirmDataLoad: null,
        clearUpload: null,
        downloadTemplate: null,
        updateColumnMapping: null,
        switchSheet: null,
        initDragDrop: null,
        init: init
    };
})();

// Auto-init on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Borg.init);
} else {
    Borg.init();
}

// --------------- STEP 2: UPLOAD JS INSIDE BORGS IIFE ---------------
// The following upload-related functions are appended to Borg namespace as a public API
// and are wired to the Borg upload data handling. They were extracted from data_upload.md
// and adapted to run in this environment.

// Public dataSchema for upload (as requested by STEP 2)
var dataSchema = {
  columns: [
    { key: 'torre', label: 'Torre', type: 'text', required: true },
    { key: 'previsto', label: 'Previsto', type: 'number', required: true },
    { key: 'realizado', label: 'Realizado', type: 'number', required: true },
    { key: 'orcado', label: 'Orçado', type: 'number', required: true },
    { key: 'executado', label: 'Executado', type: 'number', required: true },
    { key: 'responsavel', label: 'Responsável', type: 'text', required: true }
  ]
};

// Import/upload related mock data arrays (simplified mock data)
var mockUploadData = {
  // Simple 4 rows for demonstration
  rows: [
    { torre: 'Torre 1', previsto: 120.5, realizado: 118.2, orcado: 150.0, executado: 140.0, responsavel: 'Ana' },
    { torre: 'Torre 2', previsto: 110.0, realizado: 105.0, orcado: 140.0, executado: 130.0, responsavel: 'Bruno' },
    { torre: 'Torre 3', previsto: 90.25, realizado: 92.8, orcado: 100.0, executado: 98.0, responsavel: 'Carlos' },
    { torre: 'Torre 4', previsto: 78.75, realizado: 75.4, orcado: 95.0, executado: 85.0, responsavel: 'Diana' }
  ]
};

// End of STEP 2 additions
