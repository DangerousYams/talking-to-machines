import { chromium } from 'playwright';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

const BASE_URL = 'http://localhost:4321';
const slug = 'for-schools';
const outPath = path.join(os.homedir(), 'Desktop', 'Cultivated-AI-For-Schools-10-15.pdf');
const tmpDir = path.join(os.tmpdir(), `for-schools-10-15-${Date.now()}`);
await fs.mkdir(tmpDir, { recursive: true });

// Slides 10..15 by data-slide id (in order)
const KEEP = ['workshop', 'approach', 'practice', 'policy', 'studio', 'bundle'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });

console.log(`-> ${BASE_URL}/${slug}`);
await page.goto(`${BASE_URL}/${slug}`, { waitUntil: 'networkidle' });

// Make sure fonts are loaded
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([
  document.fonts.load('800 96px "Playfair Display"'),
  document.fonts.load('800 italic 48px "Playfair Display"'),
  document.fonts.load('400 16px "Lora"'),
  document.fonts.load('italic 400 16px "Lora"'),
  document.fonts.load('700 12px "JetBrains Mono"'),
  document.fonts.load('600 24px "Caveat"'),
]));

// Hide the floating UI we don't want in print
await page.addStyleTag({ content: `
  .progress-rail, .kbd-hint { display: none !important; }
  .card-deck-card { opacity: 1 !important; }
  /* force stagger items visible immediately so we don't have to wait for transitions on every slide */
  .deck-slide .stagger > * { opacity: 1 !important; transform: none !important; transition: none !important; }
`});

await page.waitForTimeout(300);

const pngs = [];
for (let i = 0; i < KEEP.length; i++) {
  const id = KEEP[i];
  // Scroll the slide into view (the .card-deck-container handles snapping)
  await page.evaluate((sid) => {
    const el = document.querySelector(`.deck-slide[data-slide="${sid}"]`);
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    // Force the active class so any is-active styling kicks in
    document.querySelectorAll('.deck-slide').forEach(s => s.classList.toggle('is-active', s === el));
    document.querySelectorAll('.card-deck-card').forEach(s => s.classList.toggle('is-active', s === el));
  }, id);
  await page.waitForTimeout(400);
  const out = path.join(tmpDir, `${String(i+1).padStart(2,'0')}-${id}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1600, height: 900 } });
  pngs.push(out);
  console.log(`  shot ${id} -> ${out}`);
}

// Build a temp HTML that places each PNG as a full 1600x900 page, then print to PDF
const imgsHtml = pngs.map(p => `<img src="file://${p}" />`).join('\n');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: 1600px 900px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  img { display: block; width: 1600px; height: 900px; page-break-after: always; }
  img:last-child { page-break-after: auto; }
</style></head><body>${imgsHtml}</body></html>`;

const htmlPath = path.join(tmpDir, 'index.html');
await fs.writeFile(htmlPath, html);

const pdfPage = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await pdfPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
await pdfPage.emulateMedia({ media: 'print' });
await pdfPage.pdf({ path: outPath, preferCSSPageSize: true, printBackground: true, scale: 1 });

await browser.close();
console.log(`OK ${outPath}`);
