import { expect, test } from '@playwright/test';

const V1 = 'eval.savedItems.v1';
const V2 = 'eval.savedItems.v2';

test('v1 data migrates to v2 verbatim, v1 untouched, idempotent', async ({ page }) => {
  await page.addInitScript(([v1]) => {
    if (!localStorage.getItem(v1)) localStorage.setItem(v1, JSON.stringify(['First item', 'Second item']));
  }, [V1]);
  await page.goto('/saved');
  await expect(page.getByTestId('saved-item')).toHaveCount(2);
  await expect(page.getByTestId('saved-item').nth(0)).toContainText('First item');
  await expect(page.getByTestId('saved-item').nth(1)).toContainText('Second item');

  const v2 = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), V2);
  expect(Array.isArray(v2)).toBe(true);
  expect(v2.map((i) => i.title)).toEqual(['First item', 'Second item']);
  for (const item of v2) {
    expect(typeof item.id).toBe('string');
    expect(typeof item.createdAt).toBe('number');
  }
  const v1After = await page.evaluate((k) => localStorage.getItem(k), V1);
  expect(JSON.parse(v1After)).toEqual(['First item', 'Second item']);

  await page.getByTestId('saved-title-input').pressSequentially('Third item');
  await page.getByTestId('saved-add-button').click();
  await expect(page.getByTestId('saved-item')).toHaveCount(3);

  await page.reload();
  await expect(page.getByTestId('saved-item')).toHaveCount(3);
  const v2After = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '[]'), V2);
  expect(v2After).toHaveLength(3);
});

test('corrupt v1 writes no v2 and is not overwritten', async ({ page }) => {
  await page.addInitScript(([v1]) => {
    localStorage.setItem(v1, 'corrupt {');
    localStorage.removeItem('eval.savedItems.v2');
  }, [V1]);
  await page.goto('/saved');
  await expect(page.getByTestId('saved-corrupt-notice')).toBeVisible();
  const v1After = await page.evaluate((k) => localStorage.getItem(k), V1);
  expect(v1After).toBe('corrupt {');
  const v2 = await page.evaluate((k) => localStorage.getItem(k), V2);
  expect(v2).toBeNull();
});
