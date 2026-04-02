import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

const KEY_PAGES = [
  '/',
  '/ch1',
  '/ch5',
  '/ch9',
  '/toolbox',
  '/field-guide',
  '/absolutely-youre-right',
];

test.describe('Responsive — mobile viewport', () => {
  for (const route of KEY_PAGES) {
    test(`${route} renders at ${MOBILE.width}x${MOBILE.height}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.setViewportSize(MOBILE);
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // Body has visible content
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);

      // No horizontal overflow (page isn't wider than viewport)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(MOBILE.width + 5); // 5px tolerance

      const realErrors = filterBenignErrors(errors);
      expect(realErrors, `Mobile errors on ${route}`).toHaveLength(0);
    });
  }
});

test.describe('Responsive — desktop viewport', () => {
  for (const route of KEY_PAGES) {
    test(`${route} renders at ${DESKTOP.width}x${DESKTOP.height}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.setViewportSize(DESKTOP);
      await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // Body has visible content
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);

      const realErrors = filterBenignErrors(errors);
      expect(realErrors, `Desktop errors on ${route}`).toHaveLength(0);
    });
  }
});

test.describe('Responsive — widget hydration at mobile', () => {
  test('ch1 widget works at mobile size', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/ch1', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 20_000 },
    );

    expect(await page.locator('button').count()).toBeGreaterThan(0);
  });

  test('toolbox filters work at mobile size', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/toolbox', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('button').length >= 4,
      null,
      { timeout: 15_000 },
    );

    // Click a filter pill
    const funPill = page.locator('button').filter({ hasText: 'Fun Stuff' });
    await funPill.click();
    await page.waitForTimeout(300);

    // Should still have content
    const headings = await page.locator('h2').allInnerTexts();
    expect(headings).toContain('Fun Stuff');
  });

  test('field guide works at mobile size', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/field-guide', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15_000 },
    );

    expect(await page.locator('button').count()).toBeGreaterThan(0);
  });
});
