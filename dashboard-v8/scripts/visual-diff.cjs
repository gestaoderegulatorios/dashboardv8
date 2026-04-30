#!/usr/bin/env node
// Visual regression testing diff runner using pixelmatch + pngjs
// Usage: node scripts/visual-diff.cjs <baselineDir> <currentDir> [thresholdPercent]

const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

function readPNG(filepath) {
  const data = fs.readFileSync(filepath);
  return PNG.sync.read(data);
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const args = process.argv.slice(2);
const baselineDir = args[0];
const currentDir = args[1];
const thresholdPct = Number(args[2] ?? process.env.VRT_THRESHOLD ?? 0.5); // default 0.5%

if (!baselineDir || !currentDir) {
  console.error('Usage: node scripts/visual-diff.cjs <baselineDir> <currentDir> [thresholdPercent]');
  process.exit(2);
}

if (!fs.existsSync(baselineDir)) {
  console.error(`Baseline directory not found: ${baselineDir}`);
  process.exit(3);
}
if (!fs.existsSync(currentDir)) {
  console.error(`Current directory not found: ${currentDir}`);
  process.exit(3);
}

const baselineFiles = fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'));
if (baselineFiles.length === 0) {
  console.log('No baseline PNGs found. Nothing to compare.');
  process.exit(0);
}

let total = 0;
let matches = 0;
let diffs = 0;
let exitCode = 0;

// Prepare optional per-image diffs path: write into currentDir as <name>.diff.png
const DIFF_SUFFIX = '.diff.png';

for (const file of baselineFiles) {
  const baselinePath = path.join(baselineDir, file);
  const currentPath = path.join(currentDir, file);
  if (!fs.existsSync(currentPath)) {
    console.warn(`Warning: current image missing for ${file}, skipping.`);
    continue;
  }
  total++;
  try {
    const a = readPNG(baselinePath);
    const b = readPNG(currentPath);
    const { width, height } = a;
    if (width !== b.width || height !== b.height) {
      console.warn(`Dimension mismatch for ${file}. Baseline: ${width}x${height}, Current: ${b.width}x${b.height}`);
      exitCode = 1;
      // still attempt to write a diff placeholder
    }

    const diff = new PNG({ width: Math.max(width, b.width), height: Math.max(height, b.height) });
    // Pixel data arrays must have same length; ensure we slice to min dims if needed
    const w = Math.min(width, b.width);
    const h = Math.min(height, b.height);
    const diffPixels = pixelmatch(a.data, b.data, diff.data, w, h, { threshold: 0.5, includeAA: false });
    // Save diff image (same size as diff canvas)
    const diffPath = path.join(currentDir, file.replace(/\.png$/i, '') + DIFF_SUFFIX);
    const outBuffer = PNG.sync.write(diff);
    fs.writeFileSync(diffPath, outBuffer);

    const totalPixels = w * h || 1;
    const diffPercent = (diffPixels / totalPixels) * 100;
    if (diffPercent >= thresholdPct) {
      diffs++;
      exitCode = 1;
    }
    if (diffPixels === 0) {
      matches++;
    }
    console.log(`- ${file}: diff=${diffPercent.toFixed(2)}% (${diffPixels} px)`);
  } catch (e) {
    console.error(`Error comparing ${file}: ${e.message}`);
    exitCode = 1;
  }
}

console.log(`\nSummary: ${matches}/${total} match, ${diffs} differ (threshold ${thresholdPct}%)`);
process.exit(exitCode);
