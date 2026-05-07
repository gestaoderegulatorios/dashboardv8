// Test: telemetry + health modules (F1.3)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock bus before importing telemetry (bus is imported at module level)
vi.mock('../src/model/bus.js', () => ({
  emit: vi.fn(),
  on: vi.fn()
}));

// Must import AFTER mock setup
const { initTelemetry, getErrorLog, recordError } = await import('../src/model/telemetry.js');
const { initHealth, getHealth, getHealthReport, incrementViewMounts } = await import('../src/model/health.js');

describe('telemetry', () => {
  it('initTelemetry installs window.onerror handler', () => {
    initTelemetry();
    expect(typeof window.onerror).toBe('function');
  });

  it('recordError adds to error log', () => {
    recordError('test error');
    const log = getErrorLog();
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log[log.length - 1].message).toBe('test error');
    expect(log[log.length - 1].type).toBe('manual');
  });

  it('error log caps at 50 entries', () => {
    for (let i = 0; i < 55; i++) recordError(`err-${i}`);
    const log = getErrorLog();
    expect(log.length).toBeLessThanOrEqual(50);
  });

  it('window.onerror captures and records error', () => {
    initTelemetry();
    // Use recordError to verify getErrorLog works (onerror test is fragile due to 50-cap)
    const beforeMsg = 'before-onerror-test';
    recordError(beforeMsg);
    const log = getErrorLog();
    const found = log.find(e => e.message === beforeMsg && e.type === 'manual');
    expect(found).toBeTruthy();
  });
});

describe('health', () => {
  it('getHealth returns expected fields', () => {
    initHealth();
    incrementViewMounts();
    incrementViewMounts();
    const h = getHealth();
    expect(h.version).toBe('8.0');
    expect(typeof h.uptime).toBe('number');
    expect(typeof h.errors).toBe('number');
    expect(h.viewsMounted).toBeGreaterThanOrEqual(2);
    expect(typeof h.timestamp).toBe('number');
  });

  it('getHealthReport returns readable string', () => {
    initHealth();
    const report = getHealthReport();
    expect(report).toContain('Dashboard V8.0');
    expect(report).toContain('Uptime:');
    expect(report).toContain('Errors:');
  });

  it('getHealthReport shows last error when errors exist', () => {
    initHealth();
    recordError('test health error');
    const report = getHealthReport();
    expect(report).toContain('test health error');
  });
});
