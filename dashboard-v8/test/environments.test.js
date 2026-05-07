import { describe, it, expect, vi } from 'vitest';
import { detectEnv, getEnv, getConfig, isDev, isStaging, isProd, _resetEnv } from '../src/config/environments.js';

describe('config/environments', () => {
  afterEach(() => {
    _resetEnv();
    delete globalThis.window;
  });

  it('detectEnv: localhost -> development', () => {
    expect(detectEnv('localhost')).toBe('development');
  });

  it('detectEnv: 127.0.0.1 -> development', () => {
    expect(detectEnv('127.0.0.1')).toBe('development');
  });

  it('detectEnv: vazio -> development', () => {
    expect(detectEnv('')).toBe('development');
  });

  it('detectEnv: *.pages.dev -> staging', () => {
    expect(detectEnv('my-proj.pages.dev')).toBe('staging');
    expect(detectEnv('dash-staging.pages.dev')).toBe('staging');
  });

  it('detectEnv: dominio customizado -> production', () => {
    expect(detectEnv('dashboard.company.com')).toBe('production');
    expect(detectEnv('app.company.com')).toBe('production');
  });

  it('detectEnv: IP externo -> production', () => {
    expect(detectEnv('192.168.1.1')).toBe('production');
  });

  it('getConfig: development tem authRequired=false e mockData=true', () => {
    globalThis.window = { location: { hostname: 'localhost' } };
    const config = getConfig();
    expect(config.name).toBe('development');
    expect(config.authRequired).toBe(false);
    expect(config.mockData).toBe(true);
    expect(config.debug).toBe(true);
    expect(config.telemetry).toBe(false);
    _resetEnv();
  });

  it('getConfig: staging tem authRequired=true', () => {
    globalThis.window = { location: { hostname: 'dash-staging.pages.dev' } };
    const config = getConfig();
    expect(config.name).toBe('staging');
    expect(config.authRequired).toBe(true);
    expect(config.telemetry).toBe(true);
    _resetEnv();
  });

  it('getConfig: production tem authRequired=true e debug=false', () => {
    globalThis.window = { location: { hostname: 'dashboard.company.com' } };
    const config = getConfig();
    expect(config.name).toBe('production');
    expect(config.authRequired).toBe(true);
    expect(config.debug).toBe(false);
    expect(config.telemetry).toBe(true);
    _resetEnv();
  });

  it('isDev, isStaging, isProd funcionam corretamente', () => {
    globalThis.window = { location: { hostname: 'localhost' } };
    expect(isDev()).toBe(true);
    expect(isStaging()).toBe(false);
    expect(isProd()).toBe(false);
    _resetEnv();
  });
});
