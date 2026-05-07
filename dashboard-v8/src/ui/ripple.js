// Ripple V8 — onda circular ao clicar em [data-ripple]. Espelho V7.
// Listener delegado no document; não polui DOM nem requer wrapping manual.

import { safeRemove } from './safe-cleanup.js';

function reduced() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initRipple() {
  document.addEventListener('click', (e) => {
    if (reduced()) return;
    const target = e.target.closest('[data-ripple]');
    if (!target) return;
    // Garante container para clip
    target.classList.add('ripple-container');
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const wave = document.createElement('span');
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = `${size}px`;
    wave.style.left = `${x}px`;
    wave.style.top = `${y}px`;
    target.appendChild(wave);
    setTimeout(() => { safeRemove(wave); }, 650);
  });
}
