import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { hashDirectory, inputIdentity, parseAgentOutput, plannedSamples, readRecords, summarizeRecords } from '../runner/protocol.mjs';
import { neutralQuality } from '../runner/neutral-quality.mjs';

const config = { tasks: ['T1', 'T2', 'T3', 'T4', 'T5'], conditions: { A: {}, B: {} }, runsPerTaskPerCondition: 5 };
const record = (task, condition, n, pass = false) => ({ runId: `${task}-${condition}-${n}`, task, condition, n, sampleValid: true, inputs: { fingerprint: 'frozen' }, score: { complete: true, pass }, usage: { totalTokens: 100, costUsd: 1 }, agentSeconds: 10 });
const complete = () => config.tasks.flatMap((task) => ['A', 'B'].flatMap((condition) => Array.from({ length: 5 }, (_, i) => record(task, condition, i + 1, condition === 'B'))));

test('full resumes the missing 40 samples after smoke and is idempotent', () => {
  const smoke = complete().filter((r) => r.n === 1);
  const pending = plannedSamples(config, smoke, { perCell: 5, fingerprint: 'frozen' });
  assert.equal(pending.length, 40);
  assert.ok(pending.every((r) => r.n > 1));
  assert.equal(new Set(pending.map((r) => `${r.task}/${r.condition}/${r.n}`)).size, 40);
  assert.deepEqual(plannedSamples(config, complete(), { perCell: 5, fingerprint: 'frozen' }), []);
});

test('invalid scoring attempts are retried; duplicate samples and changed inputs stop scheduling', () => {
  const bad = { ...record('T1', 'A', 1), sampleValid: false, error: 'scorer interrupted' };
  assert.equal(plannedSamples(config, [bad], { perCell: 1, fingerprint: 'frozen' }).length, 10);
  assert.throws(() => plannedSamples(config, [record('T1', 'A', 1), record('T1', 'A', 1)], { perCell: 5, fingerprint: 'frozen' }), /Duplicate/);
  assert.throws(() => plannedSamples(config, [record('T1', 'A', 1)], { perCell: 5, fingerprint: 'new inputs' }), /different inputs/);
  assert.throws(() => plannedSamples(config, [], { perCell: 1, tasks: ['T6'] }), /Unknown task/);
});

test('aggregate count cannot pass an incomplete or over-sampled task matrix', () => {
  const rs = complete();
  rs[0] = { ...rs[0], task: 'T2' };
  const summary = summarizeRecords(config, rs);
  assert.equal(summary.totals.A.runs, 25);
  assert.equal(summary.totals.B.runs, 25);
  assert.equal(summary.complete, false);
  assert.equal(summary.verdict, 'INCOMPLETE');
});

test('Gate 1 requires every token and wall-time value; missing evidence is unknown', () => {
  const rs = complete();
  assert.equal(summarizeRecords(config, rs).verdict, 'PASS');
  delete rs[0].usage.totalTokens;
  assert.match(summarizeRecords(config, rs).verdict, /^UNKNOWN/);
  rs[0].usage.totalTokens = 100;
  delete rs[0].agentSeconds;
  assert.equal(summarizeRecords(config, rs).costOk, null);
});

test('Gate 1 catches per-task regression and uses the statistical even median', () => {
  const rs = complete();
  for (const r of rs) if (r.task === 'T1') r.score.pass = r.condition === 'A';
  assert.equal(summarizeRecords(config, rs).verdict, 'FAIL');
  const half = rs.filter((r) => r.condition === 'A').slice(0, 2);
  half[0].agentSeconds = 2; half[1].agentSeconds = 8;
  assert.equal(summarizeRecords(config, half).totals.A.medianSeconds, 5);
});

test('usage includes both cache categories and preserves actual model metadata', () => {
  const parsed = parseAgentOutput(JSON.stringify({ usage: { input_tokens: 10, output_tokens: 20, cache_read_input_tokens: 1000, cache_creation_input_tokens: 200 }, modelUsage: { 'claude-opus-5-5': { inputTokens: 10 } }, total_cost_usd: 0.5, num_turns: 4 }), 'claude-opus-5-5');
  assert.equal(parsed.usage.totalTokens, 1230);
  assert.equal(parsed.usage.costUsd, 0.5);
  assert.deepEqual(parsed.actualModels, ['claude-opus-5-5']);
  assert.equal(parsed.metadataError, undefined);
  assert.match(parseAgentOutput('{"model":"opus"}', 'claude-opus-5-5').metadataError, /differs/);
  assert.equal(parseAgentOutput('{"usage":{"input_tokens":1,"output_tokens":2}}').usage.totalTokens, null);
  assert.match(parseAgentOutput('not json').metadataError, /not JSON/);
});

test('identities detect snapshot mutation and ignore generated dependencies', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'blueprint-eval-identity-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const protocol = { id: 'test', sourceRevision: 'full-immutable-commit', directory: 'bases/test' };
  const cfg = { protocol, conditions: { A: { base: 'bases/test/A' }, B: { base: 'bases/test/B' } } };
  for (const part of ['source', 'A', 'B']) { await mkdir(path.join(dir, 'bases/test', part), { recursive: true }); await writeFile(path.join(dir, 'bases/test', part, 'package.json'), '{}'); }
  for (const part of ['tasks', 'fixtures', 'hidden', 'runner']) { await mkdir(path.join(dir, part)); await writeFile(path.join(dir, part, 'input'), part); }
  await writeFile(path.join(dir, 'bases/test/manifest.json'), JSON.stringify({ protocolId: 'test', sourceRevision: protocol.sourceRevision, sourceTree: 'tree', sourceSha256: await hashDirectory(path.join(dir, 'bases/test/source')), A: { sha256: await hashDirectory(path.join(dir, 'bases/test/A')) }, B: { sha256: await hashDirectory(path.join(dir, 'bases/test/B')) } }));
  const before = await inputIdentity(dir, cfg);
  await mkdir(path.join(dir, 'bases/test/A/node_modules'));
  await writeFile(path.join(dir, 'bases/test/A/node_modules/ignored'), 'generated');
  assert.equal((await inputIdentity(dir, cfg)).fingerprint, before.fingerprint);
  await writeFile(path.join(dir, 'tasks/input'), 'changed prompt');
  assert.notEqual((await inputIdentity(dir, cfg)).fingerprint, before.fingerprint);
  await writeFile(path.join(dir, 'bases/test/B/package.json'), '{"changed":true}');
  await assert.rejects(inputIdentity(dir, cfg), /Base B changed/);
});

test('neutral lint ignores app rules and neutral TypeScript catches a strictness escape', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'blueprint-eval-neutral-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await writeFile(path.join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { strict: false, types: [] }, include: ['index.ts'] }));
  await writeFile(path.join(dir, 'eslint.config.mjs'), 'throw new Error("app rules must never load")');
  await writeFile(path.join(dir, 'index.ts'), 'export function identity(value) { debugger; return value; }\n');
  const quality = await neutralQuality(dir);
  assert.ok(quality.typeErrors >= 1);
  assert.equal(quality.lintErrors, 1);
  assert.equal(quality.lintMessages[0].messages[0].ruleId, 'no-debugger');
});

test('missing app is a completed acceptance failure, never a false harness pass', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'blueprint-eval-score-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const out = path.join(dir, 'score.json');
  const scorer = fileURLToPath(new URL('../runner/score.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [scorer, 'T1', path.join(dir, 'missing'), out], { encoding: 'utf8' });
  assert.equal(result.status, 1, result.stderr);
  const score = JSON.parse(await readFile(out, 'utf8'));
  assert.equal(score.complete, true);
  assert.equal(score.pass, false);
  assert.equal(score.checks[0].pass, false);
});

test('truncated result logs fail clearly instead of silently resampling', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'blueprint-eval-results-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, 'results.jsonl');
  await writeFile(file, '{}\n{"interrupted":');
  await assert.rejects(readRecords(file), /line 2/);
});
