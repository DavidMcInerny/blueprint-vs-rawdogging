#!/usr/bin/env node
// Summarize results/results.jsonl into counts, ranges and the Gate 1 verdict.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const resultsFile = path.join(evalsDir, 'results/results.jsonl');
const lines = (await readFile(resultsFile, 'utf8')).trim().split('\n').filter(Boolean);
const records = lines.map((l) => JSON.parse(l));

const median = (xs) => {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
};
const tokens = (r) => (r.usage?.inputTokens ?? 0) + (r.usage?.outputTokens ?? 0) || null;

const tasks = [...new Set(records.map((r) => r.task))].sort();
const cell = (task, condition) => records.filter((r) => r.task === task && r.condition === condition);
const passed = (rs) => rs.filter((r) => r.score?.pass).length;

const out = ['# Phase 1 evaluation summary', '', `Records: ${records.length}. Generated ${new Date().toISOString()}.`, ''];
out.push('| Task | A (bare) | B (Blueprint) | B − A |', '| --- | --- | --- | --- |');
let totalA = 0;
let totalB = 0;
let worstTaskGap = Infinity;
for (const task of tasks) {
  const a = cell(task, 'A');
  const b = cell(task, 'B');
  totalA += passed(a);
  totalB += passed(b);
  const gap = passed(b) - passed(a);
  if (a.length && b.length) worstTaskGap = Math.min(worstTaskGap, gap);
  out.push(`| ${task} | ${passed(a)}/${a.length} | ${passed(b)}/${b.length} | ${gap >= 0 ? '+' : ''}${gap} |`);
}
const allA = records.filter((r) => r.condition === 'A');
const allB = records.filter((r) => r.condition === 'B');
out.push(`| **Total** | **${totalA}/${allA.length}** | **${totalB}/${allB.length}** | **${totalB - totalA >= 0 ? '+' : ''}${totalB - totalA}** |`);
out.push('');
const medTokensA = median(allA.map(tokens));
const medTokensB = median(allB.map(tokens));
const medSecsA = median(allA.map((r) => r.agentSeconds));
const medSecsB = median(allB.map((r) => r.agentSeconds));
out.push(`Median tokens per run: A ${medTokensA ?? 'n/a'}, B ${medTokensB ?? 'n/a'}. Median agent wall time: A ${medSecsA ?? 'n/a'}s, B ${medSecsB ?? 'n/a'}s.`);
out.push(`Total recorded cost: A $${allA.reduce((s, r) => s + (r.usage?.costUsd ?? 0), 0).toFixed(2)}, B $${allB.reduce((s, r) => s + (r.usage?.costUsd ?? 0), 0).toFixed(2)} (where the agent reported it).`);
out.push('');

const complete = allA.length >= 25 && allB.length >= 25;
const costOk = (medTokensA && medTokensB ? medTokensB <= 1.5 * medTokensA : true) && (medSecsA && medSecsB ? medSecsB <= 1.5 * medSecsA : true);
const gate1 = totalB - totalA >= 7 && worstTaskGap > -3 && costOk;
out.push(`## Gate 1 (thesis) — ${complete ? (gate1 ? 'PASS' : 'FAIL') : 'PROVISIONAL (needs 25 runs per condition)'}`);
out.push('');
out.push(`- B passes ≥7 more of 25 than A: ${totalB - totalA >= 7 ? 'yes' : `no (${totalB - totalA})`}`);
out.push(`- B not worse by ≥3 on any task: ${worstTaskGap > -3 ? 'yes' : `no (worst gap ${worstTaskGap})`}`);
out.push(`- B median tokens/time ≤1.5× A: ${costOk ? 'yes' : 'no'}`);
out.push('');
out.push('Quality detail and human-review sample notes belong in the findings note beside this file (plan Appendix D, Phase 1 deliverable).');

const text = out.join('\n') + '\n';
await writeFile(path.join(evalsDir, 'results/SUMMARY.md'), text);
console.log(text);
