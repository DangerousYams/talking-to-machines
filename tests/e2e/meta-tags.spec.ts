import { test, expect } from '@playwright/test';

const PAGES_WITH_META = [
  { path: '/', titleContains: 'Talking to Machines' },
  { path: '/feed', titleContains: 'The Arena' },
  { path: '/profile', titleContains: 'Your Profile' },
  { path: '/tools', titleContains: 'AI Tool Directory' },
];

// ch1 tested separately — mobile viewports redirect to ch1-cards
const CH1_META = { scroll: '/ch1', cards: '/ch1-cards', titleContains: 'Ch' };

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

  test('/ch1 has correct meta tags', async ({ page }) => {
    // Navigate to ch1 — may redirect to ch1-cards on mobile
    await page.goto('/ch1', { waitUntil: 'load' });
    await page.waitForTimeout(2000);

    // Title should contain "Ch" regardless of scroll or cards variant
    const title = await page.title();
    expect(title).toContain('Ch');

    // description should be present
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(10);

    // viewport meta is present
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});
