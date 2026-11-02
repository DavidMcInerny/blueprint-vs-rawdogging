import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chmod, copyFile, link, lstat, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { currentCheck, legacyCheck, migrateApp } from '../scripts/migrate-app.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const checkerFiles = ['check-app', 'quality-config', 'verify-blueprint', 'verify-architecture', 'verify-accessibility'];
async function fixture(t, check = legacyCheck) {
  const root = await mkdtemp(join(tmpdir(), 'blueprint-migrate-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'scripts'));
  for (const name of checkerFiles) await copyFile(join(repository, 'templates/scripts', name + '.mjs'), join(root, 'scripts', name + '.mjs'));
  const raw = JSON.stringify({
    name: 'custom-product', version: '7.4.2', private: true,
    scripts: { check, typecheck: 'host-typecheck', lint: 'host-lint', 'format:check': 'host-format', test: 'host-tests', 'assets:check': 'host-assets', custom: 'leave-this-alone' },
    branding: { name: 'Original brand', nested: [{ check: 'unrelated', quote: 'a "quoted" label' }, false, null] },
    dependencies: { 'product-lib': '1.2.3' },
  }, null, 4) + '\n';
  await writeFile(join(root, 'package.json'), raw);
  await writeFile(join(root, 'user-data.json'), '{"draft":"keep me"}\n');
  return { root, raw };
}
test('default dry-run reports supported migration and leaves all app bytes unchanged', async t => {
  const { root, raw } = await fixture(t);
  const scripts = await Promise.all(checkerFiles.map(name => readFile(join(root, 'scripts', name + '.mjs'))));
  assert.equal((await migrateApp({ root })).status, 'planned');
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
  assert.equal(await readFile(join(root, 'user-data.json'), 'utf8'), '{"draft":"keep me"}\n');
  assert.deepEqual(await readdir(root), ['package.json', 'scripts', 'user-data.json']);
  assert.deepEqual(await Promise.all(checkerFiles.map(name => readFile(join(root, 'scripts', name + '.mjs')))), scripts);
});
test('write replaces only scripts.check, preserves branding/data/scripts/mode and is idempotent', async t => {
  const { root, raw } = await fixture(t);
  const file = join(root, 'package.json'); await chmod(file, 0o640);
  const mode = (await lstat(file)).mode;
  assert.equal((await migrateApp({ root, write: true })).status, 'updated');
  const expected = raw.replace(JSON.stringify(legacyCheck), JSON.stringify(currentCheck));
  assert.equal(await readFile(file, 'utf8'), expected);
  assert.equal((await lstat(file)).mode, mode);
  assert.equal(await readFile(join(root, 'user-data.json'), 'utf8'), '{"draft":"keep me"}\n');
  assert.equal((await migrateApp({ root, write: true })).status, 'up-to-date');
  assert.equal(await readFile(file, 'utf8'), expected);
  assert.deepEqual(await readdir(root), ['package.json', 'scripts', 'user-data.json']);
});
test('already migrated coherent app is an unchanged no-op', async t => {
  const { root, raw } = await fixture(t, currentCheck);
  assert.equal((await migrateApp({ root })).status, 'up-to-date');
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
});
test('custom pipelines and missing host stages are preserved and refused', async t => {
  for (const check of ['npm run product:check', legacyCheck + ' && npm run product:check', 'node ./scripts/check-app.mjs']) {
    const { root, raw } = await fixture(t, check);
    await assert.rejects(migrateApp({ root, write: true }), /Custom or unrecognized/);
    assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
  }
  const { root } = await fixture(t);
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  delete pkg.scripts['format:check'];
  const raw = JSON.stringify(pkg);
  await writeFile(join(root, 'package.json'), raw);
  await assert.rejects(migrateApp({ root, write: true }), /Required app quality script/);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
});
test('missing or divergent current checker refuses command adoption without copying source', async t => {
  for (const name of ['check-app', 'quality-config']) {
    const { root, raw } = await fixture(t);
    await rm(join(root, 'scripts', name + '.mjs'));
    await assert.rejects(migrateApp({ root, write: true }), /ENOENT/);
    assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
  }
  const { root, raw } = await fixture(t);
  await writeFile(join(root, 'scripts/verify-architecture.mjs'), '// customized host policy\n');
  await assert.rejects(migrateApp({ root, write: true }), /coherent checker source is not installed/);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
  assert.equal(await readFile(join(root, 'scripts/verify-architecture.mjs'), 'utf8'), '// customized host policy\n');
});
test('ambiguous duplicate keys and invalid JSON refuse without writing; escaped keys are lossless', async t => {
  const { root, raw } = await fixture(t);
  for (const text of ['{', raw.replace('"scripts": {', '"scripts": {}, "scripts": {'), raw.replace('"check": ', '"check": "duplicate", "check": ')]) {
    await writeFile(join(root, 'package.json'), text);
    await assert.rejects(migrateApp({ root, write: true }));
    assert.equal(await readFile(join(root, 'package.json'), 'utf8'), text);
  }
  const escaped = raw.replace('"scripts"', '"scr\\u0069pts"').replace('"check"', '"ch\\u0065ck"');
  await writeFile(join(root, 'package.json'), escaped);
  await migrateApp({ root, write: true });
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), escaped.replace(JSON.stringify(legacyCheck), JSON.stringify(currentCheck)));
});
test('symlinked package, script directories, roots and hard-linked packages are refused', async t => {
  const outside = await fixture(t);
  for (const kind of ['package', 'scripts', 'root', 'hardlink']) {
    const { root } = await fixture(t);
    let target = root;
    if (kind === 'package' || kind === 'hardlink') {
      await rm(join(root, 'package.json'));
      if (kind === 'package') await symlink(join(outside.root, 'package.json'), join(root, 'package.json'));
      else await link(join(outside.root, 'package.json'), join(root, 'package.json'));
    } else if (kind === 'scripts') {
      await rm(join(root, 'scripts'), { recursive: true });
      await symlink(join(outside.root, 'scripts'), join(root, 'scripts'), 'junction');
    } else {
      target = join(root, 'linked-root'); await symlink(outside.root, target, 'junction');
    }
    await assert.rejects(migrateApp({ root: target, write: true }), /link/i);
    assert.equal(await readFile(join(outside.root, 'package.json'), 'utf8'), outside.raw);
  }
});
test('CLI is inert by default, requires root and rejects conflicting modes', async t => {
  const { root, raw } = await fixture(t);
  const script = join(repository, 'scripts/migrate-app.mjs');
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  assert.equal(run('--root', root).status, 0);
  assert.equal(await readFile(join(root, 'package.json'), 'utf8'), raw);
  for (const args of [[], ['--root', root, '--write', '--dry-run'], ['--root', root, '--wat'], ['--root', root, '--root', root]])
    assert.notEqual(run(...args).status, 0);
  assert.equal(run('--root', root, '--write').status, 0);
  assert.equal(JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).scripts.check, currentCheck);
});
