import { chromium } from 'playwright';
import os from 'os';
import path from 'path';

const BASE_URL = 'http://localhost:4321';
const slug = 'aia-marketing';
const outPath = path.join(os.homedir(), 'Desktop', 'Cultivated-AI-AIA-Marketing.pdf');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

console.log(`-> ${BASE_URL}/${slug}`);
await page.goto(`${BASE_URL}/${slug}`, { waitUntil: 'networkidle' });

await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([
  document.fonts.load('800 96px "Playfair Display"'),
  document.fonts.load('800 italic 48px "Playfair Display"'),
  document.fonts.load('400 16px "Lora"'),
  document.fonts.load('italic 400 16px "Lora"'),
  document.fonts.load('700 12px "JetBrains Mono"'),
  document.fonts.load('600 24px "Caveat"'),
]));
await page.waitForTimeout(500);

await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: outPath,
  preferCSSPageSize: true,
  printBackground: true,
  scale: 1,
});

await browser.close();
console.log(`OK ${outPath}`);
