import { test, expect } from '@playwright/test';
import brand from '../brand.json';
import { navigation } from '../src/config/navigation';
import AxeBuilder from '@axe-core/playwright';

test('appearance persists and explicit choice wins over system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await page.goto('/settings');
  await page.getByRole('radio', { name: 'Dark', exact: true }).click(); await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('shell.preferences.v1') ?? '{}').appearance)).toBe('dark');
  await page.reload(); await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked();
  await page.emulateMedia({ colorScheme: 'light' }); await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: 'System', exact: true }).click(); await page.emulateMedia({ colorScheme: 'dark' }); await expect(page.getByRole('radio', { name: 'System', exact: true })).toBeChecked(); await expect.poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--background').trim())).toBe(brand.dark.background); await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', brand.dark.background);
});

test('accessible pages, no horizontal overflow and real 404', async ({ page }) => {
  for (const route of [...Object.keys(navigation).map((key) => key === 'home' ? '/' : '/' + key), '/support']) {
    await page.goto(route); await expect(page.getByRole('main')).toBeVisible(); await page.getByRole('main').getByRole('heading').first().waitFor();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  const response = await page.goto('/does-not-exist'); expect(response?.status()).toBe(404); await expect(page.getByText('Page not found', { exact: true })).toBeVisible();
});

test('navigation labels fit inside their controls at narrow widths', async ({ page }) => {
  await page.goto('/');
  const navigationActions = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button');
  await expect(navigationActions).toHaveCount(Object.keys(navigation).length);
  expect(await navigationActions.evaluateAll(tabs => tabs.every(tab => [...tab.querySelectorAll('*')].filter(element => element.children.length === 0 && element.textContent?.trim() && !element.closest('[aria-hidden="true"]')).every(label => label.getBoundingClientRect().bottom <= tab.getBoundingClientRect().bottom + 1)))).toBe(true);
});

test('motion preference persists, and corrupt preferences remain intact until a successful retry', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Reduce motion', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Reduce motion', exact: true })).toBeChecked();
  await page.evaluate(() => localStorage.setItem('shell.preferences.v1', '{broken'));
  await page.reload();
  await expect(page.getByText('Stored data was preserved.', { exact: false })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('shell.preferences.v1'))).toBe('{broken');
  await page.getByRole('button', { name: 'Retry loading preferences' }).click();
  expect(await page.evaluate(() => localStorage.getItem('shell.preferences.v1'))).toBe('{broken');
  await page.evaluate(() => localStorage.setItem('shell.preferences.v1', JSON.stringify({ version: 1, appearance: 'system', motion: 'system' })));
  await page.getByRole('button', { name: 'Retry loading preferences' }).click();
  await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeEnabled();
});

test('keyboard appearance selection', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'System', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Light', exact: true })).toBeChecked();
});
