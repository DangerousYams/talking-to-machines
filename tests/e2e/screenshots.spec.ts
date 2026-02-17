import { test } from '@playwright/test';

const SCREENSHOT_PAGES = [
  { name: 'landing', path: '/' },
  { name: 'feed', path: '/feed' },
  { name: 'profile', path: '/profile' },
  { name: 'practice', path: '/practice' },
  { name: 'tools', path: '/tools' },
  { name: 'ch1-scroll', path: '/ch1' },
  { name: 'ch1-cards', path: '/ch1-cards' },
];

test.describe('Screenshots @screenshot', () => {
  for (const { name, path } of SCREENSHOT_PAGES) {
    test(`${name} desktop screenshot`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      // Wait for GSAP animations to settle
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `tests/screenshots/${name}-desktop.png`,
        fullPage: true,
      });
    });

    test(`${name} mobile screenshot`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      // Wait for GSAP animations to settle
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: `tests/screenshots/${name}-mobile.png`,
        fullPage: true,
      });
    });
  }
});
