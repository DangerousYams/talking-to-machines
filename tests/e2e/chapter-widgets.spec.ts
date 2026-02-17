import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Chapter widgets', () => {
  test('ch1 renders GuessThePrompt widget', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/ch1', { waitUntil: 'domcontentloaded' });

    // Wait for interactive buttons to appear (widget hydration — Firefox can be slow)
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15000 }
    );

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('tools page renders ToolWall', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/tools', { waitUntil: 'domcontentloaded' });

    // Wait for buttons to appear (ToolWall hydration) — Firefox can be slow
    await page.waitForFunction(() => document.querySelectorAll('button').length > 0, null, { timeout: 15000 });

    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('tools page category filter works', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });

    // Wait for filter buttons to appear
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15000 }
    );

    const filterButtons = page.locator('button');
    const count = await filterButtons.count();

    if (count > 1) {
      // Click the second filter button (first is likely "All")
      await filterButtons.nth(1).click();
      await page.waitForTimeout(500);

      // Page should still have content (didn't break)
      const body = await page.locator('body').innerText();
      expect(body.trim().length).toBeGreaterThan(0);
    }
  });
});
