#!/usr/bin/env node
// Build condition snapshots once (evals/bases/A, evals/bases/B). See ../DECISIONS.md.
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { isWin, npm, npx, run } from './lib.mjs';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(evalsDir, '..');
const basesDir = path.join(evalsDir, 'bases');
const force = process.argv.includes('--force');

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson(p) {
  return JSON.parse(await readFile(p, 'utf8'));
}

await mkdir(basesDir, { recursive: true });
const manifest = { preparedAt: new Date().toISOString() };

// --- Condition A: bare create-expo-app, no Blueprint files. ---
const baseA = path.join(basesDir, 'A');
if (force) await rm(baseA, { recursive: true, force: true });
if (await exists(path.join(baseA, 'package.json'))) {
  console.log('bases/A exists, skipping (use --force to rebuild).');
} else {
  const tmp = path.join(basesDir, 'A-tmp');
  await rm(tmp, { recursive: true, force: true });
  const created = npx(['--yes', 'create-expo-app@latest', tmp, '--template', 'default@sdk-57', '--no-install'], repo);
  if (created.status !== 0) throw new Error('create-expo-app failed for condition A.');
  await rm(baseA, { recursive: true, force: true });
  const { rename } = await import('node:fs/promises');
  await rename(tmp, baseA);
  const installed = npm(['install'], baseA, { timeoutMs: 20 * 60 * 1000 });
  if (installed.status !== 0) throw new Error('npm install failed in bases/A.');
}
const pkgA = await readJson(path.join(baseA, 'package.json'));
manifest.A = { expo: pkgA.dependencies?.expo ?? 'unknown', reactNative: pkgA.dependencies?.['react-native'] ?? 'unknown' };
if (!/^~?57\./.test(manifest.A.expo)) {
  throw new Error(`Condition A Expo is ${manifest.A.expo}, but the plan (B3) requires the same SDK as the starter (57). Rebuild with --force.`);
}

// --- Condition B: this repo's create-app, full toolkit. ---
// Harness workaround (DECISIONS.md): Git Bash first on PATH so create-app.mjs's
// bare `bash` call reaches Git's bash, not the WSL launcher. Preparation only.
const baseB = path.join(basesDir, 'B');
if (force) await rm(baseB, { recursive: true, force: true });
if (await exists(path.join(baseB, 'package.json'))) {
  console.log('bases/B exists, skipping (use --force to rebuild).');
} else {
  const env = { ...process.env };
  if (isWin) {
    const pathKey = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
    env[pathKey] = `C:\\Program Files\\Git\\bin;${env[pathKey] ?? ''}`;
  }
  const created = run('node', ['scripts/create-app.mjs', '--target', baseB, '--name', 'eval-base-app', '--agent', 'claude'], {
    cwd: repo,
    env,
    timeoutMs: 30 * 60 * 1000,
  });
  if (created.status !== 0) throw new Error('create-app.mjs failed for condition B (files may remain in bases/B).');
}
const pkgB = await readJson(path.join(baseB, 'package.json'));
let toolkitRevision = 'unknown';
try {
  toolkitRevision = (await readJson(path.join(baseB, 'blueprint-version.json'))).toolkitRevision;
} catch {}
manifest.B = { expo: pkgB.dependencies?.expo ?? 'unknown', toolkitRevision };

await writeFile(path.join(basesDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Bases ready. A: expo ${manifest.A.expo}. B: expo ${manifest.B.expo}, toolkit ${toolkitRevision}.`);
