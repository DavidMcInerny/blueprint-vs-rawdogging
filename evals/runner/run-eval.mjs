#!/usr/bin/env node
import { access, appendFile, cp, mkdir, open, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyDir, isWin, npm } from './lib.mjs';
import { inputIdentity, parseAgentOutput, plannedSamples, readJson, readRecords, sampleKey, sha256 } from './protocol.mjs';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const config = await readJson(path.join(evalsDir, 'config.json'));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${name} needs a value`); return args[i + 1]; };
const allowed = new Set(['--dry-run', '--smoke', '--full', '--task', '--condition', '--skip-web']);
for (let i = 0; i < args.length; i++) { if (!allowed.has(args[i])) throw new Error(`Unknown argument ${args[i]}`); if (['--task', '--condition'].includes(args[i])) i++; }
if (args.includes('--smoke') && args.includes('--full')) throw new Error('Choose --smoke or --full.');
const dryRun = args.includes('--dry-run');
const skipWeb = args.includes('--skip-web');
const tasks = opt('--task') ? [opt('--task')] : config.tasks;
const conditions = opt('--condition') ? [opt('--condition')] : Object.keys(config.conditions);
const perCell = args.includes('--full') ? config.runsPerTaskPerCondition : config.smokeRunsPerTaskPerCondition;
const exists = async (file) => access(file).then(() => true, () => false);
const cmd = isWin && config.agent.command === 'claude' ? 'claude.exe' : config.agent.command;
const cli = spawnSync(cmd, ['--version'], { encoding: 'utf8', timeout: 10_000 });
if (cli.status !== 0) throw new Error(`Agent CLI unavailable: ${cli.error?.message ?? cli.stderr}`);
if (config.agent.args[config.agent.args.indexOf('--model') + 1] !== config.agent.model || config.agent.args[config.agent.args.indexOf('--effort') + 1] !== config.agent.effort) throw new Error('Configured model/effort does not match CLI arguments.');

async function promptFor(task, condition) {
  const variant = path.join(evalsDir, `tasks/${task}.${condition}.md`);
  const file = await exists(variant) ? variant : path.join(evalsDir, `tasks/${task}.md`);
  const text = await readFile(file, 'utf8');
  const idx = text.indexOf('## Prompt');
  if (idx < 0) throw new Error(`${file} has no ## Prompt section.`);
  return text.slice(idx + '## Prompt'.length).trim() + '\n';
}

const resultsDir = path.join(evalsDir, 'results');
const resultsFile = path.join(resultsDir, 'results.jsonl');
const records = await readRecords(resultsFile);
let inputs;
try { inputs = await inputIdentity(evalsDir, config); }
catch (error) {
  if (!dryRun) throw error;
  console.error(`NOT READY: ${error.message}`);
  inputs = { fingerprint: undefined };
  process.exitCode = 1;
}
let matrix = plannedSamples(config, records, { perCell, tasks, conditions, fingerprint: inputs.fingerprint });
for (const { task, condition } of matrix) await promptFor(task, condition);
if (dryRun) {
  console.log(`Dry run: ${matrix.length} missing samples, target ${perCell} per cell. No evaluator invoked.`);
  console.log(`CLI: ${cli.stdout.trim()}; model ${config.agent.model}; effort ${config.agent.effort}.`);
  console.log(`Input fingerprint: ${inputs.fingerprint ?? 'not prepared'}`);
  process.exit(process.exitCode ?? 0);
}

await mkdir(resultsDir, { recursive: true });
const lockFile = path.join(resultsDir, 'runner.lock');
let lock;
try { lock = await open(lockFile, 'wx'); }
catch (error) { if (error.code === 'EEXIST') throw new Error(`Runner lock exists: ${lockFile}. Verify its owner has stopped before removing a stale lock.`); throw error; }
await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString(), fingerprint: inputs.fingerprint }) + '\n');

async function prepareWorkspace(task, condition, workspace) {
  const started = Date.now();
  await mkdir(workspace, { recursive: true });
  const appDir = task === 'T1' ? path.join(workspace, 'app-under-test') : workspace;
  if (task === 'T1') {
    if (condition === 'B') await copyDir(path.join(evalsDir, config.protocol.directory, 'source'), workspace, ['evals', '.github']);
  } else {
    await copyDir(path.join(evalsDir, config.conditions[condition].base), workspace);
  }
  const fixtures = path.join(evalsDir, 'fixtures', task);
  if (await exists(fixtures)) await copyDir(fixtures, workspace);
  if (task !== 'T1') {
    const r = npm(['ci'], workspace, { timeoutMs: 20 * 60_000 });
    if (r.status !== 0 || r.error) throw new Error(`Dependency setup failed: ${r.error?.message ?? r.status}`);
  }
  return { appDir, setupSeconds: (Date.now() - started) / 1000 };
}

async function recoverableAttempt(sample) {
  const runs = path.join(evalsDir, 'runs');
  if (!(await exists(runs))) return null;
  for (const entry of (await readdir(runs)).sort().reverse()) {
    const file = path.join(runs, entry, 'attempt.json');
    if (!(await exists(file))) continue;
    const record = await readJson(file);
    if (record.inputs?.fingerprint === inputs.fingerprint && sampleKey(record) === sampleKey(sample) && record.agentFinished && !record.error && !records.some((r) => r.runId === record.runId && r.sampleValid)) return record;
  }
  return null;
}

try {
  // The lock may have become available after another runner appended results.
  records.splice(0, records.length, ...await readRecords(resultsFile));
  matrix = plannedSamples(config, records, { perCell, tasks, conditions, fingerprint: inputs.fingerprint });
  if (records.some((r) => r.sampleValid && r.cliVersion !== cli.stdout.trim())) throw new Error('Agent CLI version changed during the experiment. Preserve existing results and resolve the protocol change first.');
  for (const sample of matrix) {
    // Revalidate before each consequential invocation, so a changed prompt,
    // scorer or snapshot can never silently enter an experiment in progress.
    if ((await inputIdentity(evalsDir, config)).fingerprint !== inputs.fingerprint) throw new Error('Inputs changed during evaluation. Stop rather than mix protocols.');
    let record = await recoverableAttempt(sample);
    const reused = Boolean(record);
    const runId = record?.runId ?? `${sample.task}-${sample.condition}-${sample.n}-${randomUUID()}`;
    const runDir = path.join(evalsDir, 'runs', runId);
    const workspace = path.join(runDir, 'workspace');
    const attemptFile = path.join(runDir, 'attempt.json');
    record ??= { runId, ...sample, startedAt: new Date().toISOString(), requestedModel: config.agent.model, effort: config.agent.effort, cliVersion: cli.stdout.trim(), nodeVersion: process.version, platform: process.platform, agentArgs: config.agent.args, inputs };
    console.log(`${reused ? 'Resume scoring' : 'Run'} ${runId}`);
    await mkdir(runDir, { recursive: true });
    let allowanceFailure = false;
    try {
      if (!reused) {
        Object.assign(record, await prepareWorkspace(sample.task, sample.condition, workspace));
        const prompt = await promptFor(sample.task, sample.condition);
        record.promptSha256 = sha256(prompt);
        await writeFile(attemptFile, JSON.stringify(record, null, 2) + '\n');
        const started = Date.now();
        const r = spawnSync(cmd, config.agent.args, { cwd: workspace, input: prompt, encoding: 'utf8', timeout: config.agent.timeoutMinutes * 60_000, maxBuffer: 64 * 1024 * 1024 });
        const raw = r.stdout ?? '';
        await writeFile(path.join(runDir, 'agent-output.txt'), raw);
        await writeFile(path.join(runDir, 'agent-stderr.txt'), r.stderr ?? '');
        Object.assign(record, { agentSeconds: (Date.now() - started) / 1000, agentExit: r.status, agentSignal: r.signal }, parseAgentOutput(raw, config.agent.model));
        allowanceFailure = /usage limit|rate_limit_error|you.ve (?:hit|reached|used).*limit|out of extra usage/i.test(raw + (r.stderr ?? ''));
        if (r.error) throw new Error(`Agent process failed: ${r.error.message}`);
        if (allowanceFailure) throw new Error('Subscription allowance exhausted; stop this batch without changing billing or credentials.');
        if (record.metadataError) throw new Error(record.metadataError);
        record.agentFinished = true;
        await writeFile(attemptFile, JSON.stringify(record, null, 2) + '\n');
      }
      const scoreOut = path.join(runDir, 'score.json');
      const scorer = spawnSync(process.execPath, [path.join(evalsDir, 'runner/score.mjs'), sample.task, record.appDir, scoreOut, ...(skipWeb ? ['--skip-web'] : [])], { cwd: evalsDir, stdio: 'inherit', timeout: 45 * 60_000 });
      if (scorer.error) throw new Error(`Scorer failed: ${scorer.error.message}`);
      record.score = await readJson(scoreOut);
      if (!record.score.complete && !skipWeb) throw new Error(`Scoring incomplete: ${record.score.scoringError ?? 'required checks were skipped'}`);
      record.score.pass = record.score.pass && record.agentExit === 0 && record.agentResult?.isError !== true;
      record.sampleValid = record.score.complete === true;
      record.finishedAt = new Date().toISOString();
      await writeFile(attemptFile, JSON.stringify(record, null, 2) + '\n');
    } catch (error) {
      record.error = error.message;
      record.sampleValid = false;
      console.error(`${runId}: ${record.error}`);
      // Keep the agent-complete checkpoint intact if only scoring failed.
      if (!record.agentFinished) await writeFile(attemptFile, JSON.stringify(record, null, 2) + '\n');
    }
    await appendFile(resultsFile, JSON.stringify(record) + '\n');
    records.push(record);
    console.log(`${runId}: ${record.sampleValid ? record.score.pass ? 'PASS' : 'FAIL' : 'UNSCORED'}`);
    if (allowanceFailure || record.error) { process.exitCode = 1; break; }
  }
} finally {
  await lock.close();
  await rm(lockFile);
}
