import { test, expect } from '@playwright/test';

const PAGES_WITH_META = [
  { path: '/', titleContains: 'Talking to Machines' },
  { path: '/toolbox', titleContains: 'Toolbox' },
  { path: '/field-guide', titleContains: 'Field Guide' },
  { path: '/tools', titleContains: 'Tool' },
  { path: '/ch1', titleContains: 'Ch' },
  { path: '/ch6', titleContains: 'Ch' },
  { path: '/ch11', titleContains: 'Ch' },
  { path: '/absolutely-youre-right', titleContains: 'Right' },
];

test.describe('Meta tags', () => {
  for (const { path, titleContains } of PAGES_WITH_META) {
    test(`${path} has correct meta tags`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // <title> exists and contains expected text
      const title = await page.title();
      expect(title).toContain(titleContains);

      // <meta name="description"> is present and non-empty
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(10);

      // viewport meta is present
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toContain('width=device-width');
    });
  }
});
