import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { installToolkit } from '../scripts/install.mjs';
const repo = fileURLToPath(new URL('../', import.meta.url));
async function temp(t) { const root = await mkdtemp(join(tmpdir(), 'blueprint-portable-install-')); t.after(() => rm(root, { recursive: true, force: true })); return root; }
const quiet = { log() {} };
async function tree(root, prefix = '') {
  const files = {};
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) Object.assign(files, await tree(root, name));
    else files[name] = await readFile(join(root, name), 'utf8');
  }
  return files;
}

test('Node installer preserves the legacy Bash additive output', { skip: process.platform === 'win32' }, async t => {
  const root = await temp(t), legacy = join(root, 'legacy'), portable = join(root, 'portable');
  const result = spawnSync('bash', [join(repo, 'install.sh'), '--target', legacy], { cwd: repo, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  await installToolkit({ target: portable, ...quiet });
  assert.deepEqual(await tree(portable), await tree(legacy));
});

test('explicit user assets use the supplied home and CODEX_HOME without touching the actual home', async t => {
  const root = await temp(t), userHome = join(root, 'home'), codexHome = join(root, 'codex');
  await installToolkit({ target: join(root, 'app'), agent: 'claude', withDocs: false, installUserAssets: true, userHome, codexHome, ...quiet });
  assert.ok((await readFile(join(userHome, '.agents/skills/mature-app-starter/SKILL.md'), 'utf8')).length);
  assert.deepEqual(await readdir(join(codexHome, 'agents')), (await readdir(join(repo, 'codex/agents'))).filter(name => name.endsWith('.toml')));
  assert.deepEqual(await readdir(userHome), ['.agents']);
});

test('force replaces a selected directory and removes stale contents; normal install preserves it', async t => {
  const root = await temp(t), target = join(root, 'app');
  await mkdir(join(target, '.claude/commands'), { recursive: true });
  await writeFile(join(target, '.claude/commands/local.txt'), 'keep unless forced');
  await installToolkit({ target, agent: 'claude', withDocs: false, ...quiet });
  assert.deepEqual(await readdir(join(target, '.claude/commands')), ['local.txt']);
  await installToolkit({ target, agent: 'claude', withDocs: false, force: true, ...quiet });
  assert.deepEqual(await readdir(join(target, '.claude/commands')), await readdir(join(repo, 'claude/commands')));
});

test('rejects directory symlinks before any writes, including with force', async t => {
  const root = await temp(t), outside = join(root, 'outside'), target = join(root, 'app');
  await mkdir(outside); await mkdir(target);
  await writeFile(join(outside, 'keep.txt'), 'outside work');
  await symlink(outside, join(target, 'docs'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installToolkit({ target, force: true, ...quiet }), /Symbolic link refused/);
  assert.deepEqual(await readdir(target), ['docs']);
  assert.equal(await readFile(join(outside, 'keep.txt'), 'utf8'), 'outside work');
});

test('rejects dangling-file symlinks before any writes', async t => {
  const root = await temp(t), target = join(root, 'app');
  await mkdir(target);
  try { await symlink(join(root, 'missing.md'), join(target, 'BLUEPRINT.md'), 'file'); }
  catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') { t.skip('Windows file-symlink privilege unavailable; directory junction coverage still runs'); return; }
    throw error;
  }
  await assert.rejects(installToolkit({ target, ...quiet }), /Symbolic link refused/);
  assert.deepEqual(await readdir(target), ['BLUEPRINT.md']);
});

test('rejects source symlinks and a non-directory destination ancestor without partial installation', async t => {
  const root = await temp(t), sourceRoot = join(root, 'source'), target = join(root, 'app');
  // Only the installer source directories are needed; dependencies never cross into the fixture.
  await mkdir(sourceRoot);
  for (const name of ['BLUEPRINT.md', 'templates', 'codex', 'claude']) await cp(join(repo, name), join(sourceRoot, name), { recursive: true });
  await rm(join(sourceRoot, 'codex/skills/mature-app-starter'), { recursive: true });
  await symlink(join(repo, 'codex/skills/mature-app-starter'), join(sourceRoot, 'codex/skills/mature-app-starter'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(installToolkit({ target, sourceRoot, withDocs: false, ...quiet }), /Expected a skill directory without symbolic links/);
  assert.deepEqual(await readdir(root), ['source']);
  await mkdir(target); await writeFile(join(target, 'docs'), 'user file');
  await assert.rejects(installToolkit({ target, withDocs: false, ...quiet }), /Destination parent is not a directory/);
  assert.deepEqual(await readdir(target), ['docs']);
});
