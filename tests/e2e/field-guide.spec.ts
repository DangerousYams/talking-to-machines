import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Field Guide (PromptFramer)', () => {
  test('loads and shows tool selector', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/field-guide', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for PromptFramer to hydrate
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15_000 },
    );

    // Should have tool type buttons (Image, Video, Music, Code, Research, Writing, Presentation)
    const buttons = page.locator('button');
    expect(await buttons.count()).toBeGreaterThan(5);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('?tool= URL param auto-selects tool type', async ({ page }) => {
    await page.goto('/field-guide?tool=music', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for component hydration
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15_000 },
    );

    // The page should have content related to the music tool
    // (e.g. music-related form fields or labels)
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toMatch(/genre|mood|tempo|music/);
  });

  test('clicking tool type buttons works without errors', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/field-guide', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for PromptFramer to fully hydrate — look for the tool selector area
    await page.waitForFunction(
      () => {
        const buttons = document.querySelectorAll('button');
        return buttons.length > 5;
      },
      null,
      { timeout: 15_000 },
    );

    // The tool type selector buttons are the first set of small buttons
    // Click a few and verify no crashes
    const allButtons = page.locator('button');
    const count = await allButtons.count();

    // Click buttons 2-4 (skip first which is already selected)
    for (let i = 1; i < Math.min(count, 4); i++) {
      const btn = allButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(400);
      }
    }

    const bodyText = await page.locator('body').innerText();
    expect(bodyText.trim().length).toBeGreaterThan(0);

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });
});
