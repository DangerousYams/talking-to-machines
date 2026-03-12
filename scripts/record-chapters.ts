/**
 * Record smooth-scroll videos of chapter pages using Playwright.
 *
 * Usage:
 *   npx tsx scripts/record-chapters.ts                  # all chapters
 *   npx tsx scripts/record-chapters.ts ch1 ch6          # specific chapters
 *   npx tsx scripts/record-chapters.ts --mobile         # mobile viewport
 *   npx tsx scripts/record-chapters.ts --speed=2        # 2x scroll speed
 *   npx tsx scripts/record-chapters.ts --landing        # just the landing page
 *   npx tsx scripts/record-chapters.ts --all            # landing + all chapters
 *
 * Requires: dev server running on localhost:4321 (or set BASE_URL)
 * Output:   tests/videos/*.webm
 */

import { chromium, type Page } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const VIDEO_DIR = path.resolve('tests/videos');

// ── CLI parsing ──────────────────────────────────────────────

const args = process.argv.slice(2);
const isMobile = args.includes('--mobile');
const includeLanding = args.includes('--landing') || args.includes('--all');
const speedArg = args.find((a) => a.startsWith('--speed='));
const speed = speedArg ? parseFloat(speedArg.split('=')[1]) : 1;

const explicitPages = args.filter((a) => !a.startsWith('--'));

const CHAPTER_ROUTES = [
  '/ch1', '/ch2', '/ch3', '/ch4', '/ch5', '/ch6',
  '/ch7', '/ch8', '/ch9', '/ch10', '/ch11',
];

let pagesToRecord: string[];
if (explicitPages.length > 0) {
  pagesToRecord = explicitPages.map((c) => (c.startsWith('/') ? c : `/${c}`));
} else if (includeLanding) {
  pagesToRecord = ['/', ...CHAPTER_ROUTES];
} else {
  pagesToRecord = CHAPTER_ROUTES;
}

const viewport = isMobile
  ? { width: 390, height: 844 }
  : { width: 1280, height: 800 };

// ── Build a paid access token for localStorage ───────────────
// The paywall checks localStorage for a JWT-like token with
// tier: 'paid' and a future exp. This lets the recorder see
// the actual chapter content instead of the paywall overlay.

function buildPaidToken(): string {
  const payload = {
    uid: 'recorder',
    tier: 'paid',
    cid: null,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year
  };
  const b64 = Buffer.from(JSON.stringify(payload))
    .toString('base64url');
  return `${b64}.recorder`;
}

const PAID_TOKEN = buildPaidToken();

// ── Smooth scroll using incremental steps ────────────────────
// Uses page.evaluate in small chunks to avoid tsx __name issue
// with serialized async functions.

async function smoothScroll(page: Page, durationMs: number) {
  // Detect card-deck layout (scroll-snap container instead of window scroll)
  const scrollInfo = await page.evaluate(() => {
    const container = document.querySelector('.card-deck-container');
    if (container) {
      return {
        type: 'container' as const,
        total: container.scrollHeight - container.clientHeight,
      };
    }
    return {
      type: 'window' as const,
      total: document.documentElement.scrollHeight - window.innerHeight,
    };
  });

  if (scrollInfo.total <= 0) return;

  const fps = 30;
  const totalFrames = Math.round((durationMs / 1000) * fps);
  const msPerFrame = durationMs / totalFrames;

  for (let frame = 1; frame <= totalFrames; frame++) {
    const progress = frame / totalFrames;
    // ease-in-out cubic
    const eased =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    const y = Math.round(eased * scrollInfo.total);
    try {
      if (scrollInfo.type === 'container') {
        await page.evaluate(`document.querySelector('.card-deck-container').scrollTo(0, ${y})`);
      } else {
        await page.evaluate(`window.scrollTo(0, ${y})`);
      }
      await page.waitForTimeout(msPerFrame);
    } catch {
      // Navigation or context destruction — stop scrolling gracefully
      break;
    }
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const suffix = isMobile ? '-mobile' : '-desktop';
  console.log(
    `\nRecording ${pagesToRecord.length} page(s) — ` +
    `${isMobile ? 'mobile 390×844' : 'desktop 1280×800'}, ` +
    `${speed}x speed\n`
  );

  const browser = await chromium.launch();

  for (const route of pagesToRecord) {
    const pageName = route === '/' ? 'index' : route.slice(1);
    const videoFile = `${pageName}${suffix}.webm`;

    process.stdout.write(`  ${pageName} … `);

    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: VIDEO_DIR, size: viewport },
    });

    // Inject paid token into localStorage before any page JS runs
    await context.addInitScript((token: string) => {
      localStorage.setItem('ttm_access_token', token);
    }, PAID_TOKEN);

    const page = await context.newPage();

    // Navigate with ?force=scroll to bypass A/B test redirect
    // (middleware redirects mobile UAs to card-deck variant otherwise)
    const separator = route === '/' ? '' : '?force=scroll';
    await page.goto(`${BASE_URL}${route}${separator}`, { waitUntil: 'networkidle' });

    // Let hero animations play
    await page.waitForTimeout(2000);

    // Calculate scroll duration based on page length
    const scrollDistance = await page.evaluate(() => {
      const container = document.querySelector('.card-deck-container');
      if (container) return container.scrollHeight - container.clientHeight;
      return document.documentElement.scrollHeight - window.innerHeight;
    }) as number;

    if (scrollDistance > 0) {
      // ~3s per viewport-height of content, adjusted by speed multiplier
      const baseDuration = (scrollDistance / viewport.height) * 3000;
      const scrollDuration = Math.max(3000, baseDuration / speed);

      await smoothScroll(page, scrollDuration);
    }

    // Hold at bottom
    await page.waitForTimeout(1500);

    // Finalize video
    const video = page.video();
    await context.close();

    if (video) {
      const dest = path.join(VIDEO_DIR, videoFile);
      await video.saveAs(dest);
      const size = (fs.statSync(dest).size / 1024 / 1024).toFixed(1);
      console.log(`✓  ${videoFile}  (${size} MB)`);
    } else {
      console.log('✗  no video recorded');
    }
  }

  await browser.close();
  console.log(`\nDone! Videos saved to tests/videos/\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
