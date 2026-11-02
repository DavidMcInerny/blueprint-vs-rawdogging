import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { inspectBrandHome } from './contracts.mjs';

test('home renders the supplied brand title and no demo links', async ({ page }) => {
  const brand = JSON.parse(await readFile(new URL('../fixtures/T1/supplied-brand.json', import.meta.url), 'utf8'));
  await page.goto('/');
  await expect(page.getByTestId('app-title')).toBeVisible();
  const home = await inspectBrandHome(page, brand);
  expect(home.titleCount).toBe(1);
  expect(home.titleText).toBe(brand.name);
  expect(home.demoLinks).toEqual([]);
});
