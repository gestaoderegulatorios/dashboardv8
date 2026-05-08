import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('chart animations config', () => {
  let mockApexCharts;
  let chartOpts;

  beforeEach(async () => {
    chartOpts = null;
    mockApexCharts = vi.fn(function(container, options) {
      chartOpts = options;
      this.render = vi.fn();
      this.update = vi.fn();
      this.updateSeries = vi.fn();
      this.destroy = vi.fn();
    });
    globalThis.window = {
      ApexCharts: mockApexCharts,
      ResizeObserver: vi.fn(() => ({ observe: vi.fn() }))
    };
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it('mountChart passes animation config to ApexCharts', async () => {
    const { mountChart } = await import('../src/domain/chart.js');
    const container = document.createElement('div');
    container.id = 'test-chart';
    document.body.appendChild(container);

    mountChart(container, {
      chart: { type: 'bar', height: 320 }
    });

    // Wait for requestAnimationFrame
    await new Promise(r => setTimeout(r, 50));

    expect(mockApexCharts).toHaveBeenCalled();
    expect(chartOpts).not.toBeNull();

    // Check animation config
    const anim = chartOpts.chart?.animations;
    expect(anim).toBeDefined();
    expect(anim.enabled).toBe(true);
    expect(anim.speed).toBeGreaterThan(0);

    document.body.removeChild(container);
  });
});
