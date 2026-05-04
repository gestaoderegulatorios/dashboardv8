// Auth stub — localStorage-based. Interface pronta para P3 (RLS) e P8 (SaaS/JWT).
// Hoje: simulação local. Futuro: trocar localStorage por API call.

import { STORAGE_PREFIX } from './branding.js';

const AUTH_KEY = `${STORAGE_PREFIX}_auth`;

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string[]} roles
 */

/** @returns {boolean} */
export function isAuthenticated() {
  if (typeof localStorage === 'undefined') return false;
  return !!localStorage.getItem(AUTH_KEY);
}

/** @returns {AuthUser | null} */
export function getAuthUser() {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/** @returns {string} */
export function getUserId() {
  const user = getAuthUser();
  return user ? user.id : 'anonymous';
}

/** @returns {string[]} */
export function getUserRoles() {
  const user = getAuthUser();
  return user ? user.roles : ['viewer'];
}

/**
 * Stub login — aceita qualquer email/senha não vazios.
 * Cria um AuthUser com roles baseadas no email:
 * - contém "admin" → roles = ['admin', 'manager', 'viewer']
 * - contém "manager" ou "gestor" → roles = ['manager', 'viewer']  
 * - qualquer outro → roles = ['viewer']
 * @param {string} email
 * @param {string} password
 * @returns {{ success: boolean, user?: AuthUser, error?: string }}
 */
export function login(email, password) {
  if (!email || !email.trim()) return { success: false, error: 'Email é obrigatório' };
  if (!password || !password.trim()) return { success: false, error: 'Senha é obrigatória' };
  if (typeof localStorage === 'undefined') return { success: false, error: 'localStorage indisponível' };

  const emailLower = email.trim().toLowerCase();
  const name = emailLower.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  let roles = ['viewer'];
  if (emailLower.includes('admin')) roles = ['admin', 'manager', 'viewer'];
  else if (emailLower.includes('manager') || emailLower.includes('gestor')) roles = ['manager', 'viewer'];

  const user = {
    id: `user_${Date.now()}`,
    email: emailLower,
    name,
    roles
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return { success: true, user };
}

/** Remove auth do localStorage */
export function logout() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}
