import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { activateFocusedFilter, tabTo } from './contracts.mjs';

test('search and category filter combine; empty state shows', async ({ page }) => {
  const externalRequests = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') externalRequests.push(req.url());
  });
  await page.goto('/items');
  await expect(page.getByTestId('item-row')).toHaveCount(12);

  await page.getByTestId('item-search').pressSequentially('apple');
  await expect(page.getByTestId('item-row')).toHaveCount(2);

  await page.getByTestId('item-category-food').click();
  await expect(page.getByTestId('item-row')).toHaveCount(1);
  await expect(page.getByTestId('item-row').first()).toContainText('Apple pie');

  await page.getByTestId('item-search').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.getByTestId('item-search').pressSequentially('zzzz-nothing');
  await expect(page.getByTestId('item-row')).toHaveCount(0);
  await expect(page.getByTestId('item-empty')).toBeVisible();

  expect(externalRequests).toEqual([]);
});

test('no axe violations; search is keyboard reachable', async ({ page }) => {
  await page.goto('/items');
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  expect(await tabTo(page, page.getByTestId('item-search'))).toBe(true);
  await expect(page.getByTestId('item-search')).toBeFocused();
  await page.keyboard.type('trail');
  await expect(page.getByTestId('item-row')).toHaveCount(2);
});

test('category controls are reachable and operable with the keyboard', async ({ page }) => {
  await page.goto('/items');
  await expect(page.getByTestId('item-row')).toHaveCount(12);
  for (const category of ['food', 'tools', 'outdoors', 'all']) {
    const filter = page.getByTestId(`item-category-${category}`);
    expect(await tabTo(page, filter)).toBe(true);
    await activateFocusedFilter(page, filter);
    await expect(page.getByTestId('item-row')).toHaveCount(category === 'all' ? 12 : 4);
  }
});

test('renders with reduced motion', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/items');
  await expect(page.getByTestId('item-row')).toHaveCount(12);
  await context.close();
});
