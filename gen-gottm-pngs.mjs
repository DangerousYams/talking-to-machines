import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const outDir = join(import.meta.dirname, 'public/images');
mkdirSync(outDir, { recursive: true });

const CREAM = '#F8F6F3';

const fonts = [
  { key: 'inter',         family: "'Inter', sans-serif",          weight: 800, size: 112 },
  { key: 'dm-sans',       family: "'DM Sans', sans-serif",        weight: 700, size: 112 },
  { key: 'space-grotesk', family: "'Space Grotesk', sans-serif",  weight: 700, size: 112 },
  { key: 'outfit',        family: "'Outfit', sans-serif",         weight: 700, size: 112 },
];

const colors = [
  { key: 'deep-coral',  left: '#1A1A2E', right: '#E94560' },
  { key: 'deep-purple', left: '#1A1A2E', right: '#7B61FF' },
  { key: 'deep-teal',   left: '#1A1A2E', right: '#16C79A' },
  { key: 'coral-solid', left: '#E94560', right: '#E94560' },
  { key: 'cream-coral', left: '#F8F6F3', right: '#E94560' },
  { key: 'purple-coral',left: '#7B61FF', right: '#E94560' },
  { key: 'navy-coral',  left: '#0F3460', right: '#E94560' },
];

const html = (left, right, bg, family, weight, size) => `<!DOCTYPE html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=DM+Sans:wght@700;800&family=Space+Grotesk:wght@700&family=Outfit:wght@700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; }
    body {
      width: 1024px;
      height: 1024px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${bg};
    }
    .text {
      font-family: ${family};
      font-weight: ${weight};
      font-size: ${size}px;
      letter-spacing: -0.02em;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span class="text"><span style="color:${left}">gottm</span><span style="color:${right}">.xyz</span></span>
</body>
</html>`;

const browser = await chromium.launch();

async function render(name, left, right, bg, family, weight, size, omitBg) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1024, height: 1024 });
  await page.setContent(html(left, right, bg, family, weight, size), { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const outPath = join(outDir, `${name}.png`);
  await page.screenshot({ path: outPath, omitBackground: omitBg });
  console.log(`  ✓ ${name}.png`);
  await page.close();
}

for (const font of fonts) {
  console.log(`\n${font.key}:`);
  for (const color of colors) {
    const name = `gottm-${font.key}-${color.key}`;
    // Transparent version
    await render(name, color.left, color.right, 'transparent', font.family, font.weight, font.size, true);
    // Cream bg version (skip cream text on cream bg)
    if (color.key !== 'cream-coral') {
      await render(`${name}-bg`, color.left, color.right, CREAM, font.family, font.weight, font.size, false);
    }
  }
}

await browser.close();
console.log('\nDone! All PNGs saved to public/images/');
