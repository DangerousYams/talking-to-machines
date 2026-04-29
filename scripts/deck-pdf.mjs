#!/usr/bin/env node
// Print a workshop deck to PDF, honouring its @page print rules (1600×900).
//
// Usage:
//   node scripts/deck-pdf.mjs workshop-day2
//   BASE_URL=http://localhost:4321 node scripts/deck-pdf.mjs workshop-day1

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const slug = process.argv[2];

if (!slug) {
  console.error('Usage: node scripts/deck-pdf.mjs <slug>    (e.g. workshop-day2)');
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(repoRoot, `${slug}.pdf`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

console.log(`→ ${BASE_URL}/${slug}`);
await page.goto(`${BASE_URL}/${slug}`, { waitUntil: 'networkidle' });

// Wait for webfonts (Playfair Display, Lora, JetBrains Mono, Caveat) to finish loading.
// Without this, the PDF renders in fallback serif and all typography shifts.
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([
  document.fonts.load('800 64px "Playfair Display"'),
  document.fonts.load('400 16px "Lora"'),
  document.fonts.load('italic 600 24px "Playfair Display"'),
  document.fonts.load('600 20px "Caveat"'),
  document.fonts.load('600 14px "JetBrains Mono"'),
]));

// Force all slides "active" so stagger animations resolve to their final state.
await page.evaluate(() => {
  document.querySelectorAll('.deck-slide').forEach((s) => s.classList.add('is-active'));
});
await page.waitForTimeout(500);

await page.emulateMedia({ media: 'print' });
// The deck's @page rule is `size: 1600px 900px`. Use it directly.
await page.pdf({
  path: outPath,
  preferCSSPageSize: true,
  printBackground: true,
  scale: 1,
});

await browser.close();
console.log(`✓ ${outPath}`);
