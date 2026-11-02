import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const repo = fileURLToPath(new URL('../', import.meta.url));
const script = join(repo, 'scripts/create-app.mjs');
const run = args => spawnSync(process.execPath, [script, ...args], { cwd: repo, encoding: 'utf8' });
for (const agent of ['codex', 'claude', 'both']) test(`creates a self-contained ${agent} app without copying local build output`, async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-create-test-')); t.after(() => rm(root, { recursive: true, force: true })); const target = join(root, 'new-app');
  const result = run(['--target', target, '--name', 'new-app', '--agent', agent, '--skip-install']); assert.equal(result.status, 0, result.stderr);
  const brand = JSON.parse(await readFile(join(target, 'brand.json')));
  assert.equal(brand.name, 'New App'); assert.equal(brand.slug, 'new-app'); assert.equal(brand.scheme, 'new-app'); assert.equal(brand.bundleIdentifier, 'com.example.newapp');
  const pkg = JSON.parse(await readFile(join(target, 'package.json'))); assert.equal(pkg.name, 'new-app'); assert.equal(pkg.main, 'expo-router/entry');
  const lock = JSON.parse(await readFile(join(target, 'package-lock.json'))); assert.equal(lock.packages[''].name, 'new-app');
  const entries = await readdir(target); for (const excluded of ['node_modules', 'dist', 'dist-native', '.expo', '.env']) assert.ok(!entries.includes(excluded));
  assert.ok(entries.includes('blueprint-version.json')); assert.ok(entries.includes('.github')); assert.ok(entries.includes('.gitattributes'));
  const git = args => spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  assert.equal(git(['rev-list', '--count', 'HEAD']).stdout.trim(), '1');
  assert.equal(git(['status', '--porcelain']).stdout.trim(), '');
  assert.equal(git(['log', '-1', '--format=%s']).stdout.trim(), 'Create new-app from Blueprint');
  assert.ok(!entries.includes('.agents')); assert.ok(!entries.includes('.claude'));
  assert.ok(!(await readdir(join(target, 'docs'))).includes('foundation'));
  assert.ok(!(await readdir(join(target, 'src/modules'))).includes('notes'));
  const tracked = git(['ls-files']).stdout; assert.ok(!tracked.split('\n').some(file => file === '.env' || file.startsWith('node_modules/')));
  const verify = spawnSync(process.execPath, ['scripts/verify-blueprint.mjs'], { cwd: target, encoding: 'utf8' }); assert.equal(verify.status, 0, verify.stdout + verify.stderr);
});
test('rejects existing destinations and invalid names without modifying existing work', async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-create-existing-')); t.after(() => rm(root, { recursive: true, force: true })); await writeFile(join(root, 'keep.txt'), 'user work');
  assert.notEqual(run(['--target', root, '--name', 'valid', '--skip-install']).status, 0); assert.equal(await readFile(join(root, 'keep.txt'), 'utf8'), 'user work');
  assert.notEqual(run(['--target', join(root, 'bad'), '--name', '../bad', '--skip-install']).status, 0); assert.deepEqual(await readdir(root), ['keep.txt']);
});

test('rejects starter-source destinations before creating a recursive copy', async () => {
  let target = join(repo, 'starters/expo/creation-must-not-recurse');
  if (process.platform === 'win32') target = target.toLowerCase();
  const result = run(['--target', target, '--name', 'valid', '--skip-install']);
  assert.notEqual(result.status, 0); assert.match(result.stderr, /outside the starter source/);
});

test('creates inside a parent repository using a command-local author fallback and spaced paths', async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-create-git-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const initialized = spawnSync('git', ['init'], { cwd: root, encoding: 'utf8' }); assert.equal(initialized.status, 0, initialized.stderr);
  const target = join(root, 'folder with spaces');
  const env = { ...process.env, GIT_CONFIG_GLOBAL: join(root, 'no-global-gitconfig'), GIT_CONFIG_NOSYSTEM: '1' };
  for (const name of ['GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL']) delete env[name];
  const result = spawnSync(process.execPath, [script, '--target', target, '--name', 'custom-brand', '--agent', 'codex', '--skip-install'], { cwd: repo, env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const git = args => spawnSync('git', args, { cwd: target, env, encoding: 'utf8' });
  assert.equal(git(['log', '-1', '--format=%an <%ae>']).stdout.trim(), 'Blueprint Generator <blueprint-generator@example.invalid>');
  assert.notEqual(git(['config', '--local', 'user.name']).status, 0);
  assert.equal(git(['status', '--porcelain']).stdout.trim(), '');
  assert.equal(spawnSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: root, env, encoding: 'utf8' }).status, 128);
});

test('the explicit demo option preserves the reference workflow and full local instructions', async t => {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-create-demo-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const target = join(root, 'demo');
  const result = run(['--target', target, '--name', 'demo-app', '--agent', 'codex', '--skip-install', '--with-demo']);
  assert.equal(result.status, 0, result.stderr);
  assert.ok((await readdir(join(target, 'src/modules'))).includes('notes'));
  assert.ok((await readdir(join(target, 'docs'))).includes('foundation'));
  assert.ok((await readFile(join(target, '.agents/skills/mature-app-starter/SKILL.md'), 'utf8')).length);
});
