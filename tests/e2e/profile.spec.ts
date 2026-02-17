import { test, expect } from '@playwright/test';

test.describe('Profile page', () => {
  test('profile loads and shows content', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    // Title should mention profile
    const title = await page.title();
    expect(title.toLowerCase()).toContain('profile');

    // Wait for React hydration
    await page.waitForTimeout(2000);

    // Body has content
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('profile has ConceptWeb SVG', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // ConceptWeb renders an <svg>
    const svg = page.locator('svg');
    const count = await svg.count();
    expect(count).toBeGreaterThan(0);
  });

  test('header nav links work', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    // Header has link to home
    const homeLink = page.locator('header a[href="/"]');
    await expect(homeLink).toBeAttached();

    // Header has link to feed
    const feedLink = page.locator('header a[href="/feed"]');
    await expect(feedLink).toBeAttached();
  });
});
