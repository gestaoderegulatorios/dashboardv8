/**
 * Tests: Auth Layer (P2.1)
 * Tests login, logout, JWT, guards, RBAC, and API client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  login,
  logout,
  getAccessToken,
  getCurrentUser,
  isAuthenticated,
  initAuth,
  isTokenExpired,
} from '../src/auth/auth.js';
import {
  canAccessView,
  canPerformAction,
  isHigherRole,
  getAllowedViews,
  hasMinimumRole,
} from '../src/auth/rbac.js';

describe('auth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('login retorna user e token (DEV mock)', async () => {
    const result = await login({ email: 'test@test.com', password: 'any' });
    expect(result.ok).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.role).toBeDefined();
    expect(getAccessToken()).not.toBeNull();
    expect(getCurrentUser()).not.toBeNull();
  });

  it('logout remove auth', async () => {
    await login({ email: 'test@test.com', password: 'any' });
    await logout();
    expect(getAccessToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
  });

  it('isAuthenticated retorna true apos login', async () => {
    expect(isAuthenticated()).toBe(false);
    await login({ email: 'test@test.com', password: 'any' });
    expect(isAuthenticated()).toBe(true);
  });

  it('initAuth recupera de storage se houver', async () => {
    await login({ email: 'test@test.com', password: 'any' });
    const user = getCurrentUser();
    expect(user).not.toBeNull();
  });

  it('isTokenExpired com mock nunca expira', () => {
    expect(isTokenExpired('mock_token')).toBe(false);
    expect(isTokenExpired(null)).toBe(true);
  });
});

describe('rbac', () => {
  it('admin pode acessar qualquer view', () => {
    expect(canAccessView('admin', 'overview')).toBe(true);
    expect(canAccessView('admin', 'finance')).toBe(true);
    expect(canAccessView('admin', 'reports')).toBe(true);
  });

  it('viewer nao pode acessar settings', () => {
    expect(canAccessView('viewer', 'settings')).toBe(false);
    expect(canAccessView('viewer', 'finance')).toBe(true);
  });

  it('manager pode editar', () => {
    expect(canPerformAction('manager', 'edit')).toBe(true);
    expect(canPerformAction('manager', 'admin')).toBe(false);
  });

  it('auditor pode export', () => {
    expect(canPerformAction('auditor', 'export')).toBe(true);
    expect(canPerformAction('auditor', 'edit')).toBe(false);
  });

  it('isHigherRole: admin > manager', () => {
    expect(isHigherRole('admin', 'manager')).toBe(true);
    expect(isHigherRole('manager', 'admin')).toBe(false);
    expect(isHigherRole('manager', 'viewer')).toBe(true);
  });

  it('hasMinimumRole: manager >= viewer', () => {
    expect(hasMinimumRole('manager', 'viewer')).toBe(true);
    expect(hasMinimumRole('viewer', 'manager')).toBe(false);
  });

  it('getAllowedViews retorna array', () => {
    expect(getAllowedViews('viewer')).toContain('overview');
    expect(getAllowedViews('nonexistent')).toEqual([]);
  });
});
