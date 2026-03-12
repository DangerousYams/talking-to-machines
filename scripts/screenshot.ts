/**
 * Take a full-page screenshot with all scroll-reveal animations triggered.
 *
 * Usage:
 *   npx tsx scripts/screenshot.ts /course
 *   npx tsx scripts/screenshot.ts /course --mobile
 */

import { chromium } from 'playwright';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const args = process.argv.slice(2);
const isMobile = args.includes('--mobile');
const route = args.find((a) => !a.startsWith('--')) || '/';
const pageName = route === '/' ? 'index' : route.replace(/^\//, '');
const suffix = isMobile ? '-mobile' : '-desktop';
const viewport = isMobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

  // Trigger all reveal animations
  await page.evaluate('document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"))');
  await page.waitForTimeout(300);

  const dest = path.resolve(`tests/screenshots/${pageName}${suffix}.png`);
  await page.screenshot({ path: dest, fullPage: true });
  await browser.close();
  console.log(`✓ ${dest}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
