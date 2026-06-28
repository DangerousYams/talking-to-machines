import { test, expect, type Page } from '@playwright/test';
import { sorterTasks, mapRounds, checkpointScenarios, kdsMeta, placementQuiz } from '../../src/data/ladder';

const SHOTS = 'tests/results/ladder-shots';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

/** Skip placement and land on the map. */
async function skipToMap(page: Page) {
  await page.goto('/ladder');
  await page.getByRole('button', { name: 'Skip, start at the bottom' }).click();
  await expect(page.getByText('The four levels of AI Thinking')).toBeVisible();
}

async function openCard(page: Page, title: string) {
  await page.getByRole('button', { name: new RegExp(title) }).click();
}

test.describe('The Ladder — Ascent 1', () => {
  test('welcome and placement quiz place the learner', async ({ page }) => {
    await page.goto('/ladder');
    await expect(page.getByText('Stop quoting machines.')).toBeVisible();
    await shot(page, '01-welcome');

    await page.getByRole('button', { name: 'Find my level →' }).click();
    for (const q of placementQuiz) {
      await expect(page.getByText(q.question)).toBeVisible();
      await page.getByRole('button', { name: q.options[0].label }).click();
    }
    await expect(page.getByText(/You're starting as a/)).toBeVisible();
    await expect(page.getByText('Quoter', { exact: true })).toBeVisible();
    await shot(page, '02-placement-result');

    await page.getByRole('button', { name: 'See the ladder →' }).click();
    await expect(page.getByText('LEVEL 4')).toBeVisible();
    await expect(page.getByText('You are here')).toBeVisible();
    await shot(page, '03-map');
  });

  test('concept slides advance and stamp the checklist', async ({ page }) => {
    await skipToMap(page);
    await openCard(page, 'Three moves, on repeat');
    await expect(page.getByText('Choose', { exact: true })).toBeVisible();
    await shot(page, '04-concept-three-moves');
    await page.getByRole('button', { name: 'Got it →' }).click();
    // Auto-advances to the Loop Trainer
    await expect(page.getByText('One task.')).toBeVisible();
    await shot(page, '05-loop-pick');
  });

  test('sorter: full 12 rounds, perfect run', async ({ page }) => {
    await skipToMap(page);
    await openCard(page, 'The Sorter');
    for (let i = 0; i < sorterTasks.length; i++) {
      const t = sorterTasks[i];
      await expect(page.getByText(t.task)).toBeVisible();
      await page.getByRole('button', { name: kdsMeta[t.answer].label, exact: true }).click();
      await expect(page.getByText(t.why)).toBeVisible();
      if (i === 0) await shot(page, '06-sorter-verdict');
      await page.getByRole('button', { name: i + 1 >= sorterTasks.length ? 'See my score →' : 'Next →' }).click();
    }
    await expect(page.getByText(`12 / ${sorterTasks.length}`)).toBeVisible();
    await shot(page, '07-sorter-result');
    await page.getByRole('button', { name: 'Continue →' }).click();
  });

  test('map picker: full 8 rounds, perfect run', async ({ page }) => {
    await skipToMap(page);
    await openCard(page, 'The Map Picker');
    for (let i = 0; i < mapRounds.length; i++) {
      const r = mapRounds[i];
      await expect(page.getByText(r.scenario)).toBeVisible();
      const correct = r.options.find((o) => o.correct)!;
      const escaped = correct.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await page.getByRole('button', { name: new RegExp(`^${escaped}`) }).click();
      await expect(page.getByText(r.lesson)).toBeVisible();
      if (i === 0) await shot(page, '08-picker-verdict');
      await page.getByRole('button', { name: i + 1 >= mapRounds.length ? 'See my score →' : 'Next →' }).click();
    }
    await expect(page.getByText(`8 / ${mapRounds.length}`)).toBeVisible();
    await shot(page, '09-picker-result');
  });

  test('loop trainer: three live AI passes climb the meter', async ({ page }) => {
    test.setTimeout(240_000);
    await skipToMap(page);
    await openCard(page, 'The Loop Trainer');

    await page.getByRole('button', { name: /landlord/ }).click();
    await page.locator('textarea.ld-input').fill('write an email to my landlord about the broken heater');
    await page.getByRole('button', { name: 'Run pass 1 →' }).click();

    // Pass 1 scored → move chips appear
    await expect(page.getByRole('button', { name: /Ask what it held back/ })).toBeVisible({ timeout: 90_000 });
    await shot(page, '10-loop-pass1-scored');

    await page.getByRole('button', { name: /Ask what it held back/ }).click();
    await expect(page.getByRole('button', { name: /Humanize it/ })).toBeVisible({ timeout: 90_000 });
    await shot(page, '11-loop-pass2-scored');

    await page.getByRole('button', { name: /Humanize it/ }).click();
    await expect(page.getByRole('button', { name: 'See the climb →' })).toBeVisible({ timeout: 90_000 });
    await page.getByRole('button', { name: 'See the climb →' }).click();
    await expect(page.getByText('quality points')).toBeVisible();
    await shot(page, '12-loop-result');
    await page.getByRole('button', { name: 'Continue →' }).click();
  });

  test('checkpoint: routing + live AI grading earns the Curator stamp', async ({ page }) => {
    test.setTimeout(180_000);
    await skipToMap(page);
    await openCard(page, 'Checkpoint: Curator');
    await expect(page.getByText('Earn the')).toBeVisible();
    await shot(page, '13-checkpoint-intro');
    await page.getByRole('button', { name: 'Start →' }).click();

    for (let i = 0; i < checkpointScenarios.length; i++) {
      const sc = checkpointScenarios[i];
      await expect(page.getByText(sc.scenario)).toBeVisible();
      await page.getByRole('button', { name: sc.toolOptions[sc.correctTool], exact: true }).click();
      await page.getByRole('button', { name: kdsMeta[sc.correctKds].label, exact: true }).click();
      await expect(page.getByText(sc.note)).toBeVisible();
      if (i === 0) await shot(page, '14-checkpoint-route');
      await page.getByRole('button', { name: i + 1 >= checkpointScenarios.length ? 'Part 2 →' : 'Next →' }).click();
    }

    await expect(page.getByText('Plan one task through the Loop.')).toBeVisible();
    await page.locator('textarea.ld-input').fill(
      'My weekly investor update email. I would use Claude for the draft. Pass 1: draft from my bullet points with last month\'s update pasted in as an example of good. Pass 2: ask Claude what it held back, push for the stronger version, and cross-check the draft in Gemini to compare. Pass 3: cut it in half, strip the corporate varnish, and edit until it sounds like me, not the machine.'
    );
    await shot(page, '15-checkpoint-plan');
    await page.getByRole('button', { name: 'Grade my plan →' }).click();

    // Live AI grade — expect a pass with this plan
    await expect(page.getByText('Checkpoint · Verdict')).toBeVisible({ timeout: 90_000 });
    await shot(page, '16-checkpoint-verdict');
    await expect(page.getByText('Curator', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Back to the ladder →' }).click();

    // The map should now show the earned stamp
    await expect(page.getByText('Stamped').or(page.getByText('Earned'))).toBeVisible();
    await shot(page, '17-map-stamped');
  });
});
