import { expect, test } from '@playwright/test';

test('settings round-trip through the memory adapter', async ({ page }) => {
  await page.goto('/adapter-demo');
  await expect(page.getByTestId('adapter-kind')).toContainText('memory');
  await page.getByTestId('adapter-name-input').pressSequentially('Ada');
  await page.getByTestId('adapter-save-button').click();
  await expect(page.getByTestId('adapter-saved-name')).toContainText('Ada');
});
