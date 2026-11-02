#!/usr/bin/env node
// Hidden acceptance scoring. Copied into a run only AFTER the agent finishes
// (the runner invokes this file from the repo; it is never in the workspace).
// Usage: node score.mjs <T1..T5> <appDir> <outJson> [--skip-web] [--skip-export]
import { access, readFile, writeFile } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isWin, npm, npx, walkFiles } from './lib.mjs';

const [task, appDir, outJson] = process.argv.slice(2);
const skipWeb = process.argv.includes('--skip-web');
const skipExport = process.argv.includes('--skip-export');
const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const checks = [];
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

function typecheck() {
  const r = npx(['tsc', '--noEmit'], appDir, { capture: true, timeoutMs: 5 * 60 * 1000 });
  check('typecheck (npx tsc --noEmit)', r.status === 0, r.status === 0 ? '' : String(r.stdout ?? '').slice(-500));
}

if (!(await exists(path.join(appDir, 'package.json')))) {
  check('app exists with package.json', false, `not found in ${appDir}`);
} else {
  check('app exists with package.json', true);
  const sources = await readAllSources();
  const allText = sources.map((s) => s.text).join('\n');
  const has = (re) => re.test(allText);

  if (task === 'T1') {
    const brand = JSON.parse(await readFile(path.join(evalsDir, 'fixtures/T1/supplied-brand.json'), 'utf8'));
    check('brand slug applied', has(new RegExp(brand.slug)), brand.slug);
    check('brand display name applied', has(new RegExp(brand.name)), brand.name);
    check('home shows app-title testID', has(/app-title/));
    check('no notes demo remains', !has(/NotesProvider|RecentNotes|note\/new/));
    typecheck();
    if (!skipExport) {
      const r = npx(['expo', 'export', '--platform', 'web'], appDir, { capture: true, timeoutMs: 10 * 60 * 1000 });
      check('expo export --platform web', r.status === 0, r.status === 0 ? '' : String(r.stdout ?? '').slice(-500));
    }
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

  // Web behaviour via hidden Playwright specs (T2-T5).
  if (['T2', 'T3', 'T4', 'T5'].includes(task)) {
    if (skipWeb) {
      check('web behaviour (hidden Playwright spec)', false, 'skipped with --skip-web: run is unscored on primary behaviour');
    } else {
      check('web behaviour (hidden Playwright spec)', await runWebSpec(task));
    }
  }
}

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
  if (exported.status !== 0) return false;
  const server = spawn('node', [path.join(evalsDir, 'hidden/serve-dist.mjs'), distDir, port], { stdio: 'ignore' });
  try {
    const deadline = Date.now() + config.web.readyTimeoutSeconds * 1000;
    let ready = false;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(config.web.url);
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 3000));
    }
    if (!ready) return false;
    const r = spawnSync(isWin ? 'npx.cmd' : 'npx', ['playwright', 'test', `${specTask}.spec.mjs`], {
      cwd: path.join(evalsDir, 'hidden'),
      env: { ...process.env, EVAL_BASE_URL: config.web.url },
      stdio: 'inherit',
      shell: isWin,
      timeout: 10 * 60 * 1000,
    });
    return r.status === 0;
  } finally {
    if (isWin && server.pid) spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
}

const result = { task, appDir, pass: checks.every((c) => c.pass), checks };
await writeFile(outJson, JSON.stringify(result, null, 2) + '\n');
console.log(`${task}: ${result.pass ? 'PASS' : 'FAIL'} (${checks.filter((c) => c.pass).length}/${checks.length} checks)`);
process.exit(result.pass ? 0 : 1);
