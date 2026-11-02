import { expect, test } from '@playwright/test';

const KEY = 'eval.savedItems.v1';

test('saved items persist across reload', async ({ page }) => {
  await page.goto('/saved');
  await page.getByTestId('saved-title-input').pressSequentially('Persist me');
  await page.getByTestId('saved-add-button').click();
  await expect(page.getByTestId('saved-item')).toHaveCount(1);
  await expect(page.getByTestId('saved-item').first()).toContainText('Persist me');
  await page.reload();
  await expect(page.getByTestId('saved-item')).toHaveCount(1);
  await expect(page.getByTestId('saved-item').first()).toContainText('Persist me');
});

test('failed save keeps the draft and shows an error', async ({ page }) => {
  await page.goto('/saved');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'eval.savedItems.v1') throw new Error('injected save failure');
      return original.call(this, key, value);
    };
  });
  await page.getByTestId('saved-title-input').pressSequentially('Draft to keep');
  await page.getByTestId('saved-add-button').click();
  await expect(page.getByTestId('saved-error')).toBeVisible();
  await expect(page.getByTestId('saved-title-input')).toHaveValue('Draft to keep');
  await expect(page.getByTestId('saved-item')).toHaveCount(0);
});

test('corrupt storage is survived and not overwritten', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, 'not valid json {');
  }, KEY);
  await page.goto('/saved');
  await expect(page.getByTestId('saved-corrupt-notice')).toBeVisible();
  await expect(page.getByTestId('saved-item')).toHaveCount(0);
  const stored = await page.evaluate((key) => localStorage.getItem(key), KEY);
  expect(stored).toBe('not valid json {');
});
