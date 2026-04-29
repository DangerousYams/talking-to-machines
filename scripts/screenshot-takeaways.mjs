import { chromium } from 'playwright';

const targets = [
  { url: 'http://localhost:4321/share-card-takeaways-v1', out: 'public/images/share-card-takeaways-v1.png' },
  { url: 'http://localhost:4321/share-card-takeaways-v2', out: 'public/images/share-card-takeaways-v2.png' },
  { url: 'http://localhost:4321/share-card-takeaways-v2b', out: 'public/images/share-card-takeaways-v2b.png' },
  { url: 'http://localhost:4321/share-card-takeaways-v3', out: 'public/images/share-card-takeaways-v3.png' },
];

const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
  await page.goto(t.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    document.querySelectorAll('astro-dev-toolbar, astro-dev-overlay').forEach((el) => el.remove());
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: t.out, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await page.close();
  console.log('Saved', t.out);
}
await browser.close();
