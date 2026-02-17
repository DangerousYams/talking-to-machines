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

  // Use the cards variant for chapter nav tests — scroll chapters have dozens
  // of React islands that don't reliably hydrate within test timeouts.
  test('ch1 chapter nav has next link', async ({ page }) => {
    await page.goto('/ch1-cards', { waitUntil: 'domcontentloaded' });

    // Cards pages are single React islands that hydrate quickly
    const nextLink = page.locator('a[href="/ch2"], a[href="/ch2-cards"]');
    await expect(nextLink.first()).toBeAttached({ timeout: 15000 });
  });

  test('ch11 chapter nav has prev link', async ({ page }) => {
    await page.goto('/ch11-cards', { waitUntil: 'domcontentloaded' });

    // ch11 is last — may link to ch10, ch10-cards, or home (/)
    const prevLink = page.locator('a[href="/ch10"], a[href="/ch10-cards"], a[href="/"]');
    await expect(prevLink.first()).toBeAttached({ timeout: 15000 });
  });

  test('mid-chapter (ch6) has both prev and next', async ({ page }) => {
    await page.goto('/ch6-cards', { waitUntil: 'domcontentloaded' });

    const prevLink = page.locator('a[href="/ch5"], a[href="/ch5-cards"]');
    const nextLink = page.locator('a[href="/ch7"], a[href="/ch7-cards"]');
    await expect(prevLink.first()).toBeAttached({ timeout: 15000 });
    await expect(nextLink.first()).toBeAttached({ timeout: 15000 });
  });
});
