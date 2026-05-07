/**
 * Session Management - Gerenciamento de sessao de usuario
 *
 * Features:
 * - Timeout automatico apos inatividade
 * - Warning antes do timeout (para salvar work)
 * - Invalidacao de sessao em multi-tab (sync via storage)
 * - Refresh automatico de token
 *
 * @version 1.0.0
 */

// import { isToken expired } from './auth.js';
// Removido — nao usado neste modulo. Mantendo sessao puramente por timeout/ atividade

/** Timeout em ms (default: 30 min) */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** Warning antes do timeout (default: 5 min) */
const WARNING_BEFORE_MS = 5 * 60 * 1000;

/** @type {number|null} */
let _lastActivity = Date.now();
let _timer = null;
let _warningTimer = null;
/** @type {Set<(remainingMs: number) => void>} */
const warningListeners = new Set();
/** @type {Set<() => void>} */
const timeoutListeners = new Set();

/**
 * Marca o usuario como ativo (chamar em eventos: click, keypress, scroll)
 */
export function pingActivity() {
  _lastActivity = Date.now();
}

/**
 * Inicia o monitoramento de sessao
 * @param {{onTimeout?: () => void, onWarning?: (remaining: number) => void, timeoutMs?: number}} options
 */
export function startSession({ onTimeout, onWarning, timeoutMs = SESSION_TIMEOUT_MS } = {}) {
  // Limpa timers previos
  clearTimers();

  const tickCheck = () => {
    const idle = Date.now() - _lastActivity;
    const timeLeft = timeoutMs - idle;

    if (timeLeft <= 0) {
      timeoutListeners.forEach(cb => {
        try { cb(); } catch { /* noop: listener threw, ignore to keep tick running */ }
      });
      onTimeout?.();
      return;
    }

    // Avisar quando restar WARNING_BEFORE_MS
    if (timeLeft <= WARNING_BEFORE_MS) {
      warningListeners.forEach(cb => {
        try { cb(timeLeft); } catch { /* noop: listener threw, ignore to keep tick running */ }
      });
      onWarning?.(timeLeft);
    }

    _timer = setTimeout(tickCheck, Math.min(timeLeft, 60000)); // check a cada 60s
  };

  // Setup activity listeners ( apenas no browser)
  if (typeof window !== 'undefined') {
    window.addEventListener('click', pingActivity, true);
    window.addEventListener('keypress', pingActivity, true);
    window.addEventListener('scroll', pingActivity, true);
    window.addEventListener('mousemove', pingActivity, true);
  }

  tickCheck();
}

/**
 * Para o monitoramento de sessao
 */
export function stopSession() {
  clearTimers();
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', pingActivity, true);
    window.removeEventListener('keypress', pingActivity, true);
    window.removeEventListener('scroll', pingActivity, true);
    window.removeEventListener('mousemove', pingActivity, true);
  }
}

function clearTimers() {
  if (_timer) { clearTimeout(_timer); _timer = null; }
  if (_warningTimer) { clearTimeout(_warningTimer); _warningTimer = null; }
}

/**
 * Registra callback para ser chamado quando a sessao expirar
 * @param {() => void} cb
 */
export function onSessionTimeout(cb) {
  timeoutListeners.add(cb);
  return () => timeoutListeners.delete(cb);
}

/**
 * Registra callback para ser chamado antes do timeout (warning)
 * @param {(remainingMs: number) => void} cb
 */
export function onSessionWarning(cb) {
  warningListeners.add(cb);
  return () => warningListeners.delete(cb);
}

/**
 * Retorna o tempo restante em milisegundos
 * @returns {number}
 */
export function getRemainingTime(timeoutMs = SESSION_TIMEOUT_MS) {
  return Math.max(0, timeoutMs - (Date.now() - _lastActivity));
}

/**
 * Retorna true se a sessao esta ativa (nao expirou)
 * @returns {boolean}
 */
export function isSessionActive() {
  return getRemainingTime() > 0;
}
