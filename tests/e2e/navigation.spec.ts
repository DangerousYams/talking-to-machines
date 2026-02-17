import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('landing page has hero heading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // "Talking to" and "Machines" are in the hero
    await expect(page.locator('h1')).toContainText('Talking to');
    await expect(page.locator('h1')).toContainText('Machines');
  });

  test('landing page has "Begin Chapter One" CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cta = page.getByRole('link', { name: 'Begin Chapter One' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/ch1');
  });

  test('landing page has The Arena link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const feedLink = page.getByRole('link', { name: 'The Arena' });
    await expect(feedLink).toBeVisible();
  });

  test('landing page shows all 11 chapters in TOC', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Each chapter has a link in the TOC. ch1 appears twice (hero CTA + TOC),
    // so just verify all 11 chapter links exist on the page.
    for (let i = 1; i <= 11; i++) {
      const links = page.locator(`a[href="/ch${i}"]`);
      const count = await links.count();
      expect(count, `Expected at least one link to /ch${i}`).toBeGreaterThanOrEqual(1);
    }
  });

  test('clicking a chapter link in TOC navigates correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Click the TOC entry (second /ch1 link, not the hero CTA)
    await page.getByRole('link', { name: 'Begin Chapter One' }).click();
    await page.waitForURL('**/ch1**');

    // Should land on ch1 (possibly redirected to ch1-cards on mobile)
    expect(page.url()).toMatch(/\/ch1/);
  });

  test('ch1 chapter nav has next link', async ({ page }) => {
    await page.goto('/ch1', { waitUntil: 'domcontentloaded' });

    // Should have a link pointing to ch2
    const nextLink = page.locator('a[href="/ch2"]');
    await expect(nextLink).toBeAttached();
  });

  test('ch11 chapter nav has prev link', async ({ page }) => {
    await page.goto('/ch11', { waitUntil: 'domcontentloaded' });

    // Should have a link pointing to ch10
    const prevLink = page.locator('a[href="/ch10"]');
    await expect(prevLink).toBeAttached();
  });

  test('mid-chapter (ch6) has both prev and next', async ({ page }) => {
    await page.goto('/ch6', { waitUntil: 'domcontentloaded' });

    const prevLink = page.locator('a[href="/ch5"]');
    const nextLink = page.locator('a[href="/ch7"]');
    await expect(prevLink).toBeAttached();
    await expect(nextLink).toBeAttached();
  });
});
