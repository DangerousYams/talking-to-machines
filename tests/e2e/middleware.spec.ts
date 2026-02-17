import { test, expect } from '@playwright/test';
import { MOBILE_UA } from './helpers';

test.describe('Middleware — responsive routing', () => {
  test('mobile UA on /ch1 redirects to /ch1-cards', async ({ browser }) => {
    const context = await browser.newContext({ userAgent: MOBILE_UA });
    const page = await context.newPage();

    await page.goto('/ch1', { waitUntil: 'load' });
    // Client-side script detects mobile UA and redirects
    await page.waitForURL('**/ch1-cards**', { timeout: 5000 });
    expect(page.url()).toContain('/ch1-cards');

    await context.close();
  });

  test('desktop UA on /ch1 stays on /ch1', async ({ browser }) => {
    const desktopUA =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const context = await browser.newContext({ userAgent: desktopUA });
    const page = await context.newPage();

    await page.goto('/ch1', { waitUntil: 'load' });
    // Desktop should stay on scroll variant
    expect(page.url()).toMatch(/\/ch1(\?|$)/);

    await context.close();
  });

  test('?force=cards loads successfully', async ({ page }) => {
    // In dev mode, ?force=cards may not redirect (middleware only in prod)
    // Verify the page loads without error regardless
    const response = await page.goto('/ch1?force=cards', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
  });

  test('?force=scroll prevents mobile redirect', async ({ browser }) => {
    const context = await browser.newContext({ userAgent: MOBILE_UA });
    const page = await context.newPage();

    await page.goto('/ch1?force=scroll', { waitUntil: 'load' });
    // force=scroll should prevent client-side redirect to cards
    // Wait a moment to confirm no redirect happens
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/ch1');
    expect(page.url()).not.toContain('/ch1-cards');

    await context.close();
  });

  test('?mobile param redirects to cards', async ({ page }) => {
    await page.goto('/ch1?mobile', { waitUntil: 'load' });
    await page.waitForURL('**/ch1-cards**', { timeout: 5000 });
    expect(page.url()).toContain('/ch1-cards');
  });

  test('?desktop param prevents mobile redirect', async ({ browser }) => {
    const context = await browser.newContext({ userAgent: MOBILE_UA });
    const page = await context.newPage();

    await page.goto('/ch1?desktop', { waitUntil: 'load' });
    // ?desktop sets forceScroll = true, preventing cards redirect
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/ch1');
    expect(page.url()).not.toContain('/ch1-cards');

    await context.close();
  });

  test('direct /ch1-cards access does not redirect loop', async ({ page }) => {
    await page.goto('/ch1-cards', { waitUntil: 'domcontentloaded' });
    // Should stay on cards, not redirect away
    expect(page.url()).toContain('/ch1-cards');
  });

  test('non-chapter routes skip middleware (no redirect)', async ({ browser }) => {
    const context = await browser.newContext({ userAgent: MOBILE_UA });
    const page = await context.newPage();

    // /feed, /profile, /tools should NOT be redirected even with mobile UA
    for (const route of ['/feed', '/profile', '/tools']) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(page.url()).toContain(route);
    }

    await context.close();
  });
});
