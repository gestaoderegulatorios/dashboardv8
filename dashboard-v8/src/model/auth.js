/**
 * @fileoverview Auth Bridge — Interface única para autenticação.
 *
 * Boot.js importa desse módulo. A camada P2 de segurança
 * usa `src/auth/`; esse bridge garante que boot.js não quebre.
 *
 * Regra de fallback:
 *  1. Se `src/auth/auth.js` já tem user logado (P2), usa.
 *  2. Se há legacy auth no localStorage (stub antigo), usa.
 *  3. Se não for autenticado, retorna false / null.
 *
 * @version 2.0.0 (P2)
 */

import { STORAGE_PREFIX } from './branding.js';
import { isAuthenticated as newIsAuthenticated, getCurrentUser, logout as newLogout } from '../auth/auth.js';

const AUTH_KEY = `${STORAGE_PREFIX}_auth`;

/** @returns {boolean} */
export function isAuthenticated() {
  // 1. Novo sistema (P2) tem preferência
  if (newIsAuthenticated()) return true;

  // 2. Fallback para legado no localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem(AUTH_KEY);
    }
  } catch { /* noop */ }
  return false;
}

/** @returns {{ id: string, email: string, name: string, role: string, roles?: string[] } | null} */
export function getAuthUser() {
  // 1. Novo sistema
  const newUser = getCurrentUser();
  if (newUser) return newUser;

  // 2. Fallback legado
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const legacy = JSON.parse(raw);
    return {
      id: legacy.id || 'legacy',
      email: legacy.email || '',
      name: legacy.name || '',
      role: Array.isArray(legacy.roles) ? legacy.roles[0] : 'viewer',
      roles: legacy.roles || ['viewer'],
    };
  } catch { return null; }
}

/** @returns {string} */
export function getUserId() {
  const user = getAuthUser();
  return user ? user.id : 'anonymous';
}

/** @returns {string} */
export function getUserRole() {
  const user = getAuthUser();
  return user ? (user.role || 'viewer') : 'viewer';
}

/** @returns {string[]} */
export function getUserRoles() {
  const user = getAuthUser();
  return user ? (user.roles || [user.role || 'viewer']) : ['viewer'];
}

/**
 * Login legado (adaptado para novo formato).
 * Cria user demo para dev, ou chama API real.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ok: boolean, user?: any, error?: string}>}
 */
export async function login(email, password) {
  if (!email || !email.trim()) return { ok: false, error: 'Email obrigatorio' };
  if (!password || !password.trim()) return { ok: false, error: 'Senha obrigatoria' };

  // Chama logon do novo sistema (P2)
  const { login: newLogin } = await import('../auth/auth.js');
  return newLogin({ email, password });
}

/** Logout via novo sistema, e fallback legado */
export async function logout() {
  const result = await newLogout();
  // Remove legado tambem
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch { /* noop */ }
  return result;
}
