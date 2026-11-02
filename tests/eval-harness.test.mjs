import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { plannedSamples } from '../evals/runner/protocol.mjs';

const repo = fileURLToPath(new URL('../', import.meta.url));

test('evaluation planning resolves every prompt without an installed agent or prepared bases', async () => {
  const config = JSON.parse(await readFile(join(repo, 'evals/config.json'), 'utf8'));
  const matrix = plannedSamples(config, [], { perCell: config.smokeRunsPerTaskPerCondition });
  assert.equal(matrix.length, config.tasks.length * Object.keys(config.conditions).length);
  assert.equal(new Set(matrix.map(({ task, condition }) => `${task}/${condition}`)).size, matrix.length);
  for (const { task, condition } of matrix) {
    const variant = join(repo, `evals/tasks/${task}.${condition}.md`);
    const prompt = await readFile(variant, 'utf8').catch((error) => {
      if (error.code !== 'ENOENT') throw error;
      return readFile(join(repo, `evals/tasks/${task}.md`), 'utf8');
    });
    assert.match(prompt, /## Prompt\s+\S/);
  }
});

test('the creation protocol and prompt pin compatible scaffold and runtime versions', async () => {
  const config = JSON.parse(await readFile(join(repo, 'evals/config.json'), 'utf8'));
  const prompt = await readFile(join(repo, 'evals/tasks/T1.A.md'), 'utf8');
  assert.ok(prompt.includes(`create-expo-app@${config.protocol.createExpoApp}`));
  assert.ok(prompt.includes(config.protocol.template));
  const expo = prompt.match(/pin Expo to `([0-9]+\.[0-9]+\.[0-9]+)`/)?.[1];
  const native = prompt.match(/React Native to\s+`([0-9]+\.[0-9]+\.[0-9]+)`/)?.[1];
  assert.ok(expo, 'Creation must pin an exact Expo patch before scoring');
  assert.ok(native, 'Creation must pin an exact React Native version before scoring');
  assert.equal(expo.split('.')[0], config.protocol.template.match(/@([0-9]+)\./)?.[1]);
  assert.match(config.protocol.createExpoApp, /^[0-9]+\.[0-9]+\.[0-9]+$/);
  assert.match(config.protocol.sourceRevision, /^[a-f0-9]{40}$/);
  // Actual frozen-lock/snapshot equivalence is verified by immutable preparation.
  // General toolkit tests must also run in ordinary shallow checkouts/source packs.
});

test('scorer serves a production web export, not the Metro dev server', async () => {
  // Regression (validation run, 2 Nov 2026): scoring against `expo start --web`
  // intermittently lost Playwright interactions before hydration and failed a
  // correct T3 implementation. The starter's own e2e serves an export instead.
  const source = await readFile(join(repo, 'evals/runner/score.mjs'), 'utf8');
  assert.match(source, /expo.*export.*--platform.*web/);
  assert.match(source, /serve-dist\.mjs/);
  assert.doesNotMatch(source, /'expo',\s*'start'/);
});
