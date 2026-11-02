import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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

test('the pinned creation prompt and protocol match the frozen comparison runtime', async () => {
  const config = JSON.parse(await readFile(join(repo, 'evals/config.json'), 'utf8'));
  const lockResult = spawnSync('git', ['show', `${config.protocol.sourceRevision}:starters/expo/package-lock.json`], { cwd: repo, encoding: 'utf8' });
  assert.equal(lockResult.status, 0, lockResult.stderr);
  const lock = JSON.parse(lockResult.stdout);
  const prompt = await readFile(join(repo, 'evals/tasks/T1.A.md'), 'utf8');
  assert.ok(prompt.includes(`create-expo-app@${config.protocol.createExpoApp}`));
  assert.ok(prompt.includes(config.protocol.template));
  assert.ok(prompt.includes(lock.packages['node_modules/expo'].version));
  assert.ok(prompt.includes(lock.packages['node_modules/react-native'].version));
  assert.match(config.protocol.sourceRevision, /^[a-f0-9]{40}$/);
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
