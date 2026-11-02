import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { walkFiles } from './lib.mjs';

export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

export async function hashDirectory(dir) {
  const entries = [];
  for await (const file of walkFiles(dir)) {
    entries.push([path.relative(dir, file).replaceAll('\\', '/'), sha256(await readFile(file))]);
  }
  entries.sort(([a], [b]) => a.localeCompare(b, 'en'));
  if (!entries.length) throw new Error(`No files found to fingerprint: ${dir}`);
  return sha256(JSON.stringify(entries));
}

export async function inputIdentity(evalsDir, config) {
  const manifest = await readJson(path.join(evalsDir, config.protocol.directory, 'manifest.json'));
  if (manifest.protocolId !== config.protocol.id || manifest.sourceRevision !== config.protocol.sourceRevision) {
    throw new Error('Prepared bases belong to another protocol/source. Run prepare-bases.mjs.');
  }
  const source = path.join(evalsDir, config.protocol.directory, 'source');
  const actual = { source: await hashDirectory(source) };
  for (const [condition, value] of Object.entries(config.conditions)) {
    actual[condition] = await hashDirectory(path.join(evalsDir, value.base));
    if (actual[condition] !== manifest[condition]?.sha256) throw new Error(`Base ${condition} changed since preparation.`);
  }
  if (actual.source !== manifest.sourceSha256) throw new Error('Frozen source changed since preparation.');
  const inputs = {};
  for (const dir of ['tasks', 'fixtures', 'hidden', 'runner']) inputs[dir] = await hashDirectory(path.join(evalsDir, dir));
  const identity = { protocolId: config.protocol.id, sourceRevision: manifest.sourceRevision, sourceTree: manifest.sourceTree, bases: actual, inputs, configSha256: sha256(JSON.stringify(config)) };
  return { ...identity, fingerprint: sha256(JSON.stringify(identity)), manifest };
}

export async function readRecords(file) {
  let raw;
  try { raw = await readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
  return raw.split('\n').filter((line) => line.trim()).map((line, i) => {
    try { return JSON.parse(line); } catch { throw new Error(`Invalid result JSON at line ${i + 1}; preserve/repair the interrupted append before resuming.`); }
  });
}

export function sampleKey(record) { return `${record.task}/${record.condition}/${record.n}`; }
export function validSample(record) { return record.sampleValid === true && !record.error && !record.metadataError && record.score?.complete === true && typeof record.score.pass === 'boolean'; }
export function consumedSample(record) { return validSample(record) || record.terminalUnscored === true || (record.agentInvoked === true && !record.agentFinished); }

export function assertInvocationAvailable(config, records, sample, fingerprint) {
  const invoked = records.filter((r) => r.agentInvoked && r.inputs?.fingerprint === fingerprint);
  if (invoked.some((r) => sampleKey(r) === sampleKey(sample))) throw new Error(`Primary invocation already consumed: ${sampleKey(sample)}. Only score-only recovery is permitted.`);
  const limit = config.tasks.length * Object.keys(config.conditions).length * config.runsPerTaskPerCondition;
  if (new Set(invoked.map((r) => r.runId)).size >= limit) throw new Error(`Primary invocation budget exhausted (${limit}); no replacement attempts are permitted.`);
}

export function plannedSamples(config, records, { perCell, tasks = config.tasks, conditions = Object.keys(config.conditions), fingerprint } = {}) {
  for (const task of tasks) if (!config.tasks.includes(task)) throw new Error(`Unknown task: ${task}`);
  for (const condition of conditions) if (!config.conditions[condition]) throw new Error(`Unknown condition: ${condition}`);
  const occupied = new Set();
  const invokedKeys = new Map();
  for (const record of records) {
    if (!consumedSample(record) && !record.agentInvoked) continue;
    if (record.inputs?.fingerprint !== fingerprint) throw new Error(`Existing scored run ${record.runId} has different inputs. Do not mix experiments.`);
    if (!config.tasks.includes(record.task) || !config.conditions[record.condition] || !Number.isInteger(record.n) || record.n < 1 || record.n > config.runsPerTaskPerCondition) throw new Error(`Out-of-matrix sample: ${sampleKey(record)}`);
    const key = sampleKey(record);
    if (record.agentInvoked) {
      if (invokedKeys.has(key) && invokedKeys.get(key) !== record.runId) throw new Error(`Duplicate primary invocation: ${key}`);
      invokedKeys.set(key, record.runId);
    }
    if (consumedSample(record)) {
      if (occupied.has(key) && validSample(record)) throw new Error(`Duplicate valid sample: ${key}`);
      occupied.add(key);
    }
  }
  const pending = [];
  for (let n = 1; n <= perCell; n++) for (const task of tasks) {
    // Alternate A/B order across replicates to limit ordering bias.
    for (const condition of n % 2 ? conditions : [...conditions].reverse()) {
      if (!occupied.has(sampleKey({ task, condition, n }))) pending.push({ task, condition, n });
    }
  }
  return pending;
}

const count = (value) => Number.isFinite(value) && value >= 0 ? value : null;
export function parseAgentOutput(raw, requestedModel) {
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return { usage: {}, metadataError: 'Agent output was not JSON.' }; }
  const usage = parsed.usage ?? {};
  const models = Object.keys(parsed.modelUsage ?? parsed.model_usage ?? {});
  if (!models.length && parsed.model) models.push(parsed.model);
  const values = {
    inputTokens: count(usage.input_tokens ?? usage.inputTokens),
    outputTokens: count(usage.output_tokens ?? usage.outputTokens),
    cacheReadInputTokens: count(usage.cache_read_input_tokens ?? usage.cacheReadInputTokens),
    cacheCreationInputTokens: count(usage.cache_creation_input_tokens ?? usage.cacheCreationInputTokens),
  };
  values.totalTokens = Object.values(values).every((v) => v !== null) ? Object.values(values).reduce((a, b) => a + b, 0) : null;
  values.costUsd = count(parsed.total_cost_usd ?? parsed.cost_usd);
  values.turns = count(parsed.num_turns);
  return {
    usage: values, actualModels: models, modelUsage: parsed.modelUsage ?? parsed.model_usage,
    agentResult: { type: parsed.type, subtype: parsed.subtype, isError: parsed.is_error, sessionId: parsed.session_id, stopReason: parsed.stop_reason },
    metadataError: models.length && models.every((model) => model === requestedModel) ? undefined : `Actual model identity missing or differs from ${requestedModel}: ${models.join(', ') || 'missing'}`,
  };
}

export function agentInvocationOutcome(result, requestedModel) {
  const parsed = parseAgentOutput(result.stdout ?? '', requestedModel);
  return { ...parsed, agentExit: result.status, agentSignal: result.signal, agentProcessError: result.error?.message, agentSucceeded: result.status === 0 && !result.error && parsed.agentResult?.isError !== true, terminalUnscored: Boolean(parsed.metadataError) };
}

export function summarizeRecords(config, records) {
  const valid = records.filter(validSample);
  const fingerprints = new Set(valid.map((r) => r.inputs?.fingerprint));
  const identityMismatch = valid.some((r) => config.protocol && (r.inputs?.protocolId !== config.protocol.id || r.inputs?.sourceRevision !== config.protocol.sourceRevision || r.inputs?.configSha256 !== sha256(JSON.stringify(config)))) || valid.some((r) => config.agent && (r.requestedModel !== config.agent.model || r.effort !== config.agent.effort || !r.actualModels?.length || r.actualModels.some((model) => model !== config.agent.model))) || new Set(valid.map((r) => r.cliVersion)).size > 1;
  const keys = new Set();
  let malformed = false;
  for (const record of valid) {
    if (keys.has(sampleKey(record)) || !config.tasks.includes(record.task) || !config.conditions[record.condition] || !Number.isInteger(record.n) || record.n < 1 || record.n > config.runsPerTaskPerCondition) malformed = true;
    keys.add(sampleKey(record));
  }
  const cells = config.tasks.map((task) => ({ task, ...Object.fromEntries(Object.keys(config.conditions).map((c) => [c, valid.filter((r) => r.task === task && r.condition === c)])) }));
  const complete = !malformed && !identityMismatch && fingerprints.size === 1 && !fingerprints.has(undefined) && cells.every((cell) => Object.keys(config.conditions).every((c) => cell[c].length === config.runsPerTaskPerCondition));
  const median = (xs) => { if (!xs.length || xs.some((x) => !Number.isFinite(x) || x < 0)) return null; const sorted = [...xs].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
  const totals = Object.fromEntries(Object.keys(config.conditions).map((condition) => {
    const rs = valid.filter((r) => r.condition === condition);
    return [condition, { runs: rs.length, passed: rs.filter((r) => r.score.pass).length, medianTokens: median(rs.map((r) => r.usage?.totalTokens)), medianSeconds: median(rs.map((r) => r.agentSeconds)), costUsd: rs.length && rs.every((r) => Number.isFinite(r.usage?.costUsd)) ? rs.reduce((sum, r) => sum + r.usage.costUsd, 0) : null }];
  }));
  const delta = totals.B.passed - totals.A.passed;
  const worstGap = Math.min(...cells.map((cell) => cell.B.filter((r) => r.score.pass).length - cell.A.filter((r) => r.score.pass).length));
  const costKnown = [totals.A.medianTokens, totals.B.medianTokens, totals.A.medianSeconds, totals.B.medianSeconds].every((v) => v !== null);
  const costOk = costKnown ? totals.B.medianTokens <= 1.5 * totals.A.medianTokens && totals.B.medianSeconds <= 1.5 * totals.A.medianSeconds : null;
  return { cells, totals, complete, malformed, identityMismatch, fingerprints: [...fingerprints], invalidAttempts: records.length - valid.length, delta, worstGap, costOk, verdict: !complete ? 'INCOMPLETE' : !costKnown ? 'UNKNOWN (missing token/time evidence)' : delta >= 7 && worstGap > -3 && costOk ? 'PASS' : 'FAIL' };
}
