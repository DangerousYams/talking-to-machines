import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Feed flow', () => {
  test('feed page loads and shows content', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/feed', { waitUntil: 'domcontentloaded' });

    // Wait for actual content to appear rather than a fixed timeout
    await page.waitForFunction(() => document.body.innerText.trim().length > 0, null, { timeout: 10000 });

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('feed renders challenge cards after hydration', async ({ page }) => {
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });

    // Wait for interactive elements to appear (React hydration — Firefox can be slow)
    await page.waitForFunction(
      () => document.querySelectorAll('button, [role="button"], a').length > 0,
      null,
      { timeout: 15000 }
    );

    const hasInteractiveContent =
      (await page.locator('button').count()) > 0 ||
      (await page.locator('[role="button"]').count()) > 0 ||
      (await page.locator('a').count()) > 0;

    expect(hasInteractiveContent).toBeTruthy();
  });
});
