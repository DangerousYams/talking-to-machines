import { test, expect } from '@playwright/test';
import { CHAPTERS, collectErrors, filterBenignErrors } from './helpers';

test.describe('Chapter widgets and break activities', () => {
  for (const ch of CHAPTERS) {
    test(`ch${ch.num} — page loads and has interactive widget`, async ({ page }) => {
      const errors = collectErrors(page);

      await page.goto(`/${ch.slug}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

      // Wait for at least one React island to hydrate (buttons appear)
      await page.waitForFunction(
        () => document.querySelectorAll('button').length > 0,
        null,
        { timeout: 30_000 },
      );

      // Should have interactive buttons from widgets
      const buttons = page.locator('button');
      expect(await buttons.count()).toBeGreaterThan(0);

      const realErrors = filterBenignErrors(errors);
      expect(realErrors, `Errors on /${ch.slug}: ${JSON.stringify(realErrors)}`).toHaveLength(0);
    });

    if (ch.breakName) {
      test(`ch${ch.num} — break section (#break) exists`, async ({ page }) => {
        await page.goto(`/${ch.slug}#break`, { waitUntil: 'domcontentloaded', timeout: 30_000 });

        // The break section should exist
        const breakSection = page.locator('#break');
        await expect(breakSection).toBeAttached({ timeout: 10_000 });

        // Break section should contain the break activity name or content
        const breakText = await breakSection.innerText();
        expect(breakText.trim().length).toBeGreaterThan(0);
      });
    }
  }

  test('bonus chapter — SycophancyTest and SweetTalker load', async ({ page }) => {
    const errors = collectErrors(page);

    await page.goto('/absolutely-youre-right', { waitUntil: 'domcontentloaded', timeout: 30_000 });

    // Wait for widget hydration
    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 0,
      null,
      { timeout: 30_000 },
    );

    expect(await page.locator('button').count()).toBeGreaterThan(0);

    // Break section exists
    const breakSection = page.locator('#break');
    await expect(breakSection).toBeAttached({ timeout: 10_000 });

    const realErrors = filterBenignErrors(errors);
    expect(realErrors).toHaveLength(0);
  });
});
