import AxeBuilder from '@axe-core/playwright';
import { test } from '@playwright/test';

test('neutral axe quality measurement', async ({ page }, testInfo) => {
  const routes = { T1: '/', T2: '/saved', T3: '/adapter-demo', T4: '/saved', T5: '/items' };
  const anchors = { T1: 'app-title', T2: 'saved-title-input', T3: 'adapter-kind', T4: 'saved-title-input', T5: 'item-search' };
  const task = process.env.EVAL_TASK;
  await page.goto(routes[task]);
  await page.getByTestId(anchors[task]).waitFor();
  const result = await new AxeBuilder({ page }).analyze();
  await testInfo.attach('neutral-axe', { body: JSON.stringify({ violations: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), violationCount: result.violations.length }), contentType: 'application/json' });
});
