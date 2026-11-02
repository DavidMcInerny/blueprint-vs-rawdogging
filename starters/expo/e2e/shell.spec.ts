import { test, expect } from '@playwright/test';
import brand from '../brand.json';
import { navigation } from '../src/config/navigation';
import AxeBuilder from '@axe-core/playwright';
test('keyboard appearance selection', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'System', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Light', exact: true })).toBeChecked();
});
