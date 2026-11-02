import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = fileURLToPath(new URL('../', import.meta.url));

test('eval runner dry-run resolves every task prompt without invoking the agent', () => {
  const result = spawnSync(process.execPath, ['evals/runner/run-eval.mjs', '--dry-run'], { cwd: repo, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /10 run\(s\) planned/);
  assert.match(result.stdout, /No agent was invoked/);
});

test('prepare-bases pins condition A to the starter SDK and handles Windows PATH casing', async () => {
  const source = await readFile(join(repo, 'evals/runner/prepare-bases.mjs'), 'utf8');
  // Regression: @latest created an SDK 58 app against the SDK 57 starter (plan B3 requires the same SDK).
  assert.match(source, /default@sdk-57/);
  assert.match(source, /requires the same SDK as the starter/);
  // Regression: setting env.PATH while Windows carries the key as "Path" silently dropped the Git Bash prefix.
  assert.match(source, /k\.toLowerCase\(\) === 'path'/);
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
