#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, readRecords, summarizeRecords } from './protocol.mjs';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const config = await readJson(path.join(evalsDir, 'config.json'));
const records = await readRecords(path.join(evalsDir, 'results/results.jsonl'));
const summary = summarizeRecords(config, records);
const passed = (rs) => rs.filter((r) => r.score.pass).length;
const shown = (value) => value === null ? 'unknown' : value;
const out = ['# Phase 1 evaluation summary', '', `Gate 1: **${summary.verdict}**. Valid samples: ${summary.totals.A.runs + summary.totals.B.runs}; unscored attempts: ${summary.invalidAttempts}.`, '',
  `Protocol: ${config.protocol.id}. Source: ${config.protocol.sourceRevision}. Model: ${config.agent.model}; effort: ${config.agent.effort}.`,
  `Fingerprints: ${summary.fingerprints.join(', ') || 'none'}. Generated ${new Date().toISOString()}.`, '',
  '| Task | A (bare) | B (Blueprint) | B − A |', '| --- | --- | --- | --- |'];
for (const cell of summary.cells) {
  const gap = passed(cell.B) - passed(cell.A);
  out.push(`| ${cell.task} | ${passed(cell.A)}/${cell.A.length} | ${passed(cell.B)}/${cell.B.length} | ${gap >= 0 ? '+' : ''}${gap} |`);
}
out.push(`| **Total** | **${summary.totals.A.passed}/${summary.totals.A.runs}** | **${summary.totals.B.passed}/${summary.totals.B.runs}** | **${summary.delta}** |`, '');
out.push(`Complete: ${summary.complete}; each of the ten task/condition cells requires exactly ${config.runsPerTaskPerCondition} unique replicates. Duplicate/out-of-matrix records: ${summary.malformed}; input/model/CLI mismatch: ${summary.identityMismatch}.`, '',
  '| Metric | A | B |', '| --- | --- | --- |');
for (const [label, key] of [['Median tokens (input + output + cache read + cache creation)', 'medianTokens'], ['Median agent wall seconds', 'medianSeconds'], ['Total list-price equivalent USD', 'costUsd']]) out.push(`| ${label} | ${shown(summary.totals.A[key])} | ${shown(summary.totals.B[key])} |`);
out.push('', `- B passes at least seven more of 25 than A: ${summary.delta >= 7 ? 'yes' : 'no'} (${summary.delta}).`,
  `- B is not worse by at least three on any task: ${summary.worstGap > -3 ? 'yes' : 'no'} (worst gap ${summary.worstGap}).`,
  `- B median tokens and time are at most 1.5× A: ${summary.costOk === null ? 'unknown (missing metrics)' : summary.costOk ? 'yes' : 'no'}.`, '',
  'Quality uses a shared TypeScript strictness override and a neutral ESLint rule set; app-specific lint rules are not used. Native exports cover iOS and Android bundles, without device/provider qualification.', '',
  '| Condition | Type errors | Lint errors | Axe violations | Resilience failures |', '| --- | --- | --- | --- | --- |');
for (const condition of ['A', 'B']) {
  const rs = records.filter((r) => r.sampleValid && r.condition === condition);
  const total = (pick) => rs.length && rs.every((r) => Number.isFinite(pick(r))) ? rs.reduce((sum, r) => sum + pick(r), 0) : 'unknown';
  out.push(`| ${condition} | ${total((r) => r.score.quality?.typeErrors)} | ${total((r) => r.score.quality?.lintErrors)} | ${total((r) => r.score.quality?.axe?.violationCount)} | ${total((r) => r.score.quality?.resilienceFailures)} |`);
}
out.push('', 'No-container limitation: sequential Windows-native fresh directories share machine load, network and caches. Costs are reported token list-price equivalents; actual subscription allowance remains the execution constraint.', '', 'Human review minutes for five samples per condition and the final findings/decision are recorded separately; this summary does not invent those observations.');
const text = out.join('\n') + '\n';
await mkdir(path.join(evalsDir, 'results'), { recursive: true });
await writeFile(path.join(evalsDir, 'results/SUMMARY.md'), text);
await writeFile(path.join(evalsDir, 'results/summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(text);
