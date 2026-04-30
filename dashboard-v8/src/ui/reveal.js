// Reveal V8 — IntersectionObserver. Adiciona .revealed quando .reveal entra
// no viewport (espelho V7). Não dispara em prefers-reduced-motion.

let _observer = null;

function shouldAnimate() {
  return !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initReveal(root) {
  if (!shouldAnimate()) {
    // Reveals só ficam visíveis sem animar
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
    return;
  }
  if (_observer) {
    try { _observer.disconnect(); } catch {}
  }
  _observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        _observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  const scope = root || document;
  scope.querySelectorAll('.reveal:not(.revealed)').forEach((el) => _observer.observe(el));
}
