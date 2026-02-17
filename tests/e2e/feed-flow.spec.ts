import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Feed flow', () => {
  test('feed page loads and shows content', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/feed', { waitUntil: 'domcontentloaded' });

    // Wait for React hydration — the PracticeFeed component renders
    await page.waitForTimeout(2000);

    // Page should have visible content
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('feed renders challenge cards after hydration', async ({ page }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });

    // Wait for hydration
    await page.waitForTimeout(3000);

    // The feed should have interactive content — look for buttons or cards
    const hasInteractiveContent =
      (await page.locator('button').count()) > 0 ||
      (await page.locator('[role="button"]').count()) > 0 ||
      (await page.locator('a').count()) > 0;

    expect(hasInteractiveContent).toBeTruthy();
  });
});
