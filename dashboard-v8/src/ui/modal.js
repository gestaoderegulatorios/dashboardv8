// Modal fullscreen para charts e tabelas. Lifecycle correto: monta cópia no modal,
// original intacto. Ao fechar, destroy cópia. Sem flicker.
// Espelho V7: openChartFullscreen clona state.chartConfigs via JSON.parse(JSON.stringify()).

import { mountChart, getChartConfig } from '../domain/chart.js';

let activeModal = null;
let modalResizeObserver = null;

/**
 * Abre modal com cópia do chart em tela cheia (espelho V7 openChartFullscreen).
 * Clona as opções do chart via registry (getChartConfig) — igual V7 faz com state.chartConfigs.
 * @param {string} chartId — id do container original
 * @param {string} title — título do modal
 */
export function openChartFullscreen(chartId, title) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const titleEl = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!titleEl || !body) return;

  closeModal();

  titleEl.textContent = title || 'Gráfico';
  body.style.overflow = 'hidden';
  body.innerHTML = '<div id="modal-chart" style="width:100%;height:100%;min-height:300px"></div>';

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Espelho V7: espera CSS transition + layout settle, depois cria chart
  setTimeout(() => {
    const dims = computeDims(body);
    const config = getChartConfig(chartId);
    if (!config) return;

    const fc = JSON.parse(JSON.stringify(config));
    fc.chart = fc.chart || {};
    fc.chart.height = dims.height;
    fc.chart.width = dims.width;
    fc.chart.redrawOnParentResize = false;
    // Forçar animação no clone (barras crescendo, linha desenhando, etc)
    fc.chart.animations = fc.chart.animations || {};
    fc.chart.animations.enabled = true;
    fc.chart.animations.easing = fc.chart.animations.easing || 'easeinout';
    fc.chart.animations.speed = fc.chart.animations.speed || 800;
    fc.chart.animations.dynamicAnimation = fc.chart.animations.dynamicAnimation || { enabled: true, speed: 400 };

    activeModal = mountChart(document.getElementById('modal-chart'), fc);

    // ResizeObserver para reflow (espelho V7)
    if (typeof window.ResizeObserver !== 'undefined') {
      if (modalResizeObserver) { try { modalResizeObserver.disconnect(); } catch {} }
      modalResizeObserver = new window.ResizeObserver(() => {
        if (!activeModal) return;
        const d = computeDims(body);
        try { activeModal.updateOptions({ chart: { height: d.height, width: d.width } }, false, false); } catch {}
      });
      modalResizeObserver.observe(body);
    }
  }, 350);

  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.focus();
}

function computeDims(modalBody) {
  const r = modalBody.getBoundingClientRect();
  return {
    width: Math.max(Math.round(r.width) - 16, 300),
    height: Math.max(Math.round(r.height) - 8, 280)
  };
}

/** Fecha modal e destrói chart cópia (espelho V7 closeModal). */
export function closeModal() {
  if (activeModal) {
    try { activeModal.destroy(); } catch {}
    activeModal = null;
  }

  if (modalResizeObserver) {
    try { modalResizeObserver.disconnect(); } catch {}
    modalResizeObserver = null;
  }

  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    overlay.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';

  const body = document.getElementById('modal-body');
  if (body) { body.style.overflow = ''; body.innerHTML = ''; }
}

/**
 * Abre modal com tabela HTML em tela cheia (espelho V7 openTableFullscreen).
 * @param {string} title — título do modal
 * @param {string} tableHTML — outerHTML da <table> a exibir
 */
export function openTableFullscreen(title, tableHTML) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const titleEl = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!titleEl || !body) return;

  closeModal();

  titleEl.textContent = title;
  body.innerHTML = `<div class="overflow-auto w-full" style="max-height:70vh">${tableHTML}</div>`;

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.focus();
}

/**
 * Abre modal com conteúdo HTML arbitrário (para relatórios, etc).
 * @param {string} title — título do modal
 * @param {string} innerHTML — conteúdo HTML do body
 */
export function openContentFullscreen(title, innerHTML) {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const titleEl = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  if (!titleEl || !body) return;

  closeModal();

  titleEl.textContent = title;
  body.innerHTML = innerHTML;

  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.focus();
}

/** Inicializa listeners do modal (click fora, ESC, botão fechar). */
export function initModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeModal) closeModal();
  });
}
