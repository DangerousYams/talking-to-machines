import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('landing page has hero heading', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toContainText('Talking to');
    await expect(page.locator('h1')).toContainText('Machines');
  });

  test('landing page has chapter 1 CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const ch1Links = page.locator('a[href="/ch1"]');
    expect(await ch1Links.count()).toBeGreaterThanOrEqual(1);
  });

  test('landing page shows all 11 chapters in TOC', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    for (let i = 1; i <= 11; i++) {
      const links = page.locator(`a[href="/ch${i}"]`);
      expect(await links.count(), `Expected link to /ch${i}`).toBeGreaterThanOrEqual(1);
    }
  });

  test('ch1 has link to ch2', async ({ page }) => {
    await page.goto('/ch1', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const nextLink = page.locator('a[href="/ch2"]');
    await expect(nextLink.first()).toBeAttached({ timeout: 15_000 });
  });

  test('ch11 has link back (prev chapter or home)', async ({ page }) => {
    await page.goto('/ch11', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const prevLink = page.locator('a[href="/ch10"], a[href="/"]');
    await expect(prevLink.first()).toBeAttached({ timeout: 15_000 });
  });

  test('mid-chapter (ch6) has both prev and next links', async ({ page }) => {
    await page.goto('/ch6', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    const prevLink = page.locator('a[href="/ch5"]');
    const nextLink = page.locator('a[href="/field-guide"], a[href="/ch7"]');
    await expect(prevLink.first()).toBeAttached({ timeout: 15_000 });
    await expect(nextLink.first()).toBeAttached({ timeout: 15_000 });
  });

  test('toolbox page has home link', async ({ page }) => {
    await page.goto('/toolbox', { waitUntil: 'domcontentloaded' });

    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });

  test('field guide has chapter navigation links', async ({ page }) => {
    await page.goto('/field-guide', { waitUntil: 'domcontentloaded' });

    // Should have prev (ch6) and next (ch7) links
    const ch6Link = page.locator('a[href="/ch6"]');
    const ch7Link = page.locator('a[href="/ch7"]');
    await expect(ch6Link.first()).toBeAttached({ timeout: 10_000 });
    await expect(ch7Link.first()).toBeAttached({ timeout: 10_000 });
  });
});
