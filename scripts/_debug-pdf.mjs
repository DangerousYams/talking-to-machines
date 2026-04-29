import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto('http://localhost:4321/workshop-day2', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.querySelectorAll('.deck-slide').forEach(s => s.classList.add('is-active')); });
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(300);

const info = await page.evaluate(() => {
  const slides = document.querySelectorAll('.deck-slide');
  const visible = [];
  slides.forEach((s) => {
    const rect = s.getBoundingClientRect();
    const style = getComputedStyle(s);
    visible.push({ slug: s.dataset.slide, h: Math.round(rect.height), w: Math.round(rect.width), display: style.display });
  });
  return { count: slides.length, visible, bodyH: document.body.scrollHeight, contH: document.querySelector('.card-deck-container')?.scrollHeight };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
