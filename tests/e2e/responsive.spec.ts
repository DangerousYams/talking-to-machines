import { test, expect } from '@playwright/test';

test.describe('Responsive layout', () => {
  test('landing page hides chapter hooks on mobile', async ({ page }) => {
    // Set a mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Chapter hooks use "hidden sm:inline" class — should be hidden on mobile
    const hooks = page.locator('.hidden.sm\\:inline');
    const count = await hooks.count();

    // All hook elements should be hidden (not visible)
    for (let i = 0; i < count; i++) {
      await expect(hooks.nth(i)).not.toBeVisible();
    }
  });

  test('landing page shows chapter hooks on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // On desktop, the chapter hooks should be visible
    const hooks = page.locator('.hidden.sm\\:inline');
    const count = await hooks.count();

    if (count > 0) {
      // At least some should be visible on desktop
      await expect(hooks.first()).toBeVisible();
    }
  });

  test('feed page works at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Page should still render correctly
    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });

  test('feed page works at desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/feed', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const body = await page.locator('body').innerText();
    expect(body.trim().length).toBeGreaterThan(0);
  });
});
