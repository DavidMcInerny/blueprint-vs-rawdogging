#!/usr/bin/env node
// Hidden acceptance scoring. Copied into a run only AFTER the agent finishes
// (the runner invokes this file from the repo; it is never in the workspace).
// Usage: node score.mjs <T1..T5> <appDir> <outJson> [--skip-web] [--skip-export]
import { access, readFile, writeFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isWin, npm, npx, walkFiles } from './lib.mjs';
import { neutralQuality } from './neutral-quality.mjs';
import { remainingDemoFiles, resolvedBrandChecks } from './t1-contract.mjs';

const [task, appDir, outJson] = process.argv.slice(2);
const skipWeb = process.argv.includes('--skip-web');
const skipExport = process.argv.includes('--skip-export');
const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const checks = [];
let quality = {};
let scoringError;
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readAllSources() {
  const out = [];
  for await (const file of walkFiles(appDir)) {
    if (/\.(tsx?|jsx?|json)$/.test(file) && !file.endsWith('package-lock.json')) {
      out.push({ file: path.relative(appDir, file), text: await readFile(file, 'utf8').catch(() => '') });
    }
  }
  return out;
}

function typecheck() { check('TypeScript (shared neutral strictness)', quality.typeErrors === 0, `${quality.typeErrors} errors`); }

try {
if (!['T1', 'T2', 'T3', 'T4', 'T5'].includes(task)) throw new Error(`Unknown task: ${task}`);
if (!(await exists(path.join(appDir, 'package.json')))) {
  check('app exists with package.json', false, `not found in ${appDir}`);
} else {
  check('app exists with package.json', true);
  quality = await neutralQuality(path.resolve(appDir));
  const sources = await readAllSources();
  const allText = sources.map((s) => s.text).join('\n');
  const has = (re) => re.test(allText);

  if (task === 'T1') {
    const brand = JSON.parse(await readFile(path.join(evalsDir, 'fixtures/T1/supplied-brand.json'), 'utf8'));
    const resolved = npx(['expo', 'config', '--type', 'public', '--json'], appDir, { capture: true, timeoutMs: 60_000 });
    if (resolved.error) throw resolved.error;
    let expoConfig;
    try { expoConfig = resolved.status === 0 ? JSON.parse(resolved.stdout) : {}; } catch { expoConfig = {}; }
    quality.resolvedExpoBrand = { name: expoConfig.name, slug: expoConfig.slug, scheme: expoConfig.scheme };
    const brandChecks = resolvedBrandChecks(expoConfig, brand);
    for (const key of ['name', 'slug', 'scheme']) check(`resolved Expo ${key} matches supplied brand`, brandChecks[key], JSON.stringify(quality.resolvedExpoBrand));
    const demos = remainingDemoFiles(sources.map((source) => source.file));
    check('both templates demo routes/modules removed', demos.length === 0, demos.join(', '));
    check('no notes demo remains', !has(/NotesProvider|RecentNotes|note\/new/));
    typecheck();
  }

  if (task === 'T3') {
    check('adapter testIDs present', has(/adapter-name-input/) && has(/adapter-save-button/) && has(/adapter-saved-name/) && has(/adapter-kind/));
    const importerOf = (re) => sources.filter((s) => re.test(s.text)).map((s) => s.file);
    const adapterImporters = importerOf(/memoryAdapter|asyncStorageAdapter/).filter((f) => !/(^|[\\/])(memoryAdapter|asyncStorageAdapter)\.tsx?$/.test(f));
    check('adapter implementations imported in at most one composition file', adapterImporters.length <= 1, adapterImporters.join(', '));
    check('composition wires the memory adapter', adapterImporters.some((f) => /memoryAdapter/.test(sources.find((s) => s.file === f)?.text ?? '')), adapterImporters.join(', '));
    const directStorage = importerOf(/@react-native-async-storage\/async-storage/).filter((f) => !/asyncStorageAdapter\.tsx?$/.test(f) && !f.endsWith('package.json'));
    check('no direct AsyncStorage import outside the supplied adapter', directStorage.length === 0, directStorage.join(', '));
    typecheck();
  }

  if (['T2', 'T4'].includes(task)) {
    check('saved testIDs present', has(/saved-title-input/) && has(/saved-add-button/) && has(/saved-item/));
    typecheck();
  }
  if (task === 'T5') {
    check('items testIDs present', has(/item-search/) && has(/item-row/) && has(/item-empty/));
    typecheck();
  }

  // Native bundling is required for every task; no device/provider claim is made.
  if (!skipExport) {
    const native = npx(['expo', 'export', '--platform', 'ios', '--platform', 'android', '--output-dir', path.join(path.resolve(appDir), 'dist-native-eval')], appDir, { capture: true, timeoutMs: 10 * 60 * 1000 });
    await writeFile(path.join(path.dirname(outJson), 'native-export.txt'), String(native.stdout ?? '') + String(native.stderr ?? ''));
    if (native.error) throw native.error;
    check('expo export for ios and android', native.status === 0, native.status === 0 ? '' : String(native.stderr ?? native.stdout ?? '').slice(-1000));
  }
  // Production web export + hidden behaviour + neutral axe measurements.
  {
    if (skipWeb) {
      check('web behaviour (hidden Playwright spec)', false, 'skipped with --skip-web: run is unscored on primary behaviour');
    } else {
      check('web behaviour (hidden Playwright spec)', await runWebSpec(task));
    }
  }
}
} catch (error) { scoringError = error.message; }

async function runWebSpec(specTask) {
  // Serve a production export, not the Metro dev server: dev-server runs
  // intermittently lost Playwright interactions before hydration (validation,
  // 2 Nov 2026). This matches the starter's own e2e (serve-web over dist).
  const config = JSON.parse(await readFile(path.join(evalsDir, 'config.json'), 'utf8'));
  const port = new URL(config.web.url).port || '19097';
  const distDir = path.join(path.resolve(appDir), 'dist-eval');
  const exported = npx(['expo', 'export', '--platform', 'web', '--output-dir', distDir], appDir, {
    capture: true,
    timeoutMs: 10 * 60 * 1000,
  });
  await writeFile(path.join(path.dirname(outJson), 'web-export.txt'), String(exported.stdout ?? '') + String(exported.stderr ?? ''));
  if (exported.error) throw exported.error;
  check('expo export --platform web', exported.status === 0);
  if (exported.status !== 0) return false;
  const server = spawn(process.execPath, [path.join(evalsDir, 'hidden/serve-dist.mjs'), distDir, port], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    // Require our own child's listening acknowledgement. A pre-existing server
    // on this port must never be mistaken for this run or killed by the scorer.
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Evaluation web server did not become ready.')), config.web.readyTimeoutSeconds * 1000);
      let stderr = '';
      server.stderr.on('data', (data) => { stderr += data; });
      server.once('error', (error) => { clearTimeout(timer); reject(error); });
      server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Evaluation web server exited ${code}: ${stderr}`)); });
      server.stdout.on('data', (data) => { if (String(data).includes('serving ')) { clearTimeout(timer); resolve(); } });
    });
    const reportFile = path.join(path.dirname(outJson), 'playwright.json');
    const specsToRun = [`${specTask}.spec.mjs`, 'quality.spec.mjs'];
    const r = spawnSync(isWin ? 'npx.cmd' : 'npx', ['playwright', 'test', ...specsToRun], {
      cwd: path.join(evalsDir, 'hidden'),
      env: { ...process.env, EVAL_BASE_URL: config.web.url, EVAL_TASK: specTask, EVAL_REPORT_PATH: reportFile },
      stdio: 'inherit',
      shell: isWin,
      timeout: 10 * 60 * 1000,
    });
    if (r.error) throw r.error;
    const report = JSON.parse(await readFile(reportFile, 'utf8'));
    const specs = [];
    const visit = (suite) => { specs.push(...(suite.specs ?? [])); for (const nested of suite.suites ?? []) visit(nested); };
    for (const suite of report.suites ?? []) visit(suite);
    quality.behaviourTests = specs.map((spec) => ({ title: spec.title, pass: spec.ok }));
    quality.resilienceFailures = specs.filter((spec) => /fail|corrupt|migrat|persist|memory|motion/i.test(spec.title) && !spec.ok).length;
    for (const spec of specs) for (const test of spec.tests ?? []) for (const result of test.results ?? []) for (const attachment of result.attachments ?? []) {
      if (attachment.name === 'neutral-axe' && attachment.body) quality.axe = JSON.parse(Buffer.from(attachment.body, 'base64').toString('utf8'));
    }
    return r.status === 0;
  } finally {
    server.kill('SIGTERM');
  }
}

const complete = !skipWeb && !skipExport && !scoringError;
const result = { task, appDir, complete, pass: complete && checks.every((c) => c.pass), checks, quality, scoringError };
await writeFile(outJson, JSON.stringify(result, null, 2) + '\n');
console.log(`${task}: ${result.pass ? 'PASS' : 'FAIL'} (${checks.filter((c) => c.pass).length}/${checks.length} checks)`);
process.exit(result.pass ? 0 : 1);
