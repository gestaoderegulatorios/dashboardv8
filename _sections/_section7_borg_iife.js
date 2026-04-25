/* Borg IIFE - Section 7: Complete core Borg for Construtora Horizonte dashboard
   Note: This file is intentionally verbose to cover all required subsystems
   It expects Section 6 to provide borgChartDefaults if available, otherwise
   falls back to specificOptions only.
*/
var Borg = (function() {
  // STATE
  var state = {
    activeView: '',
    sidebarOpen: false,
    charts: {},
    chartConfigs: {},
    tables: {},
    filters: {},
    modalOpen: false
  };

  // UTILITIES
  function isObject(v) {
    return v && typeof v === 'object' && !Array.isArray(v);
  }

  function deepMerge(target, source) {
    if (!isObject(source)) return target || {};
    target = target || {};
    for (var key in source) {
      if (!source.hasOwnProperty(key)) continue;
      if (isObject(source[key])) {
        target[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function(){ func.apply(context, args); }, wait);
    };
  }

  function formatBRL(n) {
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
    } catch (e) {
      return 'R$ ' + Number(n).toFixed(2);
    }
  }

  function formatNumber(n) {
    try {
      return new Intl.NumberFormat('pt-BR').format(n);
    } catch (e) {
      return String(n);
    }
  }

  function formatCompact(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'b';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return String(n);
  }

  function formatPercent(n) {
    return (Number(n) * 100).toFixed(1) + '%';
  }

  function formatDateBR(d) {
    var dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt)) return '';
    var day = dt.getDate().toString().padStart(2, '0');
    var month = (dt.getMonth() + 1).toString().padStart(2, '0');
    var year = dt.getFullYear();
    return day + '/' + month + '/' + year;
  }

  function formatTimeAgo(date) {
    var d = (date instanceof Date) ? date : new Date(date);
    var diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
    if (diff < 60) return Math.floor(diff) + 's';
    if (diff < 3600) return Math.floor(diff/60) + 'm';
    if (diff < 86400) return Math.floor(diff/3600) + 'h';
    var days = Math.floor(diff/86400);
    return days + 'd';
  }

  function scrollToEl(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  // Small DOM helpers
  function byId(id) { return document.getElementById(id); }
  function isVisible(el) { return !!(el && el.offsetParent !== null); }

  // SIDEBAR
  function toggleSidebar() {
    var sidebar = byId('sidebar');
    if (!sidebar) return;
    state.sidebarOpen = !state.sidebarOpen;
    if (state.sidebarOpen) {
      sidebar.classList.remove('sidebar-collapsed');
      sidebar.classList.add('sidebar-expanded');
    } else {
      sidebar.classList.remove('sidebar-expanded');
      sidebar.classList.add('sidebar-collapsed');
    }
    // main content padding adjustment (simple heuristic)
    var main = byId('main-content');
    if (main) {
      if (state.sidebarOpen) main.classList.add('content-expanded');
      else main.classList.remove('content-expanded');
    }
    // Backdrop for mobile
    var backdrop = byId('mobile-backdrop');
    if (backdrop) {
      backdrop.style.display = state.sidebarOpen ? 'block' : 'none';
    }
  }

  // VIEW SWITCHING
  function destroyChartsInView(viewId) {
    if (!viewId) return;
    for (var k in state.charts) {
      if (state.chartConfigs[k] && state.chartConfigs[k]._viewId === viewId) {
        try { if (state.charts[k] && state.charts[k].destroy) state.charts[k].destroy(); } catch(e){}
        delete state.charts[k];
      }
    }
  }

  function initChartsInView(viewSectionId) {
    // Placeholder: in a real setup, Section 6 would initialize charts here.
    // We emit a custom event to signal view activation for possible listeners.
    var ev = document.createEvent('CustomEvent');
    ev.initCustomEvent('borg:viewActivated', true, false, { viewId: viewSectionId });
    document.dispatchEvent(ev);
  }

  function switchView(viewName) {
    if (!viewName) return;
    // Close any open drawers (simple implementation)
    var drawers = document.querySelectorAll('[data-drawer]');
    Array.prototype.forEach.call(drawers, function(d) { if (d.classList.contains('open')) d.classList.remove('open'); });
    // Destroy charts from previous view
    if (state.activeView) destroyChartsInView('view-' + state.activeView);
    // Hide all views
    var sections = document.querySelectorAll('.view-section');
    Array.prototype.forEach.call(sections, function(sec){ sec.style.display = 'none'; sec.classList.add('hidden'); });
    // Show target view
    var target = byId('view-' + viewName);
    if (target) {
      target.style.display = 'block';
      target.classList.remove('hidden');
    }
    state.activeView = viewName;
    // Update nav items
    var items = document.querySelectorAll('.nav-item');
    Array.prototype.forEach.call(items, function(it){
      var v = it.getAttribute('data-view');
      if (v === viewName) {
        it.setAttribute('aria-current', 'page');
        it.classList.add('active');
      } else {
        it.removeAttribute('aria-current');
        it.classList.remove('active');
      }
    });
    // Title
    var pageTitle = byId('page-title');
    if (pageTitle) pageTitle.textContent = (viewName.charAt(0).toUpperCase() + viewName.slice(1)) + ' - Construtora Horizonte';
    // Scroll to top
    window.scrollTo(0, 0);
    // Initialize animated values and charts for the new view
    initAnimatedValues(byId('view-' + viewName));
    initChartsInView('view-' + viewName);
    // Close sidebar on mobile if open
    if (byId('sidebar') && byId('mobile-backdrop')) {
      state.sidebarOpen = false;
      byId('sidebar').classList.add('sidebar-collapsed');
      byId('mobile-backdrop').style.display = 'none';
    }
  }

  // CHART LIFECYCLE
  function createChart(elementId, specificOptions) {
    if (typeof ApexCharts === 'undefined') {
      console.warn('ApexCharts is not loaded. Chart not created: ' + elementId);
      return null;
    }
    var el = byId(elementId);
    if (!el) {
      console.warn('Chart container not found: ' + elementId);
      return null;
    }
    // Destroy existing
    if (state.charts[elementId] && state.charts[elementId].destroy) {
      try { state.charts[elementId].destroy(); } catch(e) {}
    }
    var options = {};
    if (typeof borgChartDefaults !== 'undefined') {
      options = deepMerge({}, borgChartDefaults);
    }
    options = deepMerge(options, specificOptions || {});
    // Attach a view id for potential cleanup when switching views
    if (options && !options._viewId) options._viewId = state.activeView ? ('view-' + state.activeView) : 'view-unknown';
    try {
      var chart = new ApexCharts(el, options);
      chart.render();
      state.charts[elementId] = chart;
      state.chartConfigs[elementId] = options;
    } catch (e) {
      console.error('Error rendering chart ' + elementId, e);
      // Show a minimal UI cue and provide a retry path
      el.innerHTML = '<div class=" Borg-error" style="color:red;padding:8px;">Chart failed to render. <button onclick="Borg.retryChart(\''+elementId+'\')">Retry</button></div>';
    }
  }

  function retryChart(elementId) {
    if (!elementId) return;
    createChart(elementId, {});
  }

  function destroyChartsInViewIfPresent(viewId) {
    if (!viewId) return;
    for (var id in state.charts) {
      var cfg = state.chartConfigs[id] || {};
      if (cfg._viewId === viewId && state.charts[id] && state.charts[id].destroy) {
        try { state.charts[id].destroy(); } catch(e){}
        delete state.charts[id];
      }
    }
  }

  function openChartFullscreen(chartId, title) {
    var chart = state.charts[chartId];
    if (!chart) return;
    // Simple fullscreen modal container
    var modal = byId('modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-overlay';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.background = 'rgba(0,0,0,0.6)';
      modal.style.display = 'none';
      modal.style.zIndex = '10000';
      document.body.appendChild(modal);
      modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
    }
    modal.innerHTML = '';
    var content = document.createElement('div');
    content.style.width = '80%';
    content.style.height = '500px';
    content.style.margin = '5% auto';
    content.style.background = '#fff';
    content.style.borderRadius = '8px';
    content.style.overflow = 'hidden';
    content.style.position = 'relative';
    // Move a clone into modal for fullscreen viewing
    var sourceNode = byId(chartId) || (document.createElement('div'));
    var clone = sourceNode.cloneNode(true);
    content.appendChild(clone);
    modal.appendChild(content);
    modal.style.display = 'block';
    state.modalOpen = true;
  }

  function openDrawer(drawerId, data) {
    var drawer = byId(drawerId);
    if (!drawer) {
      console.warn('Drawer not found: ' + drawerId);
      return;
    }
    drawer.classList.add('open');
    if (data) drawer.dataset.drawerData = JSON.stringify(data);
    // trap focus inside drawer
    trapFocus(drawer);
    window.setTimeout(function(){ drawer.scrollIntoView({behavior:'smooth'}); }, 50);
  }
  function closeDrawer(drawerId) {
    var drawer = byId(drawerId);
    if (!drawer) return;
    drawer.classList.remove('open');
    releaseFocus();
  }

  // MODAL
  function openModal() {
    var overlay = byId('modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(0,0,0,0.6)';
      overlay.style.display = 'none';
      overlay.style.zIndex = '10000';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(); });
    }
    overlay.style.display = 'block';
    state.modalOpen = true;
    trapFocus(overlay);
  }
  function closeModal() {
    var overlay = byId('modal-overlay');
    if (overlay) overlay.style.display = 'none';
    state.modalOpen = false;
    releaseFocus();
  }

  // FOCUS TRAP
  var _focusGuard = null;
  var _previousFocus = null;
  function trapFocus(container) {
    if (!container) return;
    _previousFocus = document.activeElement;
    _focusGuard = container;
    document.addEventListener('keydown', _handleTabKey);
  }
  function releaseFocus() {
    document.removeEventListener('keydown', _handleTabKey);
    if (_previousFocus && typeof _previousFocus.focus === 'function') {
      _previousFocus.focus();
    }
    _focusGuard = null;
  }
  function _handleTabKey(e) {
    if (e.key !== 'Tab') return;
    var root = _focusGuard;
    if (!root) return;
    var focusables = root.querySelectorAll('a, button, input, textarea, select, [tabindex]');
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    var isShift = e.shiftKey;
    var active = document.activeElement;
    if (active === last && !isShift) {
      e.preventDefault();
      first.focus();
    } else if (active === first && isShift) {
      e.preventDefault();
      last.focus();
    }
  }

  // ANIMATED VALUES
  function animateValue(el, target, duration) {
    if (!el) return;
    var start = 0;
    var from = Number(el.innerText) || 0;
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var progress = Math.min((ts - t0) / (duration || 600), 1);
      var val = Math.round(from + (target - from) * progress);
      el.innerText = String(val);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function initAnimatedValues(container) {
    if (!container) container = document;
    if (!('IntersectionObserver' in window)) {
      // Fallback: animate all elements with data-animate
      var nodes = container.querySelectorAll('[data-animate]');
      Array.prototype.forEach.call(nodes, function(n){ animateValue(n, Number(n.getAttribute('data-animate')), 800); });
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if (entry.isIntersecting) {
        var el = entry.target;
        var to = Number(el.getAttribute('data-animate')) || 0;
        animateValue(el, to, Number(el.getAttribute('data-duration')) || 800);
        observer.unobserve(el);
      } });
    }, { threshold: 0.3, rootMargin: '0px' });
    var items = container.querySelectorAll('[data-animate]');
    Array.prototype.forEach.call(items, function(it){ observer.observe(it); });
  }

  // TABLE SORT
  function sortTable(tableId, colIndex) {
    var table = byId(tableId);
    if (!table) return;
    var tbody = table.tBodies[0];
    if (!tbody) return;
    var rows = Array.prototype.slice.call(tbody.rows, 0);
    var asc = table.getAttribute('data-sort-' + colIndex) !== 'asc';
    rows.sort(function(a, b){
      var A = a.cells[colIndex] ? a.cells[colIndex].innerText : '';
      var B = b.cells[colIndex] ? b.cells[colIndex].innerText : '';
      return A.localeCompare(B, undefined, { numeric: true });
    });
    if (!asc) rows.reverse();
    // Reattach
    for (var i = 0; i < rows.length; i++) tbody.appendChild(rows[i]);
    table.setAttribute('data-sort-' + colIndex, asc ? 'asc' : 'desc');
    // Simple aria-sort update and icons (basic)
    var header = table.querySelectorAll('thead th')[colIndex];
    if (header) header.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
  }
  var _debouncedSort = debounce(sortTable, 150);

  // TABLE FILTER
  function filterTable(tableId, query) {
    var table = byId(tableId);
    if (!table) return;
    var rows = table.tBodies[0] ? Array.prototype.slice.call(table.tBodies[0].rows, 0) : [];
    var q = (query || '').toLowerCase();
    rows.forEach(function(r){
      var text = r.textContent.toLowerCase();
      var show = text.indexOf(q) > -1;
      r.style.display = show ? '' : 'none';
    });
  }
  var _debouncedFilter = debounce(filterTable, 200);

  // TABLE PAGINATION
  function initPagination(tableId, rowsPerPage) {
    var table = byId(tableId); if (!table) return;
    var per = rowsPerPage || 10;
    var tbody = table.tBodies[0];
    if (!tbody) return;
    var total = tbody.rows.length;
    var pages = Math.max(1, Math.ceil(total / per));
    // store
    state.tables[tableId] = { per: per, pages: pages, current: 0 };
    // create simple pagination controls container if not exists
    var info = byId(tableId + '-pagination-info');
    if (!info) {
      info = document.createElement('div'); info.id = tableId + '-pagination-info';
      info.style.marginTop = '6px';
      var parent = table.parentElement;
      if (parent) parent.appendChild(info);
    }
    function render() {
      var page = state.tables[tableId].current;
      for (var i = 0; i < tbody.rows.length; i++) {
        tbody.rows[i].style.display = (i >= page * per && i < (page + 1) * per) ? '' : 'none';
      }
      info.textContent = 'Page ' + (page + 1) + ' of ' + pages;
    }
    render();
  }
  function paginateTable(tableId, direction) {
    var t = state.tables[tableId]; if (!t) return;
    t.current = Math.max(0, Math.min(t.pages - 1, t.current + (direction === 'next' ? 1 : -1)));
    var table = byId(tableId); if (table) {
      var per = t.per;
      var rows = table.tBodies[0].rows;
      for (var i = 0; i < rows.length; i++) {
        rows[i].style.display = (i >= t.current * per && i < (t.current + 1) * per) ? '' : 'none';
      }
    }
    var info = byId(tableId + '-pagination-info'); if (info) info.textContent = 'Page ' + (t.current + 1) + ' of ' + t.pages;
  }
  function applyPagination(tableId) { initPagination(tableId, state.tables[tableId] ? state.tables[tableId].per : 10); }

  // TABLE EXPORT CSV
  function exportCSV(tableId, filename) {
    var table = byId(tableId); if (!table) return;
    var rows = table.querySelectorAll('thead tr, tbody tr');
    var csv = '\ufeff';
    Array.prototype.forEach.call(table.querySelectorAll('thead tr'), function(r){
      var cells = Array.prototype.slice.call(r.querySelectorAll('th,td')).map(function(c){ return c.innerText.trim(); });
      if (cells.length) csv += cells.join(';') + '\n';
    });
    Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function(r){
      var cells = Array.prototype.slice.call(r.querySelectorAll('td')).map(function(c){ return c.innerText.trim(); });
      if (cells.length) csv += cells.join(';') + '\n';
    });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = (filename || tableId + '.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('CSV exported', 'success');
  }

  function openTableFullscreen(tableId) {
    var t = byId(tableId); if (!t) return;
    openChartFullscreen(tableId, 'Table: ' + tableId);
  }

  // ROW EXPAND
  function toggleRowExpand(triggerRow, detailId) {
    if (!triggerRow) return;
    var detail = byId(detailId);
    if (!detail) return;
    var expanded = detail.classList.toggle('hidden');
    triggerRow.setAttribute('aria-expanded', String(!expanded));
  }

  // BULK ACTIONS
  function toggleAllRows(tableId, checked) {
    var table = byId(tableId); if (!table) return;
    var checkboxes = table.querySelectorAll('input[type="checkbox"].row-select');
    Array.prototype.forEach.call(checkboxes, function(cb){ cb.checked = !!checked; });
  }
  function updateBulkActions(tableId) {
    // Simple placeholder: dispatch an event with selected ids
    var table = byId(tableId); if (!table) return;
    var checked = [];
    var checkboxes = table.querySelectorAll('input[type="checkbox"].row-select:checked');
    Array.prototype.forEach.call(checkboxes, function(cb){ checked.push(cb.value); });
    var ev = document.createEvent('CustomEvent'); ev.initCustomEvent('borg:bulkSelected', true, false, { ids: checked });
    document.dispatchEvent(ev);
  }
  function exportSelectedCSV(tableId) {
    var table = byId(tableId); if (!table) return;
    var rows = table.querySelectorAll('input[type="checkbox"].row-select:checked');
    if (!rows.length) { showToast('No rows selected', 'warning'); return; }
    // Simple: export selected rows from corresponding tbody rows
    var idList = Array.prototype.map.call(rows, function(cb){ return cb.value; });
    // Build a small CSV with selected rows content
    var csv = '\ufeff';
    idList.forEach(function(id){ csv += id + '\n'; });
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = (tableId + '_selected.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast('Selected CSV exported', 'success');
  }

  // TABS
  function switchTab(tabBtn, panelId) {
    if (!tabBtn) return;
    var tablist = tabBtn.closest('[role="tablist"]');
    var container = tablist ? tablist.parentElement : null;
    var panels = container ? container.querySelectorAll('[id^="panel-"]') : [];
    // deactivate all
    var btns = tablist ? tablist.querySelectorAll('[role="tab"]') : [];
    Array.prototype.forEach.call(btns, function(b){ b.setAttribute('aria-selected', 'false'); b.classList.remove('active'); });
    tabBtn.setAttribute('aria-selected', 'true'); tabBtn.classList.add('active');
    // hide panels
    if (panels) Array.prototype.forEach.call(panels, function(p){ p.style.display = 'none'; p.setAttribute('aria-hidden','true'); });
    var target = byId(panelId); if (target) { target.style.display = 'block'; target.setAttribute('aria-hidden','false'); }
  }

  // FILTERS
  function applyFilters() {
    var f = byId('filter-search');
    var query = f ? f.value : '';
    state.filters.query = query;
    // chips update
    updateFilterChips();
    var ev = document.createEvent('CustomEvent'); ev.initCustomEvent('borg:filtersApplied', true, false, { filters: state.filters });
    document.dispatchEvent(ev);
  }
  function clearFilters() {
    state.filters = {};
    updateFilterChips();
    var ev = document.createEvent('CustomEvent'); ev.initCustomEvent('borg:filtersCleared', true, false, {});
    document.dispatchEvent(ev);
  }
  function removeFilter(key) {
    if (state.filters.hasOwnProperty(key)) { delete state.filters[key]; }
    updateFilterChips();
  }
  function updateFilterChips() {
    var chipsC = byId('filters-chips');
    if (!chipsC) return;
    chipsC.innerHTML = '';
    Object.keys(state.filters).forEach(function(k){ var v = state.filters[k]; var chip = document.createElement('span'); chip.className = 'chip rounded-full'; chip.textContent = k + ': ' + v; chipsC.appendChild(chip); });
  }

  // CROSS-FILTERING
  function crossFilter(sourceChartId, targetTableId, categoryIndex, categories) {
    // Minimal implementation: filter table rows by a category match if provided in data attributes
    var table = byId(targetTableId); if (!table) return;
    var rows = table.tBodies && table.tBodies[0] ? Array.prototype.slice.call(table.tBodies[0].rows, 0) : [];
    if (!rows.length) return;
    rows.forEach(function(r){ var cell = r.cells[categoryIndex]; var cat = cell ? cell.innerText : ''; var matched = !categories || categories.indexOf(cat) > -1; r.style.display = matched ? '' : 'none'; });
  }
  function clearCrossFilter(tableId) {
    var table = byId(tableId); if (!table) return; Array.prototype.forEach.call(table.tBodies[0].rows, function(r){ r.style.display = ''; });
  }

  // TOAST
  function showToast(message, type) {
    var container = byId('toast-container');
    if (!container) {
      container = document.createElement('div'); container.id = 'toast-container'; container.style.position = 'fixed'; container.style.bottom = '16px'; container.style.right = '16px'; container.style.zIndex = '9999'; document.body.appendChild(container);
    }
    var toast = document.createElement('div'); toast.style.marginTop = '6px'; toast.style.minWidth = '200px'; toast.style.padding = '10px 14px'; toast.style.borderRadius = '6px'; toast.style.background = (type === 'success') ? '#10b981' : (type === 'warning' ? '#f59e0b' : '#374151'); toast.style.color = '#fff'; toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function(){ toast.style.opacity = '0'; setTimeout(function(){ container.removeChild(toast); }, 300); }, 3000);
  }

  // REVEAL ON SCROLL
  function initReveal(root) {
    if (!('IntersectionObserver' in window)) return;
    if (typeof root === 'string') root = byId(root);
    if (!root) root = document;
    var obs = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } }); }, { threshold: 0.25 });
    var items = root.querySelectorAll('.reveal'); Array.prototype.forEach.call(items, function(it){ obs.observe(it); });
  }

  // RIPPLE
  function attachRipple(el) {
    if (!el) return;
    el.style.position = 'relative';
    el.addEventListener('click', function(e){
      var circle = document.createElement('span');
      circle.className = 'ripple'; circle.style.position = 'absolute'; circle.style.borderRadius = '50%'; circle.style.transform = 'scale(0)'; circle.style.background = 'rgba(255,255,255,0.6)';
      var rect = el.getBoundingClientRect(); circle.style.width = circle.style.height = Math.max(rect.width, rect.height) + 'px'; circle.style.left = (e.clientX - rect.left - parseInt(circle.style.width)/2) + 'px'; circle.style.top = (e.clientY - rect.top - parseInt(circle.style.height)/2) + 'px'; el.appendChild(circle);
      circle.animate([
        { transform: 'scale(0)', opacity: 0.6 },
        { transform: 'scale(1)', opacity: 0 }
      ], { duration: 600, easing: 'ease-out' });
      setTimeout(function(){ el.removeChild(circle); }, 600);
    });
  }
  function initRipples(root) {
    if (!root) root = document; var nodes = root.querySelectorAll('[data-ripple]'); Array.prototype.forEach.call(nodes, function(n){ attachRipple(n); });
  }

  // DARK MODE
  function toggleDarkMode() {
    var current = (localStorage.getItem('borg-theme') || 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('borg-theme', next);
    restoreTheme();
  }
  function restoreTheme() {
    var t = 'light';
    try { t = localStorage.getItem('borg-theme') || 'light'; } catch (e) {}
    var html = document.documentElement;
    if (t === 'dark') { html.classList.add('dark'); html.classList.remove('light'); }
    else { html.classList.add('light'); html.classList.remove('dark'); }
    // Re-render active view charts so ApexCharts picks up theme
    if (state.activeView) {
      destroyChartsInView('view-' + state.activeView);
      initChartsInView('view-' + state.activeView);
    }
  }

  // EXPORT PDF
  function exportPDF(filename) {
    var title = document.title;
    if (filename) document.title = filename;
    window.print();
    document.title = title;
  }

  // COMMAND PALETTE
  var commandPalette = {
    commands: [],
    activeIndex: -1,
    filtered: []
  };
  function registerCommand(cmd) {
    Borg.commandPalette.commands.push(cmd);
  }
  function openCmdPalette() {
    var overlay = byId('command-palette');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    var input = byId('cmd-palette-input');
    if (input) { input.value = ''; input.focus(); }
    renderCmdPaletteResults('');
  }
  function closeCmdPalette() {
    var overlay = byId('command-palette');
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
  function _cmdPaletteGlobalKeyHandler(e) {
    // Cmd/Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmdPalette(); }
    // Cmd/Ctrl+D toggles theme
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); toggleDarkMode(); }
  }
  function renderCmdPaletteResults(query) {
    var results = byId('cmd-palette-results'); if (!results) return;
    results.innerHTML = '';
    var cmds = Borg.commandPalette ? Borg.commandPalette.commands : [];
    Borg.commandPalette.filtered = cmds.filter(function(c){ var s = (c.name || '') + ' ' + (c.description || ''); return s.toLowerCase().indexOf((query||'').toLowerCase()) > -1; });
    Borg.commandPalette.filtered.forEach(function(c, idx){ var item = document.createElement('div'); item.textContent = c.name; item.style.padding = '6px 8px'; item.style.cursor = 'pointer'; item.addEventListener('click', function(){ executeCmd(idx); }); results.appendChild(item); });
    Borg.commandPalette.activeIndex = -1;
  }
  function openCmdPaletteInputListener() {
    var input = byId('cmd-palette-input'); if (!input) return;
    input.addEventListener('input', function(){ renderCmdPaletteResults(input.value); });
  }
  function moveCmdPalette(delta) {
    var list = byId('cmd-palette-results'); if (!list) return;
    var items = list.children; if (!items.length) return;
    Borg.commandPalette.activeIndex += delta; if (Borg.commandPalette.activeIndex < 0) Borg.commandPalette.activeIndex = items.length - 1; if (Borg.commandPalette.activeIndex >= items.length) Borg.commandPalette.activeIndex = 0;
    // highlight
    Array.prototype.forEach.call(items, function(it, i){ it.style.background = i === Borg.commandPalette.activeIndex ? '#e5e7eb' : ''; });
  }
  function executeCmd(index) {
    var cmd = Borg.commandPalette.filtered[index] || Borg.commandPalette.commands[index];
    if (cmd && typeof cmd.action === 'function') { cmd.action(); }
    closeCmdPalette();
  }
  function initCommandPalette() {
    registerCommand({ name: 'Alternar tema claro/escuro', description: 'Ctrl+D', action: function(){ toggleDarkMode(); } });
    registerCommand({ name: 'Exportar PDF', description: 'Imprimir dashboard', action: function(){ exportPDF('dashboard-horizonte.pdf'); } });
    registerCommand({ name: 'Limpar filtros', description: 'Reset de todos os filtros', action: function(){ if (typeof clearFilters === 'function') clearFilters(); } });
    var views = [
      { name: 'Ir para: Visão Geral', v: 'overview' },
      { name: 'Ir para: Obras', v: 'works' },
      { name: 'Ir para: Financeiro', v: 'finance' },
      { name: 'Ir para: Operacional', v: 'operational' },
      { name: 'Ir para: Loteamentos', v: 'land' },
      { name: 'Ir para: Upload de Dados', v: 'upload' }
    ];
    views.forEach(function(x, i){
      registerCommand({ name: x.name, description: 'Ctrl+' + (i+1), action: (function(vn){ return function(){ switchView(vn); }; })(x.v) });
    });
  }
  // Bind keyboard shortcuts for global navigation
  function _bindGlobalShortcuts() {
    document.addEventListener('keydown', function(e){
      // Cmd/Ctrl + K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); openCmdPalette(); return;
      }
      // Cmd/Ctrl + D → toggle dark mode (not Shift-D, which conflicts)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && !e.shiftKey) {
        e.preventDefault(); toggleDarkMode(); return;
      }
      // Ctrl/Cmd + 1-6 navigate to views (assuming 6 views)
      if ((e.ctrlKey || e.metaKey) && /^[1-6]$/.test(e.key)) {
        e.preventDefault(); switchViewMap(parseInt(e.key, 10) - 1);
      }
      // Ctrl+F focuses filter
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        var f = byId('filter-search'); if (f) { f.focus(); e.preventDefault(); }
      }
      // Enter/Space on .nav-item should switch view
      if (e.key === 'Enter' || e.key === ' '){
        var target = document.activeElement; if (target && target.classList && target.classList.contains('nav-item')) {
          var v = target.getAttribute('data-view'); if (v) switchView(v);
        }
      }
      // Global Escape: close modal > drawer > sidebar
      if (e.key === 'Escape') {
        if (state.modalOpen) { closeModal(); return; }
        // close any drawer
        var openDrawers = document.querySelectorAll('[data-drawer].open'); Array.prototype.forEach.call(openDrawers, function(d){ d.classList.remove('open'); });
        if (state.sidebarOpen) toggleSidebar();
      }
      // Arrow navigation for command palette when open
      var _cp = byId('command-palette');
      if (_cp && !_cp.classList.contains('hidden')) {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveCmdPalette(1); }
        if (e.key === 'ArrowUp') { e.preventDefault(); moveCmdPalette(-1); }
        if (e.key === 'Enter') { e.preventDefault(); executeCmd(Borg.commandPalette.activeIndex); }
        if (e.key === 'Escape') { e.preventDefault(); closeCmdPalette(); }
      }
    });
  }
  function switchViewMap(index) {
    // naive mapping to available view sections: overview, works, finance, operational, land, upload
    var views = ['view-overview','view-works','view-finance','view-operational','view-land','view-upload'];
    var v = views[index] || views[0];
    if (!v) return;
    var viewName = v.replace('view-','');
    switchView(viewName);
  }

  // INIT
  function init() {
    // Theme
    restoreTheme();
    // Animated values
    initAnimatedValues(document);
    // Reveal
    initReveal(document);
    // Ripples
    initRipples(document);
    // Set initial active view from first non-hidden view-section
    var first = document.querySelector('.view-section:not(.hidden)');
    state.activeView = first && first.id ? first.id.replace('view-','') : 'overview';
    // Bind sidebar toggle button if exists
    var toggleBtn = byId('sidebar-toggle'); if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
    // Bind nav item clicks
    var items = document.querySelectorAll('.nav-item'); Array.prototype.forEach.call(items, function(it){ it.addEventListener('click', function(){ var v = it.getAttribute('data-view'); if (v) switchView(v); }); });
    // Init pagination for tables with a dedicated pagination container
    var tables = document.querySelectorAll('table.pagination'); Array.prototype.forEach.call(tables, function(t){ initPagination(t.id, 10); });
    // Command palette setup
    initCommandPalette(); openCmdPaletteInputListener();
    // Keyboard shortcuts
    _bindGlobalShortcuts();
    // Timeago processing – simple pass
    var timeNodes = document.querySelectorAll('[data-time-ago]'); Array.prototype.forEach.call(timeNodes, function(n){ n.textContent = formatTimeAgo(n.getAttribute('data-time-ago') || new Date()); });
  }

  // PUBLIC API
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
    sortTable: function(tableId, colIndex){ _debouncedSort(tableId, colIndex); },
    filterTable: function(tableId, query){ _debouncedFilter(tableId, query); },
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

// AUTO-INIT
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', Borg.init);
} else {
  Borg.init();
}
