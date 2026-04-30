// Animações FUNCIONAIS (não decorativas).
// Cada função tem propósito de feedback: counter mostra valor "subindo" para
// reforçar a percepção do número; fade-in marca "isto é novo conteúdo".
// Respeita prefers-reduced-motion.

const prefersReduced = () => typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Anima um número de 0 (ou from) até target em duration ms.
 * @param {HTMLElement} el
 * @param {number} target
 * @param {{ duration?: number, format?: (v: number) => string, from?: number }} opts
 */
export function animateNumber(el, target, opts = {}) {
  if (!el) return;
  const duration = opts.duration ?? 600;
  const format = opts.format ?? ((v) => String(Math.round(v)));
  const from = opts.from ?? 0;

  if (prefersReduced() || duration <= 0) {
    el.textContent = format(target);
    return;
  }

  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const v = from + (target - from) * eased;
    el.textContent = format(v);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/**
 * Inicializa animações de KPI/sparkline em uma view (espelho V7).
 * Convenção V7: marker `data-animate-value`, target em `data-target`,
 * formatadores em `data-prefix`, `data-suffix`, `data-format` (full = BRL completo),
 * casas decimais opcionais via `data-decimals`.
 *
 * @param {HTMLElement} [root=document]
 */
export function initAnimatedValues(root = document) {
  const scope = root || document;
  scope.querySelectorAll('[data-animate-value]').forEach((el) => {
    const targetRaw = el.dataset.target ?? el.textContent;
    const target = parseFloat(String(targetRaw).replace(/[^\d.\-]/g, ''));
    if (isNaN(target)) return;

    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const format = el.dataset.format || '';
    const decimals = el.dataset.decimals != null ? parseInt(el.dataset.decimals, 10) : (Number.isInteger(target) ? 0 : 1);

  let formatter;
  if (format === 'full-text') {
    // Texto completo (não numérico), ex.: "127/200" — usa data-full-text se disponível
    const fullText = el.dataset.fullText || el.textContent;
    formatter = () => fullText;
  } else if (format === 'full') {
      // BRL completo, ex.: R$ 9.400.000
      formatter = (v) => `${prefix}${Math.round(v).toLocaleString('pt-BR')}${suffix}`;
    } else if (format === 'compact') {
      // 9.4M / 8.6K
      formatter = (v) => {
        const a = Math.abs(v);
        if (a >= 1e6) return `${prefix}${(v / 1e6).toFixed(1).replace('.', ',')}M${suffix}`;
        if (a >= 1e3) return `${prefix}${(v / 1e3).toFixed(1).replace('.', ',')}K${suffix}`;
        return `${prefix}${Math.round(v)}${suffix}`;
      };
    } else {
      formatter = (v) => `${prefix}${v.toFixed(decimals).replace('.', ',')}${suffix}`;
    }

    if (prefersReduced()) {
      el.textContent = formatter(target);
      return;
    }
    animateNumber(el, target, { duration: 800, format: formatter });
  });
}
