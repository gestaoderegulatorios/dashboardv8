/**
 * @fileoverview JWT Handler - Gerenciamento de tokens JWT no frontend.
 *
 * Regras de seguranca:
 * - Access token: armazenado em memory (nunca localStorage/sessionStorage)
 * - Refresh token: armazenado em httpOnly cookie (server-side)
 * - Nunca armazene tokens em localStorage (vulneravel a XSS)
 *
 * Em DEV: mock auth sem backend (auto-login com user demo)
 * Em STAGING/PROD: fluxo real de login com API
 *
 * @version 1.0.0
 */

import { isDev } from '../config/environments.js';

// ---- Estado interno ----
/** @type {string|null} */
let _accessToken = null;
/** @type {string|null} */
let _user = null;

// ---- Mock de usuario para DEV ----
const DEMO_USER = { id: 'demo', name: 'Usuario Demo', role: 'viewer', email: 'demo@company.com' };

/**
 * Simula resposta de login (DEV only)
 * @returns {{user: Object, accessToken: string}}
 */
function mockLoginResponse() {
  const token = btoa(JSON.stringify({ sub: DEMO_USER.id, role: DEMO_USER.role, exp: Date.now() + 3600000 }));
  return { user: DEMO_USER, accessToken: `mock_${token}` };
}

/**
 * Login - autentica com backend ou mock (DEV)
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{ok: boolean, user?: Object, error?: string}>}
 */
export async function login({ email, password }) {
  if (isDev()) {
    const result = mockLoginResponse();
    _accessToken = result.accessToken;
    _user = result.user;
    return { ok: true, user: result.user };
  }

  // Producao: chama API real
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // envia httpOnly cookie
    });

    if (!response.ok) {
      const error = await response.text();
      return { ok: false, error: error || 'Credenciais invalidas' };
    }

    const data = await response.json();
    _accessToken = data.accessToken;
    _user = data.user;
    return { ok: true, user: data.user };
  } catch (err) {
    return { ok: false, error: 'Falha na conexao. Tente novamente.' };
  }
}

/**
 * Logout - invalida sessao e limpa tokens
 * @returns {Promise<{ok: boolean}>}
 */
export async function logout() {
  if (!isDev()) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${_accessToken || ''}` },
      });
    } catch {
      // Ignora erro de rede no logout
    }
  }

  _accessToken = null;
  _user = null;
  return { ok: true };
}

/**
 * Retorna o access token atual (para enviar em headers)
 * @returns {string|null}
 */
export function getAccessToken() {
  return _accessToken;
}

/**
 * Retorna o usuario atual
 * @returns {Object|null}
 */
export function getCurrentUser() {
  return _user;
}

/**
 * Verifica se ha um usuario autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  if (isDev()) {
    // Em dev: considera autenticado se tem token mock ou user
    return _accessToken !== null || _user !== null;
  }
  return _accessToken !== null && _user !== null;
}

/**
 * Inicializa auth a partir de storage (chamado no boot)
 * Tenta recuperar session de cookie/localStorage
 */
export function initAuth() {
  // Tenta recuperar de localStorage (fallback para persistencia simples em DEV)
  // Em producao: session e gerenciada pelo backend via cookie
  try {
    const stored = localStorage.getItem('v8_auth_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.accessToken && parsed.user) {
        _accessToken = parsed.accessToken;
        _user = parsed.user;
      }
    }
  } catch {
    // Ignora erros de parse
  }
}

/**
 * Persiste estado de auth (DEV only)
 * Em producao: nao faz nada (session e server-side)
 */
export function persistAuth() {
  if (isDev() && _accessToken && _user) {
    localStorage.setItem('v8_auth_state', JSON.stringify({
      accessToken: _accessToken,
      user: _user,
      timestamp: Date.now(),
    }));
  }
}

/**
 * Limpa persisted auth (usado em logout)
 */
export function clearPersistedAuth() {
  try {
    localStorage.removeItem('v8_auth_state');
  } catch {
    // Ignora
  }
}

// ---- Helpers internos ----

/** Decodifica payload do JWT (sem verificar assinatura) */
function decodeJWT(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/** Verifica se token esta expirado */
export function isTokenExpired(token) {
  if (token === null || token === undefined) return true; // null/undefined = expirado
  if (token.startsWith('mock_')) return false; // Mock nao expira
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}
