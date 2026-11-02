#!/usr/bin/env node
// Phase 1 evaluation runner (plan Appendix B). See ../DECISIONS.md.
// Usage:
//   node run-eval.mjs --dry-run
//   node run-eval.mjs --smoke [--task T2] [--condition A|B] [--skip-web]
//   node run-eval.mjs --full  [--task T2] [--condition A|B] [--skip-web]
import { access, appendFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { copyDir, isWin, npm } from './lib.mjs';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(evalsDir, '..');
const config = JSON.parse(await readFile(path.join(evalsDir, 'config.json'), 'utf8'));

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipWeb = args.includes('--skip-web');
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const tasks = opt('--task') ? [opt('--task')] : config.tasks;
const conditions = opt('--condition') ? [opt('--condition')] : Object.keys(config.conditions);
const perCell = args.includes('--full') ? config.runsPerTaskPerCondition : config.smokeRunsPerTaskPerCondition;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function promptFor(task, condition) {
  const variant = path.join(evalsDir, `tasks/${task}.${condition}.md`);
  const file = (await exists(variant)) ? variant : path.join(evalsDir, `tasks/${task}.md`);
  const text = await readFile(file, 'utf8');
  const idx = text.indexOf('## Prompt');
  if (idx < 0) throw new Error(`${file} has no ## Prompt section.`);
  return text.slice(idx + '## Prompt'.length).trim() + '\n';
}

async function copyFixtures(task, workspace) {
  const fixtureDir = path.join(evalsDir, 'fixtures', task);
  if (await exists(fixtureDir)) await copyDir(fixtureDir, workspace);
}

async function prepareWorkspace(task, condition, workspace) {
  const started = Date.now();
  await mkdir(workspace, { recursive: true });
  let appDir = workspace;
  if (task === 'T1' && condition === 'A') {
    await cp(path.join(evalsDir, 'fixtures/T1/supplied-brand.json'), path.join(workspace, 'supplied-brand.json'));
    appDir = path.join(workspace, 'app-under-test');
  } else if (task === 'T1' && condition === 'B') {
    // Foundation checkout WITHOUT evals/tooling state the agent must not see.
    await copyDir(repo, workspace, ['evals', '.github']);
    await cp(path.join(evalsDir, 'fixtures/T1/supplied-brand.json'), path.join(workspace, 'supplied-brand.json'));
    appDir = path.join(workspace, 'app-under-test');
  } else {
    const base = path.join(evalsDir, config.conditions[condition].base);
    if (!(await exists(path.join(base, 'package.json')))) {
      throw new Error(`Base for condition ${condition} missing. Run: node evals/runner/prepare-bases.mjs`);
    }
    await copyDir(base, workspace);
    await copyFixtures(task, workspace);
    const hasLock = await exists(path.join(workspace, 'package-lock.json'));
    const r = npm([hasLock ? 'ci' : 'install'], workspace, { timeoutMs: 20 * 60 * 1000 });
    if (r.status !== 0) throw new Error(`dependency install failed in ${workspace}`);
  }
  return { appDir, setupSeconds: Math.round((Date.now() - started) / 1000) };
}

function runAgent(prompt, workspace, outFile) {
  const started = Date.now();
  const cmd = isWin && config.agent.command === 'claude' ? 'claude.exe' : config.agent.command;
  const r = spawnSync(cmd, config.agent.args, {
    cwd: workspace,
    input: prompt,
    encoding: 'utf8',
    timeout: config.agent.timeoutMinutes * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const raw = r.stdout ?? '';
  let usage = {};
  try {
    const parsed = JSON.parse(raw);
    usage = {
      inputTokens: parsed.usage?.input_tokens ?? parsed.usage?.inputTokens,
      outputTokens: parsed.usage?.output_tokens ?? parsed.usage?.outputTokens,
      costUsd: parsed.total_cost_usd ?? parsed.cost_usd,
      turns: parsed.num_turns,
    };
  } catch {
    usage = { parseError: 'agent output was not JSON; see agent-output.txt' };
  }
  return {
    agentSeconds: Math.round((Date.now() - started) / 1000),
    agentExit: r.status,
    usage,
    raw,
  };
}

const matrix = [];
for (const task of tasks) for (const condition of conditions) for (let n = 1; n <= perCell; n++) matrix.push({ task, condition, n });

if (dryRun) {
  const problems = [];
  for (const { task, condition } of matrix) {
    try {
      await promptFor(task, condition);
    } catch (e) {
      problems.push(e.message);
    }
  }
  const agentCheck = spawnSync(isWin ? 'claude.exe' : config.agent.command, ['--version'], { encoding: 'utf8' });
  console.log(`Dry run: ${matrix.length} run(s) planned (${tasks.join(',')} × ${conditions.join(',')} × ${perCell}).`);
  console.log(`Agent: ${config.agent.command} ${config.agent.args.join(' ')} -> ${agentCheck.status === 0 ? String(agentCheck.stdout).trim() : 'NOT FOUND'}`);
  for (const c of conditions) {
    const ready = await exists(path.join(evalsDir, config.conditions[c].base, 'package.json'));
    console.log(`Base ${c} (${config.conditions[c].label}): ${ready ? 'prepared' : 'not prepared (run prepare-bases.mjs; T1 does not need it)'}`);
  }
  if (problems.length) {
    console.error('Problems:\n' + problems.join('\n'));
    process.exit(1);
  }
  console.log('All task prompts resolve. No agent was invoked.');
  process.exit(0);
}

const resultsDir = path.join(evalsDir, 'results');
await mkdir(resultsDir, { recursive: true });
const resultsFile = path.join(resultsDir, 'results.jsonl');

for (const { task, condition, n } of matrix) {
  const runId = `${task}-${condition}-${n}-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const workspace = path.join(evalsDir, 'runs', runId, 'workspace');
  console.log(`\n=== ${runId} ===`);
  const record = { runId, task, condition, n, startedAt: new Date().toISOString(), model: 'opus (config)' };
  try {
    const { appDir, setupSeconds } = await prepareWorkspace(task, condition, workspace);
    record.setupSeconds = setupSeconds;
    const prompt = await promptFor(task, condition);
    const agent = runAgent(prompt, workspace);
    Object.assign(record, { agentSeconds: agent.agentSeconds, agentExit: agent.agentExit, usage: agent.usage });
    await writeFile(path.join(evalsDir, 'runs', runId, 'agent-output.txt'), agent.raw);
    // Hidden scoring happens only now that the agent has finished.
    const scoreOut = path.join(evalsDir, 'runs', runId, 'score.json');
    const scoreArgs = ['runner/score.mjs', task, appDir, scoreOut, ...(skipWeb ? ['--skip-web'] : [])];
    spawnSync('node', scoreArgs, { cwd: evalsDir, stdio: 'inherit' });
    record.score = JSON.parse(await readFile(scoreOut, 'utf8'));
  } catch (e) {
    record.error = String(e.message ?? e);
    console.error(record.error);
  }
  await appendFile(resultsFile, JSON.stringify(record) + '\n');
  console.log(`Recorded ${runId}: ${record.score ? (record.score.pass ? 'PASS' : 'FAIL') : 'ERROR'}`);
}
console.log(`\nDone. Results appended to ${resultsFile}. Run summarize.mjs for the table.`);
