// Command palette V8 — Cmd/Ctrl+K. Espelho V7.
// Registry global de comandos {label, hint, icon, action}.

import { escape } from '../view/shared.js';
import { safeFocus } from './safe-cleanup.js';

let _commands = [];
let _filtered = [];
let _activeIndex = 0;
let _lastFocused = null;

export function registerCommand(cmd) {
  if (!cmd || !cmd.label || typeof cmd.action !== 'function') return;
  _commands.push(cmd);
}

export function clearCommands() {
  _commands = [];
}

export function openPalette() {
  const overlay = document.getElementById('command-palette');
  if (!overlay) return;
  _lastFocused = document.activeElement;
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  const input = document.getElementById('cmd-palette-input');
  if (input) { input.value = ''; setTimeout(() => input.focus(), 0); }
  _filtered = _commands.slice();
  _activeIndex = 0;
  renderResults();
}

export function closePalette() {
  const overlay = document.getElementById('command-palette');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
  if (_lastFocused && typeof _lastFocused.focus === 'function') {
    safeFocus(_lastFocused);
  }
}

function search(q) {
  const term = (q || '').toLowerCase().trim();
  _filtered = term
    ? _commands.filter((c) => c.label.toLowerCase().includes(term) || (c.hint && c.hint.toLowerCase().includes(term)))
    : _commands.slice();
  _activeIndex = 0;
  renderResults();
}

function move(delta) {
  if (!_filtered.length) return;
  _activeIndex = (_activeIndex + delta + _filtered.length) % _filtered.length;
  renderResults();
  const active = document.querySelector('.cmd-item[data-active="true"]');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

function execute(idx) {
  const i = idx == null ? _activeIndex : idx;
  const cmd = _filtered[i];
  if (cmd && typeof cmd.action === 'function') {
    closePalette();
    setTimeout(() => cmd.action(), 50);
  }
}

function renderResults() {
  const list = document.getElementById('cmd-palette-results');
  if (!list) return;
  if (!_filtered.length) {
    list.innerHTML = '<div class="px-4 py-6 text-center text-sm text-on-surface-variant">Nenhum comando encontrado</div>';
    return;
  }
  list.innerHTML = _filtered.map((cmd, idx) => `
    <button type="button" class="cmd-item w-full text-left px-4 py-3 flex items-center gap-3 ${idx === _activeIndex ? 'bg-surface-container-low' : ''} hover:bg-surface-container-low transition-colors" data-active="${idx === _activeIndex}" data-idx="${idx}">
      <span class="material-symbols-outlined text-base text-on-surface-variant" aria-hidden="true">${escape(cmd.icon || 'bolt')}</span>
      <span class="flex-1 text-sm font-medium text-primary">${escape(cmd.label)}</span>
      ${cmd.hint ? `<span class="text-xs text-on-surface-variant">${escape(cmd.hint)}</span>` : ''}
    </button>
  `).join('');
}

export function initCommandPalette() {
  const input = document.getElementById('cmd-palette-input');
  const list = document.getElementById('cmd-palette-results');
  const overlay = document.getElementById('command-palette');

  if (input) {
    input.addEventListener('input', (e) => search(e.target.value));
  }
  if (list) {
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.cmd-item');
      if (!btn) return;
      execute(Number(btn.dataset.idx));
    });
    list.addEventListener('mousemove', (e) => {
      const btn = e.target.closest('.cmd-item');
      if (!btn) return;
      const idx = Number(btn.dataset.idx);
      if (idx !== _activeIndex) {
        _activeIndex = idx;
        renderResults();
      }
    });
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePalette();
    });
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
      return;
    }
    if (overlay && !overlay.classList.contains('hidden')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); return; }
      if (e.key === 'Enter') { e.preventDefault(); execute(); return; }
      if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
    }
  });
}
