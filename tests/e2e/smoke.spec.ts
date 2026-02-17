import { test, expect } from '@playwright/test';
import { ALL_ROUTES, collectErrors, filterBenignErrors } from './helpers';

test.describe('Smoke tests @smoke', () => {
  for (const route of ALL_ROUTES) {
    test(`${route} loads without errors`, async ({ page }) => {
      const errors = collectErrors(page);

      const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // Page should return a successful status
      expect(response?.status()).toBeLessThan(400);

      // Title should not be empty
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Body should have visible content
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);

      // No real console errors (benign ones filtered)
      const realErrors = filterBenignErrors(errors);
      expect(realErrors, `Unexpected errors on ${route}: ${JSON.stringify(realErrors)}`).toHaveLength(0);
    });
  }
});
