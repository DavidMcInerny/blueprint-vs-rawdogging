#!/usr/bin/env node
// Freeze immutable inputs in a new directory; legacy snapshots remain untouched.
import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWin, npm, npx, run } from './lib.mjs';
import { hashDirectory, inputIdentity, readJson, sha256 } from './protocol.mjs';

const evalsDir = fileURLToPath(new URL('../', import.meta.url));
const repo = path.resolve(evalsDir, '..');
const config = await readJson(path.join(evalsDir, 'config.json'));
const directory = path.join(evalsDir, config.protocol.directory);
const source = path.join(directory, 'source');
const exists = async (file) => access(file).then(() => true, () => false);
const requireSuccess = (result, label) => { if (result.error || result.status !== 0) throw new Error(`${label} failed: ${result.error?.message ?? result.stderr ?? result.status}. Partial files are preserved.`); return result; };
const git = (args) => requireSuccess(run('git', args, { cwd: repo, capture: true }), `git ${args[0]}`).stdout.trim();

if (process.argv.includes('--force')) throw new Error('Bases are immutable. Select a new protocol directory to rebuild; existing snapshots must be preserved.');
if (await exists(path.join(directory, 'manifest.json'))) {
  const identity = await inputIdentity(evalsDir, config);
  console.log(`Verified existing immutable bases: ${identity.fingerprint}`);
  process.exit(0);
}
const revision = git(['rev-parse', `${config.protocol.sourceRevision}^{commit}`]);
if (revision !== config.protocol.sourceRevision) throw new Error('Source revision must be a full immutable commit ID.');
const sourceTree = git(['rev-parse', `${revision}^{tree}`]);
await mkdir(directory, { recursive: true });
const archive = path.join(directory, 'source.tar');
const sourceState = path.join(directory, 'source-state.json');
if (!(await exists(source))) {
  const temporarySource = path.join(directory, `source-extract-${process.pid}`);
  await mkdir(temporarySource);
  requireSuccess(run('git', ['archive', '--format=tar', '--output', archive, revision, '--', '.', ':(exclude)evals'], { cwd: repo, capture: true }), 'source archive');
  requireSuccess(run('tar', ['-xf', archive, '-C', temporarySource], { capture: true }), 'source extraction');
  await writeFile(sourceState, JSON.stringify({ revision, sha256: await hashDirectory(temporarySource) }) + '\n');
  await rename(temporarySource, source);
}
const archiveSha256 = sha256(await readFile(archive));
const sourceSha256 = await hashDirectory(source);
const recordedSource = await readJson(sourceState);
if (recordedSource.revision !== revision || recordedSource.sha256 !== sourceSha256) throw new Error('Partial frozen source changed. Preserve it and select a new protocol directory.');
const sourcePkg = await readJson(path.join(source, 'starters/expo/package.json'));
const sourceLock = await readJson(path.join(source, 'starters/expo/package-lock.json'));
const env = { ...process.env };
if (isWin) {
  const key = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
  env[key] = `C:\\Program Files\\Git\\bin;${env[key] ?? ''}`;
}
const baseB = path.join(evalsDir, config.conditions.B.base);
const generatedB = path.join(directory, 'B-generated.json');
if (!(await exists(path.join(baseB, 'package.json')))) {
  requireSuccess(run(process.execPath, ['scripts/create-app.mjs', '--target', baseB, '--name', 'eval-base-app', '--agent', 'claude', '--skip-install'], { cwd: source, env, timeoutMs: 30 * 60_000 }), 'frozen create-app');
  await writeFile(generatedB, JSON.stringify({ sourceRevision: revision }) + '\n');
}
if (!(await exists(generatedB))) throw new Error('Partial B creation did not finish. Preserve it and select a new protocol directory.');
// Git discovery from an archive would otherwise find the enclosing checkout.
await writeFile(path.join(baseB, 'blueprint-version.json'), JSON.stringify({ starterVersion: '1.0.0', toolkitRevision: revision }, null, 2) + '\n');
requireSuccess(npm(['ci'], baseB, { timeoutMs: 20 * 60_000 }), 'B npm ci');
requireSuccess(npm(['run', 'assets'], baseB, { timeoutMs: 5 * 60_000 }), 'B assets');
const baseA = path.join(evalsDir, config.conditions.A.base);
let scaffold;
const scaffoldFile = path.join(directory, 'scaffold.json');
if (!(await exists(path.join(baseA, 'package.json')))) {
  scaffold = { command: `create-expo-app@${config.protocol.createExpoApp}`, template: config.protocol.template };
  requireSuccess(npx(['--yes', scaffold.command, baseA, '--template', scaffold.template, '--no-install'], repo, { timeoutMs: 10 * 60_000 }), 'create-expo-app');
  await writeFile(scaffoldFile, JSON.stringify(scaffold, null, 2) + '\n');
} else {
  if (!(await exists(scaffoldFile))) throw new Error('Partial base A has no scaffold identity; preserve it and choose a new protocol directory.');
  scaffold = await readJson(scaffoldFile);
}
const pkgA = await readJson(path.join(baseA, 'package.json'));
const alignedDependencies = {};
for (const section of ['dependencies', 'devDependencies']) for (const name of Object.keys(pkgA[section] ?? {})) {
  if (!sourcePkg.dependencies?.[name] && !sourcePkg.devDependencies?.[name]) continue;
  const version = sourceLock.packages[`node_modules/${name}`]?.version;
  if (!version) throw new Error(`No frozen version for shared dependency ${name}`);
  alignedDependencies[name] = version;
  pkgA[section][name] = version;
}
await writeFile(path.join(baseA, 'package.json'), JSON.stringify(pkgA, null, 2) + '\n');
requireSuccess(npm(['install'], baseA, { timeoutMs: 20 * 60_000 }), 'A install with shared dependency alignment');
const manifest = { protocolId: config.protocol.id, preparedAt: new Date().toISOString(), sourceRevision: revision, sourceTree, archiveSha256, sourceSha256, scaffold, sharedDependencyPolicy: config.protocol.sharedDependencyPolicy, alignedDependencies };
for (const [condition, base] of [['A', baseA], ['B', baseB]]) {
  const pkg = await readJson(path.join(base, 'package.json'));
  const lock = await readJson(path.join(base, 'package-lock.json'));
  manifest[condition] = { expo: pkg.dependencies.expo, installedExpo: lock.packages['node_modules/expo'].version, reactNative: lock.packages['node_modules/react-native'].version, sha256: await hashDirectory(base), lockSha256: sha256(await readFile(path.join(base, 'package-lock.json'))) };
}
if (manifest.A.installedExpo !== manifest.B.installedExpo || manifest.A.reactNative !== manifest.B.reactNative || !manifest.A.installedExpo.startsWith('57.')) throw new Error('Prepared conditions differ in installed Expo patch / React Native version.');
await writeFile(path.join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Bases ready at ${directory}; source ${revision}; Expo ${manifest.A.installedExpo}. Legacy bases preserved.`);
