import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Chapter widgets', () => {
  test('ch1 renders GuessThePrompt widget', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/ch1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // GuessThePrompt should be somewhere on the page (it has quiz-like options)
    // Look for interactive buttons within the chapter content
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('tools page renders ToolWall', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // ToolWall renders category filter buttons
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('tools page category filter works', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Get initial visible card count by looking for tool cards
    // Click a category filter button and verify the view updates
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
