import { test, expect } from '@playwright/test';

const PAGES_WITH_META = [
  { path: '/', titleContains: 'Talking to Machines' },
  { path: '/feed', titleContains: 'Practice Feed' },
  { path: '/profile', titleContains: 'Practice Profile' },
  { path: '/ch1', titleContains: 'Ch 1' },
  { path: '/tools', titleContains: 'AI Tool Directory' },
];

test.describe('Meta tags', () => {
  for (const { path, titleContains } of PAGES_WITH_META) {
    test(`${path} has correct meta tags`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });

      // <title> exists and contains expected text
      const title = await page.title();
      expect(title).toContain(titleContains);

      // <meta name="description"> is present and non-empty
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);

      // <meta property="og:title"> is present
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();

      // viewport meta is present
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
    });
  }
});
