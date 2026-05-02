// Login overlay — inline, usa design system tokens (theme.css).
// Stub para P3 (RLS) e P8 (SaaS/JWT). Hoje: localStorage.

import { login, isAuthenticated } from '../model/auth.js';
import { SIDEBAR_LOGO_ICON, BRANDING_DEFAULTS } from '../model/branding.js';
import { escape } from '../view/shared.js';

let overlayEl = null;

export function hideLogin() {
  if (!overlayEl) return;
  overlayEl.style.display = 'none';
}

/**
 * Mounts the login overlay. If onSuccess is provided, it will be called after a successful login.
 * Returns immediately; actual completion is signaled via the onSuccess callback and/or emitted events.
 * @param {{ onSuccess?: () => void }} [options]
 */
export function mountLogin(options = {}) {
  const { onSuccess } = options;

  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.id = 'login-overlay';
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-label', 'Login');
    overlayEl.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:var(--color-background,#f7f9fb);padding:1rem;';

    overlayEl.innerHTML = `
      <div style="min-width:300px;max-width:420px;width:100%;padding:2rem;background:var(--color-surface-container-lowest,#fff);border:1px solid var(--color-outline-variant,#c5c6cf);border-radius:8px;box-shadow:var(--shadow-lg,0 8px 24px rgba(10,31,68,0.12));">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;">
          <span class="material-symbols-outlined" style="color:var(--color-primary,#00081e);font-size:2rem;" aria-hidden="true">${escape(SIDEBAR_LOGO_ICON)}</span>
          <div>
            <h2 style="font-size:1.25rem;font-weight:700;color:var(--color-primary,#00081e);margin:0;">Dashboard V8</h2>
            <p style="font-size:0.75rem;color:var(--color-on-surface-variant,#44464e);margin:0;">${escape(BRANDING_DEFAULTS.companyName)}</p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <label for="login-email" style="font-size:0.75rem;font-weight:600;color:var(--color-on-surface-variant,#44464e);">Email</label>
          <input id="login-email" type="email" placeholder="seu@email.com" autocomplete="email" style="width:100%;padding:0.625rem 0.75rem;border-radius:8px;border:1px solid var(--color-outline-variant,#c5c6cf);background:var(--color-surface-container-lowest,#fff);color:var(--color-on-surface,#191c1e);font-size:0.875rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--color-surface-tint,#4c5e86)'" onblur="this.style.borderColor='var(--color-outline-variant,#c5c6cf)'" />
          <label for="login-password" style="font-size:0.75rem;font-weight:600;color:var(--color-on-surface-variant,#44464e);">Senha</label>
          <input id="login-password" type="password" placeholder="••••••••" autocomplete="current-password" style="width:100%;padding:0.625rem 0.75rem;border-radius:8px;border:1px solid var(--color-outline-variant,#c5c6cf);background:var(--color-surface-container-lowest,#fff);color:var(--color-on-surface,#191c1e);font-size:0.875rem;outline:none;transition:border-color 0.2s;" onfocus="this.style.borderColor='var(--color-surface-tint,#4c5e86)'" onblur="this.style.borderColor='var(--color-outline-variant,#c5c6cf)'" />
          <button id="login-submit" style="width:100%;min-height:44px;padding:0.625rem;border:none;border-radius:8px;background:var(--color-primary,#00081e);color:var(--color-on-primary,#ffffff);font-size:0.875rem;font-weight:700;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Entrar</button>
          <button id="login-guest" style="width:100%;padding:0.5rem;border:none;border-radius:8px;background:transparent;color:var(--color-surface-tint,#4c5e86);font-size:0.8125rem;cursor:pointer;transition:opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Entrar como convidado</button>
          <div id="login-error" style="min-height:1.2em;font-size:0.8125rem;color:var(--color-error,#ba1a1a);" aria-live="polite"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);
  }

  overlayEl.style.display = 'flex';

  const emailInput = overlayEl.querySelector('#login-email');
  const passInput = overlayEl.querySelector('#login-password');
  const errorEl = overlayEl.querySelector('#login-error');
  const submitBtn = overlayEl.querySelector('#login-submit');
  const guestBtn = overlayEl.querySelector('#login-guest');

  // Clear stale errors
  errorEl.textContent = '';
  emailInput.value = '';
  passInput.value = '';

  // Remove old listeners by replacing nodes (cleaner than tracking)
  const newSubmit = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newSubmit, submitBtn);
  const newGuest = guestBtn.cloneNode(true);
  guestBtn.parentNode.replaceChild(newGuest, guestBtn);

  const handleLogin = () => {
    const email = emailInput.value;
    const password = passInput.value;
    const result = login(email, password);
    if (result.success) {
      window.dispatchEvent(new CustomEvent('v8:auth-login', { detail: { user: result.user } }));
      if (onSuccess) onSuccess();
      hideLogin();
    } else {
      errorEl.textContent = result.error || 'Erro de autenticação';
    }
  };

  newSubmit.addEventListener('click', (e) => { e.preventDefault(); handleLogin(); });
  newGuest.addEventListener('click', (e) => {
    e.preventDefault();
    const result = login('guest@dashboard.local', 'guest');
    if (result.success) {
      window.dispatchEvent(new CustomEvent('v8:auth-login', { detail: { user: result.user } }));
      if (onSuccess) onSuccess();
      hideLogin();
    } else {
      errorEl.textContent = result.error || 'Erro de autenticação';
    }
  });

  // Enter key submits
  const keyHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(); } };
  emailInput.addEventListener('keydown', keyHandler);
  passInput.addEventListener('keydown', keyHandler);

  // Focus email input
  setTimeout(() => { if (emailInput) emailInput.focus(); }, 100);
}
