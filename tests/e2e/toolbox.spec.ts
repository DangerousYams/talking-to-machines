import { test, expect } from '@playwright/test';
import { collectErrors, filterBenignErrors } from './helpers';

test.describe('Toolbox page', () => {
  test('renders all three category sections', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/toolbox', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for component hydration
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 15_000 },
    );

    // Should have category headers
    const headings = page.locator('h2');
    const headingTexts = await headings.allInnerTexts();
    expect(headingTexts).toContain('Fun Stuff');
    expect(headingTexts).toContain('Actually Useful');
    expect(headingTexts).toContain('Quiz & Challenge');

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('filter pills are clickable without errors', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/toolbox', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for filter pills (4 buttons: All, Fun, Useful, Quiz)
    await page.waitForFunction(
      () => document.querySelectorAll('button').length >= 4,
      null,
      { timeout: 15_000 },
    );

    // Click each filter pill and verify page doesn't break
    for (const label of ['Fun Stuff', 'Actually Useful', 'Quiz & Challenge']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(300);

      const bodyText = await page.locator('body').innerText();
      expect(bodyText.trim().length).toBeGreaterThan(0);
    }

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });

  test('tool cards are clickable links', async ({ page }) => {
    await page.goto('/toolbox', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for cards to render
    await page.waitForFunction(
      () => document.querySelectorAll('a[href]').length > 10,
      null,
      { timeout: 15_000 },
    );

    // All tool cards should be <a> tags with href
    const cards = page.locator('a[href*="/ch"], a[href*="/field-guide"], a[href*="/absolutely"]');
    expect(await cards.count()).toBeGreaterThan(10);
  });
});
